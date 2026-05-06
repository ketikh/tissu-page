"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Heart, ShoppingBag } from "lucide-react";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/lib/admin-api";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useStoreHydration } from "@/store/useHydration";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

/* ─── Fonts — identical to ShopClient ─── */
const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

/* ─── Palette — identical to ShopClient ─── */
const C = {
  cream:       "#fef0d6",
  beige:       "#f5e3c2",
  ink:         "#2a1d14",
  mustard:     "#f3b62b",
  mustardDeep: "#d99820",
  burnt:       "#d56826",
  champagne:   "#c9a86c",
  rose:        "#c4849a",
  lavender:    "#9e8abf",
  sage:        "#7aaa8a",
  green:       "#3f6f56",
  blue:        "#5a9fd4",
};

/* ─── Scalloped hero bottom — same as ShopClient ─── */
const SCALLOP_PATH = (() => {
  const n = 20, w = 1440, sw = w / n, H = 44;
  let d = `M 0 80 L 0 ${H}`;
  for (let i = 0; i < n; i++) {
    d += ` Q ${Math.round(i * sw + sw / 2)} 0 ${Math.round((i + 1) * sw)} ${H}`;
  }
  return d + ` L ${w} 80 Z`;
})();

/* ─── Botanical float animation — same helper as ShopClient ─── */
function botanicalAnim(color: string, size: number) {
  const h = (color.charCodeAt(1) + color.charCodeAt(2) + size) % 21;
  return {
    animate: { y: [0, h % 2 === 0 ? -(4 + h % 5) : 3 + h % 4, 0] as number[] },
    transition: { duration: 2.8 + (h % 6) * 0.45, repeat: Infinity, ease: "easeInOut" as const, delay: (h % 8) * 0.3 },
  };
}

/* ─── Botanical decoration components — copied from ShopClient ─── */
function Daisy({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
        <g transform="translate(40,40)">
          {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="0" cy="-18" rx="7" ry="14" fill={color} opacity="0.88" transform={`rotate(${45 * i})`} />)}
          <circle r="9" fill={C.mustard} />
        </g>
      </svg>
    </motion.div>
  );
}

function TulipStem({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 1);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: Math.round(size * 2.4), ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 60 140" style={{ width: "100%", height: "100%" }}>
        <path d="M30 130 C27 100 33 75 28 50 C23 28 30 10 30 10" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 80 Q10 65 17 50 Q27 63 28 80Z" fill={color} opacity="0.72" />
        <path d="M32 95 Q50 80 43 65 Q33 78 32 95Z" fill={color} opacity="0.65" />
        <path d="M22 18 Q10 10 16 0 Q26 8 22 18Z" fill={color} opacity="0.88" />
        <path d="M38 18 Q50 10 44 0 Q34 8 38 18Z" fill={color} opacity="0.88" />
        <path d="M30 10 Q28 -4 30 -8 Q32 -4 30 10Z" fill={color} opacity="0.88" />
      </svg>
    </motion.div>
  );
}

function SmallLeaf({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 2);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: Math.round(size * 1.5), ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 40 60" style={{ width: "100%", height: "100%" }}>
        <path d="M20 58 C20 58 5 44 5 28 Q5 4 20 2 Q35 4 35 28 C35 44 20 58 20 58Z" fill={color} opacity="0.75" />
        <path d="M20 58 L20 2" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
        <path d="M20 28 Q10 22 8 14" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" fill="none" />
        <path d="M20 38 Q30 32 32 24" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" fill="none" />
      </svg>
    </motion.div>
  );
}

function Sparkle({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 3);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 40 40" style={{ width: "100%", height: "100%" }}>
        <path d="M20 1 L22 17 L38 20 L22 23 L20 39 L18 23 L2 20 L18 17 Z" fill={color} opacity="0.78" />
      </svg>
    </motion.div>
  );
}

