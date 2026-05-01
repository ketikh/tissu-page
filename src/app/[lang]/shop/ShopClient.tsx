"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct, StorefrontCategory } from "@/lib/admin-api";
import { getLandingCopy } from "@/app/[lang]/landingCopy";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";

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
  champagne:   "#c9a86c",
  rose:        "#c4849a",
  lavender:    "#9e8abf",
  sage:        "#7aaa8a",
  green:       "#3f6f56",
  teal:        "#1e4d43",
};

/* ── Repeating flower tile background ───────────────────────────── */
const BG_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="68" height="68">` +
  `<g transform="translate(34,34)" opacity="0.32">` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(0)"/>` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(72)"/>` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(144)"/>` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(216)"/>` +
  `<ellipse cx="0" cy="-13" rx="5" ry="11" fill="#c9a86c" transform="rotate(288)"/>` +
  `<circle r="5" fill="#c9a86c"/>` +
  `</g></svg>`
)}")`;

/* ── Scalloped divider ───────────────────────────────────────────── */
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

function dripPath(
  bodyW: number, bodyH: number, drips: number,
  minDepth: number, maxDepth: number, cornerR: number,
  side: "top" | "bottom" | "left" | "right",
  cx = 200, cy = 200, seed = 0
): string {
  const halfW = bodyW / 2, halfH = bodyH / 2;
  const top = cy - halfH, left = cx - halfW, right = cx + halfW, bot = cy + halfH;
  const slot = ((side === "top" || side === "bottom") ? bodyW : bodyH) / drips;
  const r = Math.min(cornerR, halfW * 0.5, halfH * 0.5);
  const bulge = slot * 0.32;
  const dc = (eY: number, fX: number, tX: number, mX: number, apY: number, bl: number, hdY: number) => {
    let s = `C ${fX.toFixed(1)} ${hdY.toFixed(1)}, `;
    s += `${(mX + Math.sign(tX - fX) * -bl).toFixed(1)} ${apY.toFixed(1)}, ${mX.toFixed(1)} ${apY.toFixed(1)} `;
    s += `C ${(mX - Math.sign(tX - fX) * -bl).toFixed(1)} ${apY.toFixed(1)}, ${tX.toFixed(1)} ${hdY.toFixed(1)}, ${tX.toFixed(1)} ${eY.toFixed(1)} `;
    return s;
  };
  let d = "";
  if (side === "bottom") {
    d += `M ${(left+r).toFixed(1)} ${top.toFixed(1)} L ${(right-r).toFixed(1)} ${top.toFixed(1)} A ${r} ${r} 0 0 1 ${right.toFixed(1)} ${(top+r).toFixed(1)} L ${right.toFixed(1)} ${bot.toFixed(1)} `;
    for (let i = drips - 1; i >= 0; i--) {
      const dR = left+(i+1)*slot, dL = left+i*slot, dM = (dL+dR)/2;
      const dep = minDepth + seedNoise(i, seed) * (maxDepth - minDepth);
      d += dc(bot, dR, dL, dM, bot+dep, bulge, bot+dep*0.55);
    }
    d += `L ${left.toFixed(1)} ${(top+r).toFixed(1)} A ${r} ${r} 0 0 1 ${(left+r).toFixed(1)} ${top.toFixed(1)} Z`;
  } else if (side === "top") {
    d += `M ${left.toFixed(1)} ${top.toFixed(1)} `;
    for (let i = 0; i < drips; i++) {
      const dL = left+i*slot, dR = left+(i+1)*slot, dM = (dL+dR)/2;
      const dep = minDepth + seedNoise(i, seed) * (maxDepth - minDepth);
      d += dc(top, dL, dR, dM, top-dep, bulge, top-dep*0.55);
    }
    d += `L ${right.toFixed(1)} ${(bot-r).toFixed(1)} A ${r} ${r} 0 0 1 ${(right-r).toFixed(1)} ${bot.toFixed(1)} L ${(left+r).toFixed(1)} ${bot.toFixed(1)} A ${r} ${r} 0 0 1 ${left.toFixed(1)} ${(bot-r).toFixed(1)} Z`;
  } else if (side === "left") {
    d += `M ${left.toFixed(1)} ${top.toFixed(1)} L ${(right-r).toFixed(1)} ${top.toFixed(1)} A ${r} ${r} 0 0 1 ${right.toFixed(1)} ${(top+r).toFixed(1)} L ${right.toFixed(1)} ${(bot-r).toFixed(1)} A ${r} ${r} 0 0 1 ${(right-r).toFixed(1)} ${bot.toFixed(1)} L ${left.toFixed(1)} ${bot.toFixed(1)} `;
    for (let i = drips - 1; i >= 0; i--) {
      const dT = top+i*slot, dB = top+(i+1)*slot, dM = (dT+dB)/2;
      const dep = minDepth + seedNoise(i, seed) * (maxDepth - minDepth);
      const aX = left - dep, hdX = left - dep*0.55;
      d += `C ${hdX.toFixed(1)} ${dB.toFixed(1)}, ${aX.toFixed(1)} ${(dM+bulge).toFixed(1)}, ${aX.toFixed(1)} ${dM.toFixed(1)} C ${aX.toFixed(1)} ${(dM-bulge).toFixed(1)}, ${hdX.toFixed(1)} ${dT.toFixed(1)}, ${left.toFixed(1)} ${dT.toFixed(1)} `;
    }
    d += `Z`;
  } else {
    d += `M ${(left+r).toFixed(1)} ${top.toFixed(1)} L ${right.toFixed(1)} ${top.toFixed(1)} `;
    for (let i = 0; i < drips; i++) {
      const dT = top+i*slot, dB = top+(i+1)*slot, dM = (dT+dB)/2;
      const dep = minDepth + seedNoise(i, seed) * (maxDepth - minDepth);
      const aX = right + dep, hdX = right + dep*0.55;
      d += `C ${hdX.toFixed(1)} ${dT.toFixed(1)}, ${aX.toFixed(1)} ${(dM-bulge).toFixed(1)}, ${aX.toFixed(1)} ${dM.toFixed(1)} C ${aX.toFixed(1)} ${(dM+bulge).toFixed(1)}, ${hdX.toFixed(1)} ${dB.toFixed(1)}, ${right.toFixed(1)} ${dB.toFixed(1)} `;
    }
    d += `L ${(left+r).toFixed(1)} ${bot.toFixed(1)} A ${r} ${r} 0 0 1 ${left.toFixed(1)} ${(bot-r).toFixed(1)} L ${left.toFixed(1)} ${(top+r).toFixed(1)} A ${r} ${r} 0 0 1 ${(left+r).toFixed(1)} ${top.toFixed(1)} Z`;
  }
  return d;
}

