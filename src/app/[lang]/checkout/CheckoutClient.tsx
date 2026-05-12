"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreHydration } from "@/store/useHydration";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, Lock, User as UserIcon, CheckCircle2, CreditCard, Wallet, ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import { Order } from "@/lib/types";

const FRAUNCES = "var(--font-noto-sans), var(--font-nunito), 'Inter', system-ui, -apple-system, sans-serif";
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
  
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "Tbilisi",
    postal: "",
    notes: ""
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
        postal: "",
        notes: ""
      });
      setIsGuest(false);
    }
  }, [isAuthenticated, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = dictionary.validation.required;
    if (!formData.phone) newErrors.phone = dictionary.validation.required;
    if (!formData.firstName) newErrors.firstName = dictionary.validation.required;
    if (!formData.lastName) newErrors.lastName = dictionary.validation.required;
    if (!formData.street) newErrors.street = dictionary.validation.required;
    if (!formData.city) newErrors.city = dictionary.validation.required;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validateForm()) return;

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
          image: i.product.images[0]
        };
      });

      const payload = {
        items: orderPayloadItems,
        subtotal,
        shipping,
        discount,
        total,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          streetAddress: formData.street,
          city: formData.city,
          phone: formData.phone
        },
        paymentMethod: paymentMethod as string,
        isGuest
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Checkout failed");

      const data = await response.json();
      const newOrder = data.order;
      
      const formattedOrder: Order = {
        ...newOrder,
        shippingAddress: JSON.parse(newOrder.shippingAddress),
        items: newOrder.items.map((i: any) => ({
          ...i,
          productName: JSON.parse(i.productName),
          variantName: JSON.parse(i.variantName)
        }))
      };

      if (isAuthenticated) {
        addOrder(formattedOrder);
      }

      clearCart();
      router.push(`/${lang}/checkout/success?orderId=${newOrder.id}`);
    } catch (err) {
      console.error(err);
      router.push(`/${lang}/checkout/failed`);
    }
    
    setIsSubmitting(false);
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
              fontSize: "clamp(28px, 4vw, 44px)",
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
              fontSize: "clamp(28px, 4vw, 44px)",
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
                        flexShrink: 0,
                      }}>
                        <div style={{
                          position: "absolute", inset: 0,
                          borderRadius: 10, background: "#f5f5f5",
                          overflow: "hidden",
                          border: `1px solid rgba(42,29,20,0.08)`,
                        }}>
                          <Image src={item.product.images[0] || "/placeholder.jpg"} alt={productName} fill className="object-cover" />
                        </div>
                        <span style={{
                          position: "absolute", top: -6, right: -6,
                          width: 22, height: 22, borderRadius: "50%",
                          background: C.ink, color: C.cream,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontFamily: FRAUNCES, fontWeight: 700, fontSize: 11,
                          border: `2px solid ${C.softCream}`,
                          zIndex: 2,
                        }}>{item.quantity}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                          color: C.ink, lineHeight: 1.25,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{productName}</div>
                        {meta && (
                          <div style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.ink, opacity: 0.55, marginTop: 2 }}>{meta}</div>
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
                  <span style={{ opacity: 0.7 }}>{dictionary.checkout.shippingC}</span>
                  <span style={{ color: shipping === 0 ? C.green : C.ink, fontWeight: 600 }}>
                    {shipping === 0 ? (isKa ? "უფასო" : "Free") : <Price value={shipping} />}
                  </span>
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
                <Price value={total} big />
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
                <span style={{ fontFamily: PRICE_FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: C.burnt }}>01</span>
                {dictionary.checkout.contact}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>{dictionary.checkout.email}</label>
                  <input
                    type="email"
                    placeholder="hello@example.com"
                    style={errors.email ? inputErrorStyle : inputStyle}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isAuthenticated}
                  />
                  {errors.email && <span style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.rose, marginLeft: 4 }}>{errors.email}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>{dictionary.checkout.phone}</label>
                  <input
                    type="tel"
                    placeholder="+995 5XX XXX XXX"
                    style={errors.phone ? inputErrorStyle : inputStyle}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {errors.phone && <span style={{ fontFamily: PRICE_FONT, fontSize: 11, color: C.rose, marginLeft: 4 }}>{errors.phone}</span>}
                </div>
              </div>
            </section>

            {/* 2. Address */}
            <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={sectionTitleStyle}>
                <Star size={14} />
                <span style={{ fontFamily: PRICE_FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: C.burnt }}>02</span>
                {dictionary.checkout.address}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>{dictionary.checkout.firstName}</label>
                  <input
                    placeholder={dictionary.checkout.firstName}
                    style={errors.firstName ? inputErrorStyle : inputStyle}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>{dictionary.checkout.lastName}</label>
                  <input
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
                  placeholder={dictionary.checkout.street}
                  style={errors.street ? inputErrorStyle : inputStyle}
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>{dictionary.checkout.city}</label>
                  <input
                    placeholder={dictionary.checkout.city}
                    style={errors.city ? inputErrorStyle : inputStyle}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>{dictionary.checkout.postal}</label>
                  <input
                    placeholder={dictionary.checkout.postal}
                    style={inputStyle}
                    value={formData.postal}
                    onChange={(e) => setFormData({ ...formData, postal: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* 3. Shipping */}
            <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={sectionTitleStyle}>
                <Star size={14} />
                <span style={{ fontFamily: PRICE_FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: C.burnt }}>03</span>
                {dictionary.checkout.shippingMethod}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {radioOption(
                  "shipping", "standard", shippingMethod === "standard",
                  () => setShippingMethod("standard"),
                  dictionary.checkout.standard, dictionary.checkout.standardDesc,
                  <Price value={5} />,
                )}
                {radioOption(
                  "shipping", "express", shippingMethod === "express",
                  () => setShippingMethod("express"),
                  dictionary.checkout.express, dictionary.checkout.expressDesc,
                  <Price value={15} />,
                )}
              </div>
            </section>

            {/* 4. Payment */}
            <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={sectionTitleStyle}>
                <Star size={14} />
                <span style={{ fontFamily: PRICE_FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: C.burnt }}>04</span>
                {dictionary.checkout.payment}
              </h2>
              <p style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.55, margin: 0, marginLeft: 4 }}>
                {dictionary.checkout.secureMsg}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {radioOption(
                  "payment", "card", paymentMethod === "card",
                  () => setPaymentMethod("card"),
                  dictionary.checkout.card, null,
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ width: 30, height: 18, background: "#e9e2d4", borderRadius: 4 }} />
                    <div style={{ width: 30, height: 18, background: "#e9e2d4", borderRadius: 4 }} />
                  </div>,
                  <CreditCard size={18} />,
                )}

                {paymentMethod === "card" && (
                  <div style={{
                    background: C.softCream,
                    border: `1px solid rgba(42,29,20,0.08)`,
                    borderRadius: 14,
                    padding: 18,
                    display: "grid",
                    gap: 14,
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={labelStyle}>{dictionary.checkout.cardNumber}</label>
                      <input placeholder="0000 0000 0000 0000" style={{ ...inputStyle, fontFamily: "ui-monospace, SFMono-Regular, monospace", letterSpacing: "0.08em" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={labelStyle}>{dictionary.checkout.expiryDate}</label>
                        <input placeholder="MM / YY" style={inputStyle} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={labelStyle}>{dictionary.checkout.cvc}</label>
                        <input placeholder="CVC" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={labelStyle}>{dictionary.checkout.nameCard}</label>
                      <input placeholder="ANNA SMITH" style={{ ...inputStyle, textTransform: "uppercase" }} />
                    </div>
                  </div>
                )}

                {radioOption(
                  "payment", "cash", paymentMethod === "cash",
                  () => setPaymentMethod("cash"),
                  dictionary.checkout.cash, null,
                  null,
                  <Wallet size={18} />,
                )}
              </div>
            </section>

            {/* Pay button */}
            <div style={{ paddingTop: 8 }}>
              <button
                type="button"
                onClick={handlePay}
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
                    <Lock size={16} />
                    {dictionary.checkout.pay} · <Price value={total} />
                  </>
                )}
              </button>

              <p style={{
                fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.5,
                textAlign: "center", marginTop: 14, marginBottom: 0,
              }}>
                {isKa ? "უსაფრთხო გადახდა · ხელნაკეთი თბილისში" : "Secure checkout · Handmade in Tbilisi"}
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
