"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/lib/admin-api";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useStoreHydration } from "@/store/useHydration";
import { AdminProductCard } from "@/components/product/AdminProductCard";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

/* ─── Fonts ─── */
const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

/* ─── Palette ─── */
const C = {
  cream:       "#fef0d6",
  beige:       "#f5e3c2",
  ink:         "#2a1d14",
  mustard:     "#f3b62b",
  mustardDeep: "#d99820",
  burnt:       "#d56826",
  green:       "#3f6f56",
  champagne:   "#c9a86c",
  rose:        "#c4849a",
  teal:        "#1e4d43",
  blue:        "#5a9fd4",
  blueDark:    "#3a7faa",
  lavender:    "#9e8abf",
};

/* ─── 5-petal flower using round circle-arc petals (SSR-safe) ─── */
// Identical algorithm to ShopClient.flowerArc — only Math.sin/cos/sqrt used.
function flowerPath(petals: number, d: number, r: number, cx = 250, cy = 250): string {
  const step     = (Math.PI * 2) / petals;
  const halfStep = step / 2;
  const L        = d * Math.sin(halfStep);
  const midD     = d * Math.cos(halfStep);
  const W        = midD + Math.sqrt(Math.max(0, r * r - L * L));
  const waist: [number, number][] = Array.from({ length: petals }, (_, i) => {
    const a = i * step + halfStep;
    return [cx + W * Math.cos(a), cy + W * Math.sin(a)];
  });
  let p = `M ${waist[petals - 1][0].toFixed(1)} ${waist[petals - 1][1].toFixed(1)} `;
  for (let i = 0; i < petals; i++) {
    p += `A ${r} ${r} 0 0 1 ${waist[i][0].toFixed(1)} ${waist[i][1].toFixed(1)} `;
  }
  return p + "Z";
}

