"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct, StorefrontCategory } from "@/lib/admin-api";
import { getLandingCopy } from "@/app/[lang]/landingCopy";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";

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
  champagne:   "#c9a86c",
  rose:        "#c4849a",
  lavender:    "#9e8abf",
  sage:        "#7aaa8a",
  green:       "#3f6f56",
  blue:        "#5a9fd4",
};

/* ── Scalloped hero bottom ───────────────────────────────────────── */
const SCALLOP_PATH = (() => {
  const n = 20, w = 1440, sw = w / n, H = 44;
  let d = `M 0 80 L 0 ${H}`;
  for (let i = 0; i < n; i++) {
    d += ` Q ${Math.round(i * sw + sw / 2)} 0 ${Math.round((i + 1) * sw)} ${H}`;
  }
  return d + ` L ${w} 80 Z`;
})();

/* ── Shape helpers ───────────────────────────────────────────────── */
function seedNoise(i: number, seed: number): number {
  const n = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/* Each petal is a genuine circle arc — creates round puffy clover/cloud shapes
   where the product photo remains clearly visible.
   d = distance from center to petal-circle center, r = petal circle radius */
function flowerArc(petals: number, d: number, r: number, cx = 200, cy = 200): string {
  const step = (Math.PI * 2) / petals;
  const halfStep = step / 2;
  const L = d * Math.sin(halfStep);
  const midD = d * Math.cos(halfStep);
  const W = midD + Math.sqrt(Math.max(0, r * r - L * L));
  const waist: [number, number][] = Array.from({ length: petals }, (_, i) => {
    const a = i * step + halfStep;
    return [cx + W * Math.cos(a), cy + W * Math.sin(a)];
  });
  let p = `M ${waist[petals - 1][0].toFixed(1)} ${waist[petals - 1][1].toFixed(1)} `;
  for (let i = 0; i < petals; i++) {
    p += `A ${r} ${r} 0 1 1 ${waist[i][0].toFixed(1)} ${waist[i][1].toFixed(1)} `;
  }
  return p + "Z";
}

function blob(pts: number, rx: number, ry: number, variance: number, cx = 200, cy = 200, seed = 0): string {
  const arr: [number, number][] = [];
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const m = 1 + (seedNoise(i, seed) * 2 - 1) * variance;
    arr.push([cx + m * rx * Math.cos(a), cy + m * ry * Math.sin(a)]);
  }
  const mid = (i: number, j: number): [number, number] => [(arr[i][0] + arr[j][0]) / 2, (arr[i][1] + arr[j][1]) / 2];
  const start = mid(pts - 1, 0);
  let d = `M ${start[0].toFixed(1)} ${start[1].toFixed(1)} `;
  for (let i = 0; i < pts; i++) {
    const next = (i + 1) % pts;
    const m = mid(i, next);
    d += `Q ${arr[i][0].toFixed(1)} ${arr[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)} `;
  }
  return d + "Z";
}

