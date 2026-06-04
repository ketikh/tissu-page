"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct, StorefrontCategory } from "@/lib/admin-api";
import { getLandingCopy } from "@/app/[lang]/landingCopy";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { buildPhotoTransform, buildBackPhotoTransform } from "@/lib/shop-photo-positions";
import { cloudinaryCutout } from "@/lib/cloudinary";

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

/* ── Scalloped hero bottom — varied, asymmetric soft bumps ────────── */
const SCALLOP_VB_H = 150;
const SCALLOP_PATH = (() => {
  /* width = how wide the bump is; peakY = how far up it reaches (smaller = taller);
     apexShift = horizontal offset of the apex from centre (negative = left-leaning).
     Sum of widths must equal 1440. */
  const bumps = [
    { w: 230, peakY: 50, apexShift: -18 },
    { w: 130, peakY: 78, apexShift:  10 },
    { w: 210, peakY: 56, apexShift:  -6 },
    { w: 160, peakY: 70, apexShift:  14 },
    { w: 250, peakY: 46, apexShift: -22 },
    { w: 140, peakY: 82, apexShift:   8 },
    { w: 180, peakY: 54, apexShift: -10 },
    { w: 140, peakY: 74, apexShift:   4 },
  ];
  const baseY = 100;
  let d = `M 0 ${SCALLOP_VB_H} L 0 ${baseY}`;
  let x = 0;
  for (const b of bumps) {
    const apexX = Math.round(x + b.w / 2 + b.apexShift);
    const endX = x + b.w;
    d += ` Q ${apexX} ${b.peakY} ${endX} ${baseY}`;
    x = endX;
  }
  d += ` L 1440 ${SCALLOP_VB_H} Z`;
  return d;
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

// Per request — every product card uses the same rounded-rectangle frame.
// We only rotate the rim colour so the grid still reads as a colourful zine.
const FRAMES: Frame[] = [
  { path: () => roundedRect(340, 340, 200, 200, 56), color: C.rose },
  { path: () => roundedRect(340, 340, 200, 200, 56), color: C.green },
  { path: () => roundedRect(340, 340, 200, 200, 56), color: C.mustard },
  { path: () => roundedRect(340, 340, 200, 200, 56), color: C.blue },
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

/* ── Botanical float animation — deterministic from color+size ───── */
function botanicalAnim(color: string, size: number) {
  const h = (color.charCodeAt(1) + color.charCodeAt(2) + size) % 21;
  const dur = 2.8 + (h % 6) * 0.45;
  const delay = (h % 8) * 0.3;
  const amp = h % 2 === 0 ? -(4 + (h % 5)) : (3 + (h % 4));
  return {
    animate: { y: [0, amp, 0] as number[] },
    transition: { duration: dur, repeat: Infinity, ease: "easeInOut" as const, delay },
  };
}

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
  const { animate, transition } = botanicalAnim(color, size);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
        <g transform="translate(40,40)">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-18" rx="7" ry="14"
              fill={color} opacity="0.88" transform={`rotate(${45 * i})`} />
          ))}
          <circle r="9" fill={C.mustard} />
        </g>
      </svg>
    </motion.div>
  );
}

function TulipStem({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const h = Math.round(size * 2.4);
  const { animate, transition } = botanicalAnim(color, size + 1);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: h, ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 60 140" style={{ width: "100%", height: "100%" }}>
        <path d="M30 130 C27 100 33 75 28 50 C23 28 30 10 30 10"
          fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
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
        <circle cx="16" cy="20" r="3.5" fill={color} opacity="0.65" />
        <circle cx="34" cy="16" r="3.5" fill={color} opacity="0.65" />
        <circle cx="25" cy="10" r="4" fill={color} opacity="0.75" />
      </svg>
    </motion.div>
  );
}