function MiniClover({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 5);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 40 40" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <path d="M31.5 8.5 A12 12 0 0 1 31.5 31.5 A12 12 0 0 1 8.5 31.5 A12 12 0 0 1 8.5 8.5 A12 12 0 0 1 31.5 8.5 Z" fill={color} opacity="0.88" />
      </svg>
    </motion.div>
  );
}

function SmallBerries({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 4);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: Math.round(size * 1.4), ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 50 70" style={{ width: "100%", height: "100%" }}>
        <path d="M25 65 C22 55 28 45 25 35" stroke={color} strokeWidth="2" fill="none" strokeOpacity="0.6" strokeLinecap="round" />
        <path d="M25 50 Q15 42 10 35" stroke={color} strokeWidth="1.5" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
        <path d="M25 45 Q35 37 40 30" stroke={color} strokeWidth="1.5" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
        <circle cx="25" cy="32" r="5" fill={color} opacity="0.80" />
        <circle cx="9"  cy="32" r="4" fill={color} opacity="0.70" />
        <circle cx="41" cy="27" r="4" fill={color} opacity="0.70" />
        <circle cx="25" cy="10" r="4" fill={color} opacity="0.75" />
      </svg>
    </motion.div>
  );
}

/* ─── Category colours — same as ShopClient ─── */
const CAT_COLORS: Record<string, { bg: string; text: string; shadow: string }> = {
  pouch:        { bg: C.burnt,    text: C.cream, shadow: "#a83c14" },
  laptop:       { bg: C.lavender, text: C.cream, shadow: "#7060a0" },
  tote:         { bg: C.sage,     text: C.cream, shadow: "#568868" },
  kidsbackpack: { bg: C.mustard,  text: C.ink,   shadow: C.mustardDeep },
  apron:        { bg: C.green,    text: C.cream, shadow: "#1e3828" },
  necklace:     { bg: C.champagne,text: C.ink,   shadow: "#9a7840" },
};

/* ─── Frame shapes for related cards — copied from ShopClient ─── */
function flowerArc(petals: number, d: number, r: number, cx = 200, cy = 200): string {
  const step = (Math.PI * 2) / petals;
  const halfStep = step / 2;
  const L = d * Math.sin(halfStep);
  const W = d * Math.cos(halfStep) + Math.sqrt(Math.max(0, r * r - L * L));
  const waist: [number, number][] = Array.from({ length: petals }, (_, i) => {
    const a = i * step + halfStep;
    return [cx + W * Math.cos(a), cy + W * Math.sin(a)];
  });
  let p = `M ${waist[petals - 1][0].toFixed(1)} ${waist[petals - 1][1].toFixed(1)} `;
  for (let i = 0; i < petals; i++) p += `A ${r} ${r} 0 0 1 ${waist[i][0].toFixed(1)} ${waist[i][1].toFixed(1)} `;
  return p + "Z";
}

