"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useStoreHydration } from "@/store/useHydration";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, Tag } from "lucide-react";
import { Locale } from "@/i18n/config";

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  ink: "#2a1d14",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  burnt: "#d56826",
  green: "#3f6f56",
  champagne: "#c9a86c",
  rose: "#c4849a",
};

interface CartClientProps {
  dictionary: any;
  lang: Locale;
}

export default function CartClient({ dictionary, lang }: CartClientProps) {
  useStoreHydration();
  const { items, removeItem, updateQuantity, getSummary, applyPromoCode, discount } = useCartStore();
  const { subtotal, total, discountAmount, shipping } = getSummary();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const isKa = lang === "ka";

  const handleApplyPromo = () => {
    const success = applyPromoCode(promoCode);
    setPromoSuccess(success);
    setPromoError(!success);
  };

  if (items.length === 0) {
    return (
      <div style={{ background: C.cream, minHeight: "80vh" }}>
        <div
          className="h-2 w-full"
          style={{ background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
          aria-hidden="true"
        />
        <div className="container py-24 flex flex-col items-center text-center gap-8">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 14 }}
            style={{ fontSize: 64, lineHeight: 1 }}
            aria-hidden="true"
          >
            🛒
          </motion.span>
          <h1
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 60px)",
              color: C.ink,
              lineHeight: 1.0,
            }}
          >
            {isKa ? "კალათა ცარიელია" : "Your basket is empty"}
          </h1>
          <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 17, color: C.champagne, maxWidth: 380 }}>
            {isKa ? "ჯერ კიდევ არ გამოგიყვანია ის ჩანთა." : "You haven't picked a bag yet."}
          </p>
          <Link
            href={`/${lang}/shop`}
            className="inline-flex items-center gap-2.5 font-extrabold text-[13px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            style={{
              fontFamily: FRAUNCES,
              fontWeight: 800,
              background: C.ink,
              color: C.cream,
              borderRadius: 999,
              padding: "14px 32px",
              boxShadow: `0 5px 0 ${C.mustardDeep}`,
            }}
          >
            {isKa ? "მაღაზიაში გადასვლა" : "Go to shop"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {/* Top stripe */}
      <div
        className="h-2 w-full"
        style={{ background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
        aria-hidden="true"
      />

      <div className="container py-10 md:py-14 max-w-6xl">
        {/* Back link */}
        <Link
          href={`/${lang}/shop`}
          className="inline-flex items-center gap-1.5 mb-8 hover:underline underline-offset-4"
          style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: C.champagne }}
        >
          ← {isKa ? "მაღაზიაში დაბრუნება" : "Back to shop"}
        </Link>

        {/* Heading */}
        <h1
          className="mb-10"
          style={{
            fontFamily: isKa ? ALK_LIFE : FRAUNCES,
            fontStyle: isKa ? "normal" : "italic",
            fontWeight: 900,
            fontSize: "clamp(32px, 5vw, 58px)",
            color: C.ink,
            lineHeight: 1.0,
          }}
        >
          {isKa ? "კალათა" : dictionary.cartDrawer?.title ?? "Your basket"}
        </h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* ── Items ── */}
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {items.map((item) => {
                const name = item.product.name[lang] || item.product.name["ka"];
                const color = item.variant.color[lang] || item.variant.color["ka"];
                const linePrice = (item.variant.price || item.product.price) * item.quantity;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4 }}
                    className="flex gap-5 p-4 md:p-5"
                    style={{
                      background: C.beige,
                      borderRadius: 24,
                      border: `1.5px solid ${C.champagne}`,
                    }}
                  >
                    {/* Photo */}
                    <div
                      className="relative shrink-0 overflow-hidden"
                      style={{ width: 100, height: 120, borderRadius: 16, boxShadow: "0 6px 0 #d99820" }}
                    >
                      <Image
                        src={item.product.images[0] || "/placeholder.jpg"}
                        alt={name}
                        fill
                        className="object-cover"
                        style={{ filter: "saturate(0.95) sepia(0.03)" }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <Link
                          href={`/${lang}/product/${item.product.id}`}
                          className="hover:underline underline-offset-3"
                          style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: C.ink, display: "block" }}
                        >
                          {name}
                        </Link>
                        {color && (
                          <span
                            className="inline-block mt-1 px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.18em]"
                            style={{ fontFamily: FRAUNCES, color: C.champagne, background: C.cream, borderRadius: 999 }}
                          >
                            {color}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                        {/* Qty stepper */}
                        <div
                          className="inline-flex items-center gap-1 p-1"
                          style={{ background: C.cream, borderRadius: 999, border: `1.5px solid ${C.champagne}` }}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease"
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                            style={{ color: C.ink }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className="min-w-6 text-center"
                            style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase"
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                            style={{ color: C.ink }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price + delete */}
                        <div className="flex items-center gap-3">
                          <span style={{ fontFamily: PACIFICO, fontSize: 22, color: C.burnt }}>
                            {formatPrice(linePrice)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label="Remove"
                            className="w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors"
                            style={{ background: C.cream, color: C.rose, border: `1.5px solid ${C.rose}` }}
                          >
                            <Trash2 className="w-4 h-4" />
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
            className="p-7 sticky top-24"
            style={{
              background: C.beige,
              borderRadius: 28,
              border: `2px solid ${C.champagne}`,
              boxShadow: "0 12px 32px rgba(42,29,20,0.10)",
            }}
          >
            <h2
              className="mb-6 pb-4"
              style={{
                fontFamily: isKa ? ALK_LIFE : FRAUNCES,
                fontStyle: isKa ? "normal" : "italic",
                fontWeight: 800,
                fontSize: 22,
                color: C.ink,
                borderBottom: `1.5px dashed ${C.champagne}`,
              }}
            >
              {isKa ? "შეკვეთის შეჯამება" : "Order summary"}
            </h2>

            <div className="space-y-4 mb-6" style={{ fontFamily: FRAUNCES }}>
              <div className="flex justify-between text-[13px] font-semibold" style={{ color: C.champagne }}>
                <span>{isKa ? "სულ ფასი" : "Subtotal"}</span>
                <span style={{ color: C.ink }}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-semibold" style={{ color: C.champagne }}>
                <span>{isKa ? "მიწოდება" : "Shipping"}</span>
                <span style={{ color: shipping === 0 ? C.green : C.ink, fontWeight: 700 }}>
                  {shipping === 0 ? (isKa ? "უფასო" : "FREE") : formatPrice(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div
                  className="flex justify-between text-[13px] font-bold px-3 py-2"
                  style={{ color: C.green, background: C.cream, borderRadius: 12, border: `1px solid ${C.green}` }}
                >
                  <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {discount}%</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div
                className="flex justify-between pt-4"
                style={{ borderTop: `1.5px dashed ${C.champagne}` }}
              >
                <span style={{ fontFamily: isKa ? ALK_LIFE : FRAUNCES, fontStyle: isKa ? "normal" : "italic", fontWeight: 900, fontSize: 20, color: C.ink }}>
                  {isKa ? "სულ" : "Total"}
                </span>
                <span style={{ fontFamily: PACIFICO, fontSize: 26, color: C.burnt }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Promo code */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.champagne }} />
                <input
                  type="text"
                  placeholder={isKa ? "პრომო კოდი" : "Promo code"}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-[13px] font-bold outline-none"
                  style={{
                    fontFamily: FRAUNCES,
                    background: C.cream,
                    border: `1.5px solid ${promoError ? C.rose : C.champagne}`,
                    borderRadius: 999,
                    color: C.ink,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 h-11 text-[12px] font-extrabold uppercase tracking-[0.15em] transition-transform hover:-translate-y-0.5"
                style={{ fontFamily: FRAUNCES, background: C.ink, color: C.cream, borderRadius: 999 }}
              >
                {isKa ? "გამოყენება" : "Apply"}
              </button>
            </div>
            {promoError && (
              <p className="text-[11px] font-bold mb-3" style={{ color: C.rose, fontFamily: FRAUNCES }}>
                {isKa ? "კოდი არასწორია" : "Invalid promo code"}
              </p>
            )}
            {promoSuccess && (
              <p className="text-[11px] font-bold mb-3" style={{ color: C.green, fontFamily: FRAUNCES }}>
                {isKa ? "კოდი გამოყენებულია ✓" : "Code applied ✓"}
              </p>
            )}

            {/* Checkout CTA */}
            <Link
              href={`/${lang}/checkout`}
              className="flex items-center justify-center gap-2.5 w-full font-extrabold text-[13px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              style={{
                fontFamily: FRAUNCES,
                fontWeight: 800,
                background: C.ink,
                color: C.cream,
                borderRadius: 999,
                padding: "15px 24px",
                boxShadow: `0 5px 0 ${C.mustardDeep}`,
              }}
            >
              {isKa ? "გადახდა" : "Checkout"}
              <span aria-hidden="true">→</span>
            </Link>

            {/* Trust note */}
            <p
              className="mt-5 text-center text-[11px] font-semibold"
              style={{ fontFamily: FRAUNCES, color: C.champagne, letterSpacing: "0.1em" }}
            >
              ✦ {isKa ? "უსაფრთხო გადახდა" : "Secure checkout"} ✦
            </p>
          </div>
        </div>
      </div>

      {/* Bottom stripe */}
      <div
        className="h-2 w-full mt-16"
        style={{ background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
        aria-hidden="true"
      />
    </div>
  );
}
