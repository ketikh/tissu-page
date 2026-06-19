"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreHydration } from "@/store/useHydration";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, User as UserIcon, CheckCircle2, ShoppingBag, Loader2, MessageCircle, Mail, Truck, Send } from "lucide-react";
import {
  REGION_OPTIONS,
  TBILISI_SUB_LABELS,
  TBILISI_SUB_FEE,
  PLACE_TYPE_FEE,
  computeDelivery,
  type TopArea,
  type TbilisiSub,
  type PlaceType,
  type DeliveryRegion,
} from "@/lib/delivery-zones";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import { Order } from "@/lib/types";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const PRICE_FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  cream: "#fef0d6",
  softCream: "#f9f4eb",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

function Star({ size = 14, color = C.mustard, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: "inline-block", flexShrink: 0, ...style }}
    >
      <path
        d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z"
        fill={color}
      />
    </svg>
  );
}

function Price({ value, big = false }: { value: number; big?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, fontFamily: FRAUNCES, color: C.ink, lineHeight: 1 }}>
      <span style={{ fontWeight: 700, fontSize: big ? 32 : 16, letterSpacing: "-0.02em" }}>{value}</span>
      <span style={{ fontFamily: PRICE_FONT, fontWeight: 500, fontSize: big ? 12 : 11, color: C.ink, opacity: 0.55, marginBottom: big ? 4 : 2 }}>₾</span>
    </span>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: FRAUNCES,
  fontWeight: 700,
  fontSize: 22,
  color: C.ink,
  letterSpacing: "-0.01em",
  display: "flex",
  alignItems: "center",
  gap: 10,
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  fontFamily: PRICE_FONT,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: C.ink,
  opacity: 0.55,
  marginLeft: 4,
};

const inputStyle: React.CSSProperties = {
  fontFamily: PRICE_FONT,
  width: "100%",
  height: 48,
  padding: "0 16px",
  background: "white",
  border: `1.5px solid rgba(42,29,20,0.14)`,
  borderRadius: 12,
  color: C.ink,
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: C.rose,
  boxShadow: `0 0 0 3px ${C.rose}22`,
};

interface CheckoutClientProps {
  lang: Locale;
  dictionary: any;
}