function seedNoise(i: number, seed: number): number {
  const n = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function blob(pts: number, rx: number, ry: number, variance: number, cx = 200, cy = 200, seed = 0): string {
  const arr: [number, number][] = Array.from({ length: pts }, (_, i) => {
    const a = (i / pts) * Math.PI * 2;
    const m = 1 + (seedNoise(i, seed) * 2 - 1) * variance;
    return [cx + m * rx * Math.cos(a), cy + m * ry * Math.sin(a)];
  });
  const mid = (i: number, j: number): [number, number] => [(arr[i][0] + arr[j][0]) / 2, (arr[i][1] + arr[j][1]) / 2];
  const start = mid(pts - 1, 0);
  let d = `M ${start[0].toFixed(1)} ${start[1].toFixed(1)} `;
  for (let i = 0; i < pts; i++) {
    const m = mid(i, (i + 1) % pts);
    d += `Q ${arr[i][0].toFixed(1)} ${arr[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)} `;
  }
  return d + "Z";
}

const RELATED_FRAMES = [
  { path: () => flowerArc(4, 65, 95),                    color: C.rose },
  { path: () => blob(10, 160, 158, 0.12, 200, 200, 22),  color: C.blue },
  { path: () => flowerArc(4, 68, 98),                    color: C.mustard },
  { path: () => blob(10, 170, 150, 0.10, 200, 200, 15),  color: C.green },
];

/* ─── Types ─── */
interface ProductDetailsClientProps {
  product: StorefrontProduct;
  related: StorefrontProduct[];
  lang: Locale;
  dictionary: any;
}

/* ════════════════════════════════════════════════════════════════════ */
export function ProductDetailsClient({ product, related, lang }: ProductDetailsClientProps) {
  useStoreHydration();
  const copy = getLandingCopy(lang);

  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity,   setQuantity]   = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const hasBack   = Boolean(product.image_back);
  const activeImg = activeSide === "back" && product.image_back ? product.image_back : product.image_front;
  const inStock   = product.in_stock && product.stock > 0;
  const isOnSale  = Boolean(product.original_price && product.original_price > product.price);
  const name      = product.name || product.code;
  const sub       = [product.size, product.color].filter(Boolean).join(" · ");
  const isKa      = lang === "ka";
  const curr      = product.currency === "GEL" ? "₾" : ` ${product.currency}`;
  const categoryLabel = copy.shop.filters[product.category === "tote" ? "bag" : product.category];
  const catColor  = CAT_COLORS[product.category] ?? { bg: C.rose, text: C.cream, shadow: "#9c6078" };

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
          variants: [{ id: `${product.id}-default`, size: "one", colorName: { en: product.color || "default", ka: product.color || "default" }, colorCode: "#264ba0", inStock: true }],
          category: product.category as any, featured: true, badges: [],
        } as any,
        { id: `${product.id}-default`, size: "one", colorName: { en: product.color || "default", ka: product.color || "default" }, colorCode: "#264ba0", inStock: true } as any,
        quantity
      );
      openCart();
    } catch { openCart(); }
  };

  /* ── render ── */
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* ══ ROSE HERO — matches shop hero style ════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: C.rose, paddingBottom: 90 }}>
        {/* Floating flowers — same decorations as shop hero */}
        {[
          { color: C.cream,   size: 64, petals: 5, style: { left: "5%",   top: "18%", opacity: 0.22, transform: "rotate(-14deg)" } },
          { color: C.mustard, size: 48, petals: 5, style: { right: "7%",  top: "22%", opacity: 0.40, transform: "rotate(18deg)"  } },
          { color: C.cream,   size: 36, petals: 6, style: { left: "22%",  bottom: "30%", opacity: 0.18 } },
          { color: C.mustard, size: 28, petals: 6, style: { right: "20%", bottom: "34%", opacity: 0.35, transform: "rotate(-9deg)" } },
        ].map(({ color, size, petals, style }, i) => (
          <div key={i} className="absolute pointer-events-none" style={{ width: size, height: size, ...style }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <g transform="translate(50,50)">
                {Array.from({ length: petals }, (_, j) => (
                  <ellipse key={j} cx="0" cy="-22" rx="10" ry="20" fill={color} transform={`rotate(${(360 / petals) * j})`} />
                ))}
                <circle r="11" fill={color} />
              </g>
            </svg>
          </div>
        ))}

        <div className="relative z-10 text-center px-6 pt-14 md:pt-20">
          {/* Breadcrumb */}
          <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.cream, opacity: 0.65, marginBottom: 12, display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Link href={`/${lang}`}       style={{ color: "inherit", textDecoration: "none" }}>{isKa ? "მთავარი" : "home"}</Link>
            <span>✦</span>
            <Link href={`/${lang}/shop`}  style={{ color: "inherit", textDecoration: "none" }}>{isKa ? "მაღაზია" : "shop"}</Link>
            <span>✦</span>
            <span style={{ opacity: 0.9 }}>{categoryLabel || product.category}</span>
          </div>

          {/* Product name — big italic, same size as shop "bags." heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <h1 style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(34px, 6vw, 76px)",
              color: C.cream,
              lineHeight: 1.0,
              margin: 0,
            }}>
              {name}
            </h1>
          </motion.div>

          {sub && (
            <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 15, color: C.cream, opacity: 0.72, marginTop: 10, marginBottom: 0 }}>
              {sub}
            </p>
          )}
        </div>

        {/* Scalloped bottom — identical to shop */}
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 80, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full block">
            <path d={SCALLOP_PATH} fill={C.cream} />
          </svg>
        </div>
      </section>

      {/* ══ PRODUCT DETAIL AREA — cream with botanical sides ══════════ */}
      <div style={{ background: C.cream, position: "relative" }}>

        {/* Botanical decorations — same layout as shop content area */}
        <div aria-hidden="true" className="absolute hidden md:block pointer-events-none overflow-hidden" style={{ top: 0, bottom: 0, left: 0, right: 0, zIndex: 0 }}>
          <Daisy        color={C.rose}      size={62} style={{ left: "2%",  top: "5%",  transform: "rotate(-12deg)", opacity: 0.68 }} />
          <SmallLeaf    color={C.sage}      size={28} style={{ left: "4%",  top: "18%", transform: "rotate(25deg)",  opacity: 0.62 }} />
          <TulipStem    color={C.lavender}  size={44} style={{ left: "1%",  top: "32%", transform: "rotate(-8deg)",  opacity: 0.60 }} />
          <Sparkle      color={C.mustard}   size={22} style={{ left: "6%",  top: "52%", transform: "rotate(10deg)",  opacity: 0.64 }} />
          <MiniClover   color={C.rose}      size={18} style={{ left: "3%",  top: "64%", transform: "rotate(-20deg)", opacity: 0.62 }} />
          <SmallBerries color={C.champagne} size={42} style={{ left: "1%",  top: "76%", transform: "rotate(6deg)",   opacity: 0.60 }} />

          <TulipStem    color={C.sage}      size={46} style={{ right: "1%", top: "8%",  transform: "rotate(14deg)",  opacity: 0.62 }} />
          <SmallLeaf    color={C.rose}      size={30} style={{ right: "3%", top: "24%", transform: "rotate(-22deg)", opacity: 0.62 }} />
          <Sparkle      color={C.lavender}  size={24} style={{ right: "5%", top: "40%", transform: "rotate(-12deg)", opacity: 0.64 }} />
          <Daisy        color={C.mustard}   size={54} style={{ right: "2%", top: "56%", transform: "rotate(9deg)",   opacity: 0.65 }} />
          <MiniClover   color={C.champagne} size={18} style={{ right: "4%", top: "72%", transform: "rotate(15deg)",  opacity: 0.60 }} />
          <Daisy        color={C.green}     size={46} style={{ right: "1%", top: "88%", transform: "rotate(-17deg)", opacity: 0.60 }} />
        </div>

        {/* Main product grid */}
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-20 relative" style={{ zIndex: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 52, alignItems: "start" }}>

            {/* ── LEFT: Main product photo — large, fully visible ── */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.215, 0.61, 0.355, 1] }}
              >
                {/* Photo frame: rounded rectangle, no clipping — product fully visible */}
                <div style={{
                  position: "relative",
                  borderRadius: 28,
                  overflow: "hidden",
                  aspectRatio: "4 / 5",
                  boxShadow: `0 0 0 4px ${catColor.bg}, 0 0 0 8px rgba(201,168,108,0.18), 0 14px 44px rgba(42,29,20,0.18)`,
                  background: C.beige,
                }}>
                  <Image
                    src={activeImg}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                    priority
                  />

                  {/* Wishlist button */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setWishlisted((w) => !w)}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    style={{
                      position: "absolute", top: 14, right: 14, zIndex: 2,
                      background: "white", border: "none", borderRadius: "50%",
                      width: 42, height: 42,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.14)",
                    }}
                  >
                    <Heart size={18} fill={wishlisted ? C.rose : "none"} stroke={wishlisted ? C.rose : C.champagne} strokeWidth={2} />
                  </motion.button>

                  {/* New tag */}
                  {product.tags.includes("new") && (
                    <span style={{
                      position: "absolute", top: 14, left: 14, zIndex: 2,
                      background: C.mustard, color: C.ink,
                      fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700,
                      fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                      padding: "4px 12px", borderRadius: 999,
                      boxShadow: `0 3px 0 ${C.mustardDeep}`,
                      transform: "rotate(-4deg)",
                    }}>
                      {isKa ? "ახალი" : "New"}
                    </span>
                  )}

                  {/* Stock badge */}
                  <div style={{
                    position: "absolute", bottom: 14, left: 14, zIndex: 2,
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: 999, padding: "4px 14px",
                    fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 11,
                    color: inStock ? C.green : C.rose,
                  }}>
                    {inStock
                      ? `✦ ${product.stock} ${isKa ? "მარაგშია" : "in stock"}`
                      : isKa ? "გაყიდულია" : "Sold out"}
                  </div>
                </div>

                {/* Front / Back thumb switcher */}
                {hasBack && (
                  <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center" }}>
                    {(["front", "back"] as const).map((side) => {
                      const src    = side === "front" ? product.image_front : product.image_back!;
                      const active = activeSide === side;
                      return (
                        <motion.button
                          key={side}
                          onClick={() => setActiveSide(side)}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            width: 64, height: 64, borderRadius: 14, overflow: "hidden",
                            border: active ? `3px solid ${catColor.bg}` : `2px solid rgba(201,168,108,0.30)`,
                            padding: 0, cursor: "pointer", position: "relative", background: C.beige,
                            boxShadow: active ? `0 3px 0 ${catColor.shadow}` : `0 2px 0 rgba(201,168,108,0.25)`,
                            transition: "border-color 0.18s, box-shadow 0.18s",
                          }}
                          aria-label={side}
                        >
                          <Image src={src} alt={side} fill style={{ objectFit: "cover" }} sizes="64px" />
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── RIGHT: Product info ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
              style={{ paddingTop: 6 }}
            >
              {/* Category pill — same style as shop filter pills */}
              <div style={{ marginBottom: 20 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: catColor.bg, color: catColor.text,
                  fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700,
                  fontSize: 12, letterSpacing: "0.06em",
                  padding: "7px 18px",
                  borderRadius: "14px 20px 16px 18px",
                  boxShadow: `0 4px 0 ${catColor.shadow}`,
                }}>
                  {categoryLabel || product.category}
                  <span style={{ opacity: 0.55 }}>·</span>
                  <span style={{ fontWeight: 600, opacity: 0.88 }}>
                    {product.stock} {isKa ? "მარაგში" : "in stock"}
                  </span>
                </span>
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
                <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 900, fontSize: 46, color: C.ink, lineHeight: 1 }}>
                  {product.price}{curr}
                </span>
                {isOnSale && product.original_price && (
                  <span style={{ fontFamily: FRAUNCES, fontSize: 22, color: C.champagne, textDecoration: "line-through" }}>
                    {product.original_price}{curr}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p style={{
                  fontFamily: FRAUNCES, fontStyle: "italic",
                  fontSize: 15, lineHeight: 1.75, color: C.ink, opacity: 0.80,
                  marginBottom: 20,
                  borderLeft: `3px solid ${catColor.bg}`,
                  paddingLeft: 14,
                }}>
                  {product.description}
                </p>
              )}

              {/* Feature pills — same style as shop category pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
                {[
                  isKa ? "ხელნაკეთი"   : "Handmade",
                  isKa ? "წყალგამძლე" : "Water-resistant",
                  isKa ? "ორმხრივი"   : "Reversible",
                ].map((label) => (
                  <span key={label} style={{
                    fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700,
                    fontSize: 12, color: C.ink,
                    background: C.cream,
                    border: `2px solid rgba(201,168,108,0.40)`,
                    borderRadius: "20px 14px 18px 16px",
                    padding: "7px 16px",
                    boxShadow: `0 3px 0 rgba(201,168,108,0.28)`,
                  }}>
                    {label}
                  </span>
                ))}
              </div>

              {/* Quantity */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.champagne, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {isKa ? "რაოდ." : "Qty"}
                </span>
                <div style={{
                  display: "flex", alignItems: "center",
                  border: `2px solid rgba(201,168,108,0.40)`,
                  borderRadius: "20px 14px 18px 16px",
                  background: "white",
                  boxShadow: `0 3px 0 rgba(201,168,108,0.25)`,
                }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="decrease"
                    style={{ width: 38, height: 38, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
                    <Minus size={13} />
                  </button>
                  <span style={{ width: 34, textAlign: "center", fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, color: C.ink }}>{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} aria-label="increase"
                    style={{ width: 38, height: 38, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Buttons — shop pill style with drop shadow */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 3 }}
                  onClick={onAddToCart}
                  disabled={!inStock}
                  style={{
                    flex: "1 1 0", minWidth: 160,
                    background: inStock ? C.mustard : C.champagne,
                    color: C.ink,
                    border: "none",
                    borderRadius: "20px 14px 18px 16px",
                    padding: "14px 24px",
                    fontFamily: FRAUNCES, fontStyle: "italic",
                    fontSize: 15, fontWeight: 700,
                    cursor: inStock ? "pointer" : "not-allowed",
                    boxShadow: inStock ? `0 5px 0 ${C.mustardDeep}` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <ShoppingBag size={16} />
                  {isKa ? "კალათში დამატება" : "Add to bag"}
                </motion.button>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 3 }}
                  onClick={() => { window.location.href = `/${lang}/shop`; }}
                  style={{
                    flexShrink: 0,
                    background: C.cream, color: C.ink,
                    border: `2px solid rgba(201,168,108,0.40)`,
                    borderRadius: "14px 20px 16px 18px",
                    padding: "14px 22px",
                    fontFamily: FRAUNCES, fontStyle: "italic",
                    fontSize: 15, fontWeight: 700, cursor: "pointer",
                    boxShadow: `0 5px 0 rgba(201,168,108,0.28)`,
                  }}
                >
                  {isKa ? "მაღაზია" : "Shop"}
                </motion.button>
              </div>

              {/* Delivery note */}
              <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.champagne, opacity: 0.88 }}>
                ✦ {isKa ? "ხელნაკეთი თბილისში · სწრაფი მიტანა საქართველოში" : "Handmade in Tbilisi · Fast delivery across Georgia"}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ FEATURES STRIP — beige, dashed borders ═════════════════════ */}
      <div style={{ background: C.beige, borderTop: `1.5px dashed rgba(201,168,108,0.35)`, borderBottom: `1.5px dashed rgba(201,168,108,0.35)` }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ padding: "28px 0", gap: 16 }}>
            {[
              { icon: "🚗", title: isKa ? "უფასო მიტანა"  : "Free shipping",    sub: isKa ? "1-2 სამ. დღე"       : "1–2 business days"      },
              { icon: "✦",  title: isKa ? "ხელნაკეთი"     : "Handmade",         sub: isKa ? "ჩვენს სახელოსნოში"  : "In our Tbilisi studio"   },
              { icon: "↺",  title: isKa ? "ორმხრივი"      : "Reversible",       sub: isKa ? "ორი მხარე, ერთი ჩანთა" : "Two sides, one bag"   },
              { icon: "💧", title: isKa ? "წყალგამძლე"    : "Water-resistant",  sub: isKa ? "სანვარე ტილო"       : "Canvas that handles rain" },
            ].map(({ icon, title, sub: fsub }) => (
              <div key={title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 14, color: C.burnt, fontWeight: 700, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 11, color: C.champagne }}>{fsub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RELATED PRODUCTS — shop-style organic frames ═══════════════ */}
      {related.length > 0 && (
        <div style={{ background: C.cream, padding: "60px 0 80px" }}>
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            {/* Heading — shop style */}
            <div className="text-center" style={{ marginBottom: 44 }}>
              <span style={{
                fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700,
                fontSize: 10, color: C.champagne,
                letterSpacing: "0.35em", textTransform: "uppercase",
                display: "block", marginBottom: 8,
              }}>
                {isKa ? "ხელით ნაკერი · თბილისი" : "Handmade in Tbilisi"}
              </span>
              <h2 style={{
                fontFamily: FRAUNCES, fontStyle: "italic",
                fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: C.ink, margin: 0,
              }}>
                {isKa ? "შეიძლება მოგეწონოს" : "You might also love"}
              </h2>
            </div>

            {/* Shop-style 2-col on mobile, 4-col on lg */}
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 24 }}>
              {related.slice(0, 4).map((rp, idx) => (
                <RelatedCard key={rp.id} product={rp} lang={lang} isKa={isKa} index={idx} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Related product card — shop ShopCard style ─── */
function RelatedCard({
  product, lang, isKa, index,
}: {
  product: StorefrontProduct; lang: Locale; isKa: boolean; index: number;
}) {
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const name     = product.name || product.code;
  const curr     = product.currency === "GEL" ? "₾" : ` ${product.currency}`;
  const frame    = RELATED_FRAMES[index % RELATED_FRAMES.length];
  const path     = useMemo(() => frame.path(), [frame]);
  const clipId   = `rc-${product.id}`;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addItem(
        { id: product.id, slug: product.id, name: { en: name, ka: name },
          subtitle: { en: "", ka: "" }, description: { en: "", ka: "" }, price: product.price,
          images: [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [{ id: `${product.id}-d`, size: "one", colorName: { en: product.color || "default", ka: product.color || "default" }, colorCode: "#c9a86c", inStock: true }],
          category: product.category as any, featured: true, badges: [] } as any,
        { id: `${product.id}-d`, size: "one", colorName: { en: product.color || "default", ka: product.color || "default" }, colorCode: "#c9a86c", inStock: true } as any,
        1
      );
      openCart();
    } catch { openCart(); }
  };

  return (
    <Link href={`/${lang}/product/${product.id}`} style={{ textDecoration: "none" }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: index * 0.07, ease: [0.215, 0.61, 0.355, 1] }}
        className="flex flex-col items-center"
        style={{ gap: 12 }}
      >
        {/* Organic-framed photo — same as ShopCard */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>
          <svg
            viewBox="0 0 400 400"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
            className="absolute inset-0 w-full h-full"
            style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.13))", overflow: "visible" }}
          >
            <defs><clipPath id={clipId}><path d={path} /></clipPath></defs>
            <image
              href={product.image_front}
              x="0" y="0" width="400" height="400"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
            <path d={path} fill="none" stroke={frame.color} strokeWidth="6" />
          </svg>
        </div>

        {/* Name + price + add button */}
        <div style={{ textAlign: "center", width: "100%" }}>
          <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 3 }}>
            {name}
          </div>
          <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 17, fontWeight: 900, color: C.burnt, marginBottom: 10 }}>
            {product.price}{curr}
          </div>
          <motion.button
            whileTap={{ y: 2 }}
            onClick={handleAdd}
            style={{
              background: C.cream, color: C.ink,
              border: `2px solid rgba(201,168,108,0.40)`,
              borderRadius: "20px 14px 18px 16px",
              padding: "7px 20px",
              fontFamily: FRAUNCES, fontStyle: "italic",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 3px 0 rgba(201,168,108,0.28)`,
            }}
          >
            {isKa ? "+ კალათი" : "+ Add"}
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}
