"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useStoreHydration } from "@/store/useHydration";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, Tag, ShoppingBag } from "lucide-react";
import { Locale } from "@/i18n/config";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  champagne: "#c9a86c",
  lavender: "#9e8abf",
  sage: "#7aaa8a",
  rose: "#c4849a",
};

const NAMED_COLORS: Record<string, string> = {
  rose: C.rose, burnt: C.burnt, mustard: C.mustard, sage: C.sage,
  lavender: C.lavender, green: C.green, champagne: C.champagne,
  cream: C.cream, ink: C.ink,
};

/** Read an admin colour override from a tags array — same syntax used on the
 *  product details hero. Accepts `color:#abcdef`, `color:rose`, `color:rgb(…)`,
 *  or a bare `#abcdef` / `rgb(…)` tag. */
function colorFromTags(tags?: string[]): string | null {
  if (!tags) return null;
  const isHex = (v: string) => /^#[0-9a-f]{3,8}$/i.test(v);
  const isRgb = (v: string) => /^rgba?\(\s*\d+/i.test(v);
  for (const raw of tags) {
    const t = raw.trim();
    if (!t) continue;
    if (t.toLowerCase().startsWith("color:")) {
      const v = t.slice(6).trim();
      if (isHex(v) || isRgb(v)) return v;
      const named = NAMED_COLORS[v.toLowerCase()];
      if (named) return named;
    }
    if (isHex(t) || isRgb(t)) return t;
  }
  return null;
}

/** Convert any colour expression (hex or rgb(…)) to the same colour with the
 *  given alpha so we can show it at 50% over a white card. */
function withAlpha(color: string, alpha = 0.5): string {
  const c = color.trim();
  if (/^rgba?\(/i.test(c)) {
    // strip existing alpha (if any), re-apply
    const nums = c.match(/[\d.]+/g) || [];
    const [r = "0", g = "0", b = "0"] = nums;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // hex (#rgb, #rgba, #rrggbb, #rrggbbaa)
  let h = c.replace("#", "");
  if (h.length === 3) h = h.split("").map(x => x + x).join("");
  if (h.length === 4) h = h.slice(0, 3).split("").map(x => x + x).join("") + (h[3] + h[3]);
  if (h.length !== 6 && h.length !== 8) return color;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Row background: admin tag → use it at 50%, else white. */
function rowBg(tags?: string[]): string {
  const fromTag = colorFromTags(tags);
  if (!fromTag) return "white";
  return withAlpha(fromTag, 0.5);
}

interface CartClientProps {
  dictionary: any;
  lang: Locale;
}

const PRICE_FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

function CartStar({ size = 14, color = C.mustard }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill={color} />
    </svg>
  );
}

function Price({ value, big = false }: { value: number; big?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, fontFamily: FRAUNCES, color: C.ink, lineHeight: 1 }}>
      <span style={{ fontWeight: 700, fontSize: big ? 32 : 16, letterSpacing: "-0.02em" }}>{value}</span>
      <span style={{
        fontFamily: PRICE_FONT, fontWeight: 500,
        fontSize: big ? 12 : 11,
        color: C.ink, opacity: 0.55,
        marginBottom: big ? 4 : 2,
      }}>₾</span>
    </span>
  );
}

export default function CartClient({ dictionary, lang }: CartClientProps) {
  useStoreHydration();
  const { items, removeItem, updateQuantity, getSummary, applyPromoCode, clearPromoCode, discount, promoCode: appliedCode } = useCartStore();
  const { subtotal, total, discountAmount, shipping } = getSummary();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const isKa = lang === "ka";

  const handleApplyPromo = async () => {
    const success = await applyPromoCode(promoCode);
    setPromoSuccess(success);
    setPromoError(!success);
    if (success) setPromoCode("");
  };

  const handleRemovePromo = () => {
    clearPromoCode();
    setPromoSuccess(false);
    setPromoError(false);
    setPromoCode("");
  };

  if (items.length === 0) {
    return (
      <div style={{
        background: "#fffcf5",
        minHeight: "60vh",
        position: "relative",
        overflow: "hidden",
        backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
        backgroundSize: "26px 26px",
      }}>
        <span aria-hidden="true" style={{ position: "absolute", top: 60, left: "8%", opacity: 0.7 }}><CartStar size={16} /></span>
        <span aria-hidden="true" style={{ position: "absolute", top: 40, right: "10%", opacity: 0.55 }}><CartStar size={12} color={C.burnt} /></span>
        <span aria-hidden="true" style={{ position: "absolute", bottom: 80, left: "12%", opacity: 0.5 }}><CartStar size={14} /></span>
        <span aria-hidden="true" style={{ position: "absolute", bottom: 60, right: "10%", opacity: 0.55 }}><CartStar size={18} /></span>
        <div className="container py-20 md:py-28 flex flex-col items-center text-center gap-7 max-w-xl" style={{ position: "relative" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 88, height: 88, borderRadius: "50%",
              background: "#f9f4eb",
              color: C.burnt,
            }}
          >
            <ShoppingBag size={36} strokeWidth={1.6} />
          </span>
          <h1
            style={{
              fontFamily: FRAUNCES,
              fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 32px)",
              color: C.ink,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {isKa ? "კალათა ცარიელია" : "Your basket is empty"}
          </h1>
          <p style={{
            fontFamily: PRICE_FONT,
            fontSize: 15, color: C.ink, opacity: 0.6, margin: 0,
          }}>
            {isKa ? "ჯერ კიდევ არ აგირჩევია ჩანთა." : "You haven't picked a bag yet."}
          </p>
          <Link
            href={`/${lang}/shop`}
            style={{
              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
              letterSpacing: "0.02em",
              background: C.burnt, color: C.cream,
              borderRadius: 999,
              padding: "12px 28px",
              display: "inline-flex", alignItems: "center", gap: 8,
              textDecoration: "none",
              transition: "transform 0.18s ease",
            }}
            className="hover:-translate-y-0.5"
          >
            {isKa ? "მაღაზიაში" : "Go to shop"} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fffcf5",
      minHeight: "60vh",
      position: "relative",
      overflow: "hidden",
      backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
      backgroundSize: "26px 26px",
    }}>
      {/* Sprinkled decorative stars */}
      <span aria-hidden="true" style={{ position: "absolute", top: 80, left: "5%", opacity: 0.85 }}><CartStar size={18} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 40, right: "8%", opacity: 0.7 }}><CartStar size={12} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 360, right: "4%", opacity: 0.65 }}><CartStar size={14} color={C.rose} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "50%", left: "3%", opacity: 0.6 }}><CartStar size={14} color={C.green} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 120, left: "8%", opacity: 0.7 }}><CartStar size={16} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 60, right: "12%", opacity: 0.6 }}><CartStar size={11} color={C.burnt} /></span>

      {/* Vibrant floating pebbles */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 180, left: "-3%",
        width: 110, height: 110,
        background: C.burnt, opacity: 0.26,
        borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
        transform: "rotate(-12deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: 80, right: "-2%",
        width: 90, height: 90,
        background: C.mustard, opacity: 0.36,
        borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%",
        transform: "rotate(18deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: "40%", left: "-2%",
        width: 70, height: 70,
        background: C.green, opacity: 0.24,
        borderRadius: "50%",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: "55%", right: "-3%",
        width: 100, height: 100,
        background: C.rose, opacity: 0.26,
        borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%",
        transform: "rotate(-6deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 60, right: "-3%",
        width: 130, height: 130,
        background: C.mustard, opacity: 0.32,
        borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%",
        transform: "rotate(10deg)",
      }} />

      {/* Squiggly wavy lines */}
      <svg aria-hidden="true" style={{ position: "absolute", top: 220, right: "14%", opacity: 0.55, pointerEvents: "none" }} width="100" height="20" viewBox="0 0 100 20">
        <path d="M 2 10 Q 11 1 20 10 T 38 10 T 56 10 T 74 10 T 92 10 T 98 10" stroke={C.burnt} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg aria-hidden="true" style={{ position: "absolute", bottom: 220, left: "20%", opacity: 0.55, pointerEvents: "none", transform: "rotate(-8deg)" }} width="90" height="20" viewBox="0 0 90 20">
        <path d="M 2 10 Q 10 1 18 10 T 34 10 T 50 10 T 66 10 T 82 10" stroke={C.green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <div className="container py-10 md:py-14 max-w-6xl" style={{ position: "relative" }}>
        {/* Back link */}
        <Link
          href={`/${lang}/shop`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: FRAUNCES, fontWeight: 500, fontSize: 13,
            color: C.ink, opacity: 0.6, textDecoration: "none",
            marginBottom: 24,
          }}
          className="hover:opacity-100"
        >
          ← {isKa ? "მაღაზიაში დაბრუნება" : "Back to shop"}
        </Link>

        {/* Heading */}
        <div className="flex items-baseline gap-4 mb-10 flex-wrap">
          <h1
            style={{
              fontFamily: FRAUNCES, fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 32px)",
              color: C.ink, lineHeight: 1.0,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {isKa ? "კალათა" : "Your basket"}
          </h1>
          <span style={{
            fontFamily: PRICE_FONT, fontSize: 14, color: C.ink, opacity: 0.55,
          }}>
            {items.length} {isKa ? (items.length === 1 ? "ნივთი" : "ნივთი") : (items.length === 1 ? "item" : "items")}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* ── Items ── */}
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {items.map((item) => {
                const name = item.product?.name?.[lang] || item.product?.name?.["ka"] || "";
                const variantField =
                  (item.variant as any)?.color ??
                  (item.variant as any)?.colorName ??
                  null;
                const variantLabel = variantField?.[lang] || variantField?.["ka"] || "";
                const unitPrice = item.variant?.price || item.product?.price || 0;
                const linePrice = unitPrice * item.quantity;
                const tint = rowBg((item.product as any)?.tags);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.32 }}
                    className="flex gap-4 md:gap-5 p-4 md:p-5"
                    style={{
                      background: tint,
                      borderRadius: 16,
                      border: `1px solid rgba(42,29,20,0.08)`,
                    }}
                  >
                    {/* Photo */}
                    <Link
                      href={`/${lang}/product/${item.product.id}`}
                      className="relative shrink-0 overflow-hidden block"
                      style={{ width: 96, height: 110, borderRadius: 12, background: "#f5f5f5" }}
                    >
                      <Image
                        src={item.product.images[0] || "/placeholder.jpg"}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link
                        href={`/${lang}/product/${item.product.id}`}
                        style={{
                          fontFamily: FRAUNCES, fontWeight: 600,
                          fontSize: 16, color: C.ink, lineHeight: 1.2,
                          textDecoration: "none",
                          letterSpacing: "-0.005em",
                        }}
                        className="hover:opacity-80"
                      >
                        {name}
                      </Link>
                      {variantLabel && (
                        <span style={{
                          fontFamily: PRICE_FONT,
                          fontSize: 12, color: C.ink, opacity: 0.55,
                          marginTop: 4,
                        }}>
                          {variantLabel}
                        </span>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-3 gap-3 flex-wrap">
                        {/* Qty stepper */}
                        <div style={{
                          display: "inline-flex", alignItems: "center",
                          border: `1.5px solid rgba(42,29,20,0.14)`,
                          borderRadius: 12,
                          background: "white",
                        }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease"
                            style={{ width: 34, height: 36, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{
                            minWidth: 24, textAlign: "center",
                            fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink,
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase"
                            style={{ width: 34, height: 36, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Line price + remove */}
                        <div className="flex items-center gap-3">
                          <Price value={linePrice} />
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label="Remove"
                            style={{
                              width: 34, height: 34,
                              border: "none", background: "transparent",
                              borderRadius: 999,
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              color: C.ink, opacity: 0.45,
                              cursor: "pointer",
                              transition: "opacity 0.18s ease, color 0.18s ease",
                            }}
                            className="hover:opacity-100 hover:text-[#c4849a]!"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Summary panel ── */}
          <div
            className="p-6 lg:sticky lg:top-24"
            style={{
              background: "#f9f4eb",
              borderRadius: 18,
              border: `1px solid rgba(42,29,20,0.08)`,
            }}
          >
            <div style={{
              fontFamily: FRAUNCES, fontWeight: 600,
              fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase",
              color: C.ink, opacity: 0.55,
              marginBottom: 18,
            }}>
              {isKa ? "შეჯამება" : "Order summary"}
            </div>

            <div className="space-y-3 mb-5" style={{ fontFamily: PRICE_FONT }}>
              <div className="flex justify-between text-[14px]" style={{ color: C.ink }}>
                <span style={{ opacity: 0.7 }}>{isKa ? "სულ" : "Subtotal"}</span>
                <Price value={subtotal} />
              </div>
              <div className="flex justify-between text-[14px]" style={{ color: C.ink }}>
                <span style={{ opacity: 0.7 }}>{isKa ? "მიწოდება" : "Shipping"}</span>
                <span style={{ color: shipping === 0 ? C.green : C.ink, fontWeight: 600 }}>
                  {shipping === 0
                    ? (isKa ? "უფასო" : "Free")
                    : <Price value={shipping} />}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[14px]" style={{ color: C.green }}>
                  <span className="flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                    <Tag size={13} /> {discount}%
                  </span>
                  <span style={{ fontWeight: 600 }}>−{formatPrice(discountAmount)}</span>
                </div>
              )}
            </div>

            <div
              className="flex items-baseline justify-between mb-6 pt-4"
              style={{ borderTop: `1px solid rgba(42,29,20,0.10)` }}
            >
              <span style={{
                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16,
                color: C.ink, letterSpacing: "-0.005em",
              }}>
                {isKa ? "სულ ჯამი" : "Total"}
              </span>
              <Price value={total} big />
            </div>

            {/* Promo code — show applied state whenever a discount is active,
                 even if the code name was lost on an older session. */}
            {discount > 0 ? (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px",
                  background: `${C.green}14`,
                  border: `1.5px solid ${C.green}40`,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <Tag size={14} style={{ color: C.green, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13, color: C.green, letterSpacing: "0.04em" }}>
                    {appliedCode || (isKa ? "კოდი გამოყენებულია" : "Code applied")}
                  </span>
                  <span style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.green, opacity: 0.8, marginLeft: 8 }}>
                    −{discount}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  aria-label={isKa ? "კოდის წაშლა" : "Remove code"}
                  style={{
                    fontFamily: PRICE_FONT, fontSize: 12, fontWeight: 600,
                    background: "transparent", color: C.green,
                    border: "none", cursor: "pointer", padding: "4px 8px",
                  }}
                  className="hover:underline"
                >
                  {isKa ? "წაშლა" : "Remove"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.ink, opacity: 0.4 }} />
                    <input
                      type="text"
                      placeholder={isKa ? "პრომო კოდი" : "Promo code"}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 text-[13px] outline-none"
                      style={{
                        fontFamily: PRICE_FONT,
                        background: "white",
                        border: `1.5px solid ${promoError ? C.rose : "rgba(42,29,20,0.14)"}`,
                        borderRadius: 12,
                        color: C.ink,
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{
                      fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
                      letterSpacing: "0.02em",
                      background: "transparent", color: C.ink,
                      border: `1.5px solid rgba(42,29,20,0.18)`,
                      borderRadius: 12,
                      padding: "0 18px", height: 44,
                      cursor: "pointer",
                      transition: "background 0.18s ease",
                    }}
                    className="hover:bg-[rgba(42,29,20,0.05)]"
                  >
                    {isKa ? "გამოყენება" : "Apply"}
                  </button>
                </div>
                {promoError && (
                  <p style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.rose, margin: "4px 4px 0", opacity: 0.9 }}>
                    {isKa ? "კოდი არასწორია" : "Invalid promo code"}
                  </p>
                )}
                {promoSuccess && (
                  <p style={{ fontFamily: PRICE_FONT, fontSize: 12, color: C.green, margin: "4px 4px 0", opacity: 0.9 }}>
                    {isKa ? "კოდი გამოყენებულია ✓" : "Code applied ✓"}
                  </p>
                )}
              </>
            )}

            {/* Checkout CTA */}
            <Link
              href={`/${lang}/checkout`}
              style={{
                marginTop: 18,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                letterSpacing: "0.02em",
                background: C.burnt, color: C.cream,
                borderRadius: 14,
                padding: "14px 22px",
                textDecoration: "none",
                transition: "transform 0.18s ease, background 0.18s ease",
              }}
              className="hover:-translate-y-0.5"
            >
              {isKa ? "გადახდა" : "Checkout"}
              <span aria-hidden="true">→</span>
            </Link>

            {/* Trust note */}
            <p style={{
              fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.5,
              textAlign: "center", marginTop: 14, marginBottom: 0,
            }}>
              {isKa ? "უსაფრთხო გადახდა · ხელნაკეთი თბილისში" : "Secure checkout · Handmade in Tbilisi"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