/* Mini 4-petal clover — matches product frame shape, 12-24px scatter size */
function MiniClover({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 5);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 40 40" style={{ width: "100%", height: "100%" }} overflow="visible">
        <path d="M31.5 8.5 A12 12 0 0 1 31.5 31.5 A12 12 0 0 1 8.5 31.5 A12 12 0 0 1 8.5 8.5 A12 12 0 0 1 31.5 8.5 Z"
          fill={color} opacity="0.88" />
      </svg>
    </motion.div>
  );
}

/* ── Types ───────────────────────────────────────────────────────── */
interface ShopClientProps {
  lang: Locale;
  dictionary: any;
  products: StorefrontProduct[];
  photoPositions?: import("@/lib/shop-photo-positions").PhotoPositions;
  categories?: import("@/lib/storefront-categories").StorefrontCategoryEntry[];
}
type CategoryValue = "all" | StorefrontCategory;
type SortValue     = "featured" | "new" | "price-low" | "price-high";

const CAT_ALIASES: Record<string, CategoryValue> = {
  all: "all", pouches: "pouch", pouch: "pouch",
  "laptop-sleeves": "laptop", laptop: "laptop",
  totes: "tote", tote: "bag",  // legacy URLs that used tote map to the agent's bag slug
  bag: "bag", bags: "bag",
  "kids-backpacks": "kidsbackpack", kidsbackpack: "kidsbackpack",
  kidsbag: "kidsbag",
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

export default function ShopClient({ lang, dictionary, products, photoPositions = {}, categories = [] }: ShopClientProps) {
  const copy = getLandingCopy(lang);
  const router = useRouter();
  const sp = useSearchParams();
  const isKa = lang === "ka";
  // Show the whole catalogue by default — the bag count is small, and a
  // hidden second page was masking sold-out items.
  const [pageSize, setPageSize] = useState(100);
  // "scatter" = editorial 2-col offset layout, "grid" = compact 4-col grid (default).
  const [gridMode, setGridMode] = useState<"scatter" | "grid">("grid");

  // Treat unknown / custom categories from the agent as the raw URL value
  // so the matching filter pill still works.
  const rawCat = sp.get("category") ?? "all";
  const catParam: CategoryValue = CAT_ALIASES[rawCat] ?? (rawCat as CategoryValue);
  const sortParam = (sp.get("sort") as SortValue) ?? "featured";
  // Model sub-filter — only shown for the bags / laptop-bags category since
  // that's where "ფხრიწიანი" / "თასმიანი" actually applies.
  const modelParam = sp.get("model") ?? "all";

  const setParam = (key: string, val: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (val && val !== "all") p.set(key, val); else p.delete(key);
    if (key === "category") {
      setPageSize(100);
      // Switching the top-level category resets the model sub-filter so
      // we don't carry a stale "ფხრიწიანი" into a category that doesn't
      // have that model at all.
      p.delete("model");
    }
    router.push(`?${p.toString()}`, { scroll: false });
  };

  const visible = useMemo(() => {
    let r = products.filter((p) => Boolean(p.image_front));
    if (catParam !== "all") r = r.filter((p) => p.category === catParam);
    if (modelParam !== "all") r = r.filter((p) => (p.model || "").trim() === modelParam);
    if (sortParam === "price-low") r.sort((a, b) => a.price - b.price);
    else if (sortParam === "price-high") r.sort((a, b) => b.price - a.price);
    else if (sortParam === "new") r.sort((a, b) => (b.tags.includes("new") ? 1 : 0) - (a.tags.includes("new") ? 1 : 0));
    return r;
  }, [products, catParam, modelParam, sortParam]);

  // The agent stores `model` as a free-text field — collect the unique values
  // present in the bags category so each one becomes its own filter pill.
  const bagModels = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category === "bag") {
        const m = (p.model || "").trim();
        if (m) set.add(m);
      }
    }
    return Array.from(set).sort();
  }, [products]);
  const showModelFilter = catParam === "bag" && bagModels.length > 1;

  // Build category filter pills from the agent's `/storefront/categories`
  // endpoint (the agent owns the localised labels + emoji + ordering). Any
  // product whose category isn't yet in that list gets a stub pill with its
  // raw slug, so nothing disappears while the admin is still naming things.
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const presentCategorySlugs = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  );
  // Start with categories the agent told us about (in their sort order),
  // then append any extras seen on products but missing from the agent list.
  const orderedSlugs = [
    ...categories.filter((c) => presentCategorySlugs.includes(c.slug)).map((c) => c.slug),
    ...presentCategorySlugs.filter((slug) => !categoryBySlug.has(slug)).sort(),
  ];

  const cats: Array<{ label: string; emoji?: string; val: CategoryValue }> = [
    { label: copy.shop.filters.all, val: "all" },
    ...orderedSlugs.map((slug) => {
      const cat = categoryBySlug.get(slug);
      const label = cat
        ? (lang === "ka" ? cat.name_ka : cat.name_en) || slug
        : slug;
      return { label, emoji: cat?.emoji, val: slug as CategoryValue };
    }),
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

        <div className="absolute bottom-0 left-0 w-full" style={{ height: 140, lineHeight: 0 }}>
          <svg viewBox={`0 0 1440 ${SCALLOP_VB_H}`} preserveAspectRatio="none" className="w-full h-full block">
            <path d={SCALLOP_PATH} fill={C.cream} />
          </svg>
        </div>
      </section>

      {/* ── Content ── */}
      <div style={{ background: C.cream, position: "relative" }}>

        {/* Botanical decorations — full-width layer */}
        <div
          aria-hidden="true"
          className="absolute hidden md:block pointer-events-none overflow-hidden"
          style={{ top: 0, bottom: 0, left: 0, right: 0, zIndex: 0 }}
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

        {/* ── PRODUCT GRID ── */}
        <main className="px-6 md:px-14 lg:px-20 pt-0 pb-24">

          {/* ── Filter + Sort bar (clean, non-sticky) ── */}
          <div className="py-6 mb-2 flex flex-col gap-3">
            {/* Row 1 — category pills only, full width so they wrap cleanly */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex flex-wrap gap-2.5 gap-y-3 flex-1 min-w-0" style={{ paddingBottom: 4 }}>
                {cats.map((cat) => {
                  const active = catParam === cat.val;
                  const col = CAT_COLORS[cat.val] ?? CAT_COLORS.all;
                  const restingShadow = active
                    ? `0 1px 0 ${col.shadow}`
                    : `0 4px 0 rgba(42,29,20,0.14)`;
                  const pressedShadow = `0 0 0 ${col.shadow}`;
                  return (
                    <motion.button
                      key={cat.val}
                      onClick={() => setParam("category", cat.val)}
                      animate={{ y: active ? 3 : 0 }}
                      whileHover={{ y: active ? 3 : -1 }}
                      whileTap={{ y: 4, boxShadow: pressedShadow }}
                      transition={{ duration: 0.14 }}
                      style={{
                        fontFamily: FRAUNCES,
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: "0.02em",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 18px",
                        borderRadius: 999,
                        background: active ? col.bg : "white",
                        color: active ? col.text : C.ink,
                        border: active
                          ? `1.5px solid ${col.bg}`
                          : `1.5px solid rgba(42,29,20,0.14)`,
                        boxShadow: restingShadow,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.18s ease, border-color 0.18s ease, color 0.18s ease",
                      }}
                    >
                      <span style={{ fontSize: 13, opacity: active ? 1 : 0.7 }}>{cat.emoji ?? CAT_BOTANICAL[cat.val] ?? "✦"}</span>
                      {cat.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Row 1b — model sub-filter (only on the bags / laptop-bags tab) */}
            {showModelFilter && (
              <div className="flex flex-wrap items-center gap-2.5">
                <span style={{
                  fontFamily: FRAUNCES, fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: C.ink, opacity: 0.6, marginRight: 4,
                }}>
                  {isKa ? "მოდელი" : "Model"}
                </span>
                <ModelChip
                  active={modelParam === "all"}
                  onClick={() => setParam("model", null)}
                >
                  {isKa ? "ყველა" : "All"}
                </ModelChip>
                {bagModels.map((m) => (
                  <ModelChip
                    key={m}
                    active={modelParam === m}
                    onClick={() => setParam("model", m)}
                  >
                    {m}
                  </ModelChip>
                ))}
              </div>
            )}

            {/* Row 2 — grid toggle + sort, on their own line below the pills */}
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
              {/* Grid mode toggle — 2-col editorial vs 4-col compact */}
              <div style={{
                display: "inline-flex",
                background: "white",
                border: `1.5px solid rgba(42,29,20,0.14)`,
                borderRadius: 999,
                padding: 3,
                flexShrink: 0,
              }}>
                {([
                  { val: "scatter", label: isKa ? "2" : "2" },
                  { val: "grid",    label: isKa ? "4" : "4" },
                ] as const).map(({ val, label }) => {
                  const active = gridMode === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setGridMode(val)}
                      aria-label={`${label} columns`}
                      style={{
                        fontFamily: FRAUNCES,
                        fontWeight: 700,
                        fontSize: 12,
                        background: active ? C.ink : "transparent",
                        color: active ? C.cream : C.ink,
                        border: "none",
                        borderRadius: 999,
                        padding: "6px 14px",
                        cursor: "pointer",
                        transition: "background 0.18s ease, color 0.18s ease",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Sort dropdown */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <select
                  value={sortParam}
                  onChange={(e) => setParam("sort", e.target.value)}
                  style={{
                    fontFamily: FRAUNCES,
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: "0.04em",
                    color: C.ink,
                    background: "transparent",
                    border: `1.5px solid rgba(42,29,20,0.14)`,
                    borderRadius: 999,
                    padding: "9px 36px 9px 16px",
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                    outline: "none",
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.val} value={opt.val}>
                      {isKa ? opt.ka : opt.en}
                    </option>
                  ))}
                </select>
                <span style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  pointerEvents: "none", fontSize: 9, color: C.ink, opacity: 0.55,
                }}>▼</span>
              </div>
            </div>
          </div>

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
              {gridMode === "scatter" ? (
                /* Editorial 2-column scatter */
                <div className="flex flex-col md:flex-row md:gap-10 lg:gap-14 gap-16">
                  {/* Left column */}
                  <div className="flex-1 flex flex-col gap-20 md:gap-28">
                    {visible.slice(0, pageSize).filter((_, i) => i % 2 === 0).map((p, i) => (
                      <ShopCard key={p.id} product={p} index={i * 2} lang={lang} isKa={isKa} copy={copy} position={photoPositions[p.id]} />
                    ))}
                  </div>
                  {/* Right column — shifted down */}
                  <div className="flex-1 flex flex-col gap-20 md:gap-28 md:pt-36 lg:pt-44">
                    {visible.slice(0, pageSize).filter((_, i) => i % 2 === 1).map((p, i) => (
                      <ShopCard key={p.id} product={p} index={i * 2 + 1} lang={lang} isKa={isKa} copy={copy} position={photoPositions[p.id]} />
                    ))}
                  </div>
                </div>
              ) : (
                /* Compact 4-column grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-y-14">
                  {visible.slice(0, pageSize).map((p, i) => (
                    <ShopCard key={p.id} product={p} index={i} lang={lang} isKa={isKa} copy={copy} position={photoPositions[p.id]} />
                  ))}
                </div>
              )}

              {/* Load more */}
              {visible.length > pageSize && (
                <div className="flex justify-center mt-16 mb-4">
                  <motion.button
                    onClick={() => setPageSize(visible.length)}
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

function ModelChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: FRAUNCES, fontWeight: 600, fontSize: 12,
        padding: "7px 14px",
        borderRadius: 999,
        background: active ? C.ink : "white",
        color: active ? C.cream : C.ink,
        border: `1.5px solid ${active ? C.ink : "rgba(42,29,20,0.14)"}`,
        cursor: "pointer",
        transition: "background 0.18s, color 0.18s",
      }}
    >
      {children}
    </button>
  );
}

function ShopCard({ product, index, lang, isKa, copy, position }: {
  product: StorefrontProduct; index: number; lang: Locale; isKa: boolean;
  copy: ReturnType<typeof getLandingCopy>;
  position?: import("@/lib/shop-photo-positions").PhotoPosition;
}) {
  const [hover, setHover] = useState(false);
  // Cloudinary's background-removal addon fails on some photos with a 400.
  // We optimistically request the cutout version and fall back to the
  // original image if it doesn't load.
  const [frontCutoutFailed, setFrontCutoutFailed] = useState(false);
  const [backCutoutFailed,  setBackCutoutFailed]  = useState(false);
  const frontSrc = frontCutoutFailed ? product.image_front : cloudinaryCutout(product.image_front);
  const backSrc  = product.image_back
    ? (backCutoutFailed ? product.image_back : cloudinaryCutout(product.image_back))
    : "";

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
          category: product.category as any, featured: true, badges: [], tags: product.tags ?? [] } as any,
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
        {/* Tag-driven badges removed — the agent's admin panel is the
         *  source of truth and we don't add anything decorative on top. */}

        {/* Sold-out badge + diagonal stamp over the photo */}
        {!inStock && (
          <>
            <span
              className="absolute -top-2 right-3 z-10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em]"
              style={{
                background: C.ink, color: "white", fontFamily: FRAUNCES,
                transform: "rotate(6deg)", borderRadius: 999,
                boxShadow: "0 3px 0 rgba(0,0,0,0.35)",
              }}
            >
              {isKa ? "გაყიდულია" : "Sold out"}
            </span>
            <span
              aria-hidden="true"
              className="absolute z-10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.3em]"
              style={{
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%) rotate(-12deg)",
                background: "rgba(42,29,20,0.85)", color: C.cream,
                fontFamily: FRAUNCES,
                borderRadius: 6,
                boxShadow: "0 6px 14px rgba(0,0,0,0.30)",
                whiteSpace: "nowrap",
              }}
            >
              {isKa ? "გაყიდულია" : "Sold out"}
            </span>
          </>
        )}

        <svg
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{
            filter: inStock
              ? "drop-shadow(0 10px 22px rgba(0,0,0,0.14))"
              : "drop-shadow(0 10px 22px rgba(0,0,0,0.10)) saturate(0.4) opacity(0.85)",
            overflow: "visible",
          }}
        >
          <defs><clipPath id={clipId}><path d={path} /></clipPath></defs>

          {/* Everything photo-related (backdrop + image + hover image) is
           *  wrapped in a single clip group so a zoomed image can never
           *  escape the rounded frame. */}
          <g clipPath={`url(#${clipId})`}>
            {/* Soft coloured backdrop matching this card's frame. */}
            <rect x="0" y="0" width="400" height="400" fill={frame.color} fillOpacity="0.18" />

            {/* Front photo — `transform` applies the per-product position
             *  saved on /admin/photos. */}
            <image
              href={frontSrc}
              x="0" y="0" width="400" height="400"
              preserveAspectRatio="xMidYMin meet"
              transform={buildPhotoTransform(position)}
              onError={() => setFrontCutoutFailed(true)}
              style={{ filter: "saturate(0.95) sepia(0.02)", opacity: hover && hasBack ? 0 : 1, transition: "opacity 0.5s ease" }}
            />
            {hasBack && (
              <image
                href={backSrc}
                x="0" y="0" width="400" height="400"
                preserveAspectRatio="xMidYMin meet"
                transform={buildBackPhotoTransform(position)}
                onError={() => setBackCutoutFailed(true)}
                style={{ filter: "saturate(0.95) sepia(0.02)", opacity: hover ? 1 : 0, transition: "opacity 0.5s ease" }}
              />
            )}
          </g>
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
