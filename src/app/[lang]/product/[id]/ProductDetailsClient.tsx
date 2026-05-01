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

/* ─────────────── Fonts ─────────────── */
const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

/* ─────────────── Palette ─────────────── */
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
  lavender:    "#9e8abf",
};

/* ─────────────── Organic blob path (SSR-safe, deterministic) ─────────────── */
// Uses only Math.sin — no Math.random — so server and client produce identical SVG.
function blobPath(cx = 250, cy = 250, rx = 210, ry = 205): string {
  const pts = 8;
  // Each point gets a deterministic radial offset from index-based sine
  const verts: [number, number][] = Array.from({ length: pts }, (_, i) => {
    const angle = (i / pts) * Math.PI * 2;
    const mod   = 0.88 + Math.abs(Math.sin((i + 1) * 2.55)) * 0.21;
    return [cx + mod * rx * Math.cos(angle), cy + mod * ry * Math.sin(angle)];
  });
  const mid = (a: number, b: number): [number, number] => [
    (verts[a][0] + verts[b][0]) / 2,
    (verts[a][1] + verts[b][1]) / 2,
  ];
  const s = mid(pts - 1, 0);
  let d = `M ${s[0].toFixed(1)} ${s[1].toFixed(1)} `;
  for (let i = 0; i < pts; i++) {
    const n = (i + 1) % pts;
    const m = mid(i, n);
    d += `Q ${verts[i][0].toFixed(1)} ${verts[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)} `;
  }
  return d + "Z";
}

// Computed once at module level — safe for SSR/hydration
const BLOB_PATH = blobPath();

/* ─────────────── Types ─────────────── */
interface ProductDetailsClientProps {
  product: StorefrontProduct;
  related: StorefrontProduct[];
  lang: Locale;
  dictionary: any;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export function ProductDetailsClient({ product, related, lang }: ProductDetailsClientProps) {
  useStoreHydration();
  const copy = getLandingCopy(lang);

  /* ── State (UI only) ── */
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity,   setQuantity]   = useState(1);

  /* ── Store actions — untouched business logic ── */
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  /* ── Derived values ── */
  const hasBack  = Boolean(product.image_back);
  const activeImg = activeSide === "back" && product.image_back
    ? product.image_back
    : product.image_front;
  const inStock  = product.in_stock && product.stock > 0;
  const isOnSale = Boolean(product.original_price && product.original_price > product.price);
  const name     = product.name || product.code;
  const sub      = [product.size, product.color].filter(Boolean).join(" · ");
  const isKa     = lang === "ka";
  const currencySymbol = product.currency === "GEL" ? "₾" : ` ${product.currency}`;

  const categoryLabel = copy.shop.filters[
    product.category === "tote" ? "bag" : product.category
  ];