function roundedRect(w: number, h: number, cx = 200, cy = 200, r = 10): string {
  const x = cx - w / 2, y = cy - h / 2;
  return `M ${x+r} ${y} h ${w-2*r} a ${r} ${r} 0 0 1 ${r} ${r} v ${h-2*r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w-2*r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h-2*r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
}

/* ── Frame definitions (varied shapes) ──────────────────────────── */
type OutlineFrame = { kind: "outline"; path: () => string; rotate: number; color: string };
type DripFrame    = { kind: "drip"; outerPath: () => string; innerPath: () => string; rotate: number; color: string };
type ShopFrame    = OutlineFrame | DripFrame;

const FRAMES: ShopFrame[] = [
  { kind: "outline", path: () => flower(8, 178, 62),                       rotate: -3, color: C.rose },
  { kind: "outline", path: () => blob(12, 178, 168, 0.13, 200, 200, 7),    rotate:  4, color: C.champagne },
  { kind: "outline", path: () => flower(6, 172, 72),                       rotate: -5, color: C.lavender },
  { kind: "drip",
    outerPath: () => dripPath(300, 250, 6, 14, 62, 22, "bottom", 200, 200, 9),
    innerPath: () => roundedRect(272, 222, 200, 200, 10),
    rotate: 2, color: C.sage },
  { kind: "outline", path: () => flower(14, 170, 32, 200, 200, 0.18),      rotate: -2, color: C.mustard },
  { kind: "outline", path: () => blob(10, 175, 175, 0.14, 200, 200, 31),   rotate:  5, color: C.rose },
  { kind: "drip",
    outerPath: () => dripPath(280, 250, 4, 18, 55, 22, "top", 200, 200, 23),
    innerPath: () => roundedRect(252, 222, 200, 200, 10),
    rotate: -4, color: C.champagne },
  { kind: "outline", path: () => blob(13, 180, 162, 0.12, 200, 200, 55),   rotate:  3, color: C.lavender },
];

/* ── Colorful sticker-style category filter pills ───────────────── */
const CAT_COLORS: Record<string, {
  bg: string; text: string; shadow: string;
  idleBg: string; idleBorder: string; idleText: string; rotate: string;
}> = {
  all:          { bg: C.rose,      text: C.cream, shadow: "#9c6078",      idleBg: "rgba(196,132,154,0.15)", idleBorder: C.rose,      idleText: "#9c6078",  rotate: "-1.5deg" },
  pouch:        { bg: C.burnt,     text: C.cream, shadow: "#a83c14",      idleBg: "rgba(213,104,38,0.15)",  idleBorder: C.burnt,     idleText: C.burnt,    rotate: "1deg" },
  laptop:       { bg: C.lavender,  text: C.cream, shadow: "#7060a0",      idleBg: "rgba(158,138,191,0.15)", idleBorder: C.lavender,  idleText: C.lavender, rotate: "-2deg" },
  tote:         { bg: C.sage,      text: C.cream, shadow: "#568868",      idleBg: "rgba(122,170,138,0.15)", idleBorder: C.sage,      idleText: "#3f6f56",  rotate: "1.5deg" },
  kidsbackpack: { bg: C.mustard,   text: C.ink,   shadow: C.mustardDeep,  idleBg: "rgba(243,182,43,0.15)",  idleBorder: C.mustard,   idleText: "#8a6200",  rotate: "-1deg" },
  apron:        { bg: C.green,     text: C.cream, shadow: "#1e3828",      idleBg: "rgba(63,111,86,0.15)",   idleBorder: C.green,     idleText: C.green,    rotate: "2deg" },
  necklace:     { bg: C.champagne, text: C.ink,   shadow: "#9a7840",      idleBg: "rgba(201,168,108,0.15)", idleBorder: C.champagne, idleText: "#8a5820",  rotate: "-0.5deg" },
};

const CAT_ICONS: Record<string, string> = {
  all: "✦", pouch: "👜", laptop: "💻", tote: "🛍️", kidsbackpack: "🎒", apron: "👩‍🍳", necklace: "📿",
};

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

/* ── Decorative floating flower ──────────────────────────────────── */
function FloatFlower({ color, size, petals = 5, style }: {
  color: string; size: number; petals?: number; style: React.CSSProperties;
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

/* ── Botanical decorations (daisy / leaf) ───────────────────────── */
function BotanicalEl({ type, color, size, style }: {
  type: "daisy" | "leaf"; color: string; size: number; style: React.CSSProperties;
}) {
  if (type === "daisy") {
    return (
      <div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <g transform="translate(50,50)">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} cx="0" cy="-24" rx="9" ry="20"
                fill={color} transform={`rotate(${45 * i})`} />
            ))}
            <circle r="12" fill={C.mustard} />
          </g>
        </svg>
      </div>
    );
  }
  return (
    <div className="pointer-events-none" style={{ position: "absolute", width: size, height: Math.round(size * 1.35), ...style }}>
      <svg viewBox="0 0 60 80" style={{ width: "100%", height: "100%" }}>
        <path d="M30 78 Q4 52 8 20 Q18 2 30 8 Q42 2 52 20 Q56 52 30 78Z" fill={color} />
        <line x1="30" y1="78" x2="30" y2="8" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <path d="M30 60 Q18 50 15 38" stroke="white" strokeWidth="1" fill="none" opacity="0.35" />
        <path d="M30 44 Q42 34 45 22" stroke="white" strokeWidth="1" fill="none" opacity="0.35" />
      </svg>
    </div>
  );
}

/* ════════════════════════ MAIN COMPONENT ══════════════════════════ */

export default function ShopClient({ lang, dictionary, products }: ShopClientProps) {
  const copy = getLandingCopy(lang);
  const router = useRouter();
  const sp = useSearchParams();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const isKa = lang === "ka";

  const catParam: CategoryValue = CAT_ALIASES[sp.get("category") ?? "all"] ?? "all";
  const sortParam = (sp.get("sort") as SortValue) ?? "featured";

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const currentSort = SORT_OPTIONS.find(o => o.val === sortParam) ?? SORT_OPTIONS[0];

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* ── Hero — rose bg + scalloped cream bottom ── */}
      <section className="relative overflow-hidden" style={{ background: C.rose, paddingBottom: 90 }}>
        <FloatFlower color={C.cream}   size={72} petals={5} style={{ left: "4%",   top: "14%",    opacity: 0.22, transform: "rotate(-14deg)" }} />
        <FloatFlower color={C.mustard} size={52} petals={5} style={{ right: "6%",  top: "20%",    opacity: 0.40, transform: "rotate(18deg)" }} />
        <FloatFlower color={C.cream}   size={38} petals={6} style={{ left: "22%",  bottom: "28%", opacity: 0.18, transform: "rotate(6deg)" }} />
        <FloatFlower color={C.mustard} size={30} petals={6} style={{ right: "20%", bottom: "32%", opacity: 0.35, transform: "rotate(-9deg)" }} />

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

      {/* ── Flower-patterned cream section ── */}
      <div style={{ backgroundImage: BG_PATTERN, backgroundSize: "68px 68px", backgroundRepeat: "repeat" }}>

        {/* ── Filter + sort bar ── */}
        <nav className="relative pt-10 pb-6 px-4" style={{ zIndex: 20 }}>

          {/* Colorful sticker-style pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {cats.map((cat) => {
              const active = catParam === cat.val;
              const col = CAT_COLORS[cat.val] ?? CAT_COLORS.all;
              return (
                <motion.button
                  key={cat.val}
                  onClick={() => setParam("category", cat.val)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: FRAUNCES,
                    borderRadius: 14,
                    background: active ? col.bg : col.idleBg,
                    color: active ? col.text : col.idleText,
                    border: `2px solid ${active ? col.bg : col.idleBorder}`,
                    boxShadow: active ? `0 4px 0 ${col.shadow}` : "none",
                    transform: `rotate(${col.rotate})`,
                    transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                  }}
                  whileTap={{ scale: 0.93 }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{CAT_ICONS[cat.val] ?? "•"}</span>
                  <span>{cat.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Custom sort — desktop only */}
          <div className="hidden md:flex justify-end items-center gap-2.5 mt-5 pr-1">
            <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.champagne }}>
              {isKa ? "დალაგება:" : "Sort by:"}
            </span>
            <div ref={sortRef} style={{ position: "relative", zIndex: 50 }}>
              <button
                type="button"
                onClick={() => setSortOpen(v => !v)}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[12px] uppercase tracking-[0.12em]"
                style={{
                  fontFamily: FRAUNCES,
                  background: sortOpen ? C.ink : C.beige,
                  color: sortOpen ? C.cream : C.ink,
                  border: `1.5px solid ${C.champagne}`,
                  borderRadius: 999,
                  boxShadow: `0 3px 0 ${C.champagne}`,
                  transition: "background 0.18s, color 0.18s",
                }}
              >
                {isKa ? currentSort.ka : currentSort.en}
                <motion.span animate={{ rotate: sortOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      minWidth: 160,
                      zIndex: 50,
                      background: C.cream,
                      border: `1.5px solid rgba(201,168,108,0.5)`,
                      borderRadius: 18,
                      boxShadow: `0 8px 28px rgba(42,29,20,0.13)`,
                      overflow: "hidden",
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const isActive = opt.val === sortParam;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => { setParam("sort", opt.val); setSortOpen(false); }}
                          className="w-full flex items-center justify-between px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-[#f5e3c2]"
                          style={{ fontFamily: FRAUNCES, color: isActive ? C.burnt : C.ink }}
                        >
                          {isKa ? opt.ka : opt.en}
                          {isActive && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* ── Product grid — editorial 2-col scatter ── */}
        <main className="container pb-24" style={{ position: "relative", zIndex: 10 }}>
          {visible.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-5">
              <span style={{ fontSize: 52, color: C.champagne }}>✦</span>
              <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 24, color: C.ink }}>
                {isKa ? "ამ ფილტრით ჩანთები ვერ მოიძებნა." : "Nothing matches those filters yet."}
              </p>
              <button
                onClick={() => setParam("category", "all")}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em]"
                style={{ fontFamily: FRAUNCES, fontWeight: 800, background: C.mustard, color: C.ink, boxShadow: `0 5px 0 ${C.mustardDeep}` }}
              >
                {isKa ? "ყველა" : "Clear filters"}
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Botanical gutter decorations — desktop only */}
              <div className="hidden md:block" aria-hidden="true">
                <BotanicalEl type="daisy"  color={C.rose}      size={54} style={{ left: "calc(50% - 27px)", top: "7%",  transform: "rotate(18deg)",  opacity: 0.68, zIndex: 5 }} />
                <BotanicalEl type="leaf"   color={C.sage}      size={42} style={{ left: "calc(50% - 21px)", top: "26%", transform: "rotate(-28deg)", opacity: 0.60, zIndex: 5 }} />
                <BotanicalEl type="daisy"  color={C.champagne} size={46} style={{ left: "calc(50% - 23px)", top: "47%", transform: "rotate(-10deg)", opacity: 0.62, zIndex: 5 }} />
                <BotanicalEl type="leaf"   color={C.lavender}  size={38} style={{ left: "calc(50% - 19px)", top: "68%", transform: "rotate(32deg)",  opacity: 0.58, zIndex: 5 }} />
                <BotanicalEl type="daisy"  color={C.mustard}   size={42} style={{ left: "calc(50% - 21px)", top: "87%", transform: "rotate(6deg)",   opacity: 0.55, zIndex: 5 }} />
              </div>

              {/* Two independent columns */}
              <div className="flex flex-col md:flex-row md:gap-12 lg:gap-20 gap-16">
                {/* Left column — even-indexed products */}
                <div className="flex-1 flex flex-col gap-20 md:gap-28">
                  {visible.filter((_, i) => i % 2 === 0).map((p, i) => (
                    <ShopCard key={p.id} product={p} index={i * 2} lang={lang} isKa={isKa} copy={copy} />
                  ))}
                </div>

                {/* Right column — odd-indexed, shifted down for scatter effect */}
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

/* ════════════════════════ SHOP CARD ═══════════════════════════════ */

function ShopCard({ product, index, lang, isKa, copy }: {
  product: StorefrontProduct; index: number; lang: Locale; isKa: boolean;
  copy: ReturnType<typeof getLandingCopy>;
}) {
  const [hover, setHover] = useState(false);
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const frame  = FRAMES[index % FRAMES.length];
  const clipId = `sc-${product.id}`;

  const { clipD, fillD, strokeD } = useMemo(() => {
    if (frame.kind === "drip") {
      return { clipD: frame.innerPath(), fillD: frame.outerPath(), strokeD: null };
    }
    const p = frame.path();
    return { clipD: p, fillD: null, strokeD: p };
  }, [frame]);

  const hasBack  = Boolean(product.image_back);
  const isOnSale = Boolean(product.original_price && product.original_price > product.price);
  const name     = product.name || product.code;
  const inStock  = product.in_stock;
  const tilt     = frame.rotate;

  const onBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      addItem(
        { id: product.id, slug: product.id, name: { en: name, ka: name }, subtitle: { en: "", ka: "" },
          description: { en: "", ka: "" }, price: product.price,
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
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.75, delay: (index % 3) * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex flex-col items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Organic photo frame */}
      <Link
        href={`/${lang}/product/${product.id}`}
        className="relative w-full cursor-pointer"
        style={{ aspectRatio: "1 / 1", transform: `rotate(${tilt}deg)`, transition: "transform 0.55s cubic-bezier(0.215,0.61,0.355,1)" }}
      >
        {product.tags.includes("new") && (
          <span
            className="absolute -top-2 right-3 z-10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em]"
            style={{ background: C.mustard, color: C.ink, fontFamily: FRAUNCES, transform: "rotate(8deg)", borderRadius: 999, boxShadow: `0 3px 0 ${C.mustardDeep}` }}
          >
            {isKa ? "ახალი" : "New"}
          </span>
        )}

        <svg
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.22))", overflow: "visible" }}
        >
          <defs><clipPath id={clipId}><path d={clipD} /></clipPath></defs>
          {fillD && <path d={fillD} fill={frame.color} />}
          <image
            href={product.image_front} x="0" y="0" width="400" height="400"
            preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`}
            style={{ filter: "saturate(0.95) sepia(0.02)", opacity: hover && hasBack ? 0 : 1, transition: "opacity 0.5s ease" }}
          />
          {hasBack && (
            <image
              href={product.image_back!} x="0" y="0" width="400" height="400"
              preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`}
              style={{ filter: "saturate(0.95) sepia(0.02)", opacity: hover ? 1 : 0, transition: "opacity 0.5s ease" }}
            />
          )}
          {strokeD && (
            <path d={strokeD} fill="none" stroke={frame.color} strokeWidth="8" strokeLinejoin="round" />
          )}
        </svg>
      </Link>

      {/* Product info card */}
      <div
        className="mt-3 w-full px-5 pt-4 pb-4"
        style={{
          background: C.beige,
          borderRadius: 22,
          borderTop: `3px solid ${frame.color}`,
          borderRight: `1.5px solid ${C.champagne}`,
          borderBottom: `1.5px solid ${C.champagne}`,
          borderLeft: `1.5px solid ${C.champagne}`,
          boxShadow: `0 5px 0 ${C.champagne}`,
          transform: `rotate(${tilt * -0.5}deg)`,
        }}
      >
        <Link
          href={`/${lang}/product/${product.id}`}
          className="hover:underline underline-offset-2 block leading-snug mb-1"
          style={{ fontFamily: isKa ? ALK_LIFE : FRAUNCES, fontStyle: isKa ? "normal" : "italic", fontWeight: 700, fontSize: "clamp(14px,1.4vw,18px)", color: C.ink }}
        >
          {name}
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span style={{ fontFamily: PACIFICO, fontSize: "clamp(18px,1.8vw,24px)", color: C.burnt, lineHeight: 1.1 }}>
            {product.price}{product.currency === "GEL" ? "₾" : ` ${product.currency}`}
          </span>
          {isOnSale && product.original_price && (
            <span style={{ fontFamily: FRAUNCES, fontSize: 12, color: C.champagne, textDecoration: "line-through" }}>
              {product.original_price}₾
            </span>
          )}
        </div>

        <button
          onClick={onBuy}
          disabled={!inStock}
          className="w-full font-extrabold text-[10px] uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            fontFamily: FRAUNCES, fontWeight: 800,
            background: inStock ? C.mustard : C.beige,
            color: C.ink, borderRadius: 999, padding: "9px 16px",
            boxShadow: inStock ? `0 4px 0 ${C.mustardDeep}` : "none",
            border: inStock ? "none" : `1.5px solid ${C.champagne}`,
          }}
        >
          {inStock ? (isKa ? "კალათაში →" : "Add to basket →") : (isKa ? "ამოიწურა" : "Sold out")}
        </button>
      </div>
    </motion.div>
  );
}
