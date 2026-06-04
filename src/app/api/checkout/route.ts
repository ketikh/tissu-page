import { NextResponse } from "next/server";
import { notifyAdminNewOrder } from "@/lib/notifications";
import { fetchStorefrontProducts } from "@/lib/admin-api";

/**
 * Order intake. The tissu-agent now owns orders end-to-end — we forward the
 * checkout payload to `POST /api/admin/orders` (admin-keyed, server-side only)
 * and the agent persists, decrements stock when status enters `preparing`, and
 * exposes the order to its admin UI.
 *
 * We still fire the Telegram notification from here (best-effort) because the
 * site is what sees the customer-facing copy and zone labels in their final
 * form. Once the agent ships its own notify pipeline this block can go.
 */

interface OrderItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: unknown;
  variantName: unknown;
  image: string;
}

interface CheckoutPayload {
  items: OrderItemInput[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  shippingAddress: {
    streetAddress: string;
    city: string;
  };
  contactMethod: "phone" | "whatsapp" | "viber";
  deliveryMethod: "courier";
  deliveryZone?: {
    id: string;
    label: { ka: string; en: string };
    fee: number;
  } | null;
  notes?: string;
  termsAccepted: boolean;
}

const VALID_CONTACT = new Set(["phone", "whatsapp", "viber"]);

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function pickLocalized(value: unknown): { ka: string; en: string } {
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return {
      ka: typeof o.ka === "string" ? o.ka : "",
      en: typeof o.en === "string" ? o.en : "",
    };
  }
  const s = typeof value === "string" ? value : "";
  return { ka: s, en: s };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CheckoutPayload>;
    const {
      items, subtotal, shipping, discount, total,
      customer, shippingAddress, contactMethod, deliveryZone, notes, termsAccepted,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customer?.firstName || !customer?.lastName || !customer?.phone) {
      return NextResponse.json({ error: "Missing customer details" }, { status: 400 });
    }
    if (!shippingAddress?.streetAddress || !shippingAddress?.city) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }
    if (!contactMethod || !VALID_CONTACT.has(contactMethod)) {
      return NextResponse.json({ error: "Invalid contact method" }, { status: 400 });
    }
    if (!termsAccepted) {
      return NextResponse.json({ error: "Terms must be accepted" }, { status: 400 });
    }
    if (!ADMIN_API_URL || !ADMIN_API_KEY) {
      console.error("[checkout] ADMIN_API_URL / ADMIN_API_KEY not configured");
      return NextResponse.json({ error: "Order service unavailable" }, { status: 503 });
    }

    const agentPayload = {
      customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
      customer_phone: customer.phone,
      customer_email: customer.email || undefined,
      address_street: shippingAddress.streetAddress,
      address_city: shippingAddress.city,
      address_zone: deliveryZone
        ? {
            id: deliveryZone.id,
            label_ka: deliveryZone.label?.ka || "",
            label_en: deliveryZone.label?.en || "",
            fee: deliveryZone.fee ?? 0,
          }
        : null,
      contact_method: contactMethod,
      payment_method: "undecided",
      subtotal: subtotal ?? 0,
      shipping: shipping ?? 0,
      discount: discount ?? 0,
      total: total ?? 0,
      notes: notes || "",
      items: items.map((i) => {
        const pname = pickLocalized(i.productName);
        const vname = pickLocalized(i.variantName);
        return {
          product_id: i.productId,
          variant_id: i.variantId || "",
          quantity: i.quantity,
          price: i.price,
          product_name_ka: pname.ka,
          product_name_en: pname.en,
          variant_name_ka: vname.ka,
          variant_name_en: vname.en,
          image_url: i.image,
        };
      }),
    };

    const agentRes = await fetch(`${ADMIN_API_URL}/api/admin/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": ADMIN_API_KEY,
      },
      body: JSON.stringify(agentPayload),
      cache: "no-store",
    });

    if (!agentRes.ok) {
      const text = await agentRes.text().catch(() => "");
      console.error(`[checkout] agent rejected order (${agentRes.status}):`, text);
      return NextResponse.json(
        { error: "Order could not be created" },
        { status: agentRes.status >= 500 ? 502 : 400 },
      );
    }

    const created = await agentRes.json();
    const orderId = String(created?.id ?? created?.order?.id ?? "");
    if (!orderId) {
      console.error("[checkout] agent returned no order id:", created);
      return NextResponse.json({ error: "Order id missing" }, { status: 502 });
    }

    // Translate back to the legacy shape the checkout client expects (it
    // JSON.parses shippingAddress + per-item productName/variantName).
    const legacyAddress = JSON.stringify({
      firstName: customer.firstName,
      lastName: customer.lastName,
      streetAddress: shippingAddress.streetAddress,
      city: shippingAddress.city,
      phone: customer.phone,
      email: customer.email || "",
      contactMethod,
      deliveryMethod: "courier",
      deliveryZone: deliveryZone || null,
      notes: notes || "",
    });

    const legacyOrder = {
      id: orderId,
      date: new Date().toISOString(),
      status: "pending_confirmation",
      subtotal: subtotal ?? 0,
      shipping: shipping ?? 0,
      discount: discount ?? 0,
      total: total ?? 0,
      paymentMethod: "undecided",
      shippingAddress: legacyAddress,
      items: items.map((i) => ({
        id: `${orderId}-${i.productId}-${i.variantId}`,
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price,
        productName: JSON.stringify(i.productName ?? {}),
        variantName: JSON.stringify(i.variantName ?? {}),
        image: i.image,
      })),
    };

    // Fire-and-forget Telegram notify. Best-effort: never blocks the response.
    (async () => {
      try {
        const adminProducts = await fetchStorefrontProducts();
        const lookup = new Map(adminProducts.map((p) => [String(p.id), { code: p.code, image: p.image_front }]));

        await notifyAdminNewOrder({
          orderId,
          customer: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            email: customer.email,
          },
          contactMethod,
          deliveryZone: deliveryZone || undefined,
          address: { city: shippingAddress.city, street: shippingAddress.streetAddress },
          items: items.map((i) => {
            const meta = lookup.get(String(i.productId));
            const pname = pickLocalized(i.productName);
            const vname = pickLocalized(i.variantName);
            return {
              name: pname.ka || pname.en || "",
              variant: vname.ka || vname.en || "",
              code: meta?.code,
              image: meta?.image || i.image,
              quantity: i.quantity,
              price: i.price,
            };
          }),
          subtotal: subtotal ?? 0,
          shipping: shipping ?? 0,
          total: total ?? 0,
          notes: notes,
        });
      } catch (err) {
        console.error("[checkout] admin notify failed:", err);
      }
    })();

    return NextResponse.json({ order: legacyOrder }, { status: 201 });
  } catch (error) {
    console.error("Checkout Create Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
