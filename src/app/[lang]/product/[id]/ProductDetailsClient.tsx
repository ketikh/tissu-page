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

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

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
  lavender:    "#9e8abf",
};

/* ── Flower tile background (same as shop page) ─────────────────── */
const BG_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="68" height="68">` +
  `<g transform="translate(34,34)" opacity="0.28">` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(0)"/>` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(72)"/>` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(144)"/>` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(216)"/>` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(288)"/>` +
  `<circle r="5" fill="#c9a86c"/>` +
  `</g></svg>`
)}")`;

/* ── 4-petal clover path centred in 500×500 viewBox ─────────────── */
function flower(bumps: number, baseR: number, bumpH: number, cx = 200, cy = 200, jitter = 0): string {
  const step = (Math.PI * 2) / bumps;
  let d = "";
  for (let i = 0; i <= bumps; i++) {
    const a = i * step;
    const x = cx + baseR * Math.cos(a);
    const y = cy + baseR * Math.sin(a);
    if (i === 0) { d += `M ${x.toFixed(1)} ${y.toFixed(1)} `; }
    else {
      const midA = a - step / 2;
      const h = bumpH * (1 + (jitter ? Math.sin(i * 7.3) * jitter : 0));
      d += `Q ${(cx + (baseR + h) * Math.cos(midA)).toFixed(1)} ${(cy + (baseR + h) * Math.sin(midA)).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  }
  return d + "Z";
}

const CLOVER = flower(4, 128, 92, 250, 250);

interface ProductDetailsClientProps {
  product: StorefrontProduct;
  related: StorefrontProduct[];
  lang: Locale;
  dictionary: any;
}

export function ProductDetailsClient({ product, related, lang }: ProductDetailsClientProps) {
  useStoreHydration();
  const copy = getLandingCopy(lang);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const hasBack = Boolean(product.image_back);
  const activeImg = activeSide === "back" && product.image_back ? product.image_back : product.image_front;
  const inStock = product.in_stock && product.stock > 0;
  const isOnSale = Boolean(product.original_price && product.original_price > product.price);

  const name = product.name || product.code;
  const sub = [product.size, product.color].filter(Boolean).join(" · ");
  const isKa = lang === "ka";

  const categoryLabel = copy.shop.filters[
    product.category === "tote" ? "bag" : product.category
  ];

  const onAddToCart = () => {
    if (!inStock) return;
    try {
      addItem(
        {
          id: product.id,
          slug: product.id,
          name: { en: name, ka: name },
          subtitle: { en: sub, ka: sub },
          description: { en: "", ka: "" },
          price: product.price,
          images: [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [
            {
              id: `${product.id}-default`,
              size: "one",
              colorName: { en: product.color || "default", ka: product.color || "default" },
              colorCode: "#264ba0",
              inStock: true,
            },
          ],
          category: product.category as any,
          featured: true,
          badges: [],
        } as any,
        {
          id: `${product.id}-default`,
          size: "one",
          colorName: { en: product.color || "default", ka: product.color || "default" },
          colorCode: "#264ba0",
          inStock: true,
        } as any,
        quantity
      );
      openCart();
    } catch {
      openCart();
    }
  };

  return (
    <div
      style={{
        background: C.cream,
        backgroundImage: BG_PATTERN,
        backgroundSize: "68px 68px",
        minHeight: "100vh",
      }}
    >
      <div className="container py-10 md:py-14">
        {/* Breadcrumbs */}
        <nav
          className="flex items-center gap-2 mb-10 overflow-x-auto whitespace-nowrap"
          style={{
            fontFamily: FRAUNCES,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.champagne,
          }}
        >
          <Link href={`/${lang}`} className="hover:underline underline-offset-2">
            {isKa ? "მთავარი" : "Home"}
          </Link>
          <span aria-hidden="true">›</span>
          <Link href={`/${lang}/shop`} className="hover:underline underline-offset-2">
            {isKa ? "მაღაზია" : "Shop"}
          </Link>
          <span aria-hidden="true">›</span>
          <span style={{ color: C.ink }}>{name}</span>
        </nav>

        <div className="grid gap-12 lg:gap-20 lg:grid-cols-[1.1fr_1fr] items-start">

          {/* ── Image column ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
            className="space-y-5"
          >
            {/* Clover frame */}
            <div className="relative mx-auto" style={{ maxWidth: 480 }}>
              {/* Subtle drop shadow behind clover */}
              <svg
                viewBox="0 0 500 500"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}
                aria-hidden="true"
              >
                <defs>
                  <clipPath id={`clover-${product.id}`}>
                    <path d={CLOVER} />
                  </clipPath>
                </defs>

                {/* Shadow */}
                <path
                  d={CLOVER}
                  fill={C.rose}
                  opacity="0.22"
                  transform="translate(10,14)"
                />

                {/* Cream backing */}
                <path d={CLOVER} fill={C.cream} />

                {/* Photo clipped to clover shape */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <image
                  href={activeImg}
                  x="30" y="30"
                  width="440" height="440"
                  clipPath={`url(#clover-${product.id})`}
                  preserveAspectRatio="xMidYMid slice"
                  style={{ transition: "opacity 0.4s" }}
                />

                {/* Rose outline stroke */}
                <path
                  d={CLOVER}
                  fill="none"
                  stroke={C.rose}
                  strokeWidth="9"
                />

                {/* Dashed mustard accent stroke */}
                <path
                  d={CLOVER}
                  fill="none"
                  stroke={C.mustard}
                  strokeWidth="3.5"
                  strokeDasharray="14 9"
                  opacity="0.55"
                />
              </svg>

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-1.5">
                {product.tags.includes("new") && (
                  <span
                    className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
                    style={{
                      background: C.mustard,
                      color: C.ink,
                      fontFamily: FRAUNCES,
                      borderRadius: 999,
                      boxShadow: `0 3px 0 ${C.mustardDeep}`,
                    }}
                  >
                    {isKa ? "ახალი" : "New"}
                  </span>
                )}
                {product.tags.includes("bestseller") && (
                  <span
                    className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
                    style={{
                      background: C.rose,
                      color: C.cream,
                      fontFamily: FRAUNCES,
                      borderRadius: 999,
                    }}
                  >
                    {isKa ? "ბესტსელერი" : "Bestseller"}
                  </span>
                )}
                {isOnSale && (
                  <span
                    className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
                    style={{
                      background: C.burnt,
                      color: C.cream,
                      fontFamily: FRAUNCES,
                      borderRadius: 999,
                    }}
                  >
                    {isKa ? "ფასდაკლება" : "Sale"}
                  </span>
                )}
              </div>
            </div>

            {/* Front / Back toggle */}
            {hasBack && (
              <div
                className="flex items-center justify-between gap-3 px-4 py-2 mx-auto"
                style={{
                  background: C.beige,
                  borderRadius: 999,
                  border: `1.5px solid ${C.champagne}`,
                  maxWidth: 360,
                }}
              >
                <span
                  style={{
                    fontFamily: FRAUNCES,
                    fontStyle: "italic",
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  {isKa ? "ორი მხარე, ერთი ჩანთა" : "Two sides, one bag"}
                </span>
                <div className="flex gap-1.5">
                  {(["front", "back"] as const).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setActiveSide(side)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors"
                      style={{
                        fontFamily: FRAUNCES,
                        background: activeSide === side ? C.ink : "transparent",
                        color: activeSide === side ? C.cream : C.ink,
                      }}
                    >
                      {side === "front"
                        ? (isKa ? "გარე" : "Front")
                        : (isKa ? "შიდა" : "Back")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Thumbnails */}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setActiveSide("front")}
                className="relative overflow-hidden transition-all"
                style={{
                  width: 76, height: 76,
                  borderRadius: 16,
                  border: `3px solid ${activeSide === "front" ? C.rose : "transparent"}`,
                  boxShadow: activeSide === "front" ? `0 4px 0 ${C.mustardDeep}` : "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_front}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
              {hasBack && (
                <button
                  type="button"
                  onClick={() => setActiveSide("back")}
                  className="relative overflow-hidden transition-all"
                  style={{
                    width: 76, height: 76,
                    borderRadius: 16,
                    border: `3px solid ${activeSide === "back" ? C.rose : "transparent"}`,
                    boxShadow: activeSide === "back" ? `0 4px 0 ${C.mustardDeep}` : "none",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_back!}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              )}
            </div>
          </motion.div>

          {/* ── Info column ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.215, 0.61, 0.355, 1] }}
            className="space-y-6 pt-2"
          >
            {/* Category label */}
            <span
              className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
              style={{ color: C.green, fontFamily: FRAUNCES }}
            >
              {categoryLabel}
            </span>

            {/* Name — huge & rose */}
            <h1
              style={{
                fontFamily: isKa ? ALK_LIFE : FRAUNCES,
                fontStyle: isKa ? "normal" : "italic",
                fontWeight: 900,
                fontSize: "clamp(42px, 5.5vw, 76px)",
                color: C.rose,
                lineHeight: 1.0,
              }}
            >
              {name}
            </h1>

            {sub && (
              <p
                style={{
                  fontFamily: FRAUNCES,
                  fontSize: 13,
                  color: C.champagne,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {sub}
              </p>
            )}

            {/* Price + stock */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span style={{ fontFamily: PACIFICO, fontSize: 46, color: C.burnt, lineHeight: 1 }}>
                {product.price}
                {product.currency === "GEL" ? "₾" : ` ${product.currency}`}
              </span>
              {isOnSale && product.original_price && (
                <span
                  style={{
                    fontFamily: FRAUNCES,
                    fontSize: 22,
                    color: C.champagne,
                    textDecoration: "line-through",
                    fontWeight: 600,
                  }}
                >
                  {product.original_price}
                  {product.currency === "GEL" ? "₾" : ` ${product.currency}`}
                </span>
              )}
              <span
                className="text-[11px] font-extrabold uppercase tracking-[0.18em]"
                style={{
                  fontFamily: FRAUNCES,
                  color: inStock ? C.green : C.rose,
                  background: inStock ? "rgba(63,111,86,0.12)" : "rgba(196,132,154,0.12)",
                  padding: "4px 10px",
                  borderRadius: 999,
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
                  fontFamily: FRAUNCES,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: C.ink,
                  lineHeight: 1.7,
                  opacity: 0.82,
                }}
              >
                {product.description}
              </p>
            )}

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              <span
                className="px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.15em]"
                style={{
                  fontFamily: FRAUNCES,
                  background: "rgba(63,111,86,0.12)",
                  color: C.green,
                  borderRadius: 999,
                  border: `1.5px solid ${C.green}`,
                }}
              >
                {isKa ? "წყალგაუმტარი" : "Water-resistant"}
              </span>
              {hasBack && (
                <span
                  className="px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.15em]"
                  style={{
                    fontFamily: FRAUNCES,
                    background: "rgba(196,132,154,0.12)",
                    color: C.rose,
                    borderRadius: 999,
                    border: `1.5px solid ${C.rose}`,
                  }}
                >
                  {isKa ? "ორმხრივი" : "Reversible"}
                </span>
              )}
              <span
                className="px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.15em]"
                style={{
                  fontFamily: FRAUNCES,
                  background: "rgba(201,168,108,0.15)",
                  color: "#8a5820",
                  borderRadius: 999,
                  border: `1.5px solid ${C.champagne}`,
                }}
              >
                {isKa ? "ხელნაკეთი" : "Handmade"}
              </span>
            </div>

            {/* Qty stepper */}
            <div
              className="inline-flex items-center gap-1 p-1"
              style={{
                background: C.beige,
                borderRadius: 999,
                border: `1.5px solid ${C.champagne}`,
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
                className="w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors"
                style={{ color: C.ink }}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                className="min-w-7 text-center font-bold"
                style={{ fontFamily: FRAUNCES, fontSize: 16, color: C.ink }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                aria-label="Increase"
                className="w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors"
                style={{ color: C.ink }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Two CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              {/* Primary: mustard */}
              <motion.button
                type="button"
                onClick={onAddToCart}
                disabled={!inStock}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 font-extrabold text-[13px] uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: FRAUNCES,
                  fontWeight: 800,
                  background: C.mustard,
                  color: C.ink,
                  borderRadius: 999,
                  padding: "14px 28px",
                  boxShadow: inStock ? `0 5px 0 ${C.mustardDeep}` : "none",
                }}
              >
                {isKa ? "კალათაში დამატება" : "Add to basket"}
                <span aria-hidden="true">→</span>
              </motion.button>

              {/* Secondary: rose outline */}
              <Link
                href={`/${lang}/shop`}
                className="inline-flex items-center gap-2 font-bold text-[13px] uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5"
                style={{
                  fontFamily: FRAUNCES,
                  fontWeight: 700,
                  background: "transparent",
                  color: C.rose,
                  borderRadius: 999,
                  padding: "13px 26px",
                  border: `2px solid ${C.rose}`,
                }}
              >
                {isKa ? "მეტის ნახვა" : "See all bags"}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Teal info strip ── */}
        <section
          className="mt-14 md:mt-20 overflow-hidden"
          style={{ background: C.teal, borderRadius: 32 }}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: "repeating-linear-gradient(90deg, #c9a86c 0 18px, #1e4d43 18px 36px)" }}
            aria-hidden="true"
          />
          <div className="px-8 py-10 flex flex-wrap gap-y-8 gap-x-12 justify-center">
            {[
              {
                icon: "🚚",
                title: isKa ? "უფასო მიწოდება" : "Free shipping",
                sub: isKa ? "150₾-დან · 2–4 დღე" : "over 150₾ · 2–4 days",
              },
              {
                icon: "✦",
                title: isKa ? "ხელნაკეთი" : "Handmade",
                sub: isKa ? "თბილისის სტუდიაში" : "In our Tbilisi studio",
              },
              {
                icon: "↺",
                title: isKa ? "ორმხრივი" : "Reversible",
                sub: isKa ? "ორი მხარე, ერთი ჩანთა" : "Two sides, one bag",
              },
              {
                icon: "💧",
                title: isKa ? "წყალგაუმტარი" : "Water-resistant",
                sub: isKa ? "ტილო, სეზონი კარგი" : "Canvas that handles rain",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 min-w-45">
                <span style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</span>
                <div>
                  <div
                    style={{
                      fontFamily: PACIFICO,
                      fontSize: 18,
                      color: C.mustard,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: FRAUNCES,
                      fontStyle: "italic",
                      fontSize: 13,
                      color: C.champagne,
                      marginTop: 2,
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="h-1.5 w-full"
            style={{ background: "repeating-linear-gradient(90deg, #c9a86c 0 18px, #1e4d43 18px 36px)" }}
            aria-hidden="true"
          />
        </section>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <section className="mt-20 md:mt-28">
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
                    favourite: copy.shop.card.favourite,
                    outOfStock: isKa ? "ამოიწურა" : "Sold out",
                    flipSides: isKa ? "გადმოაბრუნე" : "Flip sides",
                    badges: copy.shop.badges,
                  }}
                />
              ))}
            </div>
          </section>
        )}
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
