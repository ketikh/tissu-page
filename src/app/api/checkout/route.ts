import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Manual order intake. No online payment is taken here — Tissu reaches out
 * after submit to confirm availability, payment method and delivery details.
 *
 * Order is created with status `pending_confirmation` and `paymentMethod` is
 * always `undecided` at submit time. Customer contact preference and notes
 * live inside the `shippingAddress` JSON blob alongside the address fields.
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
  contactMethod: "phone" | "whatsapp" | "messenger" | "instagram" | "email";
  deliveryMethod: "courier" | "pickup";
  notes?: string;
  termsAccepted: boolean;
}

const VALID_CONTACT = new Set(["phone", "whatsapp", "messenger", "instagram", "email"]);
const VALID_DELIVERY = new Set(["courier", "pickup"]);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CheckoutPayload>;
    const {
      items, subtotal, shipping, discount, total,
      customer, shippingAddress, contactMethod, deliveryMethod, notes, termsAccepted,
    } = body;

    // Validate required pieces
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
    if (!deliveryMethod || !VALID_DELIVERY.has(deliveryMethod)) {
      return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
    }
    if (!termsAccepted) {
      return NextResponse.json({ error: "Terms must be accepted" }, { status: 400 });
    }

    // Attach user if signed in (optional — guests can order too).
    let userId: string | undefined = undefined;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;

    // Pack the full customer + delivery snapshot into the existing JSON column
    // so the schema doesn't have to change.
    const addressJson = JSON.stringify({
      firstName: customer.firstName,
      lastName: customer.lastName,
      streetAddress: shippingAddress.streetAddress,
      city: shippingAddress.city,
      phone: customer.phone,
      email: customer.email || "",
      contactMethod,
      deliveryMethod,
      notes: notes || "",
    });

    const order = await prisma.order.create({
      data: {
        status: "pending_confirmation",
        subtotal: subtotal ?? 0,
        shipping: shipping ?? 0,
        discount: discount ?? 0,
        total: total ?? 0,
        paymentMethod: "undecided",
        shippingAddress: addressJson,
        userId,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: JSON.stringify(item.productName ?? {}),
            variantName: JSON.stringify(item.variantName ?? {}),
            image: item.image,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Checkout Create Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
