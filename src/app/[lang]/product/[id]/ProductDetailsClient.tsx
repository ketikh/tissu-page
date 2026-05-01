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

const PACIFICO  = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES  = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE  = "var(--font-alk-life), serif";

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

/* ── 4-petal clover, centred in 500×500 viewBox ─────────────────── */
function cloverPath(cx = 250, cy = 250, d = 130, r = 95): string {
  const step = Math.PI / 2;
  const half = step / 2;
  const L = d * Math.sin(half);
  const midD = d * Math.cos(half);
  const W = midD + Math.sqrt(Math.max(0, r * r - L * L));
  const pts: [number, number][] = [0, 1, 2, 3].map((i) => {
    const a = i * step + half;
    return [cx + W * Math.cos(a), cy + W * Math.sin(a)];
  });
  let p = `M ${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)} `;
  for (let i = 0; i < 4; i++) {
    p += `A ${r} ${r} 0 0 1 ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} `;
  }
  return p + "Z";
}

const CLOVER_PATH = cloverPath();

interface ProductDetailsClientProps {
  product: StorefrontProduct;
  related: StorefrontProduct[];
  lang: Locale;
  dictionary: any;
}

export function ProductDetailsClient({ product, related, lang }: ProductDetailsClientProps) {
  useStoreHydration();
  const copy     = getLandingCopy(lang);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity, setQuantity]     = useState(1);

  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const hasBack  = Boolean(product.image_back);
  const activeImg = activeSide === "back" && product.image_back ? product.image_back : product.image_front;
  const inStock   = product.in_stock && product.stock > 0;
  const isOnSale  = Boolean(product.original_price && product.original_price > product.price);
  const name      = product.name || product.code;
  const sub       = [product.size, product.color].filter(Boolean).join(" · ");
  const isKa      = lang === "ka";

  const categoryLabel = copy.shop.filters[
    product.category === "tote" ? "bag" : product.category
  ];

  const onAddToCart = () => {
    if (!inStock) return;
    try {
      addItem(
        {
          id: product.id, slug: product.id,
          name: { en: name, ka: name },
          subtitle: { en: sub, ka: sub },
          description: { en: "", ka: "" },
          price: product.price,
          images: [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [{ id: `${product.id}-default`, size: "one",
            colorName: { en: product.color || "default", ka: product.color || "default" },
            colorCode: "#264ba0", inStock: true }],
          category: product.category as any, featured: true, badges: [],
        } as any,
        { id: `${product.id}-default`, size: "one",
          colorName: { en: product.color || "default", ka: product.color || "default" },
          colorCode: "#264ba0", inStock: true } as any,
        quantity
      );
      openCart();
    } catch { openCart(); }
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* ── Main product section ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-10 md:pt-16 pb-0">

        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 mb-10 md:mb-14"
          style={{ fontFamily: FRAUNCES, fontSize: 12, color: C.champagne, letterSpacing: "0.04em" }}
        >
          <Link href={`/${lang}`} className="hover:text-[#2a1d14] transition-colors">
            {isKa ? "მთავარი" : "home"}
          </Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <Link href={`/${lang}/shop`} className="hover:text-[#2a1d14] transition-colors">
            {isKa ? "მაღაზია" : "shop"}
          </Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: C.ink }}>{name}</span>
        </nav>

        {/* Two-column */}
        <div className="grid gap-10 lg:gap-20 lg:grid-cols-2 items-start">

          {/* ── LEFT: Photo ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
            className="space-y-4"
          >
            {/* Clover photo frame */}
            <div className="relative mx-auto" style={{ maxWidth: 520 }}>
              {product.tags.includes("new") && (
                <span
                  className="absolute top-8 right-8 z-10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
                  style={{
                    background: C.mustard, color: C.ink, fontFamily: FRAUNCES,
                    borderRadius: 999, boxShadow: `0 3px 0 ${C.mustardDeep}`,
                    transform: "rotate(6deg)",
                  }}
                >
                  {isKa ? "ახალი" : "New"}
                </span>
              )}
              {isOnSale && (
                <span
                  className="absolute top-8 left-8 z-10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
                  style={{
                    background: C.burnt, color: C.cream, fontFamily: FRAUNCES,
                    borderRadius: 999, boxShadow: `0 3px 0 #a84010`,
                    transform: "rotate(-6deg)",
                  }}
                >
                  {isKa ? "ფასდაკლება" : "Sale"}
                </span>
              )}

              <svg
                viewBox="0 0 500 500"
                style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
                aria-hidden="true"
              >
                <defs>
                  <clipPath id={`clip-${product.id}`}>
                    <path d={CLOVER_PATH} />
                  </clipPath>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor={C.rose} floodOpacity="0.22" />
                  </filter>
                </defs>

                {/* Shadow */}
                <path d={CLOVER_PATH} fill={C.rose} opacity="0.15" transform="translate(0,16)" filter="url(#shadow)" />

                {/* Photo clipped to clover */}
                <image
                  href={activeImg}
                  x="0" y="0" width="500" height="500"
                  clipPath={`url(#clip-${product.id})`}
                  preserveAspectRatio="xMidYMid slice"
                  style={{ transition: "opacity 0.4s ease" }}
                />

                {/* Thick rose outline */}
                <path d={CLOVER_PATH} fill="none" stroke={C.rose} strokeWidth="10" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Front / Back toggle */}
            {hasBack && (
              <div
                className="flex items-center justify-center gap-2 mx-auto"
                style={{ maxWidth: 300 }}
              >
                {(["front", "back"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setActiveSide(side)}
                    style={{
                      fontFamily: FRAUNCES, fontStyle: "italic",
                      fontSize: 13, fontWeight: 700,
                      padding: "8px 22px",
                      borderRadius: 999,
                      background: activeSide === side ? C.ink : "transparent",
                      color: activeSide === side ? C.cream : C.champagne,
                      border: `2px solid ${activeSide === side ? C.ink : C.champagne}`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {side === "front" ? (isKa ? "გარე" : "Front") : (isKa ? "შიდა" : "Back")}
                  </button>
                ))}
              </div>
            )}

            {/* Thumbnails */}
            <div className="flex gap-3 justify-center">
              {[product.image_front, product.image_back].filter(Boolean).map((src, i) => {
                const side = i === 0 ? "front" : "back";
                const isActive = activeSide === side;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSide(side)}
                    style={{
                      width: 72, height: 72, borderRadius: 14, overflow: "hidden",
                      border: `3px solid ${isActive ? C.rose : "transparent"}`,
                      boxShadow: isActive ? `0 4px 0 ${C.mustardDeep}` : "none",
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── RIGHT: Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
            className="space-y-5 lg:pt-6"
          >
            {/* Category tag */}
            <span
              style={{
                display: "inline-block",
                fontFamily: FRAUNCES, fontWeight: 800,
                fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
                color: C.green,
                background: "rgba(63,111,86,0.1)",
                padding: "4px 12px", borderRadius: 999,
              }}
            >
              {categoryLabel}
            </span>

            {/* Name — huge */}
            <h1
              style={{
                fontFamily: isKa ? ALK_LIFE : FRAUNCES,
                fontStyle: isKa ? "normal" : "italic",
                fontWeight: 900,
                fontSize: "clamp(48px, 6vw, 88px)",
                color: C.rose,
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
              }}
            >
              {name}
            </h1>

            {sub && (
              <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 13, color: C.champagne }}>
                {sub}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span style={{ fontFamily: PACIFICO, fontSize: 52, color: C.ink, lineHeight: 1 }}>
                {product.price}{product.currency === "GEL" ? "₾" : ` ${product.currency}`}
              </span>
              {isOnSale && product.original_price && (
                <span style={{ fontFamily: FRAUNCES, fontSize: 22, color: C.champagne, textDecoration: "line-through" }}>
                  {product.original_price}{product.currency === "GEL" ? "₾" : ` ${product.currency}`}
                </span>
              )}
              <span
                style={{
                  fontFamily: FRAUNCES, fontWeight: 800, fontSize: 11,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: inStock ? C.green : C.rose,
                  background: inStock ? "rgba(63,111,86,0.1)" : "rgba(196,132,154,0.1)",
                  padding: "4px 10px", borderRadius: 999,
                }}
              >
                {inStock
                  ? (isKa ? `მარაგშია · ${product.stock}` : `In stock · ${product.stock}`)
                  : (isKa ? "ამოიწურა" : "Sold out")}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p
                style={{
                  fontFamily: FRAUNCES, fontStyle: "italic",
                  fontSize: 15, color: C.ink, lineHeight: 1.75, opacity: 0.78,
                  maxWidth: 480,
                }}
              >
                {product.description}
              </p>
            )}

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em",
                background: "rgba(63,111,86,0.1)", color: C.green,
                padding: "5px 14px", borderRadius: 999, border: `1.5px solid rgba(63,111,86,0.25)` }}>
                {isKa ? "ხელნაკეთი" : "Handmade"}
              </span>
              <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em",
                background: "rgba(90,159,212,0.1)", color: C.blue,
                padding: "5px 14px", borderRadius: 999, border: `1.5px solid rgba(90,159,212,0.3)` }}>
                {isKa ? "წყალგაუმტარი" : "Water-resistant"}
              </span>
              {hasBack && (
                <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em",
                  background: "rgba(196,132,154,0.1)", color: C.rose,
                  padding: "5px 14px", borderRadius: 999, border: `1.5px solid rgba(196,132,154,0.3)` }}>
                  {isKa ? "ორმხრივი" : "Reversible"}
                </span>
              )}
            </div>

            {/* Quantity stepper */}
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className="inline-flex items-center gap-1 p-1"
                style={{
                  background: C.beige, borderRadius: 999,
                  border: `1.5px solid ${C.champagne}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                  className="w-10 h-10 rounded-full inline-flex items-center justify-center"
                  style={{ color: C.ink }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span style={{ fontFamily: FRAUNCES, fontSize: 16, fontWeight: 700, color: C.ink, minWidth: 28, textAlign: "center" }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="Increase"
                  className="w-10 h-10 rounded-full inline-flex items-center justify-center"
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
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 font-extrabold uppercase tracking-[0.15em] transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: FRAUNCES, fontWeight: 800, fontSize: 13,
                  background: C.mustard, color: C.ink,
                  borderRadius: 999,
                  padding: "14px 30px",
                  boxShadow: inStock ? `0 5px 0 ${C.mustardDeep}` : "none",
                  border: "none",
                }}
              >
                {isKa ? "კალათაში" : "Add to bag"}
                <span aria-hidden="true">→</span>
              </motion.button>

              <Link
                href={`/${lang}/shop`}
                className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.15em] transition-transform hover:-translate-y-0.5"
                style={{
                  fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13,
                  background: C.blue, color: C.cream,
                  borderRadius: 999,
                  padding: "14px 28px",
                  boxShadow: `0 5px 0 #3a7faa`,
                }}
              >
                {isKa ? "სხვა ჩანთები" : "See all bags"}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Teal info strip ── */}
      <section
        className="mt-20 md:mt-28 overflow-hidden"
        style={{ background: C.teal }}
      >
        <div className="h-1.5" style={{ background: "repeating-linear-gradient(90deg, #c9a86c 0 18px, #1e4d43 18px 36px)" }} aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 flex flex-wrap gap-y-8 gap-x-12 justify-center">
          {[
            { icon: "🚚", title: isKa ? "უფასო მიწოდება" : "Free shipping", sub: isKa ? "150₾-დან · 2–4 დღე" : "over 150₾ · 2–4 days" },
            { icon: "✦",  title: isKa ? "ხელნაკეთი"      : "Handmade",      sub: isKa ? "თბილისის სტუდიაში"  : "In our Tbilisi studio" },
            { icon: "↺",  title: isKa ? "ორმხრივი"       : "Reversible",    sub: isKa ? "ორი მხარე, ერთი ჩანთა" : "Two sides, one bag" },
            { icon: "💧", title: isKa ? "წყალგაუმტარი"  : "Water-resistant",sub: isKa ? "ტილო, სეზონი კარგი" : "Canvas that handles rain" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 min-w-45">
              <span style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: PACIFICO, fontSize: 18, color: C.mustard, lineHeight: 1.2 }}>{item.title}</div>
                <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 13, color: C.champagne, marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-1.5" style={{ background: "repeating-linear-gradient(90deg, #c9a86c 0 18px, #1e4d43 18px 36px)" }} aria-hidden="true" />
      </section>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 md:px-12 mt-20 md:mt-28 pb-24">
          <h2
            className="mb-8"
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(24px, 3.5vw, 40px)",
              color: C.ink,
            }}
          >
            {isKa ? "შესაძლოა ესეც მოგეწონოს" : "You might also love"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