export default function CheckoutClient({ lang, dictionary }: CheckoutClientProps) {
  useStoreHydration();
  const router = useRouter();
  const { items, getSummary, clearCart, discount } = useCartStore();
  const { user, isAuthenticated, addOrder } = useAuthStore();
  const { subtotal, total, discountAmount, shipping } = getSummary();
  
  const [deliveryArea, setDeliveryArea] = useState<TopArea>("tbilisi");
  const [tbilisiSub, setTbilisiSub] = useState<TbilisiSub>("center");
  const [regionId, setRegionId] = useState<Exclude<DeliveryRegion, "tbilisi" | "rustavi" | "other">>("shida-kartli");
  const [placeName, setPlaceName] = useState<string>("");
  const [placeType, setPlaceType] = useState<PlaceType>("city");

  const computedDelivery = computeDelivery({
    area: deliveryArea,
    tbilisiSub,
    regionId,
    placeName,
    placeType,
  });
  const deliveryFee = computedDelivery.fee;

  const [contactMethod, setContactMethod] = useState<"whatsapp" | "viber">("whatsapp");
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Guests start undecided so the "Continue as guest" button actually does
  // something (it dismisses the login prompt). Order payload uses !isAuthenticated.
  const [isGuest, setIsGuest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Final order total uses the zone's delivery fee instead of the cart's
  // estimate, so the customer sees the actual courier price they picked.
  const totalWithDelivery = subtotal - discountAmount + deliveryFee;

  // Form State — email is optional
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "Tbilisi",
    notes: "",
  });

  // Auto-fill if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setFormData({
        email: user.email,
        phone: user.phone || defaultAddr?.phone || "",
        firstName: user.firstName,
        lastName: user.lastName,
        street: defaultAddr?.streetAddress || "",
        city: defaultAddr?.city || "Tbilisi",
        notes: "",
      });
      setIsGuest(false);
    }
  }, [isAuthenticated, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.phone) newErrors.phone = dictionary.validation.required;
    if (!formData.email.trim()) newErrors.email = dictionary.validation.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = dictionary.validation.email;
    if (!formData.firstName) newErrors.firstName = dictionary.validation.required;
    if (!formData.lastName) newErrors.lastName = dictionary.validation.required;
    if (!formData.street) newErrors.street = dictionary.validation.required;
    if (!formData.city) newErrors.city = dictionary.validation.required;
    if (!termsAccepted) newErrors.terms = dictionary.validation.required;
    if (deliveryArea === "region" && !placeName.trim()) newErrors.placeName = dictionary.validation.required;

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmitOrder = async () => {
    setSubmitError(null);
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      // The submit button is at the bottom of the form, but the empty fields
      // are up top — so a silent inline error reads as "nothing happened".
      // Scroll to the first missing field, focus it, and show a friendly note.
      const order = ["phone", "email", "firstName", "lastName", "street", "city", "placeName", "terms"];
      const firstKey = order.find((k) => newErrors[k]);
      const el = firstKey ? document.getElementById(`co-${firstKey}`) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof el.focus === "function") setTimeout(() => el.focus({ preventScroll: true }), 350);
      }
      setSubmitError(isKa ? "გთხოვ, შეავსე მონიშნული ველები." : "Please fill in the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayloadItems = items.map(i => {
        const variantField =
          (i.variant as any)?.color ??
          (i.variant as any)?.colorName ??
          { ka: "", en: "" };
        return {
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.variant?.price || i.product.price,
          productName: i.product.name,
          variantName: variantField,
          image: i.product.images[0],
        };
      });

      const payload = {
        items: orderPayloadItems,
        lang,
        subtotal,
        shipping: deliveryFee,
        discount,
        total: totalWithDelivery,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email.trim(),
        },
        shippingAddress: {
          streetAddress: formData.street,
          city: formData.city,
        },
        contactMethod,
        deliveryMethod: "courier",
        deliveryZone: {
          id: deliveryArea === "tbilisi" ? `tbilisi-${tbilisiSub}`
            : deliveryArea === "rustavi" ? "rustavi"
            : `${regionId}-${placeType}`,
          label: computedDelivery.label,
          fee: computedDelivery.fee,
        },
        notes: formData.notes || undefined,
        termsAccepted,
        isGuest: !isAuthenticated,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || (isKa ? "შეკვეთის გაგზავნა ვერ მოხერხდა" : "Could not submit the order"));
      }

      const newOrder = data.order;
      const formattedOrder: Order = {
        ...newOrder,
        shippingAddress: JSON.parse(newOrder.shippingAddress),
        items: newOrder.items.map((i: any) => ({
          ...i,
          productName: JSON.parse(i.productName),
          variantName: JSON.parse(i.variantName),
        })),
      };

      if (isAuthenticated) addOrder(formattedOrder);
      clearCart();
      router.push(`/${lang}/checkout/success?orderId=${newOrder.id}`);
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : (isKa ? "შეცდომა გაგზავნისას" : "Submission error"));
      setIsSubmitting(false);
    }
  };

  const isKa = lang === "ka";

  if (items.length === 0) {
    return (
      <div style={{ background: "white", minHeight: "80vh" }}>
        <div className="container py-20 md:py-28 flex flex-col items-center text-center gap-7 max-w-xl">
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 88, height: 88, borderRadius: "50%",
              background: C.softCream,
              color: C.burnt,
            }}
          >
            <ShoppingBag size={36} strokeWidth={1.6} />
          </span>
          <h1
            style={{
              fontFamily: FRAUNCES, fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 32px)",
              color: C.ink, lineHeight: 1.1, letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {dictionary.checkout.empty}
          </h1>
          <Link
            href={`/${lang}/shop`}
            style={{
              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
              background: C.burnt, color: C.cream,
              borderRadius: 999,
              padding: "12px 28px",
              display: "inline-flex", alignItems: "center", gap: 8,
              textDecoration: "none",
              transition: "transform 0.18s ease",
            }}
            className="hover:-translate-y-0.5"
          >
            {dictionary.checkout.returnShop} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  const radioOption = (
    name: "shipping" | "payment",
    value: string,
    checked: boolean,
    onSelect: () => void,
    title: string,
    desc: string | null,
    rightSlot: React.ReactNode,
    icon?: React.ReactNode,
  ) => (
    <label
      onClick={onSelect}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 18px",
        background: checked ? C.softCream : "white",
        border: `1.5px solid ${checked ? C.burnt : "rgba(42,29,20,0.12)"}`,
        borderRadius: 14,
        cursor: "pointer",
        transition: "background 0.18s ease, border-color 0.18s ease",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
        <span style={{
          width: 18, height: 18, borderRadius: "50%",
          border: `2px solid ${checked ? C.burnt : "rgba(42,29,20,0.28)"}`,
          background: "white",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {checked && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.burnt }} />}
        </span>
        {icon && <span style={{ color: C.ink, opacity: 0.65, display: "inline-flex" }}>{icon}</span>}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 15, color: C.ink, lineHeight: 1.25 }}>{title}</span>
          {desc && (
            <span style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.55, marginTop: 2 }}>{desc}</span>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{rightSlot}</div>
    </label>
  );

  return (
    <div style={{
      background: "#fffcf5",
      backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
      backgroundSize: "26px 26px",
      minHeight: "60vh", position: "relative", overflow: "hidden",
    }}>
      {/* Sprinkled stars in brand colors */}
      <span aria-hidden="true" style={{ position: "absolute", top: 120, left: "6%", opacity: 0.85 }}><Star size={18} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "8%", opacity: 0.7 }}><Star size={12} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 380, right: "3%", opacity: 0.65 }}><Star size={14} color={C.rose} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "55%", left: "3%", opacity: 0.6 }}><Star size={14} color={C.green} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 200, left: "4%", opacity: 0.7 }}><Star size={16} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 320, right: "8%", opacity: 0.6 }}><Star size={13} color={C.burnt} /></span>

      {/* Vibrant floating pebbles */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 180, left: "-3%",
        width: 120, height: 120,
        background: C.burnt, opacity: 0.28,
        borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
        transform: "rotate(-12deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: 80, right: "-2%",
        width: 90, height: 90,
        background: C.mustard, opacity: 0.4,
        borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%",
        transform: "rotate(18deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: "44%", left: "-2%",
        width: 70, height: 70,
        background: C.green, opacity: 0.26,
        borderRadius: "50%",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: "50%", right: "-3%",
        width: 110, height: 110,
        background: C.rose, opacity: 0.28,
        borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%",
        transform: "rotate(-6deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 80, right: "-3%",
        width: 140, height: 140,
        background: C.mustard, opacity: 0.32,
        borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%",
        transform: "rotate(10deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 160, left: "-2%",
        width: 80, height: 80,
        background: C.burnt, opacity: 0.24,
        borderRadius: "50%",
      }} />

      {/* Squiggly wavy lines */}
      <svg aria-hidden="true" style={{ position: "absolute", top: 230, right: "12%", opacity: 0.55, pointerEvents: "none" }} width="100" height="20" viewBox="0 0 100 20">
        <path d="M 2 10 Q 11 1 20 10 T 38 10 T 56 10 T 74 10 T 92 10 T 98 10" stroke={C.burnt} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg aria-hidden="true" style={{ position: "absolute", top: "48%", left: "10%", opacity: 0.55, pointerEvents: "none", transform: "rotate(-8deg)" }} width="90" height="20" viewBox="0 0 90 20">
        <path d="M 2 10 Q 10 1 18 10 T 34 10 T 50 10 T 66 10 T 82 10" stroke={C.green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg aria-hidden="true" style={{ position: "absolute", bottom: 280, left: "16%", opacity: 0.6, pointerEvents: "none" }} width="100" height="20" viewBox="0 0 100 20">
        <path d="M 2 10 Q 11 1 20 10 T 38 10 T 56 10 T 74 10 T 92 10 T 98 10" stroke={C.mustard} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <div className="container py-10 md:py-14 max-w-6xl" style={{ position: "relative" }}>
        {/* Back link */}
        <Link
          href={`/${lang}/cart`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: FRAUNCES, fontWeight: 500, fontSize: 13,
            color: C.ink, opacity: 0.6, textDecoration: "none",
            marginBottom: 24,
          }}
          className="hover:opacity-100"
        >
          <ChevronLeft size={14} /> {dictionary.checkout.returnCart}
        </Link>

        {/* Heading */}
        <div className="flex items-baseline gap-4 mb-10 flex-wrap" style={{ position: "relative" }}>
          <h1
            style={{
              fontFamily: FRAUNCES, fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 32px)",
              color: C.ink, lineHeight: 1.0,
              letterSpacing: "-0.01em",
              margin: 0,
              position: "relative",
            }}
          >
            {isKa ? "გადახდა" : "Checkout"}
            <span aria-hidden="true" style={{ position: "absolute", top: -10, right: -22 }}><Star size={16} /></span>
          </h1>
          <span style={{ fontFamily: PRICE_FONT, fontSize: 14, color: C.ink, opacity: 0.55 }}>
            {items.length} {isKa ? "ნივთი" : (items.length === 1 ? "item" : "items")}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* Order Summary Column */}
          <div className="lg:order-2">
            <div
              className="p-6 lg:sticky lg:top-24"
              style={{
                background: C.softCream,
                borderRadius: 18,
                border: `1px solid rgba(42,29,20,0.08)`,
                position: "relative",
              }}
            >
              <span aria-hidden="true" style={{ position: "absolute", top: -8, right: 18, opacity: 0.9 }}><Star size={16} /></span>
              <div style={{
                fontFamily: FRAUNCES, fontWeight: 600,
                fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase",
                color: C.ink, opacity: 0.55,
                marginBottom: 18,
              }}>
                {dictionary.checkout.summary}
              </div>

              <div className="flex flex-col gap-4 mb-5" style={{ maxHeight: "38vh", overflowY: "auto", paddingRight: 6 }}>
                {items.map((item) => {
                  const productName = item.product?.name?.[lang] || item.product?.name?.["ka"] || "";
                  const variantField =
                    (item.variant as any)?.color ??
                    (item.variant as any)?.colorName ??
                    null;
                  const variantLabel = variantField?.[lang] || variantField?.["ka"] || "";
                  const size = item.variant?.size;
                  const meta = [size && size !== "one" ? size : null, variantLabel || null].filter(Boolean).join(" • ");
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div style={{
                        position: "relative", width: 56, height: 64,
                        borderRadius: 10, background: "#f5f5f5",
                        overflow: "hidden", flexShrink: 0,
                        border: `1px solid rgba(42,29,20,0.08)`,
                      }}>
                        <Image src={item.product.images[0] || "/placeholder.jpg"} alt={productName} fill className="object-cover" />
                        {/* Quantity badge sits inside the box so the scroll
                            container can't clip it. */}
                        <span style={{
                          position: "absolute", top: 4, right: 4,
                          minWidth: 20, height: 20, padding: "0 6px",
                          borderRadius: 999,
                          background: C.ink, color: C.cream,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontFamily: PRICE_FONT, fontWeight: 700, fontSize: 11,
                          lineHeight: 1,
                          zIndex: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                        }}>{item.quantity}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                          color: C.ink, lineHeight: 1.25,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{productName}</div>
                        {meta && (
                          <div style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.ink, opacity: 0.55, marginTop: 2, whiteSpace: "pre-line", lineHeight: 1.4 }}>{meta}</div>
                        )}
                      </div>
                      <Price value={(item.variant?.price || item.product.price) * item.quantity} />
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 mb-5" style={{ fontFamily: PRICE_FONT, paddingTop: 14, borderTop: `1px solid rgba(42,29,20,0.10)` }}>
                <div className="flex justify-between text-[14px]" style={{ color: C.ink }}>
                  <span style={{ opacity: 0.7 }}>{dictionary.checkout.subtotal}</span>
                  <Price value={subtotal} />
                </div>
                <div className="flex justify-between text-[14px]" style={{ color: C.ink }}>
                  <span style={{ opacity: 0.7 }}>{isKa ? "მიწოდება" : "Delivery"}</span>
                  <Price value={deliveryFee} />
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[14px]" style={{ color: C.green }}>
                    <span style={{ fontWeight: 600 }}>{dictionary.checkout.discount}</span>
                    <span style={{ fontWeight: 600 }}>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div
                className="flex items-baseline justify-between mb-2 pt-4"
                style={{ borderTop: `1px solid rgba(42,29,20,0.10)` }}
              >
                <span style={{
                  fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16,
                  color: C.ink, letterSpacing: "-0.005em",
                }}>
                  {dictionary.checkout.total}
                </span>
                <Price value={totalWithDelivery} big />
              </div>

              <div style={{
                marginTop: 18,
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                background: "white",
                border: `1px solid rgba(42,29,20,0.08)`,
                borderRadius: 12,
              }}>
                <CheckCircle2 size={16} style={{ color: C.green, flexShrink: 0 }} />
                <p style={{
                  fontFamily: PRICE_FONT, fontSize: 11, color: C.ink, opacity: 0.7,
                  margin: 0, lineHeight: 1.35,
                }}>
                  {isKa ? "შენი შეკვეთა დაცულია Tissu-ს გარანტიით." : "Your order is protected by the Tissu guarantee."}
                </p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:order-1 flex flex-col gap-10">

            {/* Auth Toggle / Info */}
            <div style={{
              background: "white",
              border: `1px solid rgba(42,29,20,0.10)`,
              borderRadius: 16,
              padding: "16px 18px",
            }}>
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: C.softCream, color: C.burnt,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <UserIcon size={18} />
                    </span>
                    <div>
                      <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.ink }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.55 }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => useAuthStore.getState().logout()}
                    style={{
                      fontFamily: FRAUNCES, fontWeight: 600, fontSize: 12,
                      letterSpacing: "0.02em",
                      background: "transparent", color: C.ink,
                      border: `1.5px solid rgba(42,29,20,0.14)`,
                      borderRadius: 10,
                      padding: "8px 14px",
                      cursor: "pointer",
                    }}
                  >
                    {dictionary.account.sidebar.logout}
                  </button>
                </div>
              ) : isGuest ? (
                <div className="flex items-center justify-between gap-4">
                  <div style={{ fontFamily: PRICE_FONT, fontSize: 13, color: C.ink, opacity: 0.75 }}>
                    {isKa ? "✓ აფორმებ შეკვეთას როგორც სტუმარი" : "✓ Checking out as a guest"}
                  </div>
                  <Link href={`/${lang}/account/login`} style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13, color: C.burnt, textDecoration: "underline", whiteSpace: "nowrap" }}>
                    {isKa ? "შესვლა" : "Sign in"}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.ink }}>
                      {dictionary.checkout.loginToContinue}
                    </div>
                    <div style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.55, marginTop: 2 }}>
                      {isKa ? "გააგრძელე როგორც სტუმარი ან გაიარე ავტორიზაცია." : "Continue as guest or sign in."}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/${lang}/account/login`}
                      style={{
                        fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13, letterSpacing: "0.02em",
                        background: C.burnt, color: C.cream,
                        borderRadius: 10, padding: "10px 16px",
                        textDecoration: "none",
                      }}
                    >
                      {dictionary.checkout.login}
                    </Link>
                    <button
                      onClick={() => setIsGuest(true)}
                      style={{
                        fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13, letterSpacing: "0.02em",
                        background: "transparent", color: C.ink,
                        border: `1.5px solid rgba(42,29,20,0.18)`,
                        borderRadius: 10, padding: "10px 16px",
                        cursor: "pointer",
                      }}
                    >
                      {dictionary.checkout.guestCheckout}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Contact */}
            <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={sectionTitleStyle}>
                <Star size={14} />
                <span style={{ fontFamily: FRAUNCES, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: C.burnt }}>01</span>
                {dictionary.checkout.contact}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>
                    {dictionary.checkout.phone}
                  </label>
                  <input
                    id="co-phone"
                    type="tel"
                    placeholder="+995 5XX XXX XXX"
                    style={errors.phone ? inputErrorStyle : inputStyle}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {errors.phone && <span style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.rose, marginLeft: 4 }}>{errors.phone}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>
                    {dictionary.checkout.email}
                  </label>
                  <input
                    id="co-email"
                    type="email"
                    placeholder="hello@example.com"
                    style={errors.email ? inputErrorStyle : inputStyle}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isAuthenticated}
                  />
                  {errors.email && <span style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.rose, marginLeft: 4 }}>{errors.email}</span>}
                </div>
              </div>
            </section>

            {/* 2. Address */}
            <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={sectionTitleStyle}>
                <Star size={14} />
                <span style={{ fontFamily: FRAUNCES, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: C.burnt }}>02</span>
                {dictionary.checkout.address}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>{dictionary.checkout.firstName}</label>
                  <input
                    id="co-firstName"
                    placeholder={dictionary.checkout.firstName}
                    style={errors.firstName ? inputErrorStyle : inputStyle}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>{dictionary.checkout.lastName}</label>
                  <input
                    id="co-lastName"
                    placeholder={dictionary.checkout.lastName}
                    style={errors.lastName ? inputErrorStyle : inputStyle}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>{dictionary.checkout.street}</label>
                <input
                  id="co-street"
                  placeholder={dictionary.checkout.street}
                  style={errors.street ? inputErrorStyle : inputStyle}
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>{dictionary.checkout.city}</label>
                <input
                  id="co-city"
                  placeholder={dictionary.checkout.city}
                  style={errors.city ? inputErrorStyle : inputStyle}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>
                  {isKa ? "დამატებითი კომენტარი" : "Additional notes"}
                  <span style={{ marginLeft: 6, fontWeight: 500, opacity: 0.55, textTransform: "none", letterSpacing: 0 }}>
                    {isKa ? "(არასავალდებულო)" : "(optional)"}
                  </span>
                </label>
                <textarea
                  placeholder={isKa ? "მაგ.: გთხოვ ზარის გარეშე მოვიდეთ, საჩუქარია ..." : "e.g. please call before delivery, gift wrap ..."}
                  rows={3}
                  style={{ ...inputStyle, height: "auto", padding: "12px 16px", lineHeight: 1.5, resize: "vertical" }}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </section>

            {/* 3. Delivery zone */}
            <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={sectionTitleStyle}>
                <Star size={14} />
                <span style={{ fontFamily: FRAUNCES, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: C.burnt }}>03</span>
                {isKa ? "მიწოდების ზონა" : "Delivery zone"}
              </h2>

              {/* Top-level area cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(["tbilisi", "rustavi", "region"] as const).map(area => {
                  const checked = deliveryArea === area;
                  const title =
                    area === "tbilisi" ? (isKa ? "თბილისი" : "Tbilisi") :
                    area === "rustavi" ? (isKa ? "რუსთავი" : "Rustavi") :
                    (isKa ? "სხვა რეგიონი" : "Another region");
                  const desc =
                    area === "tbilisi" ? (isKa ? "6 ₾-დან · უბნის მიხედვით" : "from 6 ₾ · depending on district") :
                    area === "rustavi" ? "8 ₾" :
                    (isKa ? "8 / 10 / 12 ₾ · ქალაქი / დაბა / სოფელი" : "8 / 10 / 12 ₾ · city / town / village");
                  return (
                    <label
                      key={area}
                      onClick={() => setDeliveryArea(area)}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px",
                        background: checked ? C.softCream : "white",
                        border: `1.5px solid ${checked ? C.burnt : "rgba(42,29,20,0.12)"}`,
                        borderRadius: 14, cursor: "pointer",
                        transition: "background 0.18s ease, border-color 0.18s ease",
                      }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: "50%",
                        border: `2px solid ${checked ? C.burnt : "rgba(42,29,20,0.28)"}`,
                        background: "white",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {checked && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.burnt }} />}
                      </span>
                      <Truck size={18} style={{ color: C.ink, opacity: 0.65 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 15, color: C.ink, lineHeight: 1.25 }}>{title}</div>
                        <div style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.6, marginTop: 2 }}>{desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Tbilisi sub-zones */}
              {deliveryArea === "tbilisi" && (
                <div style={{
                  background: C.softCream,
                  border: `1px solid rgba(42,29,20,0.08)`,
                  borderRadius: 14,
                  padding: 14,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={labelStyle}>{isKa ? "თბილისის ზონა" : "Tbilisi zone"}</div>
                  {(["center", "outskirts"] as const).map(sub => {
                    const checked = tbilisiSub === sub;
                    const labels = TBILISI_SUB_LABELS[sub];
                    return (
                      <label
                        key={sub}
                        onClick={() => setTbilisiSub(sub)}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: "10px 12px",
                          background: checked ? "white" : "transparent",
                          border: `1.5px solid ${checked ? C.burnt : "rgba(42,29,20,0.10)"}`,
                          borderRadius: 12, cursor: "pointer",
                        }}
                      >
                        <span style={{
                          width: 16, height: 16, borderRadius: "50%", marginTop: 2,
                          border: `2px solid ${checked ? C.burnt : "rgba(42,29,20,0.28)"}`,
                          background: "white",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {checked && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.burnt }} />}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.ink }}>
                            {labels[isKa ? "ka" : "en"]}
                          </div>
                          {labels.hint && (
                            <div style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.ink, opacity: 0.55, marginTop: 2, lineHeight: 1.4 }}>
                              {labels.hint[isKa ? "ka" : "en"]}
                            </div>
                          )}
                        </div>
                        <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, color: C.burnt }}>
                          {TBILISI_SUB_FEE[sub]} ₾
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Region selector — chip row + free-text place + type */}
              {deliveryArea === "region" && (
                <div style={{
                  background: C.softCream,
                  border: `1px solid rgba(42,29,20,0.08)`,
                  borderRadius: 14,
                  padding: 14,
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div>
                    <div style={{ ...labelStyle, marginBottom: 8 }}>{isKa ? "რეგიონი" : "Region"}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {REGION_OPTIONS.map(r => {
                        const active = regionId === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRegionId(r.id)}
                            style={{
                              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
                              padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                              background: active ? C.burnt : "white",
                              color: active ? C.cream : C.ink,
                              border: `1.5px solid ${active ? C.burnt : "rgba(42,29,20,0.14)"}`,
                              transition: "background 0.18s ease, color 0.18s ease",
                            }}
                          >
                            {r.label[isKa ? "ka" : "en"]}
                          </button>
                        );
                      })}
                    </div>
                    {(() => {
                      const r = REGION_OPTIONS.find(x => x.id === regionId);
                      return r ? (
                        <p style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.ink, opacity: 0.55, margin: "8px 4px 0", lineHeight: 1.5 }}>
                          {r.hint[isKa ? "ka" : "en"]}
                        </p>
                      ) : null;
                    })()}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={labelStyle}>{isKa ? "ქალაქი / სოფელი (კონკრეტული)" : "Specific city / village"}</label>
                    <input
                      id="co-placeName"
                      placeholder={isKa ? "მაგ.: გორი, ბაკურიანი, აბაშა ..." : "e.g. Gori, Bakuriani, Abasha ..."}
                      style={errors.placeName ? inputErrorStyle : inputStyle}
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                    />
                    {errors.placeName && (
                      <span style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.rose, marginLeft: 4 }}>
                        {isKa ? "შეიყვანე დასახლების სახელი" : "Enter the place name"}
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{ ...labelStyle, marginBottom: 6 }}>{isKa ? "ტიპი" : "Type"}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(["city", "town", "village"] as const).map(t => {
                        const active = placeType === t;
                        const label = t === "city" ? (isKa ? "ქალაქი" : "City") : t === "town" ? (isKa ? "დაბა" : "Town") : (isKa ? "სოფელი" : "Village");
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setPlaceType(t)}
                            style={{
                              flex: 1,
                              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
                              padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                              background: active ? C.burnt : "white",
                              color: active ? C.cream : C.ink,
                              border: `1.5px solid ${active ? C.burnt : "rgba(42,29,20,0.14)"}`,
                              transition: "background 0.18s ease, color 0.18s ease",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            }}
                          >
                            <span>{label}</span>
                            <span style={{ opacity: 0.75, fontSize: 12 }}>{PLACE_TYPE_FEE[t]} ₾</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Final fee preview */}
              <div style={{
                background: "white",
                border: `1px solid rgba(42,29,20,0.10)`,
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex", gap: 10, alignItems: "center",
              }}>
                <Truck size={16} style={{ color: C.burnt, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13, color: C.ink, lineHeight: 1.35 }}>
                    {computedDelivery.label[isKa ? "ka" : "en"]}
                  </div>
                  <div style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.ink, opacity: 0.55, marginTop: 1 }}>
                    {isKa ? "კურიერით მისამართზე" : "Courier to address"}
                  </div>
                </div>
                <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16, color: C.burnt, flexShrink: 0 }}>
                  {deliveryFee} ₾
                </span>
              </div>
            </section>

            {/* 4. Preferred contact method */}
            <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={sectionTitleStyle}>
                <Star size={14} />
                <span style={{ fontFamily: FRAUNCES, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: C.burnt }}>04</span>
                {isKa ? "როგორ დაგიკავშირდეთ" : "How should we reach you"}
              </h2>
              <p style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.6, margin: 0, marginLeft: 4 }}>
                {isKa
                  ? "შენი მონაცემების მიღების შემდეგ დაგიკავშირდებით, რომ შევთანხმდეთ გადახდის და მიწოდების დეტალებზე."
                  : "After we receive your request we will contact you to agree on payment and delivery details."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {radioOption(
                  "payment", "whatsapp", contactMethod === "whatsapp",
                  () => setContactMethod("whatsapp"),
                  "WhatsApp", null, null, <MessageCircle size={18} />,
                )}
                {radioOption(
                  "payment", "viber", contactMethod === "viber",
                  () => setContactMethod("viber"),
                  "Viber", null, null, <MessageCircle size={18} />,
                )}
              </div>
            </section>

            {/* Manual payment notice */}
            <section style={{
              background: C.softCream,
              border: `1px solid rgba(42,29,20,0.08)`,
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <Mail size={18} style={{ color: C.burnt, flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontFamily: PRICE_FONT, fontSize: 13, color: C.ink, lineHeight: 1.55 }}>
                <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 4 }}>
                  {isKa ? "ონლაინ გადახდა არ გჭირდება" : "No online payment needed"}
                </div>
                <p style={{ margin: 0, opacity: 0.75 }}>
                  {isKa
                    ? "გადახდის დეტალები (საბანკო გადარიცხვა ან მიწოდებისას ნაღდით) გაგიზიარდება შეკვეთის დადასტურების შემდეგ."
                    : "Payment details (bank transfer or cash on delivery) will be shared after we confirm your order."}
                </p>
              </div>
            </section>

            {/* Terms */}
            <label style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              cursor: "pointer", padding: "4px 0",
            }}>
              <input
                id="co-terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: C.burnt, marginTop: 2, flexShrink: 0 }}
              />
              <span style={{ fontFamily: PRICE_FONT, fontSize: 13, color: C.ink, opacity: errors.terms ? 0.95 : 0.7, lineHeight: 1.5 }}>
                {isKa ? (
                  <>
                    ვეთანხმები{" "}
                    <Link href={`/${lang}/terms`} style={{ color: C.burnt, textDecoration: "underline" }}>წესებსა და პირობებს</Link>
                    {" "}და{" "}
                    <Link href={`/${lang}/privacy`} style={{ color: C.burnt, textDecoration: "underline" }}>კონფიდენციალურობის პოლიტიკას</Link>.
                  </>
                ) : (
                  <>
                    I agree to the{" "}
                    <Link href={`/${lang}/terms`} style={{ color: C.burnt, textDecoration: "underline" }}>terms</Link>
                    {" "}and{" "}
                    <Link href={`/${lang}/privacy`} style={{ color: C.burnt, textDecoration: "underline" }}>privacy policy</Link>.
                  </>
                )}
              </span>
            </label>
            {errors.terms && (
              <p style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.rose, margin: "-6px 0 0 28px" }}>
                {isKa ? "გთხოვ მონიშნე ეთანხმები" : "Please accept the terms"}
              </p>
            )}
            {submitError && (
              <p style={{
                fontFamily: PRICE_FONT, fontSize: 12, color: C.rose,
                background: `${C.rose}14`, border: `1px solid ${C.rose}33`,
                borderRadius: 10, padding: "10px 12px", margin: 0,
              }}>
                {submitError}
              </p>
            )}

            {/* Submit button */}
            <div style={{ paddingTop: 4 }}>
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  background: C.burnt, color: C.cream,
                  fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16, letterSpacing: "0.02em",
                  border: "none",
                  borderRadius: 14,
                  padding: "18px 22px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: "transform 0.18s ease",
                }}
                className="hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    {isKa ? "შეკვეთის გაგზავნა" : "Submit order"}
                  </>
                )}
              </button>

              <p style={{
                fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.55,
                textAlign: "center", marginTop: 12, marginBottom: 0, lineHeight: 1.5,
              }}>
                {isKa
                  ? "ჩვენ დაგიკავშირდებით გადახდის და მიწოდების შესათანხმებლად."
                  : "We'll reach out to agree on payment and delivery."}
              </p>
            </div>

            {/* Policies */}
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center",
              gap: "10px 28px",
              fontFamily: FRAUNCES, fontWeight: 500, fontSize: 12,
              letterSpacing: "0.06em",
              color: C.ink, opacity: 0.5,
              borderTop: `1px dashed rgba(42,29,20,0.18)`,
              paddingTop: 24, paddingBottom: 40,
            }}>
              <Link href={`/${lang}/terms`} style={{ color: "inherit", textDecoration: "none" }} className="hover:opacity-80">{dictionary.checkout.policies.refund}</Link>
              <Link href={`/${lang}/privacy`} style={{ color: "inherit", textDecoration: "none" }} className="hover:opacity-80">{dictionary.checkout.policies.privacy}</Link>
              <Link href={`/${lang}/terms`} style={{ color: "inherit", textDecoration: "none" }} className="hover:opacity-80">{dictionary.checkout.policies.terms}</Link>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
