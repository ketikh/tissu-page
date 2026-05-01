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
};

/* ── Scalloped divider — cream arc path ────────────────────────────── */
const SCALLOP_PATH = (() => {
  const n = 20, w = 1440, sw = w / n, H = 44;
  let d = `M 0 80 L 0 ${H}`;
  for (let i = 0; i < n; i++) {
    d += ` Q ${Math.round(i * sw + sw / 2)} 0 ${Math.round((i + 1) * sw)} ${H}`;
  }
  return d + ` L ${w} 80 Z`;
})();

/* ── Flower shape helper ─────────────────────────────────────────── */
function flower(bumps: number, baseR: number, bumpH: number, cx = 200, cy = 200): string {
  const step = (Math.PI * 2) / bumps;
  let d = "";
  for (let i = 0; i <= bumps; i++) {
    const a = i * step;
    const x = cx + baseR * Math.cos(a);
    const y = cy + baseR * Math.sin(a);
    if (i === 0) { d += `M ${x.toFixed(1)} ${y.toFixed(1)} `; }
    else {
      const midA = a - step / 2;
      d += `Q ${(cx + (baseR + bumpH) * Math.cos(midA)).toFixed(1)} ${(cy + (baseR + bumpH) * Math.sin(midA)).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  }
  return d + "Z";
}

/* ── 4 clean flower-outline frames ──────────────────────────────── */
const FRAMES = [
  { path: () => flower(6,  178, 68),  rotate: -3, color: C.rose },
  { path: () => flower(8,  176, 56),  rotate:  4, color: C.champagne },
  { path: () => flower(10, 174, 46),  rotate: -2, color: C.lavender },
  { path: () => flower(12, 172, 36),  rotate:  3, color: C.sage },
];

/* ── Category icons ──────────────────────────────────────────────── */
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

/* ── Animated background sparkles ────────────────────────────────── */
const SPARKLE_POSITIONS = [
  { x: "4%",  y: "6%",   size: 14, delay: 0 },
  { x: "16%", y: "3%",   size: 10, delay: 1.2 },
  { x: "34%", y: "5%",   size: 12, delay: 2.1 },
  { x: "58%", y: "2%",   size: 9,  delay: 0.7 },
  { x: "76%", y: "7%",   size: 13, delay: 1.8 },
  { x: "91%", y: "4%",   size: 11, delay: 0.3 },
  { x: "7%",  y: "38%",  size: 9,  delay: 2.5 },
  { x: "87%", y: "33%",  size: 12, delay: 1.5 },
  { x: "43%", y: "50%",  size: 10, delay: 3.2 },
  { x: "23%", y: "62%",  size: 11, delay: 0.9 },
  { x: "70%", y: "66%",  size: 9,  delay: 2.0 },
  { x: "53%", y: "78%",  size: 13, delay: 1.1 },
  { x: "11%", y: "82%",  size: 10, delay: 3.5 },
  { x: "82%", y: "88%",  size: 11, delay: 2.8 },
];

function FloatSparkle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y, fontSize: size, color: C.champagne, lineHeight: 1 }}
      animate={{ y: [0, -11, 0], opacity: [0.16, 0.36, 0.16] }}
      transition={{ duration: 5 + delay * 0.6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      ✦
    </motion.div>
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

      {/* ── Hero — rose + scalloped cream bottom ── */}
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

      {/* ── Sparkle + filter + grid wrapper ── */}
      <div className="relative overflow-hidden">

        {/* Floating sparkles in the cream area */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {SPARKLE_POSITIONS.map((s, i) => (
            <FloatSparkle key={i} {...s} />
          ))}
        </div>

        {/* ── Filter bar ── */}
        <nav className="relative z-10 pt-10 pb-6 px-4">

          {/* Unified pill container */}
          <div className="flex justify-center">
            <div
              className="inline-flex flex-wrap justify-center gap-1 p-1.5"
              style={{
                background: C.beige,
                border: `2px solid ${C.champagne}`,
                borderRadius: 999,
                boxShadow: `0 5px 0 ${C.champagne}`,
              }}
            >
              {cats.map((cat) => {
                const active = catParam === cat.val;
                return (
                  <motion.button
                    key={cat.val}
                    onClick={() => setParam("category", cat.val)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.13em]"
                    style={{
                      fontFamily: FRAUNCES,
                      borderRadius: 999,
                      background: active ? C.ink : "transparent",
                      color: active ? C.cream : C.ink,
                      boxShadow: active ? `0 3px 0 rgba(42,29,20,0.35)` : "none",
                      transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span style={{ fontSize: 13, lineHeight: 1 }}>{CAT_ICONS[cat.val] ?? "•"}</span>
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Custom sort — desktop only */}
          <div className="hidden md:flex justify-end items-center gap-2.5 mt-5 pr-1">
            <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.champagne }}>
              {isKa ? "დალაგება:" : "Sort by:"}
            </span>
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen(v => !v)}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[12px] uppercase tracking-[0.12em] transition-transform hover:-translate-y-0.5"
                style={{
                  fontFamily: FRAUNCES,
                  background: sortOpen ? C.ink : C.beige,
                  color: sortOpen ? C.cream : C.ink,
                  border: `1.5px solid ${C.champagne}`,
                  borderRadius: 999,
                  boxShadow: `0 3px 0 ${C.champagne}`,
                  transition: "background 0.18s ease, color 0.18s ease",
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
                    className="absolute right-0 top-full mt-2 min-w-[160px] z-30 overflow-hidden"
                    style={{
                      background: C.cream,
                      border: `1.5px solid rgba(201,168,108,0.5)`,
                      borderRadius: 18,
                      boxShadow: `0 8px 28px rgba(42,29,20,0.13)`,
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const active = opt.val === sortParam;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => { setParam("sort", opt.val); setSortOpen(false); }}
                          className="w-full flex items-center justify-between px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-[#f5e3c2]"
                          style={{ fontFamily: FRAUNCES, color: active ? C.burnt : C.ink }}
                        >
                          {isKa ? opt.ka : opt.en}
                          {active && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* ── Product grid ── */}
        <main className="container relative z-10 pb-24">
          {visible.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-5">
              <span style={{ fontSize: 52, color: C.champagne }}>✦</span>
              <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 24, color: C.ink }}>
                {isKa ? "ამ ფილტრით ჩანთები ვერ მოიძებნა." : "Nothing matches those filters yet."}
              </p>
              <button
                onClick={() => setParam("category", "all")}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5"
                style={{ fontFamily: FRAUNCES, fontWeight: 800, background: C.mustard, color: C.ink, boxShadow: `0 5px 0 ${C.mustardDeep}` }}
              >
                {isKa ? "ყველა" : "Clear filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
              {visible.map((p, i) => (
                <ShopCard key={p.id} product={p} index={i} lang={lang} isKa={isKa} copy={copy} />
              ))}
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
  const clipD  = useMemo(() => frame.path(), [frame]);

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
      {/* Flower photo frame */}
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
          <path d={clipD} fill="none" stroke={frame.color} strokeWidth="8" strokeLinejoin="round" />
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
          transform: `rotate(${tilt * -0.6}deg)`,
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