  /* ── Cart handler — untouched business logic ── */
  const onAddToCart = () => {
    if (!inStock) return;
    try {
      addItem(
        {
          id: product.id, slug: product.id,
          name:        { en: name, ka: name },
          subtitle:    { en: sub,  ka: sub  },
          description: { en: "",   ka: ""   },
          price:  product.price,
          images: [product.image_front, product.image_back].filter(Boolean) as string[],
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

  /* ── Thumbnails (front + back if exists) ── */
  const thumbs = ([product.image_front, product.image_back] as (string | null)[])
    .map((src, i) => ({ src, side: i === 0 ? "front" : "back" } as const))
    .filter((t): t is { src: string; side: "front" | "back" } => Boolean(t.src));

  /* ══════════════ RENDER ══════════════ */
  return (
    <div style={{ background: C.cream, minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* ── Decorative background glows ── */}
      <div aria-hidden="true" style={{
        position: "absolute", top: -140, right: -120, width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(196,132,154,0.09) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: 260, left: -100, width: 380, height: 380,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(90,159,212,0.07) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 300, right: -60, width: 280, height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(243,182,43,0.06) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />

      {/* ── Page wrapper ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 pt-8 md:pt-14 pb-0 relative z-10">

        {/* ── Breadcrumb ── */}
        <nav
          className="flex items-center gap-1.5 mb-8 md:mb-12 overflow-x-auto whitespace-nowrap"
          style={{ fontFamily: FRAUNCES, fontSize: 12, color: C.champagne, letterSpacing: "0.06em" }}
        >
          <Link href={`/${lang}`}      className="hover:text-[#2a1d14] transition-colors shrink-0">{isKa ? "მთავარი" : "home"}</Link>
          <span className="shrink-0" style={{ opacity: 0.5 }}>/</span>
          <Link href={`/${lang}/shop`} className="hover:text-[#2a1d14] transition-colors shrink-0">{isKa ? "მაღაზია" : "shop"}</Link>
          <span className="shrink-0" style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: C.ink, fontWeight: 700 }}>{name}</span>
        </nav>

        {/* ── Two-column grid ── */}
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 items-start">

          {/* ════════════ LEFT — Image ════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1] }}
            className="relative"
          >
            {/* Dashed decorative rings behind the blob */}
            <div aria-hidden="true" style={{
              position: "absolute", top: "50%", left: "50%",
              width: "86%", height: "86%",
              transform: "translate(-50%, -52%) rotate(13deg)",
              borderRadius: "50%",
              border: `2.5px dashed ${C.rose}`,
              opacity: 0.3,
              pointerEvents: "none",
            }} />
            <div aria-hidden="true" style={{
              position: "absolute", top: "50%", left: "50%",
              width: "72%", height: "72%",
              transform: "translate(-47%, -50%) rotate(-9deg)",
              borderRadius: "50%",
              border: `2px dashed ${C.champagne}`,
              opacity: 0.22,
              pointerEvents: "none",
            }} />

            {/* Floating "New" badge */}
            {product.tags.includes("new") && (
              <div style={{
                position: "absolute", top: "10%", right: "7%", zIndex: 10,
                background: C.mustard, color: C.ink,
                fontFamily: FRAUNCES, fontWeight: 900, fontSize: 10,
                letterSpacing: "0.28em", textTransform: "uppercase",
                padding: "5px 14px", borderRadius: 999,
                boxShadow: `0 4px 0 ${C.mustardDeep}`,
                transform: "rotate(8deg)",
              }}>
                {isKa ? "ახალი" : "New ✦"}
              </div>
            )}

            {/* Floating "Sale" badge */}
            {isOnSale && (
              <div style={{
                position: "absolute", top: "10%", left: "7%", zIndex: 10,
                background: C.burnt, color: C.cream,
                fontFamily: FRAUNCES, fontWeight: 900, fontSize: 10,
                letterSpacing: "0.22em", textTransform: "uppercase",
                padding: "5px 14px", borderRadius: 999,
                boxShadow: `0 4px 0 #a84010`,
                transform: "rotate(-7deg)",
              }}>
                {isKa ? "ფასდაკლება" : "Sale"}
              </div>
            )}

            {/* ── Blob photo frame ── */}
            <div
              className="mx-auto sm:max-w-none"
              style={{ maxWidth: 420, padding: "8%" }}
            >
              <svg
                viewBox="0 0 500 500"
                style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
                aria-label={name}
              >
                <defs>
                  <clipPath id={`blob-clip-${product.id}`}>
                    <path d={BLOB_PATH} />
                  </clipPath>
                  <filter id={`blob-shadow-${product.id}`} x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="16" stdDeviation="22" floodColor={C.rose} floodOpacity="0.18" />
                  </filter>
                </defs>

                {/* Soft tinted shadow */}
                <path
                  d={BLOB_PATH}
                  fill={C.rose}
                  opacity="0.09"
                  transform="translate(6,20)"
                  filter={`url(#blob-shadow-${product.id})`}
                />

                {/* Product photo, clipped to blob */}
                <image
                  href={activeImg}
                  x="0" y="0" width="500" height="500"
                  clipPath={`url(#blob-clip-${product.id})`}
                  preserveAspectRatio="xMidYMid slice"
                  style={{ transition: "opacity 0.35s ease" }}
                />

                {/* Pastel-pink outline stroke */}
                <path
                  d={BLOB_PATH}
                  fill="none"
                  stroke={C.rose}
                  strokeWidth="9"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* ── Thumbnails / front–back switcher ── */}
            {thumbs.length > 1 && (
              <div className="flex flex-col items-center gap-2 mt-1">
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
                          width: 70, height: 70, borderRadius: 16, overflow: "hidden",
                          border: `3px solid ${active ? C.rose : "rgba(201,168,108,0.35)"}`,
                          boxShadow: active
                            ? `0 5px 0 ${C.mustardDeep}, 0 2px 14px rgba(196,132,154,0.28)`
                            : "none",
                          flexShrink: 0, cursor: "pointer",
                          background: C.beige,
                          transition: "border-color 0.2s, box-shadow 0.2s",
                          position: "relative",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {!active && (
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "rgba(254,240,214,0.38)",
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Side labels */}
                <div className="flex gap-3">
                  {thumbs.map(({ side }) => (
                    <span
                      key={side}
                      style={{
                        width: 70, textAlign: "center",
                        fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 11,
                        color: activeSide === side ? C.rose : C.champagne,
                        transition: "color 0.2s",
                      }}
                    >
                      {side === "front" ? (isKa ? "გარე" : "front") : (isKa ? "შიდა" : "back")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* ════════════ RIGHT — Info ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.13, ease: [0.215, 0.61, 0.355, 1] }}
            className="lg:pt-10 space-y-5"
          >
            {/* Decorative stars */}
            <div aria-hidden="true" style={{
              fontFamily: FRAUNCES, fontSize: 13,
              color: C.champagne, letterSpacing: "0.55em",
            }}>
              ✦ ✦ ✦
            </div>

            {/* Category + stock row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span style={{
                fontFamily: FRAUNCES, fontWeight: 800,
                fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase",
                color: C.green,
                background: "rgba(63,111,86,0.1)",
                border: `1.5px solid rgba(63,111,86,0.2)`,
                padding: "5px 14px", borderRadius: 999,
              }}>
                {categoryLabel}
              </span>

              {inStock ? (
                <span style={{
                  fontFamily: FRAUNCES, fontWeight: 700,
                  fontSize: 10, letterSpacing: "0.18em",
                  color: C.green, opacity: 0.8,
                }}>
                  · {isKa ? `${product.stock} მარაგშია` : `${product.stock} in stock`}
                </span>
              ) : (
                <span style={{
                  fontFamily: FRAUNCES, fontWeight: 800,
                  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
                  color: C.rose,
                  background: "rgba(196,132,154,0.1)",
                  border: `1.5px solid rgba(196,132,154,0.25)`,
                  padding: "5px 14px", borderRadius: 999,
                }}>
                  {isKa ? "ამოიწურა" : "Sold out"}
                </span>
              )}
            </div>

            {/* Product title */}
            <h1 style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle:  isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize:   "clamp(40px, 5.5vw, 80px)",
              color:      C.rose,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              margin: "2px 0",
            }}>
              {name}
            </h1>

            {/* Size / colour sub-line */}
            {sub && (
              <p style={{
                fontFamily: FRAUNCES, fontStyle: "italic",
                fontSize: 13, color: C.champagne, letterSpacing: "0.05em",
              }}>
                {sub}
              </p>
            )}

            {/* Thin dashed rule */}
            <div aria-hidden="true" style={{
              borderTop: `1.5px dashed ${C.champagne}`,
              opacity: 0.45, margin: "2px 0",
            }} />

            {/* Price */}
            <div className="flex items-baseline gap-4 flex-wrap">
              <span style={{
                fontFamily: PACIFICO,
                fontSize: "clamp(38px, 4.8vw, 56px)",
                color: C.ink, lineHeight: 1,
              }}>
                {product.price}{currencySymbol}
              </span>
              {isOnSale && product.original_price && (
                <span style={{
                  fontFamily: FRAUNCES, fontSize: 20,
                  color: C.champagne, textDecoration: "line-through", opacity: 0.75,
                }}>
                  {product.original_price}{currencySymbol}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{
                fontFamily: FRAUNCES, fontStyle: "italic",
                fontSize: 15, color: C.ink, lineHeight: 1.8,
                opacity: 0.75, maxWidth: 460,
              }}>
                {product.description}
              </p>
            )}

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              <FeaturePill color={C.green}   bg="rgba(63,111,86,0.1)"   border="rgba(63,111,86,0.22)">
                {isKa ? "✶ ხელნაკეთი"      : "✶ Handmade"}
              </FeaturePill>
              <FeaturePill color={C.blue}    bg="rgba(90,159,212,0.1)"  border="rgba(90,159,212,0.28)">
                {isKa ? "💧 წყალგაუმტარი"  : "💧 Water-resistant"}
              </FeaturePill>
              {hasBack && (
                <FeaturePill color={C.rose}  bg="rgba(196,132,154,0.1)" border="rgba(196,132,154,0.28)">
                  {isKa ? "↺ ორმხრივი"     : "↺ Reversible"}
                </FeaturePill>
              )}
            </div>

            {/* Quantity stepper */}
            <div className="flex items-center gap-5 flex-wrap">
              <span style={{
                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 11,
                letterSpacing: "0.25em", textTransform: "uppercase",
                color: C.champagne,
              }}>
                {isKa ? "რაოდენობა" : "Qty"}
              </span>

              <div className="inline-flex items-center" style={{
                background: C.beige, borderRadius: 999,
                border: `1.5px solid rgba(201,168,108,0.55)`,
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 rounded-full inline-flex items-center justify-center transition-colors hover:bg-[rgba(201,168,108,0.2)]"
                  style={{ color: C.ink }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span style={{
                  fontFamily: FRAUNCES, fontSize: 17, fontWeight: 800,
                  color: C.ink, minWidth: 30, textAlign: "center",
                }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="Increase quantity"
                  className="w-11 h-11 rounded-full inline-flex items-center justify-center transition-colors hover:bg-[rgba(201,168,108,0.2)]"
                  style={{ color: C.ink }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <motion.button
                type="button"
                onClick={onAddToCart}
                disabled={!inStock}
                whileHover={inStock ? { y: -4 } : {}}
                whileTap={inStock ? { scale: 0.97 } : {}}
                style={{
                  fontFamily: FRAUNCES, fontWeight: 900, fontSize: 12,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  background: C.mustard, color: C.ink,
                  borderRadius: 999, border: "none",
                  padding: "15px 34px",
                  cursor: inStock ? "pointer" : "not-allowed",
                  opacity: inStock ? 1 : 0.42,
                  boxShadow: inStock
                    ? `0 6px 0 ${C.mustardDeep}, 0 12px 28px rgba(243,182,43,0.22)`
                    : "none",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                {isKa ? "კალათაში" : "Add to bag"}
                <span aria-hidden="true" style={{ fontSize: 16 }}>→</span>
              </motion.button>

              <motion.span
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex" }}
              >
                <Link
                  href={`/${lang}/shop`}
                  style={{
                    fontFamily: FRAUNCES, fontWeight: 800, fontSize: 12,
                    letterSpacing: "0.22em", textTransform: "uppercase",
                    background: C.blue, color: C.cream,
                    borderRadius: 999,
                    padding: "15px 30px",
                    display: "inline-flex", alignItems: "center", gap: 8,
                    boxShadow: `0 6px 0 #3a7faa, 0 12px 28px rgba(90,159,212,0.2)`,
                    textDecoration: "none",
                  }}
                >
                  {isKa ? "სხვა ჩანთები" : "See all bags"}
                </Link>
              </motion.span>
            </div>

            {/* Small trust line */}
            <p style={{
              fontFamily: FRAUNCES, fontStyle: "italic",
              fontSize: 12, color: C.champagne, opacity: 0.9,
            }}>
              {isKa
                ? "✦ ხელნაკეთი თბილისში · სწრაფი მიწოდება საქართველოში"
                : "✦ Handmade in Tbilisi · Fast delivery across Georgia"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ════════════ Info strip ════════════ */}
      <section
        className="mt-20 md:mt-28 overflow-hidden"
        style={{
          background: C.teal,
          borderTop:    `2.5px dashed rgba(201,168,108,0.4)`,
          borderBottom: `2.5px dashed rgba(201,168,108,0.4)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 py-10">
          <div className="flex flex-wrap gap-y-8 gap-x-8 justify-center md:justify-around">
            {[
              {
                icon: "🚚",
                title: isKa ? "უფასო მიწოდება" : "Free shipping",
                sub:   isKa ? "150₾-დან · 2–4 დღე"       : "over 150₾ · 2–4 days",
              },
              {
                icon: "✦",
                title: isKa ? "ხელნაკეთი"      : "Handmade",
                sub:   isKa ? "თბილისის სტუდიაში"        : "In our Tbilisi studio",
              },
              {
                icon: "↺",
                title: isKa ? "ორმხრივი"       : "Reversible",
                sub:   isKa ? "ორი მხარე, ერთი ჩანთა"   : "Two sides, one bag",
              },
              {
                icon: "💧",
                title: isKa ? "წყალგაუმტარი"  : "Water-resistant",
                sub:   isKa ? "ტილო, სეზონი კარგი"      : "Canvas that handles rain",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3" style={{ minWidth: 160 }}>
                <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 3 }}>
                  {item.icon}
                </span>
                <div>
                  <div style={{
                    fontFamily: PACIFICO, fontSize: 17,
                    color: C.mustard, lineHeight: 1.2,
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12,
                    color: C.champagne, marginTop: 3, opacity: 0.85,
                  }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ Related products ════════════ */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 mt-20 md:mt-28 pb-28 relative z-10">

          {/* Section heading with dashed flanks */}
          <div className="flex items-center gap-4 mb-10">
            <div style={{ flex: 1, borderTop: `1.5px dashed ${C.champagne}`, opacity: 0.38 }} />
            <h2 style={{
              fontFamily:  isKa ? ALK_LIFE : FRAUNCES,
              fontStyle:   isKa ? "normal" : "italic",
              fontWeight:  900,
              fontSize:    "clamp(22px, 2.8vw, 34px)",
              color:       C.ink,
              whiteSpace:  "nowrap",
              flexShrink:  0,
            }}>
              {isKa ? "შესაძლოა ესეც მოგეწონოს" : "You might also love"}
            </h2>
            <div style={{ flex: 1, borderTop: `1.5px dashed ${C.champagne}`, opacity: 0.38 }} />
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

/* ─────────────── Small helpers ─────────────── */

function FeaturePill({
  children, color, bg, border,
}: {
  children: React.ReactNode;
  color: string; bg: string; border: string;
}) {
  return (
    <span style={{
      fontFamily: FRAUNCES, fontWeight: 700, fontSize: 12,
      letterSpacing: "0.08em",
      color, background: bg,
      padding: "6px 16px", borderRadius: 999,
      border: `1.5px solid ${border}`,
      display: "inline-flex", alignItems: "center",
    }}>
      {children}
    </span>
  );
}