function roundedRect(w: number, h: number, cx = 200, cy = 200, r = 10): string {
  const x = cx - w / 2, y = cy - h / 2;
  return `M ${x+r} ${y} h ${w-2*r} a ${r} ${r} 0 0 1 ${r} ${r} v ${h-2*r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w-2*r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h-2*r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
}

/* arch frame: flat top with rounded corners, elliptical arch at bottom */
function stadiumBottom(cx: number, cy: number, hw: number, ht: number, cr: number): string {
  const top  = cy - ht * 0.5;
  const archY = cy + ht * 0.5;
  const left  = cx - hw;
  const right = cx + hw;
  return [
    `M ${left + cr} ${top}`,
    `L ${right - cr} ${top}`,
    `A ${cr} ${cr} 0 0 1 ${right} ${top + cr}`,
    `L ${right} ${archY}`,
    `A ${hw} ${hw * 0.62} 0 0 1 ${left} ${archY}`,
    `L ${left} ${top + cr}`,
    `A ${cr} ${cr} 0 0 1 ${left + cr} ${top}`,
    `Z`,
  ].join(" ");
}

/* ── Frame shapes — outlined only, product clearly visible ───────── */
type Frame = { path: () => string; color: string };

const FRAMES: Frame[] = [
  { path: () => flowerArc(4, 78, 92),                      color: C.rose },
  { path: () => flowerArc(6, 80, 90),                      color: C.green },
  { path: () => blob(10, 162, 155, 0.11, 200, 200, 7),     color: C.mustard },
  { path: () => stadiumBottom(200, 185, 152, 210, 24),     color: C.blue },
  { path: () => flowerArc(4, 76, 95),                      color: C.blue },
  { path: () => roundedRect(340, 340, 200, 200, 54),       color: C.green },
  { path: () => flowerArc(6, 78, 94),                      color: C.rose },
  { path: () => flowerArc(4, 80, 88),                      color: C.mustard },
];

/* ── Category styling ────────────────────────────────────────────── */
const CAT_COLORS: Record<string, { bg: string; text: string; shadow: string }> = {
  all:          { bg: C.rose,     text: C.cream,  shadow: "#9c6078" },
  pouch:        { bg: C.burnt,    text: C.cream,  shadow: "#a83c14" },
  laptop:       { bg: C.lavender, text: C.cream,  shadow: "#7060a0" },
  tote:         { bg: C.sage,     text: C.cream,  shadow: "#568868" },
  kidsbackpack: { bg: C.mustard,  text: C.ink,    shadow: C.mustardDeep },
  apron:        { bg: C.green,    text: C.cream,  shadow: "#1e3828" },
  necklace:     { bg: C.champagne,text: C.ink,    shadow: "#9a7840" },
};

const CAT_ICONS: Record<string, string> = {
  all: "✦", pouch: "👜", laptop: "💻", tote: "🛍️", kidsbackpack: "🎒", apron: "👩‍🍳", necklace: "📿",
};

/* ── Hero flowers ────────────────────────────────────────────────── */
function FloatFlower({ color, size, petals = 5, style }: {
  color: string; size: number; petals?: number; style: CSSProperties;
}) {
  return (
    <div className="absolute pointer-events-none" style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <g transform="translate(50,50)">
          {Array.from({ length: petals }, (_, i) => (
            <ellipse key={i} cx="0" cy="-22" rx="10" ry="20"
              fill={color} transform={`rotate(${(360 / petals) * i})`} />
          ))}
          <circle r="11" fill={color} />
        </g>
      </svg>
    </div>
  );
}

/* ── Botanical decorations (hand-drawn style) ────────────────────── */
function Daisy({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  return (
    <div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }}>
      <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
        <g transform="translate(40,40)">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-18" rx="7" ry="14"
              fill={color} opacity="0.88" transform={`rotate(${45 * i})`} />
          ))}
          <circle r="9" fill={C.mustard} />
        </g>
      </svg>
    </div>
  );
}

function TulipStem({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const h = Math.round(size * 2.4);
  return (
    <div className="pointer-events-none" style={{ position: "absolute", width: size, height: h, ...style }}>
      <svg viewBox="0 0 60 140" style={{ width: "100%", height: "100%" }}>
        <path d="M30 130 C27 100 33 75 28 50 C23 28 30 10 30 10"
          fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 80 Q10 65 17 50 Q27 63 28 80Z" fill={color} opacity="0.72" />
        <path d="M32 95 Q50 80 43 65 Q33 78 32 95Z" fill={color} opacity="0.65" />
        <path d="M22 18 Q10 10 16 0 Q26 8 22 18Z" fill={color} opacity="0.88" />
        <path d="M38 18 Q50 10 44 0 Q34 8 38 18Z" fill={color} opacity="0.88" />
        <path d="M30 10 Q28 -4 30 -8 Q32 -4 30 10Z" fill={color} opacity="0.88" />
      </svg>
    </div>
  );
}

/* ── Types ───────────────────────────────────────────────────────── */
interface ShopClientProps { lang: Locale; dictionary: any; products: StorefrontProduct[] }
type CategoryValue = "all" | StorefrontCategory;
type SortValue     = "featured" | "new" | "price-low" | "price-high";

const CAT_ALIASES: Record<string, CategoryValue> = {
  all: "all", pouches: "pouch", pouch: "pouch",
  "laptop-sleeves": "laptop", laptop: "laptop",
  totes: "tote", tote: "tote",
  "kids-backpacks": "kidsbackpack", kidsbackpack: "kidsbackpack",
  aprons: "apron", apron: "apron",
  necklaces: "necklace", necklace: "necklace",
};

const SORT_OPTIONS: Array<{ val: SortValue; en: string; ka: string }> = [
  { val: "featured",   en: "Featured",  ka: "ფავორიტები" },
  { val: "new",        en: "Newest",    ka: "სიახლეები" },
  { val: "price-low",  en: "Price ↑",   ka: "ფასი ↑" },
  { val: "price-high", en: "Price ↓",   ka: "ფასი ↓" },
];

/* ════════════════════════ MAIN COMPONENT ══════════════════════════ */

export default function ShopClient({ lang, dictionary, products }: ShopClientProps) {
  const copy = getLandingCopy(lang);
  const router = useRouter();
  const sp = useSearchParams();
  const isKa = lang === "ka";

  const catParam: CategoryValue = CAT_ALIASES[sp.get("category") ?? "all"] ?? "all";
  const sortParam = (sp.get("sort") as SortValue) ?? "featured";

  const setParam = (key: string, val: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (val && val !== "all") p.set(key, val); else p.delete(key);
    router.push(`?${p.toString()}`, { scroll: false });
  };

  const visible = useMemo(() => {
    let r = products.filter((p) => Boolean(p.image_front));
    if (catParam !== "all") r = r.filter((p) => p.category === catParam);
    if (sortParam === "price-low") r.sort((a, b) => a.price - b.price);
    else if (sortParam === "price-high") r.sort((a, b) => b.price - a.price);
    else if (sortParam === "new") r.sort((a, b) => (b.tags.includes("new") ? 1 : 0) - (a.tags.includes("new") ? 1 : 0));
    return r;
  }, [products, catParam, sortParam]);

  const cats: Array<{ label: string; val: CategoryValue }> = [
    { label: copy.shop.filters.all,          val: "all" },
    { label: copy.shop.filters.pouch,        val: "pouch" },
    { label: copy.shop.filters.laptop,       val: "laptop" },
    { label: copy.shop.filters.bag,          val: "tote" },
    { label: copy.shop.filters.kidsbackpack, val: "kidsbackpack" },
    { label: copy.shop.filters.apron,        val: "apron" },
    { label: copy.shop.filters.necklace,     val: "necklace" },
  ];

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: C.rose, paddingBottom: 90 }}>
        <FloatFlower color={C.cream}   size={72} petals={5} style={{ left: "4%",   top: "14%",    opacity: 0.22, transform: "rotate(-14deg)" }} />
        <FloatFlower color={C.mustard} size={52} petals={5} style={{ right: "6%",  top: "20%",    opacity: 0.40, transform: "rotate(18deg)"  }} />
        <FloatFlower color={C.cream}   size={38} petals={6} style={{ left: "22%",  bottom: "28%", opacity: 0.18, transform: "rotate(6deg)"   }} />
        <FloatFlower color={C.mustard} size={30} petals={6} style={{ right: "20%", bottom: "32%", opacity: 0.35, transform: "rotate(-9deg)"  }} />

        <div className="relative z-10 text-center px-6 pt-16 md:pt-24">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-[10px] font-extrabold uppercase tracking-[0.35em] mb-5"
            style={{ color: C.cream, opacity: 0.72, fontFamily: FRAUNCES }}
          >
            {isKa ? "ხელით ნაკერი · თბილისი" : "Handmade in Tbilisi"}
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1] }}
          >
            {!isKa && (
              <div style={{ fontFamily: PACIFICO, fontSize: "clamp(30px, 5vw, 64px)", color: C.cream, lineHeight: 1.15, marginBottom: "-0.06em" }}>
                The
              </div>
            )}
            <div style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(56px, 10vw, 136px)",
              color: C.cream,
              lineHeight: 0.88,
            }}>
              {isKa ? "ჩანთები." : "bags."}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.72 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 mx-auto"
            style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 16, color: C.cream, maxWidth: 400 }}
          >
            {isKa ? "ყოველი ნემსი ხელით — ჩვენს სტუდიაში." : "Every stitch by hand, in our studio."}
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 w-full" style={{ height: 80, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full block">
            <path d={SCALLOP_PATH} fill={C.cream} />
          </svg>
        </div>
      </section>

      {/* ── Content: sidebar + grid ── */}
      <div className="flex" style={{ background: C.cream }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="hidden md:flex flex-col shrink-0 pt-10 pb-24 px-7"
          style={{
            width: 210,
            borderRight: `1.5px solid rgba(201,168,108,0.28)`,
            position: "sticky",
            top: 64,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
        >
          {/* Category */}
          <div
            className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.26em]"
            style={{ fontFamily: FRAUNCES, color: C.champagne }}
          >
            {isKa ? "კატეგორია" : "Category"}
          </div>
          <div className="flex flex-col gap-0.5">
            {cats.map((cat) => {
              const active = catParam === cat.val;
              const col = CAT_COLORS[cat.val] ?? CAT_COLORS.all;
              return (
                <motion.button
                  key={cat.val}
                  onClick={() => setParam("category", cat.val)}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 px-3 py-2 text-left text-[12px] font-bold uppercase tracking-[0.12em] rounded-[10px] transition-all"
                  style={{
                    fontFamily: FRAUNCES,
                    background: active ? col.bg : "transparent",
                    color: active ? col.text : C.ink,
                    boxShadow: active ? `0 3px 0 ${col.shadow}` : "none",
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{CAT_ICONS[cat.val]}</span>
                  {cat.label}
                </motion.button>
              );
            })}
          </div>

          {/* Sort */}
          <div
            className="mt-8 mb-3 text-[10px] font-extrabold uppercase tracking-[0.26em]"
            style={{ fontFamily: FRAUNCES, color: C.champagne }}
          >
            {isKa ? "დალაგება" : "Sort by"}
          </div>
          <div className="flex flex-col gap-0.5">
            {SORT_OPTIONS.map((opt) => {
              const active = opt.val === sortParam;
              return (
                <button
                  key={opt.val}
                  onClick={() => setParam("sort", opt.val)}
                  className="flex items-center justify-between px-3 py-2 text-left text-[12px] font-bold uppercase tracking-[0.12em] rounded-[10px] transition-all"
                  style={{
                    fontFamily: FRAUNCES,
                    background: active ? "rgba(201,168,108,0.16)" : "transparent",
                    color: active ? C.burnt : C.ink,
                  }}
                >
                  {isKa ? opt.ka : opt.en}
                  {active && <Check className="w-3 h-3 shrink-0" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── PRODUCT GRID ── */}
        <main className="flex-1 px-6 md:px-10 lg:px-14 pt-8 pb-24">

          {/* Mobile filter pills */}
          <nav className="flex flex-wrap gap-2 mb-8 md:hidden">
            {cats.map((cat) => {
              const active = catParam === cat.val;
              const col = CAT_COLORS[cat.val] ?? CAT_COLORS.all;
              return (
                <button
                  key={cat.val}
                  onClick={() => setParam("category", cat.val)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] rounded-[10px]"
                  style={{
                    fontFamily: FRAUNCES,
                    background: active ? col.bg : "rgba(201,168,108,0.1)",
                    color: active ? col.text : C.ink,
                    border: `1.5px solid ${active ? col.bg : C.champagne}`,
                    boxShadow: active ? `0 3px 0 ${col.shadow}` : "none",
                  }}
                >
                  {CAT_ICONS[cat.val]} {cat.label}
                </button>
              );
            })}
          </nav>

          {visible.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-5">
              <span style={{ fontSize: 52, color: C.champagne }}>✦</span>
              <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 22, color: C.ink }}>
                {isKa ? "ამ ფილტრით ჩანთები ვერ მოიძებნა." : "Nothing matches those filters yet."}
              </p>
              <button
                onClick={() => setParam("category", "all")}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em]"
                style={{ fontFamily: FRAUNCES, background: C.mustard, color: C.ink, boxShadow: `0 5px 0 ${C.mustardDeep}` }}
              >
                {isKa ? "ყველა" : "Clear filters"}
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Botanical decorations in center gutter — desktop only */}
              <div className="hidden md:block" aria-hidden="true">
                <Daisy     color={C.rose}      size={50} style={{ left: "calc(50% - 25px)", top: "5%",  transform: "rotate(18deg)",  opacity: 0.72 }} />
                <TulipStem color={C.sage}      size={34} style={{ left: "calc(50% - 17px)", top: "23%", transform: "rotate(-22deg)", opacity: 0.62 }} />
                <Daisy     color={C.mustard}   size={42} style={{ left: "calc(50% - 21px)", top: "44%", transform: "rotate(-10deg)", opacity: 0.65 }} />
                <TulipStem color={C.lavender}  size={30} style={{ left: "calc(50% - 15px)", top: "63%", transform: "rotate(25deg)",  opacity: 0.58 }} />
                <Daisy     color={C.blue}      size={38} style={{ left: "calc(50% - 19px)", top: "83%", transform: "rotate(6deg)",   opacity: 0.55 }} />
              </div>

              {/* Editorial 2-column scatter */}
              <div className="flex flex-col md:flex-row md:gap-10 lg:gap-14 gap-16">
                {/* Left column */}
                <div className="flex-1 flex flex-col gap-20 md:gap-28">
                  {visible.filter((_, i) => i % 2 === 0).map((p, i) => (
                    <ShopCard key={p.id} product={p} index={i * 2} lang={lang} isKa={isKa} copy={copy} />
                  ))}
                </div>
                {/* Right column — shifted down */}
                <div className="flex-1 flex flex-col gap-20 md:gap-28 md:pt-36 lg:pt-44">
                  {visible.filter((_, i) => i % 2 === 1).map((p, i) => (
                    <ShopCard key={p.id} product={p} index={i * 2 + 1} lang={lang} isKa={isKa} copy={copy} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════ SHOP CARD ════════════════════════════════ */

function ShopCard({ product, index, lang, isKa, copy }: {
  product: StorefrontProduct; index: number; lang: Locale; isKa: boolean;
  copy: ReturnType<typeof getLandingCopy>;
}) {
  const [hover, setHover] = useState(false);
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const frame  = FRAMES[index % FRAMES.length];
  const clipId = `sc-${product.id}`;
  const path   = useMemo(() => frame.path(), [frame]);

  const hasBack  = Boolean(product.image_back);
  const isOnSale = Boolean(product.original_price && product.original_price > product.price);
  const name     = product.name || product.code;
  const inStock  = product.in_stock;

  const onBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      addItem(
        { id: product.id, slug: product.id, name: { en: name, ka: name },
          subtitle: { en: "", ka: "" }, description: { en: "", ka: "" }, price: product.price,
          images: [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [{ id: `${product.id}-d`, size: "one",
            colorName: { en: product.color || "default", ka: product.color || "default" },
            colorCode: "#264ba0", inStock: true }],
          category: product.category as any, featured: true, badges: [] } as any,
        { id: `${product.id}-d`, size: "one",
          colorName: { en: product.color || "default", ka: product.color || "default" },
          colorCode: "#264ba0", inStock: true } as any,
        1
      );
      openCart();
    } catch { openCart(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay: (index % 2) * 0.08, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex flex-col"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Organic-framed photo */}
      <Link
        href={`/${lang}/product/${product.id}`}
        className="relative w-full"
        style={{ aspectRatio: "1 / 1" }}
      >
        {product.tags.includes("new") && (
          <span
            className="absolute -top-2 right-3 z-10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em]"
            style={{
              background: C.mustard, color: C.ink, fontFamily: FRAUNCES,
              transform: "rotate(8deg)", borderRadius: 999,
              boxShadow: `0 3px 0 ${C.mustardDeep}`,
            }}
          >
            {isKa ? "ახალი" : "New"}
          </span>
        )}

        <svg
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.14))", overflow: "visible" }}
        >
          <defs><clipPath id={clipId}><path d={path} /></clipPath></defs>

          <image
            href={product.image_front}
            x="0" y="0" width="400" height="400"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
            style={{ filter: "saturate(0.95) sepia(0.02)", opacity: hover && hasBack ? 0 : 1, transition: "opacity 0.5s ease" }}
          />
          {hasBack && (
            <image
              href={product.image_back!}
              x="0" y="0" width="400" height="400"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
              style={{ filter: "saturate(0.95) sepia(0.02)", opacity: hover ? 1 : 0, transition: "opacity 0.5s ease" }}
            />
          )}

          {/* Colored stroke outline — no fill */}
          <path d={path} fill="none" stroke={frame.color} strokeWidth="7" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Editorial text — no card box */}
      <div className="mt-4 pl-1">
        <Link
          href={`/${lang}/product/${product.id}`}
          className="hover:underline underline-offset-2 block"
          style={{
            fontFamily: isKa ? ALK_LIFE : FRAUNCES,
            fontStyle: isKa ? "normal" : "italic",
            fontWeight: 700,
            fontSize: "clamp(17px, 1.6vw, 22px)",
            color: C.ink,
            lineHeight: 1.2,
          }}
        >
          {name}
        </Link>

        {product.color && (
          <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 13, color: C.champagne, marginTop: 2 }}>
            {product.color}
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-2">
          <span style={{ fontFamily: PACIFICO, fontSize: "clamp(18px, 1.8vw, 24px)", color: C.burnt, lineHeight: 1.1 }}>
            {product.price}{product.currency === "GEL" ? "₾" : ` ${product.currency}`}
          </span>
          {isOnSale && product.original_price && (
            <span style={{ fontFamily: FRAUNCES, fontSize: 12, color: C.champagne, textDecoration: "line-through" }}>
              {product.original_price}₾
            </span>
          )}
        </div>

        <motion.button
          onClick={onBuy}
          disabled={!inStock}
          whileTap={{ scale: 0.96 }}
          className="mt-3 font-extrabold text-[10px] uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            fontFamily: FRAUNCES,
            background: inStock ? C.mustard : "transparent",
            color: inStock ? C.ink : C.champagne,
            borderRadius: 999,
            padding: "8px 20px",
            boxShadow: inStock ? `0 4px 0 ${C.mustardDeep}` : "none",
            border: inStock ? "none" : `1.5px solid ${C.champagne}`,
          }}
        >
          {inStock
            ? (isKa ? "კალათაში →" : "Add to basket →")
            : (isKa ? "ამოიწურა" : "Sold out")}
        </motion.button>
      </div>
    </motion.div>
  );
}
