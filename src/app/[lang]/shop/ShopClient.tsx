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
   d = distance from center to petal-circle center, r = petal circle radius
   large-arc=0 (minor arc, outward) + sweep=1 (clockwise) = correct outward petal */
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
    p += `A ${r} ${r} 0 0 1 ${waist[i][0].toFixed(1)} ${waist[i][1].toFixed(1)} `;
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

/* ── Frame shapes — organic outlines, product always visible ─────── */
type Frame = { path: () => string; color: string };

const FRAMES: Frame[] = [
  { path: () => flowerArc(4, 65, 95),                      color: C.rose },    // 4-petal clover
  { path: () => roundedRect(340, 340, 200, 200, 70),       color: C.green },
  { path: () => stadiumBottom(200, 185, 152, 210, 24),     color: C.mustard },
  { path: () => blob(10, 160, 158, 0.12, 200, 200, 22),    color: C.blue },
  { path: () => flowerArc(4, 68, 98),                      color: C.mustard },  // 4-petal clover variant
  { path: () => blob(10, 170, 150, 0.10, 200, 200, 15),    color: C.green },
  { path: () => stadiumBottom(200, 190, 148, 205, 26),     color: C.rose },
  { path: () => roundedRect(360, 320, 200, 200, 65),       color: C.blue },
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

/* botanical symbol per category — Unicode florals, no emoji */
const CAT_BOTANICAL: Record<string, string> = {
  all: "✦", pouch: "❀", laptop: "✿", tote: "❧",
  kidsbackpack: "✤", apron: "❦", necklace: "✾",
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

function SmallLeaf({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  return (
    <div className="pointer-events-none" style={{ position: "absolute", width: size, height: Math.round(size * 1.5), ...style }}>
      <svg viewBox="0 0 40 60" style={{ width: "100%", height: "100%" }}>
        <path d="M20 58 C20 58 5 44 5 28 Q5 4 20 2 Q35 4 35 28 C35 44 20 58 20 58Z" fill={color} opacity="0.75" />
        <path d="M20 58 L20 2" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
        <path d="M20 28 Q10 22 8 14" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" fill="none" />
        <path d="M20 38 Q30 32 32 24" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" fill="none" />
      </svg>
    </div>
  );
}

function Sparkle({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  return (
    <div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }}>
      <svg viewBox="0 0 40 40" style={{ width: "100%", height: "100%" }}>
        <path d="M20 1 L22 17 L38 20 L22 23 L20 39 L18 23 L2 20 L18 17 Z" fill={color} opacity="0.78" />
      </svg>
    </div>
  );
}

function SmallBerries({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  return (
    <div className="pointer-events-none" style={{ position: "absolute", width: size, height: Math.round(size * 1.4), ...style }}>
      <svg viewBox="0 0 50 70" style={{ width: "100%", height: "100%" }}>
        <path d="M25 65 C22 55 28 45 25 35" stroke={color} strokeWidth="2" fill="none" strokeOpacity="0.6" strokeLinecap="round" />
        <path d="M25 50 Q15 42 10 35" stroke={color} strokeWidth="1.5" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
        <path d="M25 45 Q35 37 40 30" stroke={color} strokeWidth="1.5" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
        <circle cx="25" cy="32" r="5" fill={color} opacity="0.80" />
        <circle cx="9"  cy="32" r="4" fill={color} opacity="0.70" />
        <circle cx="41" cy="27" r="4" fill={color} opacity="0.70" />
        <circle cx="16" cy="20" r="3.5" fill={color} opacity="0.65" />
        <circle cx="34" cy="16" r="3.5" fill={color} opacity="0.65" />
        <circle cx="25" cy="10" r="4" fill={color} opacity="0.75" />
      </svg>
    </div>
  );
}

/* Mini 4-petal clover — matches product frame shape, 12-24px scatter size */
function MiniClover({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  return (
    <div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }}>
      <svg viewBox="0 0 40 40" style={{ width: "100%", height: "100%" }} overflow="visible">
        <path d="M31.5 8.5 A12 12 0 0 1 31.5 31.5 A12 12 0 0 1 8.5 31.5 A12 12 0 0 1 8.5 8.5 A12 12 0 0 1 31.5 8.5 Z"
          fill={color} opacity="0.88" />
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

/* convert hex + alpha → rgba for tinted backgrounds */
function hexFaint(hex: string, a = 0.14): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ════════════════════════ MAIN COMPONENT ══════════════════════════ */

export default function ShopClient({ lang, dictionary, products }: ShopClientProps) {
  const copy = getLandingCopy(lang);
  const router = useRouter();
  const sp = useSearchParams();
  const isKa = lang === "ka";
  const [pageSize, setPageSize] = useState(8);

  const catParam: CategoryValue = CAT_ALIASES[sp.get("category") ?? "all"] ?? "all";
  const sortParam = (sp.get("sort") as SortValue) ?? "featured";

  const setParam = (key: string, val: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (val && val !== "all") p.set(key, val); else p.delete(key);
    if (key === "category") setPageSize(8);
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
      <div className="flex" style={{ background: C.cream, position: "relative" }}>

        {/* Botanical decorations — full-width layer over content area */}
        <div
          aria-hidden="true"
          className="absolute hidden md:block pointer-events-none overflow-hidden"
          style={{ top: 0, bottom: 0, left: 210, right: 0, zIndex: 0 }}
        >
          {/* ── Left column — big anchors ── */}
          <Daisy        color={C.rose}      size={68} style={{ left: "3%",  top: "4%",  transform: "rotate(-12deg)", opacity: 0.70 }} />
          <TulipStem    color={C.lavender}  size={50} style={{ left: "28%", top: "10%", transform: "rotate(-8deg)",  opacity: 0.62 }} />
          <SmallBerries color={C.rose}      size={46} style={{ left: "38%", top: "25%", transform: "rotate(-18deg)", opacity: 0.64 }} />
          <Daisy        color={C.champagne} size={54} style={{ left: "6%",  top: "52%", transform: "rotate(7deg)",   opacity: 0.66 }} />
          <TulipStem    color={C.sage}      size={44} style={{ left: "5%",  top: "71%", transform: "rotate(20deg)",  opacity: 0.64 }} />
          <SmallBerries color={C.lavender}  size={40} style={{ left: "12%", top: "87%", transform: "rotate(10deg)",  opacity: 0.60 }} />
          {/* ── Left column — tiny fills ── */}
          <SmallLeaf    color={C.sage}      size={26} style={{ left: "8%",  top: "16%", transform: "rotate(25deg)",  opacity: 0.65 }} />
          <MiniClover   color={C.rose}      size={20} style={{ left: "16%", top: "22%", transform: "rotate(-30deg)", opacity: 0.68 }} />
          <Sparkle      color={C.mustard}   size={24} style={{ left: "21%", top: "30%", transform: "rotate(10deg)",  opacity: 0.68 }} />
          <MiniClover   color={C.lavender}  size={16} style={{ left: "33%", top: "36%", transform: "rotate(14deg)",  opacity: 0.65 }} />
          <SmallLeaf    color={C.green}     size={28} style={{ left: "31%", top: "48%", transform: "rotate(-30deg)", opacity: 0.62 }} />
          <MiniClover   color={C.mustard}   size={18} style={{ left: "14%", top: "62%", transform: "rotate(22deg)",  opacity: 0.65 }} />
          <Sparkle      color={C.blue}      size={20} style={{ left: "25%", top: "67%", transform: "rotate(-14deg)", opacity: 0.64 }} />
          <MiniClover   color={C.sage}      size={14} style={{ left: "6%",  top: "79%", transform: "rotate(-8deg)",  opacity: 0.62 }} />
          <SmallLeaf    color={C.champagne} size={22} style={{ left: "36%", top: "83%", transform: "rotate(18deg)",  opacity: 0.58 }} />
          <MiniClover   color={C.rose}      size={16} style={{ left: "20%", top: "92%", transform: "rotate(-22deg)", opacity: 0.60 }} />
          {/* ── Center gutter ── */}
          <Sparkle      color={C.mustard}   size={26} style={{ left: "calc(50% - 13px)", top: "6%",  transform: "rotate(15deg)", opacity: 0.74 }} />
          <MiniClover   color={C.rose}      size={18} style={{ left: "calc(50% - 9px)",  top: "14%", transform: "rotate(-8deg)", opacity: 0.70 }} />
          <Daisy        color={C.blue}      size={56} style={{ left: "calc(50% - 28px)", top: "22%", transform: "rotate(-8deg)", opacity: 0.70 }} />
          <MiniClover   color={C.lavender}  size={14} style={{ left: "calc(50% - 7px)",  top: "33%", transform: "rotate(20deg)", opacity: 0.68 }} />
          <SmallLeaf    color={C.lavender}  size={26} style={{ left: "calc(50% - 13px)", top: "40%", transform: "rotate(20deg)", opacity: 0.66 }} />
          <MiniClover   color={C.mustard}   size={20} style={{ left: "calc(50% - 10px)", top: "50%", transform: "rotate(-5deg)", opacity: 0.68 }} />
          <SmallBerries color={C.sage}      size={42} style={{ left: "calc(50% - 21px)", top: "58%", transform: "rotate(-6deg)", opacity: 0.66 }} />
          <MiniClover   color={C.rose}      size={16} style={{ left: "calc(50% - 8px)",  top: "70%", transform: "rotate(12deg)", opacity: 0.68 }} />
          <Daisy        color={C.rose}      size={58} style={{ left: "calc(50% - 29px)", top: "76%", transform: "rotate(14deg)", opacity: 0.70 }} />
          <MiniClover   color={C.green}     size={14} style={{ left: "calc(50% - 7px)",  top: "88%", transform: "rotate(-18deg)",opacity: 0.65 }} />
          {/* ── Right column — big anchors ── */}
          <TulipStem    color={C.sage}      size={48} style={{ right: "28%", top: "7%",  transform: "rotate(14deg)",  opacity: 0.64 }} />
          <SmallLeaf    color={C.rose}      size={34} style={{ right: "5%",  top: "16%", transform: "rotate(-22deg)", opacity: 0.64 }} />
          <Daisy        color={C.mustard}   size={62} style={{ right: "4%",  top: "44%", transform: "rotate(9deg)",   opacity: 0.68 }} />
          <SmallBerries color={C.champagne} size={44} style={{ right: "31%", top: "63%", transform: "rotate(28deg)",  opacity: 0.64 }} />
          <TulipStem    color={C.rose}      size={40} style={{ right: "20%", top: "83%", transform: "rotate(-24deg)", opacity: 0.62 }} />
          <Daisy        color={C.green}     size={50} style={{ right: "3%",  top: "90%", transform: "rotate(-17deg)", opacity: 0.64 }} />
          {/* ── Right column — tiny fills ── */}
          <MiniClover   color={C.lavender}  size={18} style={{ right: "18%", top: "3%",  transform: "rotate(10deg)",  opacity: 0.68 }} />
          <Sparkle      color={C.champagne} size={22} style={{ right: "38%", top: "17%", transform: "rotate(8deg)",   opacity: 0.65 }} />
          <MiniClover   color={C.rose}      size={16} style={{ right: "10%", top: "26%", transform: "rotate(-20deg)", opacity: 0.65 }} />
          <Sparkle      color={C.lavender}  size={24} style={{ right: "22%", top: "34%", transform: "rotate(-12deg)", opacity: 0.67 }} />
          <MiniClover   color={C.sage}      size={20} style={{ right: "40%", top: "41%", transform: "rotate(18deg)",  opacity: 0.65 }} />
          <SmallLeaf    color={C.mustard}   size={24} style={{ right: "16%", top: "54%", transform: "rotate(18deg)",  opacity: 0.62 }} />
          <MiniClover   color={C.mustard}   size={14} style={{ right: "6%",  top: "60%", transform: "rotate(-10deg)", opacity: 0.65 }} />
          <SmallLeaf    color={C.blue}      size={26} style={{ right: "8%",  top: "77%", transform: "rotate(-10deg)", opacity: 0.60 }} />
          <MiniClover   color={C.champagne} size={18} style={{ right: "34%", top: "72%", transform: "rotate(15deg)",  opacity: 0.62 }} />
          <Sparkle      color={C.rose}      size={18} style={{ right: "26%", top: "95%", transform: "rotate(6deg)",   opacity: 0.60 }} />
        </div>

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
            zIndex: 10,
            background: C.cream,
          }}
        >
          {/* Category */}
          <div
            className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.26em]"
            style={{ fontFamily: FRAUNCES, color: C.champagne }}
          >
            {isKa ? "კატეგორია" : "Category"}
          </div>
          <div className="flex flex-col gap-2">
            {cats.map((cat) => {
              const active = catParam === cat.val;
              const col = CAT_COLORS[cat.val] ?? CAT_COLORS.all;
              return (
                <motion.button
                  key={cat.val}
                  onClick={() => setParam("category", cat.val)}
                  animate={{ y: active ? 3 : 0 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  className="px-3 py-2.5 text-left rounded-[12px] w-full flex items-center gap-2"
                  style={{
                    fontFamily: FRAUNCES,
                    fontStyle: "italic",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    background: col.bg,
                    color: col.text,
                    boxShadow: active
                      ? `0 1px 0 ${col.shadow}, inset 0 2px 5px rgba(0,0,0,0.14)`
                      : `0 4px 0 ${col.shadow}`,
                    whiteSpace: "nowrap",
                    border: "none",
                    cursor: "pointer",
                    outline: active ? `2px solid rgba(255,255,255,0.35)` : "none",
                    outlineOffset: -2,
                  }}
                >
                  <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>
                    {CAT_BOTANICAL[cat.val]}
                  </span>
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
                  {CAT_BOTANICAL[cat.val]} {cat.label}
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
              {/* Editorial 2-column scatter */}
              <div className="flex flex-col md:flex-row md:gap-10 lg:gap-14 gap-16">
                {/* Left column */}
                <div className="flex-1 flex flex-col gap-20 md:gap-28">
                  {visible.slice(0, pageSize).filter((_, i) => i % 2 === 0).map((p, i) => (
                    <ShopCard key={p.id} product={p} index={i * 2} lang={lang} isKa={isKa} copy={copy} />
                  ))}
                </div>
                {/* Right column — shifted down */}
                <div className="flex-1 flex flex-col gap-20 md:gap-28 md:pt-36 lg:pt-44">
                  {visible.slice(0, pageSize).filter((_, i) => i % 2 === 1).map((p, i) => (
                    <ShopCard key={p.id} product={p} index={i * 2 + 1} lang={lang} isKa={isKa} copy={copy} />
                  ))}
                </div>
              </div>

              {/* Load more */}
              {visible.length > pageSize && (
                <div className="flex justify-center mt-16 mb-4">
                  <motion.button
                    onClick={() => setPageSize(n => n + 8)}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 px-10 py-4 font-extrabold text-[11px] uppercase tracking-[0.22em] rounded-full"
                    style={{
                      fontFamily: FRAUNCES,
                      background: C.cream,
                      color: C.ink,
                      border: `2px solid ${C.champagne}`,
                      boxShadow: `0 5px 0 rgba(201,168,108,0.35)`,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>❀</span>
                    {isKa ? "მეტის ჩვენება" : "Show more"}
                    <span style={{ fontSize: 16 }}>❀</span>
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════ SHOP CARD ════════════════════════════════ */

/* per-product photo position, persisted in localStorage */
type PhotoPos = { x: number; y: number; scale: number };
const DEFAULT_POS: PhotoPos = { x: 0, y: 0, scale: 1 };

function loadPos(id: string): PhotoPos {
  if (typeof window === "undefined") return DEFAULT_POS;
  try { const s = localStorage.getItem(`tissu-pos-${id}`); return s ? JSON.parse(s) : DEFAULT_POS; }
  catch { return DEFAULT_POS; }
}

function ShopCard({ product, index, lang, isKa, copy }: {
  product: StorefrontProduct; index: number; lang: Locale; isKa: boolean;
  copy: ReturnType<typeof getLandingCopy>;
}) {
  const [hover, setHover]     = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedPos, setSavedPos] = useState<PhotoPos>(DEFAULT_POS);
  const [tempPos, setTempPos]   = useState<PhotoPos>(DEFAULT_POS);
  const svgRef  = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const dragDivRef = useRef<HTMLDivElement>(null);

  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  /* load saved position after mount */
  useEffect(() => {
    const p = loadPos(product.id);
    setSavedPos(p);
    setTempPos(p);
  }, [product.id]);

  /* non-passive wheel handler for zoom (passive:false needed to preventDefault) */
  useEffect(() => {
    if (!editing || !dragDivRef.current) return;
    const el = dragDivRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTempPos(p => ({ ...p, scale: Math.max(0.5, Math.min(4, p.scale - e.deltaY * 0.002)) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [editing]);

  const svgRatio = () => {
    if (!svgRef.current) return 1;
    const w = svgRef.current.getBoundingClientRect().width;
    return w > 0 ? 400 / w : 1;
  };

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const ratio = svgRatio();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: tempPos.x, py: tempPos.y };
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setTempPos(p => ({
        ...p,
        x: dragRef.current!.px + (ev.clientX - dragRef.current!.sx) * ratio,
        y: dragRef.current!.py + (ev.clientY - dragRef.current!.sy) * ratio,
      }));
    };
    const up = () => { dragRef.current = null; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const openEditor = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setTempPos(savedPos);
    setEditing(true);
  };

  const saveEdit = () => {
    setSavedPos(tempPos);
    try { localStorage.setItem(`tissu-pos-${product.id}`, JSON.stringify(tempPos)); } catch {}
    setEditing(false);
  };

  const cancelEdit = () => { setTempPos(savedPos); setEditing(false); };

  const frame  = FRAMES[index % FRAMES.length];
  const clipId = `sc-${product.id}`;
  const path   = useMemo(() => frame.path(), [frame]);

  const hasBack  = Boolean(product.image_back);
  const isOnSale = Boolean(product.original_price && product.original_price > product.price);
  const name     = product.name || product.code;
  const inStock  = product.in_stock;

  /* SVG transform: scale from center (200,200) then offset */
  const activePos = editing ? tempPos : savedPos;
  const imgTransform = `translate(${200 + activePos.x} ${200 + activePos.y}) scale(${activePos.scale}) translate(-200 -200)`;

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
      <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
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
          ref={svgRef}
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.14))", overflow: "visible", zIndex: 0 }}
        >
          <defs><clipPath id={clipId}><path d={path} /></clipPath></defs>

          <image
            href={product.image_front}
            x="0" y="0" width="400" height="400"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
            transform={imgTransform}
            style={{ filter: "saturate(0.95) sepia(0.02)", opacity: hover && hasBack ? 0 : 1, transition: "opacity 0.5s ease" }}
          />
          {hasBack && (
            <image
              href={product.image_back!}
              x="0" y="0" width="400" height="400"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
              transform={imgTransform}
              style={{ filter: "saturate(0.95) sepia(0.02)", opacity: hover ? 1 : 0, transition: "opacity 0.5s ease" }}
            />
          )}
          <path d={path} fill="none" stroke={frame.color} strokeWidth="7" strokeLinejoin="round" />
        </svg>

        {/* Transparent link overlay — navigates to product; disabled while editing */}
        <Link
          href={`/${lang}/product/${product.id}`}
          className="absolute inset-0 block"
          aria-label={name}
          style={{ zIndex: 1, pointerEvents: editing ? "none" : "auto" }}
        />

        {/* Drag capture div — only rendered while editing */}
        {editing && (
          <div
            ref={dragDivRef}
            className="absolute inset-0"
            style={{ zIndex: 2, cursor: "grab", touchAction: "none", userSelect: "none" }}
            onMouseDown={startDrag}
          />
        )}

        {/* Pencil edit button — appears on hover */}
        <button
          onClick={openEditor}
          aria-label={isKa ? "ფოტოს პოზიციის შეცვლა" : "Adjust photo position"}
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 3,
            opacity: hover && !editing ? 1 : 0,
            pointerEvents: hover && !editing ? "auto" : "none",
            transition: "opacity 0.2s",
            background: "rgba(255,255,255,0.88)",
            border: "none",
            borderRadius: "50%",
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            fontSize: 15,
            boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
          }}
        >
          ✎
        </button>

        {/* Editing toolbar — zoom in/out, save, cancel */}
        {editing && (
          <div
            style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              zIndex: 4,
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 999,
              padding: "7px 14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              whiteSpace: "nowrap",
            }}
          >
            <button
              onClick={() => setTempPos(p => ({ ...p, scale: Math.min(4, p.scale + 0.15) }))}
              style={{ width: 28, height: 28, borderRadius: "50%", background: C.cream, border: `1px solid ${C.champagne}`, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}
            >＋</button>
            <button
              onClick={() => setTempPos(p => ({ ...p, scale: Math.max(0.5, p.scale - 0.15) }))}
              style={{ width: 28, height: 28, borderRadius: "50%", background: C.cream, border: `1px solid ${C.champagne}`, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}
            >－</button>
            <button
              onClick={saveEdit}
              style={{ paddingInline: 12, height: 28, borderRadius: 999, background: C.sage, border: "none", color: C.cream, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: FRAUNCES, letterSpacing: "0.04em" }}
            >
              {isKa ? "შენახვა" : "Save"}
            </button>
            <button
              onClick={cancelEdit}
              style={{ paddingInline: 10, height: 28, borderRadius: 999, background: "transparent", border: `1px solid ${C.champagne}`, color: C.ink, cursor: "pointer", fontSize: 11, fontFamily: FRAUNCES }}
            >
              {isKa ? "გაუქმება" : "Cancel"}
            </button>
          </div>
        )}
      </div>

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
