"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Heart } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/lib/admin-api";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useStoreHydration } from "@/store/useHydration";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

/* ─── Fonts ─── */
const PACIFICO  = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES  = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE  = "var(--font-alk-life), serif";

/* ─── Palette — matches landing page exactly ─── */
const C = {
  cream:       "#fef0d6",
  beige:       "#f5e3c2",
  ink:         "#2a1d14",
  mustard:     "#f3b62b",
  mustardDeep: "#d99820",
  burnt:       "#d56826",
  burntDeep:   "#a84e1a",
  champagne:   "#c9a86c",
  rose:        "#c4849a",
  green:       "#3f6f56",
  blue:        "#5a9fd4",
  blueDark:    "#3a7faa",
  lavender:    "#9e8abf",
};

/* ─── Types ─── */
interface ProductDetailsClientProps {
  product: StorefrontProduct;
  related: StorefrontProduct[];
  lang: Locale;
  dictionary: any;
}

/* ══════════════════════════════════════════════════════════════════════ */
export function ProductDetailsClient({ product, related, lang }: ProductDetailsClientProps) {
  useStoreHydration();
  const copy = getLandingCopy(lang);

  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity,   setQuantity]   = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  /* ── Store actions — untouched ── */
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  /* ── Derived ── */
  const hasBack   = Boolean(product.image_back);
  const activeImg = activeSide === "back" && product.image_back
    ? product.image_back : product.image_front;
  const inStock   = product.in_stock && product.stock > 0;
  const isOnSale  = Boolean(product.original_price && product.original_price > product.price);
  const name      = product.name || product.code;
  const sub       = [product.size, product.color].filter(Boolean).join(" · ");
  const isKa      = lang === "ka";
  const curr      = product.currency === "GEL" ? "₾" : ` ${product.currency}`;
  const categoryLabel = copy.shop.filters[
    product.category === "tote" ? "bag" : product.category
  ];

  /* ── Cart handler — untouched ── */
  const onAddToCart = () => {
    if (!inStock) return;
    try {
      addItem(
        {
          id: product.id, slug: product.id,
          name:        { en: name, ka: name },
          subtitle:    { en: sub,  ka: sub  },
          description: { en: "",   ka: ""   },
          price:       product.price,
          images:      [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [{
            id: `${product.id}-default`, size: "one",
            colorName: { en: product.color || "default", ka: product.color || "default" },
            colorCode: "#264ba0", inStock: true,
          }],
          category: product.category as any, featured: true, badges: [],
        } as any,
        {
          id: `${product.id}-default`, size: "one",
          colorName: { en: product.color || "default", ka: product.color || "default" },
          colorCode: "#264ba0", inStock: true,
        } as any,
        quantity
      );
      openCart();
    } catch { openCart(); }
  };

  const thumbs = ([product.image_front, product.image_back] as (string | null)[])
    .map((src, i) => ({ src, side: i === 0 ? "front" : "back" } as const))
    .filter((t): t is { src: string; side: "front" | "back" } => Boolean(t.src));

  /* ══════════════ RENDER ══════════════ */
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* ── Thin rainbow top stripe — matches landing page energy ── */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${C.mustard} 0%, ${C.burnt} 35%, ${C.rose} 65%, ${C.mustard} 100%)`,
      }} />

      {/* ── Soft background glow ── */}
      <div aria-hidden="true" style={{
        position: "fixed", top: 0, right: 0, width: 500, height: 500, pointerEvents: "none",
        background: "radial-gradient(circle, rgba(196,132,154,0.07) 0%, transparent 65%)",
        borderRadius: "50%", zIndex: 0,
      }} />
      <div aria-hidden="true" style={{
        position: "fixed", bottom: 100, left: -80, width: 380, height: 380, pointerEvents: "none",
        background: "radial-gradient(circle, rgba(243,182,43,0.06) 0%, transparent 65%)",
        borderRadius: "50%", zIndex: 0,
      }} />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 pt-8 pb-0 relative z-10">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 mb-8 overflow-x-auto whitespace-nowrap"
          style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.champagne, letterSpacing: "0.04em" }}>
          <Link href={`/${lang}`}      className="hover:text-[#d56826] transition-colors shrink-0">{isKa ? "მთავარი" : "home"}</Link>
          <span className="shrink-0" style={{ color: C.champagne, opacity: 0.5 }}>✦</span>
          <Link href={`/${lang}/shop`} className="hover:text-[#d56826] transition-colors shrink-0">{isKa ? "მაღაზია" : "shop"}</Link>
          <span className="shrink-0" style={{ color: C.champagne, opacity: 0.5 }}>✦</span>
          <span style={{ color: C.ink, fontStyle: "normal", fontWeight: 700 }}>{name}</span>
        </nav>

        {/* ══════════════ PRODUCT GRID ══════════════ */}
        <div className="grid gap-10 lg:gap-16 xl:gap-20 lg:grid-cols-[1fr_1fr] items-start">

          {/* ════════════ LEFT — PHOTO ════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
            style={{ position: "relative" }}
          >
            {/* Wishlist heart — top right corner of frame */}
            <button
              type="button"
              onClick={() => setWishlisted((v) => !v)}
              aria-label={isKa ? "საყვარლებში" : "Add to wishlist"}
              style={{
                position: "absolute", top: 14, right: 14, zIndex: 20,
                width: 42, height: 42, borderRadius: "50%",
                background: C.cream, border: `2px solid rgba(201,168,108,0.5)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 4px 14px rgba(42,29,20,0.12)",
                transition: "transform 0.2s",
                color: wishlisted ? C.rose : C.champagne,
              }}
            >
              <Heart className="w-4 h-4" fill={wishlisted ? C.rose : "none"} />
            </button>

            {/* Rotated "Original" sticker */}
            <div style={{
              position: "absolute", top: 14, left: 14, zIndex: 20,
              background: C.mustard, color: C.ink,
              fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
              letterSpacing: "0.32em", textTransform: "uppercase",
              padding: "5px 14px", borderRadius: 999,
              boxShadow: `0 6px 0 ${C.mustardDeep}`,
              transform: "rotate(-12deg)",
              border: "2px solid rgba(255,255,255,0.6)",
            }}>
              {isKa ? "✦ ორიგინალი" : "✦ Original"}
            </div>

            {/* Sale badge */}
            {isOnSale && (
              <div style={{
                position: "absolute", top: 56, right: 14, zIndex: 20,
                background: C.burnt, color: C.cream,
                fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
                letterSpacing: "0.28em", textTransform: "uppercase",
                padding: "5px 14px", borderRadius: 999,
                boxShadow: `0 5px 0 ${C.burntDeep}`,
                transform: "rotate(8deg)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}>
                {isKa ? "ფასდაკლება" : "Sale!"}
              </div>
            )}

            {/* New badge */}
            {product.tags.includes("new") && !isOnSale && (
              <div style={{
                position: "absolute", top: 56, right: 14, zIndex: 20,
                background: C.rose, color: C.cream,
                fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
                letterSpacing: "0.28em", textTransform: "uppercase",
                padding: "5px 14px", borderRadius: 999,
                boxShadow: `0 5px 0 #a8607a`,
                transform: "rotate(8deg)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}>
                {isKa ? "ახალი!" : "New!"}
              </div>
            )}

            {/* ── MAIN PHOTO — large, clear, no clip path ── */}
            <div style={{
              borderRadius: 28,
              overflow: "hidden",
              aspectRatio: "4/5",
              position: "relative",
              boxShadow: `0 0 0 4px ${C.champagne}, 0 0 0 8px rgba(201,168,108,0.18), 0 24px 60px rgba(42,29,20,0.18)`,
              background: C.beige,
            }}>
              <Image
                src={activeImg}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-opacity duration-300"
                priority
              />
            </div>

            {/* ── Rotating stamp ── */}
            <div style={{
              position: "absolute", bottom: thumbs.length > 1 ? 100 : 16, right: -6, zIndex: 10,
            }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 110 110" width={80} height={80} aria-hidden="true">
                  <defs>
                    <path id={`sp-${product.id}`}
                      d="M 55,55 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                  </defs>
                  <circle cx="55" cy="55" r="40" fill={C.beige}
                    stroke={C.champagne} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.96" />
                  <text style={{ fontFamily: FRAUNCES, fontSize: 7.5, fontWeight: 800, letterSpacing: "1.8px" }}>
                    <textPath href={`#sp-${product.id}`} startOffset="0%" fill={C.champagne}>
                      {isKa ? "✦ ხელნაკეთი · თბილისი · " : "✦ HANDMADE · TBILISI · "}
                    </textPath>
                  </text>
                </svg>
              </motion.div>
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", pointerEvents: "none",
              }}>
                <span style={{ fontFamily: PACIFICO, fontSize: 11, color: C.rose, lineHeight: 1 }}>tissu</span>
                <span style={{ fontFamily: FRAUNCES, fontWeight: 900, fontSize: 7, color: C.champagne, letterSpacing: "2px", marginTop: 3 }}>2019</span>
              </div>
            </div>

            {/* ── Thumbnails ── */}
            {thumbs.length > 1 && (
              <div className="flex justify-center gap-3 mt-4">
                {thumbs.map(({ src, side }) => {
                  const active = activeSide === side;
                  return (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setActiveSide(side)}
                      aria-label={side === "front" ? (isKa ? "გარე" : "Front") : (isKa ? "შიდა" : "Back")}
                      style={{
                        width: 72, height: 72, borderRadius: 16, overflow: "hidden",
                        border: `3px solid ${active ? C.burnt : "rgba(201,168,108,0.4)"}`,
                        boxShadow: active
                          ? `0 6px 0 ${C.mustardDeep}, 0 4px 16px rgba(213,104,38,0.3)`
                          : "0 2px 8px rgba(42,29,20,0.08)",
                        cursor: "pointer", background: C.beige, flexShrink: 0,
                        transition: "all 0.2s", position: "relative",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {!active && <div style={{ position: "absolute", inset: 0, background: "rgba(254,240,214,0.4)" }} />}
                    </button>
                  );
                })}
              </div>
            )}
            {thumbs.length > 1 && (
              <div className="flex justify-center gap-3 mt-1.5">
                {thumbs.map(({ side }) => (
                  <span key={side} style={{
                    width: 72, textAlign: "center",
                    fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 11,
                    color: activeSide === side ? C.burnt : C.champagne,
                    transition: "color 0.2s",
                  }}>
                    {side === "front" ? (isKa ? "გარე" : "front") : (isKa ? "შიდა" : "back")}
                  </span>
                ))}
              </div>
            )}

            {/* Decorative stars scattered around the photo */}
            <span aria-hidden="true" style={{
              position: "absolute", top: "28%", left: "-5%", fontSize: 18,
              color: C.mustard, transform: "rotate(-15deg)", lineHeight: 1,
              pointerEvents: "none", zIndex: 5,
            }}>✦</span>
            <span aria-hidden="true" style={{
              position: "absolute", bottom: "32%", left: "-3%", fontSize: 13,
              color: C.rose, lineHeight: 1,
              pointerEvents: "none", zIndex: 5,
            }}>✶</span>
          </motion.div>

          {/* ════════════ RIGHT — INFO ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.215, 0.61, 0.355, 1] }}
            className="space-y-5"
          >
            {/* Category + stock row */}
            <div className="flex flex-wrap items-center gap-3">
              <span style={{
                fontFamily: FRAUNCES, fontWeight: 900,
                fontSize: 9, letterSpacing: "0.42em", textTransform: "uppercase",
                color: C.green, background: "rgba(63,111,86,0.12)",
                border: `1.5px solid rgba(63,111,86,0.28)`,
                padding: "6px 16px", borderRadius: 999,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
              }}>
                {categoryLabel}
              </span>
              {inStock ? (
                <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", color: C.green, opacity: 0.85 }}>
                  · {isKa ? `${product.stock} მარაგშია` : `${product.stock} in stock`}
                </span>
              ) : (
                <span style={{
                  fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
                  letterSpacing: "0.38em", textTransform: "uppercase",
                  color: C.rose, background: "rgba(196,132,154,0.12)",
                  border: `1.5px solid rgba(196,132,154,0.3)`,
                  padding: "6px 16px", borderRadius: 999,
                }}>
                  {isKa ? "ამოიწურა" : "Sold out"}
                </span>
              )}
            </div>

            {/* ── TITLE ── */}
            <h1 style={{
              fontFamily:    isKa ? ALK_LIFE : FRAUNCES,
              fontStyle:     isKa ? "normal" : "italic",
              fontWeight:    900,
              fontSize:      "clamp(44px, 6vw, 84px)",
              color:         C.burnt,
              lineHeight:    0.92,
              letterSpacing: isKa ? "-0.01em" : "-0.03em",
              margin:        0,
            }}>
              {name}
            </h1>

            {/* Size / colour */}
            {sub && (
              <p style={{
                fontFamily: FRAUNCES, fontStyle: "italic",
                fontSize: 14, color: C.champagne, letterSpacing: "0.06em", margin: 0,
              }}>
                {sub}
              </p>
            )}

            {/* Dashed divider */}
            <div style={{ borderTop: `2px dashed rgba(201,168,108,0.55)`, margin: "2px 0" }} />

            {/* ── Price ── */}
            <div className="flex items-baseline gap-4 flex-wrap">
              <span style={{ fontFamily: PACIFICO, fontSize: "clamp(36px, 4.8vw, 58px)", color: C.ink, lineHeight: 1 }}>
                {product.price}{curr}
              </span>
              {isOnSale && product.original_price && (
                <span style={{ fontFamily: FRAUNCES, fontSize: 20, color: C.champagne, textDecoration: "line-through", opacity: 0.65 }}>
                  {product.original_price}{curr}
                </span>
              )}
            </div>

            {/* ── Description ── */}
            {product.description && (
              <p style={{
                fontFamily: FRAUNCES, fontStyle: "italic",
                fontSize: 15, color: C.ink, lineHeight: 1.78,
                opacity: 0.72, maxWidth: 440, margin: 0,
              }}>
                {product.description}
              </p>
            )}

            {/* ── Feature pills ── */}
            <div className="flex flex-wrap gap-2">
              <Pill color={C.green}   bg="rgba(63,111,86,0.11)"   border="rgba(63,111,86,0.28)"   shadow="rgba(63,111,86,0.14)">
                {isKa ? "✶ ხელნაკეთი"     : "✶ Handmade"}
              </Pill>
              <Pill color={C.blue}    bg="rgba(90,159,212,0.11)"  border="rgba(90,159,212,0.3)"   shadow="rgba(90,159,212,0.14)">
                {isKa ? "💧 წყალგაუმტარი" : "💧 Water-resistant"}
              </Pill>
              {hasBack && (
                <Pill color={C.rose}  bg="rgba(196,132,154,0.11)" border="rgba(196,132,154,0.3)"  shadow="rgba(196,132,154,0.14)">
                  {isKa ? "↺ ორმხრივი"    : "↺ Reversible"}
                </Pill>
              )}
            </div>

            {/* ── Qty ── */}
            <div className="flex items-center gap-4 flex-wrap">
              <span style={{
                fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
                letterSpacing: "0.38em", textTransform: "uppercase", color: C.champagne,
              }}>
                {isKa ? "რაოდენობა" : "Qty"}
              </span>
              <div className="inline-flex items-center" style={{
                background: C.beige, borderRadius: 999,
                border: `2px solid rgba(201,168,108,0.5)`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
              }}>
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease"
                  className="w-11 h-11 rounded-full inline-flex items-center justify-center hover:bg-[rgba(213,104,38,0.1)] transition-colors"
                  style={{ color: C.ink }}>
                  <Minus className="w-4 h-4" />
                </button>
                <span style={{ fontFamily: FRAUNCES, fontSize: 18, fontWeight: 900, color: C.ink, minWidth: 34, textAlign: "center" }}>
                  {quantity}
                </span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} aria-label="Increase"
                  className="w-11 h-11 rounded-full inline-flex items-center justify-center hover:bg-[rgba(213,104,38,0.1)] transition-colors"
                  style={{ color: C.ink }}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── CTA buttons ── */}
            <div className="flex flex-wrap gap-3 pt-1">
              <motion.button
                type="button"
                onClick={onAddToCart}
                disabled={!inStock}
                whileHover={inStock ? { y: -5, scale: 1.03 } : {}}
                whileTap={inStock   ? { y:  1, scale: 0.97 } : {}}
                style={{
                  fontFamily: FRAUNCES, fontWeight: 900, fontSize: 12,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  background: C.mustard, color: C.ink,
                  borderRadius: 999, border: "none",
                  padding: "16px 36px",
                  cursor: inStock ? "pointer" : "not-allowed",
                  opacity: inStock ? 1 : 0.42,
                  boxShadow: inStock
                    ? `0 8px 0 ${C.mustardDeep}, 0 12px 28px rgba(243,182,43,0.28), inset 0 2px 0 rgba(255,255,255,0.38)`
                    : "none",
                  display: "inline-flex", alignItems: "center", gap: 10,
                  transition: "box-shadow 0.15s",
                }}
              >
                {isKa ? "კალათაში" : "Add to bag"}
                <span aria-hidden="true" style={{ fontSize: 16 }}>→</span>
              </motion.button>

              <motion.span whileHover={{ y: -5, scale: 1.03 }} whileTap={{ y: 1, scale: 0.97 }} style={{ display: "inline-flex" }}>
                <Link href={`/${lang}/shop`} style={{
                  fontFamily: FRAUNCES, fontWeight: 900, fontSize: 12,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  background: C.ink, color: C.cream,
                  borderRadius: 999,
                  padding: "16px 30px",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  boxShadow: `0 8px 0 rgba(42,29,20,0.55), 0 12px 28px rgba(42,29,20,0.2), inset 0 2px 0 rgba(255,255,255,0.12)`,
                  textDecoration: "none",
                  transition: "box-shadow 0.15s",
                }}>
                  {isKa ? "სხვა ჩანთები" : "See all bags"}
                </Link>
              </motion.span>
            </div>

            {/* Trust line */}
            <p style={{
              fontFamily: FRAUNCES, fontStyle: "italic",
              fontSize: 12, color: C.champagne, opacity: 0.85, margin: 0, paddingTop: 2,
            }}>
              {isKa
                ? "✦ ხელნაკეთი თბილისში · სწრაფი მიწოდება საქართველოში"
                : "✦ Handmade in Tbilisi · Fast delivery across Georgia"}
            </p>
          </motion.div>
        </div>

        {/* ══ Decorative dashed divider ══ */}
        <div className="mt-16 md:mt-24" style={{ borderTop: `2.5px dashed rgba(201,168,108,0.48)` }} />

        {/* ══ Features strip — warm, matches landing page ══ */}
        <section className="py-10 md:py-14">
          <div className="flex flex-wrap gap-y-8 gap-x-6 justify-center md:justify-around">
            {[
              { icon: "🚚", title: isKa ? "უფასო მიწოდება"  : "Free shipping",   sub: isKa ? "150₾-დან · 2–4 დღე"      : "over 150₾ · 2–4 days"   },
              { icon: "✦",  title: isKa ? "ხელნაკეთი"       : "Handmade",        sub: isKa ? "თბილისის სტუდიაში"       : "In our Tbilisi studio"   },
              { icon: "↺",  title: isKa ? "ორმხრივი"        : "Reversible",      sub: isKa ? "ორი მხარე, ერთი ჩანთა"  : "Two sides, one bag"      },
              { icon: "💧", title: isKa ? "წყალგაუმტარი"   : "Water-resistant",  sub: isKa ? "ტილო, სეზონი კარგი"     : "Canvas that handles rain"},
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3" style={{ minWidth: 150 }}>
                <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: PACIFICO, fontSize: 16, color: C.burnt, lineHeight: 1.2 }}>{item.title}</div>
                  <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.champagne, marginTop: 3, opacity: 0.85 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ Dashed divider ══ */}
        <div style={{ borderTop: `2.5px dashed rgba(201,168,108,0.48)` }} />
      </div>

      {/* ══ Related products ══ */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 mt-14 md:mt-20 pb-28 relative z-10">
          {/* Section heading */}
          <div className="flex items-center gap-4 mb-10">
            <div style={{ flex: 1, borderTop: `2px dashed rgba(201,168,108,0.45)` }} />
            <h2 style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle:  isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize:   "clamp(20px, 2.5vw, 30px)",
              color:      C.ink,
              whiteSpace: "nowrap", flexShrink: 0,
              margin: 0,
            }}>
              {isKa ? "შესაძლოა ესეც მოგეწონოს" : "You might also love"}
            </h2>
            <div style={{ flex: 1, borderTop: `2px dashed rgba(201,168,108,0.45)` }} />
          </div>

          {/* Editorial retro card grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {related.map((p, i) => (
              <RelatedProductCard
                key={p.id}
                product={p}
                lang={lang}
                index={i}
                isKa={isKa}
                copy={copy}
                addItem={addItem}
                openCart={openCart}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─── Feature pill ─── */
function Pill({
  children, color, bg, border, shadow,
}: { children: React.ReactNode; color: string; bg: string; border: string; shadow: string }) {
  return (
    <span style={{
      fontFamily: FRAUNCES, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em",
      color, background: bg,
      padding: "6px 16px", borderRadius: 999,
      border: `2px solid ${border}`,
      display: "inline-flex", alignItems: "center",
      boxShadow: `0 4px 10px ${shadow}, inset 0 1px 0 rgba(255,255,255,0.55)`,
    }}>
      {children}
    </span>
  );
}

/* ─── Related product card — retro editorial style ─── */
const CARD_ACCENT_COLORS = [C.mustard, C.rose, C.blue, C.green] as const;
type AccentColor = typeof CARD_ACCENT_COLORS[number];

function RelatedProductCard({
  product, lang, index, isKa, copy, addItem, openCart,
}: {
  product: StorefrontProduct;
  lang: string;
  index: number;
  isKa: boolean;
  copy: any;
  addItem: any;
  openCart: () => void;
}) {
  const accent = CARD_ACCENT_COLORS[index % CARD_ACCENT_COLORS.length];
  const isFallback = product.id.startsWith("fallback-");
  const name = product.name || product.code;
  const curr = product.currency === "GEL" ? "₾" : ` ${product.currency}`;
  const inStock = product.in_stock && product.stock > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    try {
      addItem(
        {
          id: product.id, slug: product.id,
          name: { en: name, ka: name }, subtitle: { en: "", ka: "" },
          description: { en: "", ka: "" },
          price: product.price,
          images: [product.image_front].filter(Boolean) as string[],
          variants: [{ id: `${product.id}-default`, size: "one", colorName: { en: "default", ka: "default" }, colorCode: "#264ba0", inStock: true }],
          category: product.category as any, featured: true, badges: [],
        } as any,
        { id: `${product.id}-default`, size: "one", colorName: { en: "default", ka: "default" }, colorCode: "#264ba0", inStock: true } as any,
        1
      );
      openCart();
    } catch { openCart(); }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      style={{ position: "relative" }}
    >
      <Link
        href={`/${lang}/product/${product.id}`}
        style={{
          display: "block",
          background: C.cream,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: `0 8px 24px rgba(42,29,20,0.1), 0 0 0 2px rgba(201,168,108,0.35)`,
          textDecoration: "none",
        }}
      >
        {/* Image — square, clear */}
        <div style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", background: C.beige }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_front}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          />
          {/* Accent colour top stripe */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 4,
            background: accent, opacity: 0.9,
          }} />
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px 14px" }}>
          <p style={{
            fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700,
            fontSize: 15, color: C.ink, lineHeight: 1.25, margin: 0,
          }}>
            {name}
          </p>
          {product.size && (
            <p style={{ fontFamily: FRAUNCES, fontSize: 10, color: C.champagne, letterSpacing: "0.08em", margin: "3px 0 0", textTransform: "uppercase" }}>
              {product.size}
            </p>
          )}
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <span style={{ fontFamily: PACIFICO, fontSize: 20, color: C.burnt }}>
              {product.price}{curr}
            </span>
          </div>
        </div>
      </Link>

      {/* Add to bag button — sits below the card */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        style={{
          marginTop: 10,
          width: "100%",
          fontFamily: FRAUNCES, fontWeight: 900, fontSize: 10,
          letterSpacing: "0.22em", textTransform: "uppercase",
          background: C.ink, color: C.cream,
          borderRadius: 999, border: "none",
          padding: "11px 0",
          cursor: inStock ? "pointer" : "not-allowed",
          opacity: inStock ? 1 : 0.4,
          boxShadow: inStock ? `0 5px 0 rgba(42,29,20,0.45)` : "none",
          transition: "transform 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        🛍 {isKa ? "კალათაში" : copy.shop.card.addToBasket}
      </button>
    </motion.div>
  );
}