// Computed once at module level — identical on server and client (no Math.random)
const FLOWER = flowerPath(5, 100, 88, 250, 250);

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
    <div style={{ background: C.cream, minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* ── Large background glow blobs ── */}
      <div aria-hidden="true" style={{
        position: "absolute", top: -200, right: -180, width: 700, height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(196,132,154,0.14) 0%, transparent 62%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: 350, left: -140, width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(90,159,212,0.1) 0%, transparent 62%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 180, right: -80, width: 380, height: 380,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(243,182,43,0.08) 0%, transparent 62%)",
        pointerEvents: "none",
      }} />

      {/* ══════════════ MAIN GRID ══════════════ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 pt-7 md:pt-11 pb-0 relative z-10">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 mb-6 md:mb-10 overflow-x-auto whitespace-nowrap"
          style={{ fontFamily: FRAUNCES, fontSize: 11, color: C.champagne, letterSpacing: "0.08em" }}>
          <Link href={`/${lang}`}      className="hover:text-[#2a1d14] transition-colors shrink-0">{isKa ? "მთავარი" : "home"}</Link>
          <span className="shrink-0">/</span>
          <Link href={`/${lang}/shop`} className="hover:text-[#2a1d14] transition-colors shrink-0">{isKa ? "მაღაზია" : "shop"}</Link>
          <span className="shrink-0">/</span>
          <span style={{ color: C.ink, fontWeight: 700 }}>{name}</span>
        </nav>

        {/* ── Product grid ── */}
        <div className="grid gap-8 lg:gap-14 xl:gap-20 lg:grid-cols-[1.1fr_0.9fr] items-start">

          {/* ════════════════ LEFT — PHOTO ════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: [0.215, 0.61, 0.355, 1] }}
            style={{ position: "relative" }}
          >
            {/* ── Floating scattered stars ── */}
            <span aria-hidden="true" style={{ position:"absolute", top:"4%",  left:"5%",  zIndex:8, fontSize:22, color:C.mustard,  transform:"rotate(-10deg)", lineHeight:1, pointerEvents:"none" }}>✦</span>
            <span aria-hidden="true" style={{ position:"absolute", top:"8%",  right:"7%", zIndex:8, fontSize:14, color:C.rose,     transform:"rotate(18deg)",  lineHeight:1, pointerEvents:"none" }}>✦</span>
            <span aria-hidden="true" style={{ position:"absolute", top:"50%", left:"0%",  zIndex:8, fontSize:26, color:C.champagne, transform:"rotate(5deg)",   lineHeight:1, pointerEvents:"none" }}>✶</span>
            <span aria-hidden="true" style={{ position:"absolute", bottom:"30%", right:"1%", zIndex:8, fontSize:12, color:C.blue,                               lineHeight:1, pointerEvents:"none" }}>✦</span>
            <span aria-hidden="true" style={{ position:"absolute", bottom:"5%",  left:"16%", zIndex:8, fontSize:18, color:C.lavender, transform:"rotate(-18deg)", lineHeight:1, pointerEvents:"none" }}>✦</span>

            {/* ── Rotated sticker — top-left, bleeds off-edge ── */}
            <div style={{
              position: "absolute", top: "3%", left: "-3%", zIndex: 15,
              background: C.mustard, color: C.ink,
              fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
              letterSpacing: "0.32em", textTransform: "uppercase",
              padding: "6px 16px", borderRadius: 999,
              boxShadow: `0 7px 0 ${C.mustardDeep}, 0 10px 24px rgba(243,182,43,0.32)`,
              transform: "rotate(-15deg)",
              border: "2px solid rgba(255,255,255,0.55)",
            }}>
              {isKa ? "✦ ორიგინალი" : "✦ Original"}
            </div>

            {/* ── "New!" badge ── */}
            {product.tags.includes("new") && (
              <div style={{
                position: "absolute", top: "2%", right: "4%", zIndex: 15,
                background: C.rose, color: C.cream,
                fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
                letterSpacing: "0.32em", textTransform: "uppercase",
                padding: "6px 16px", borderRadius: 999,
                boxShadow: `0 6px 0 #a8607a`,
                transform: "rotate(11deg)",
                border: "2px solid rgba(255,255,255,0.4)",
              }}>
                {isKa ? "ახალი!" : "New!"}
              </div>
            )}

            {/* ── Sale badge ── */}
            {isOnSale && (
              <div style={{
                position: "absolute", top: "17%", right: "-3%", zIndex: 15,
                background: C.burnt, color: C.cream,
                fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
                letterSpacing: "0.28em", textTransform: "uppercase",
                padding: "6px 16px", borderRadius: 999,
                boxShadow: `0 6px 0 #a84010`,
                transform: "rotate(9deg)",
                border: "2px solid rgba(255,255,255,0.35)",
              }}>
                {isKa ? "ფასდაკლება" : "Sale!"}
              </div>
            )}

            {/* ── Flower photo SVG with layered rings ── */}
            <div style={{ padding: "13%", position: "relative" }}>
              <svg
                viewBox="0 0 500 500"
                style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
                aria-label={name}
              >
                <defs>
                  <clipPath id={`fc-${product.id}`}>
                    <path d={FLOWER} />
                  </clipPath>
                  <filter id={`fs-${product.id}`} x="-35%" y="-35%" width="170%" height="170%">
                    <feDropShadow dx="0" dy="20" stdDeviation="26" floodColor={C.rose} floodOpacity="0.24" />
                  </filter>
                </defs>

                {/* Outer dashed ring */}
                <circle cx="250" cy="250" r="258" fill="none"
                  stroke={C.rose} strokeWidth="2.5" strokeDasharray="10 8" opacity="0.32" />

                {/* Middle solid ring */}
                <circle cx="250" cy="250" r="240" fill="none"
                  stroke={C.champagne} strokeWidth="1.5" opacity="0.22" />

                {/* Inner dotted ring */}
                <circle cx="250" cy="250" r="224" fill="none"
                  stroke={C.rose} strokeWidth="2" strokeDasharray="3 6" opacity="0.2" />

                {/* Tinted drop shadow */}
                <path d={FLOWER} fill={C.rose} opacity="0.09" transform="translate(7,24)"
                  filter={`url(#fs-${product.id})`} />

                {/* Product photo, clipped to flower */}
                <image
                  href={activeImg}
                  x="0" y="0" width="500" height="500"
                  clipPath={`url(#fc-${product.id})`}
                  preserveAspectRatio="xMidYMid slice"
                  style={{ transition: "opacity 0.35s ease" }}
                />

                {/* Thick pastel-pink petal outline */}
                <path d={FLOWER} fill="none" stroke={C.rose} strokeWidth="15" strokeLinejoin="round" />

                {/* Inner highlight stroke */}
                <path d={FLOWER} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="5" strokeLinejoin="round" />
              </svg>
            </div>

            {/* ── Circular "Handmade in Tbilisi" stamp ── */}
            <div style={{
              position: "absolute",
              bottom: thumbs.length > 1 ? 130 : 20,
              right: 4,
              zIndex: 10,
            }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 110 110" width={84} height={84} aria-hidden="true">
                  <defs>
                    <path id={`sp-${product.id}`}
                      d="M 55,55 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                  </defs>
                  <circle cx="55" cy="55" r="40"
                    fill={C.beige}
                    stroke={C.champagne} strokeWidth="1.5" strokeDasharray="3 3"
                    opacity="0.96" />
                  <text style={{ fontFamily: FRAUNCES, fontSize: 7.5, fontWeight: 800, letterSpacing: "1.8px" }}>
                    <textPath href={`#sp-${product.id}`} startOffset="0%" fill={C.champagne}>
                      {isKa ? "✦ ხელნაკეთი · თბილისი · " : "✦ HANDMADE · TBILISI · "}
                    </textPath>
                  </text>
                </svg>
              </motion.div>
              {/* Center of stamp (not rotating) */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                pointerEvents: "none",
              }}>
                <span style={{ fontFamily: PACIFICO, fontSize: 11, color: C.rose, lineHeight: 1 }}>tissu</span>
                <span style={{ fontFamily: FRAUNCES, fontWeight: 900, fontSize: 7, color: C.champagne, letterSpacing: "2px", marginTop: 3 }}>2019</span>
              </div>
            </div>

            {/* ── Thumbnails ── */}
            {thumbs.length > 1 && (
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <div className="flex gap-3">
                  {thumbs.map(({ src, side }) => {
                    const active = activeSide === side;
                    return (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setActiveSide(side)}
                        aria-label={side === "front" ? (isKa ? "გარე" : "Front") : (isKa ? "შიდა" : "Back")}
                        style={{
                          width: 70, height: 70, borderRadius: 18, overflow: "hidden",
                          border: `3px solid ${active ? C.rose : "rgba(201,168,108,0.4)"}`,
                          boxShadow: active
                            ? `0 6px 0 ${C.mustardDeep}, 0 3px 16px rgba(196,132,154,0.3)`
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
                <div className="flex gap-3">
                  {thumbs.map(({ side }) => (
                    <span key={side} style={{
                      width: 70, textAlign: "center",
                      fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 11,
                      color: activeSide === side ? C.rose : C.champagne,
                      transition: "color 0.2s",
                    }}>
                      {side === "front" ? (isKa ? "გარე" : "front") : (isKa ? "შიდა" : "back")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* ════════════════ RIGHT — INFO ════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
            className="lg:pt-16 space-y-5"
          >
            {/* Decorative stars */}
            <div aria-hidden="true" style={{
              fontFamily: FRAUNCES, fontSize: 18,
              color: C.champagne, letterSpacing: "0.65em", opacity: 0.75,
            }}>
              ✦ ✦ ✦
            </div>

            {/* Category + stock badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span style={{
                fontFamily: FRAUNCES, fontWeight: 900,
                fontSize: 9, letterSpacing: "0.42em", textTransform: "uppercase",
                color: C.green,
                background: "rgba(63,111,86,0.13)",
                border: `2px solid rgba(63,111,86,0.24)`,
                padding: "6px 16px", borderRadius: 999,
                boxShadow: "0 4px 10px rgba(63,111,86,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}>
                {categoryLabel}
              </span>

              {inStock ? (
                <span style={{
                  fontFamily: FRAUNCES, fontWeight: 700, fontSize: 11,
                  letterSpacing: "0.16em", color: C.green, opacity: 0.88,
                }}>
                  ·&nbsp;{isKa ? `${product.stock} მარაგშია` : `${product.stock} in stock`}
                </span>
              ) : (
                <span style={{
                  fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
                  letterSpacing: "0.38em", textTransform: "uppercase",
                  color: C.rose,
                  background: "rgba(196,132,154,0.13)",
                  border: `2px solid rgba(196,132,154,0.3)`,
                  padding: "6px 16px", borderRadius: 999,
                }}>
                  {isKa ? "ამოიწურა" : "Sold out"}
                </span>
              )}
            </div>

            {/* ── TITLE — magazine-scale ── */}
            <h1 style={{
              fontFamily:    isKa ? ALK_LIFE : FRAUNCES,
              fontStyle:     isKa ? "normal" : "italic",
              fontWeight:    900,
              fontSize:      "clamp(60px, 7.8vw, 108px)",
              color:         C.rose,
              lineHeight:    0.88,
              letterSpacing: isKa ? "-0.01em" : "-0.03em",
              margin:        "2px 0 0",
              textShadow:    `3px 5px 0 rgba(196,132,154,0.18)`,
            }}>
              {name}
            </h1>

            {/* Size / colour */}
            {sub && (
              <p style={{
                fontFamily: FRAUNCES, fontStyle: "italic",
                fontSize: 13, color: C.champagne, letterSpacing: "0.06em",
              }}>
                {sub}
              </p>
            )}

            {/* ── Clearly visible dashed separator ── */}
            <div aria-hidden="true" style={{
              border: `2.5px dashed rgba(201,168,108,0.6)`,
              borderRadius: 999, margin: "2px 0",
            }} />

            {/* Price */}
            <div className="flex items-baseline gap-4 flex-wrap">
              <span style={{
                fontFamily: PACIFICO,
                fontSize:   "clamp(46px, 5.8vw, 68px)",
                color: C.ink, lineHeight: 1,
              }}>
                {product.price}{curr}
              </span>
              {isOnSale && product.original_price && (
                <span style={{
                  fontFamily: FRAUNCES, fontSize: 22,
                  color: C.champagne, textDecoration: "line-through", opacity: 0.68,
                }}>
                  {product.original_price}{curr}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{
                fontFamily: FRAUNCES, fontStyle: "italic",
                fontSize: 15, color: C.ink, lineHeight: 1.8,
                opacity: 0.74, maxWidth: 440,
              }}>
                {product.description}
              </p>
            )}

            {/* ── Feature pills — coloured, shadowed ── */}
            <div className="flex flex-wrap gap-2">
              <Pill color={C.green}   bg="rgba(63,111,86,0.13)"   border="rgba(63,111,86,0.3)"   shadow="rgba(63,111,86,0.18)">
                {isKa ? "✶ ხელნაკეთი"     : "✶ Handmade"}
              </Pill>
              <Pill color={C.blue}    bg="rgba(90,159,212,0.13)"  border="rgba(90,159,212,0.34)" shadow="rgba(90,159,212,0.18)">
                {isKa ? "💧 წყალგაუმტარი" : "💧 Water-resistant"}
              </Pill>
              {hasBack && (
                <Pill color={C.rose}  bg="rgba(196,132,154,0.13)" border="rgba(196,132,154,0.34)" shadow="rgba(196,132,154,0.18)">
                  {isKa ? "↺ ორმხრივი"    : "↺ Reversible"}
                </Pill>
              )}
            </div>

            {/* ── Quantity stepper ── */}
            <div className="flex items-center gap-5 flex-wrap">
              <span style={{
                fontFamily: FRAUNCES, fontWeight: 900, fontSize: 9,
                letterSpacing: "0.35em", textTransform: "uppercase", color: C.champagne,
              }}>
                {isKa ? "რაოდენობა" : "Qty"}
              </span>
              <div className="inline-flex items-center" style={{
                background: C.beige, borderRadius: 999,
                border: `2px solid rgba(201,168,108,0.55)`,
                boxShadow: "0 4px 12px rgba(42,29,20,0.07), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 rounded-full inline-flex items-center justify-center transition-colors hover:bg-[rgba(201,168,108,0.25)]"
                  style={{ color: C.ink }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span style={{
                  fontFamily: FRAUNCES, fontSize: 18, fontWeight: 900,
                  color: C.ink, minWidth: 34, textAlign: "center",
                }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="Increase quantity"
                  className="w-11 h-11 rounded-full inline-flex items-center justify-center transition-colors hover:bg-[rgba(201,168,108,0.25)]"
                  style={{ color: C.ink }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── CTA buttons — chunky, 3-D ── */}
            <div className="flex flex-wrap gap-3 pt-2">
              <motion.button
                type="button"
                onClick={onAddToCart}
                disabled={!inStock}
                whileHover={inStock ? { y: -6, scale: 1.03 } : {}}
                whileTap={inStock   ? { y:  1, scale: 0.97 } : {}}
                style={{
                  fontFamily: FRAUNCES, fontWeight: 900, fontSize: 11,
                  letterSpacing: "0.28em", textTransform: "uppercase",
                  background: C.mustard, color: C.ink,
                  borderRadius: 999, border: "none",
                  padding: "18px 40px",
                  cursor: inStock ? "pointer" : "not-allowed",
                  opacity: inStock ? 1 : 0.42,
                  /* Thick bottom shadow = 3-D effect; inset = bevel highlight */
                  boxShadow: inStock
                    ? `0 9px 0 ${C.mustardDeep}, 0 14px 32px rgba(243,182,43,0.3), inset 0 2px 0 rgba(255,255,255,0.35)`
                    : "none",
                  display: "inline-flex", alignItems: "center", gap: 10,
                  transition: "box-shadow 0.15s",
                }}
              >
                {isKa ? "კალათაში" : "Add to bag"}
                <span aria-hidden="true" style={{ fontSize: 18 }}>→</span>
              </motion.button>

              <motion.span
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ y: 1, scale: 0.97 }}
                style={{ display: "inline-flex" }}
              >
                <Link
                  href={`/${lang}/shop`}
                  style={{
                    fontFamily: FRAUNCES, fontWeight: 900, fontSize: 11,
                    letterSpacing: "0.28em", textTransform: "uppercase",
                    background: C.blue, color: C.cream,
                    borderRadius: 999,
                    padding: "18px 36px",
                    display: "inline-flex", alignItems: "center", gap: 8,
                    boxShadow: `0 9px 0 ${C.blueDark}, 0 14px 32px rgba(90,159,212,0.28), inset 0 2px 0 rgba(255,255,255,0.25)`,
                    textDecoration: "none",
                    transition: "box-shadow 0.15s",
                  }}
                >
                  {isKa ? "სხვა ჩანთები" : "See all bags"}
                </Link>
              </motion.span>
            </div>

            {/* Trust micro-copy */}
            <p style={{
              fontFamily: FRAUNCES, fontStyle: "italic",
              fontSize: 12, color: C.champagne, opacity: 0.88,
              paddingTop: 2,
            }}>
              {isKa
                ? "✦ ხელნაკეთი თბილისში · სწრაფი მიწოდება საქართველოში"
                : "✦ Handmade in Tbilisi · Fast delivery across Georgia"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ══ Dashed full-width divider ══ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 mt-14 md:mt-20">
        <div aria-hidden="true" style={{
          borderTop: `3px dashed rgba(201,168,108,0.5)`,
        }} />
      </div>

      {/* ══ Info strip ══ */}
      <section
        className="mt-10 md:mt-14 overflow-hidden"
        style={{
          background:   C.teal,
          borderTop:    `3px dashed rgba(201,168,108,0.48)`,
          borderBottom: `3px dashed rgba(201,168,108,0.48)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 py-10">
          <div className="flex flex-wrap gap-y-8 gap-x-8 justify-center md:justify-around">
            {[
              { icon: "🚚", title: isKa ? "უფასო მიწოდება" : "Free shipping",   sub: isKa ? "150₾-დან · 2–4 დღე"        : "over 150₾ · 2–4 days"     },
              { icon: "✦",  title: isKa ? "ხელნაკეთი"      : "Handmade",        sub: isKa ? "თბილისის სტუდიაში"         : "In our Tbilisi studio"     },
              { icon: "↺",  title: isKa ? "ორმხრივი"       : "Reversible",      sub: isKa ? "ორი მხარე, ერთი ჩანთა"    : "Two sides, one bag"        },
              { icon: "💧", title: isKa ? "წყალგაუმტარი"  : "Water-resistant",  sub: isKa ? "ტილო, სეზონი კარგი"       : "Canvas that handles rain"  },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3" style={{ minWidth: 160 }}>
                <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: PACIFICO, fontSize: 17, color: C.mustard, lineHeight: 1.2 }}>{item.title}</div>
                  <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.champagne, marginTop: 3, opacity: 0.85 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Related products ══ */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 mt-20 md:mt-28 pb-28 relative z-10">
          <div className="flex items-center gap-5 mb-10">
            <div style={{ flex: 1, borderTop: `2.5px dashed rgba(201,168,108,0.5)` }} />
            <h2 style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle:  isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize:   "clamp(22px, 2.8vw, 34px)",
              color:      C.ink,
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {isKa ? "შესაძლოა ესეც მოგეწონოს" : "You might also love"}
            </h2>
            <div style={{ flex: 1, borderTop: `2.5px dashed rgba(201,168,108,0.5)` }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {related.map((p) => (
              <AdminProductCard
                key={p.id}
                product={p}
                lang={lang}
                labels={{
                  addToBasket: copy.shop.card.addToBasket,
                  favourite:   copy.shop.card.favourite,
                  outOfStock:  isKa ? "ამოიწურა" : "Sold out",
                  flipSides:   isKa ? "გადმოაბრუნე" : "Flip sides",
                  badges:      copy.shop.badges,
                }}
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
      fontFamily: FRAUNCES, fontWeight: 800, fontSize: 12, letterSpacing: "0.09em",
      color, background: bg,
      padding: "7px 18px", borderRadius: 999,
      border: `2px solid ${border}`,
      display: "inline-flex", alignItems: "center",
      boxShadow: `0 5px 12px ${shadow}, inset 0 1px 0 rgba(255,255,255,0.55)`,
    }}>
      {children}
    </span>
  );
}
