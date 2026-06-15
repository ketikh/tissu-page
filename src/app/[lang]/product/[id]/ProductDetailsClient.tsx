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
import { cloudinaryCutout } from "@/lib/cloudinary";
import { useStoreHydration } from "@/store/useHydration";
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
  champagne:   "#c9a86c",
  rose:        "#c4849a",
  lavender:    "#9e8abf",
  sage:        "#7aaa8a",
  green:       "#3f6f56",
  peach:       "#e9a574",
  lilac:       "#b89bd9",
};

/* Soft melting drip bottom for hero — hero color "drips" down into white */
const DRIP_PATH = (() => {
  const w = 1440;
  const SVG_H = 120;
  const baseY = 22;
  const drips = [
    { cx:   95, hw: 70, depth: 78 },
    { cx:  290, hw: 78, depth: 58 },
    { cx:  500, hw: 90, depth: 96 },
    { cx:  710, hw: 70, depth: 64 },
    { cx:  920, hw: 92, depth: 90 },
    { cx: 1140, hw: 76, depth: 70 },
    { cx: 1350, hw: 82, depth: 102 },
  ];
  let d = `M 0 ${baseY}`;
  for (const dr of drips) {
    const lEdge = dr.cx - dr.hw;
    const rEdge = dr.cx + dr.hw;
    d += ` L ${lEdge - 18} ${baseY}`;
    // smooth blob: slope down to depth, rounded bottom, slope back up
    d += ` C ${lEdge + 6} ${baseY + 6}, ${lEdge + 14} ${dr.depth}, ${dr.cx} ${dr.depth}`;
    d += ` C ${rEdge - 14} ${dr.depth}, ${rEdge - 6} ${baseY + 6}, ${rEdge + 18} ${baseY}`;
  }
  d += ` L ${w} ${baseY} L ${w} ${SVG_H} L 0 ${SVG_H} Z`;
  return d;
})();

const CAT_COLORS: Record<string, { bg: string; text: string; shadow: string }> = {
  pouch:        { bg: C.burnt,     text: C.cream, shadow: "#a83c14" },
  laptop:       { bg: C.lavender,  text: C.cream, shadow: "#7060a0" },
  tote:         { bg: C.sage,      text: C.cream, shadow: "#568868" },
  kidsbackpack: { bg: C.mustard,   text: C.ink,   shadow: C.mustardDeep },
  apron:        { bg: C.green,     text: C.cream, shadow: "#1e3828" },
  necklace:     { bg: C.champagne, text: C.ink,   shadow: "#9a7840" },
};

/* Map of friendly color names admins may type in tags (e.g. `color:rose`). */
const NAMED_COLORS: Record<string, string> = {
  rose: C.rose, burnt: C.burnt, mustard: C.mustard, sage: C.sage,
  lavender: C.lavender, green: C.green, champagne: C.champagne,
  peach: C.peach, lilac: C.lilac, cream: C.cream, ink: C.ink,
};

/* Look for an admin-supplied colour override inside the product's tags array.
   Accepts `color:#abcdef`, `color:rose`, or a bare `#abcdef` tag. Returns the first hit. */
function colorFromTags(tags: string[]): string | null {
  for (const raw of tags) {
    const t = raw.trim();
    if (/^#[0-9a-f]{3,8}$/i.test(t)) return t;
    if (t.toLowerCase().startsWith("color:")) {
      const val = t.slice(6).trim();
      if (/^#[0-9a-f]{3,8}$/i.test(val)) return val;
      const named = NAMED_COLORS[val.toLowerCase()];
      if (named) return named;
    }
  }
  return null;
}

/* Pick readable text colour (cream on dark bg, ink on light bg) for any hex. */
function pickTextOn(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6 && h.length !== 3) return C.cream;
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.65 ? C.ink : C.cream;
}

/* ── Drip path helpers (mirrored from RetroProducts) ── */
function seedNoise(i: number, seed: number): number {
  const n = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function roundedRectPath(width: number, height: number, cx = 200, cy = 250, radius = 8): string {
  const x = cx - width / 2, y = cy - height / 2;
  return [
    `M ${x + radius} ${y}`, `h ${width - 2 * radius}`,
    `a ${radius} ${radius} 0 0 1 ${radius} ${radius}`,
    `v ${height - 2 * radius}`,
    `a ${radius} ${radius} 0 0 1 ${-radius} ${radius}`,
    `h ${-(width - 2 * radius)}`,
    `a ${radius} ${radius} 0 0 1 ${-radius} ${-radius}`,
    `v ${-(height - 2 * radius)}`,
    `a ${radius} ${radius} 0 0 1 ${radius} ${-radius}`, "Z",
  ].join(" ");
}

function dripPath(
  bodyW: number, bodyH: number, drips: number,
  minDepth: number, maxDepth: number, cornerR: number,
  side: "top" | "bottom" | "left" | "right",
  cx = 200, cy = 250, seed = 0
): string {
  const halfW = bodyW / 2, halfH = bodyH / 2;
  const top = cy - halfH, left = cx - halfW, right = cx + halfW, bot = cy + halfH;
  const isH = side === "top" || side === "bottom";
  const slot = (isH ? bodyW : bodyH) / drips;
  const r = Math.min(cornerR, halfW * 0.5, halfH * 0.5);
  const bulge = slot * 0.32;

  const dc = (eY: number, fX: number, tX: number, mX: number, aY: number, bl: number, hdY: number) => {
    const s = Math.sign(tX - fX);
    return (
      `C ${fX.toFixed(1)} ${hdY.toFixed(1)}, ${(mX - s * bl).toFixed(1)} ${aY.toFixed(1)}, ${mX.toFixed(1)} ${aY.toFixed(1)} ` +
      `C ${(mX + s * bl).toFixed(1)} ${aY.toFixed(1)}, ${tX.toFixed(1)} ${hdY.toFixed(1)}, ${tX.toFixed(1)} ${eY.toFixed(1)} `
    );
  };

  let d = "";
  if (side === "bottom") {
    d += `M ${(left+r).toFixed(1)} ${top.toFixed(1)} L ${(right-r).toFixed(1)} ${top.toFixed(1)} A ${r} ${r} 0 0 1 ${right.toFixed(1)} ${(top+r).toFixed(1)} L ${right.toFixed(1)} ${bot.toFixed(1)} `;
    for (let i = drips - 1; i >= 0; i--) {
      const dr = left+(i+1)*slot, dl = left+i*slot, dm = (dl+dr)/2, depth = minDepth+seedNoise(i,seed)*(maxDepth-minDepth);
      d += dc(bot, dr, dl, dm, bot+depth, bulge, bot+depth*0.55);
    }
    d += `L ${left.toFixed(1)} ${(top+r).toFixed(1)} A ${r} ${r} 0 0 1 ${(left+r).toFixed(1)} ${top.toFixed(1)} Z`;
  } else if (side === "top") {
    d += `M ${left.toFixed(1)} ${top.toFixed(1)} `;
    for (let i = 0; i < drips; i++) {
      const dl = left+i*slot, dr = left+(i+1)*slot, dm = (dl+dr)/2, depth = minDepth+seedNoise(i,seed)*(maxDepth-minDepth);
      d += dc(top, dl, dr, dm, top-depth, bulge, top-depth*0.55);
    }
    d += `L ${right.toFixed(1)} ${(bot-r).toFixed(1)} A ${r} ${r} 0 0 1 ${(right-r).toFixed(1)} ${bot.toFixed(1)} L ${(left+r).toFixed(1)} ${bot.toFixed(1)} A ${r} ${r} 0 0 1 ${left.toFixed(1)} ${(bot-r).toFixed(1)} Z`;
  } else if (side === "left") {
    d += `M ${left.toFixed(1)} ${top.toFixed(1)} L ${(right-r).toFixed(1)} ${top.toFixed(1)} A ${r} ${r} 0 0 1 ${right.toFixed(1)} ${(top+r).toFixed(1)} L ${right.toFixed(1)} ${(bot-r).toFixed(1)} A ${r} ${r} 0 0 1 ${(right-r).toFixed(1)} ${bot.toFixed(1)} L ${left.toFixed(1)} ${bot.toFixed(1)} `;
    for (let i = drips - 1; i >= 0; i--) {
      const dt = top+i*slot, db = top+(i+1)*slot, dm = (dt+db)/2, depth = minDepth+seedNoise(i,seed)*(maxDepth-minDepth);
      const ax = left-depth, hx = left-depth*0.55;
      d += `C ${hx.toFixed(1)} ${db.toFixed(1)}, ${ax.toFixed(1)} ${(dm+bulge).toFixed(1)}, ${ax.toFixed(1)} ${dm.toFixed(1)} C ${ax.toFixed(1)} ${(dm-bulge).toFixed(1)}, ${hx.toFixed(1)} ${dt.toFixed(1)}, ${left.toFixed(1)} ${dt.toFixed(1)} `;
    }
    d += "Z";
  } else {
    d += `M ${(left+r).toFixed(1)} ${top.toFixed(1)} L ${right.toFixed(1)} ${top.toFixed(1)} `;
    for (let i = 0; i < drips; i++) {
      const dt = top+i*slot, db = top+(i+1)*slot, dm = (dt+db)/2, depth = minDepth+seedNoise(i,seed)*(maxDepth-minDepth);
      const ax = right+depth, hx = right+depth*0.55;
      d += `C ${hx.toFixed(1)} ${dt.toFixed(1)}, ${ax.toFixed(1)} ${(dm-bulge).toFixed(1)}, ${ax.toFixed(1)} ${dm.toFixed(1)} C ${ax.toFixed(1)} ${(dm+bulge).toFixed(1)}, ${hx.toFixed(1)} ${db.toFixed(1)}, ${right.toFixed(1)} ${db.toFixed(1)} `;
    }
    d += `L ${(left+r).toFixed(1)} ${bot.toFixed(1)} A ${r} ${r} 0 0 1 ${left.toFixed(1)} ${(bot-r).toFixed(1)} L ${left.toFixed(1)} ${(top+r).toFixed(1)} A ${r} ${r} 0 0 1 ${(left+r).toFixed(1)} ${top.toFixed(1)} Z`;
  }
  return d;
}

/* Related card frames — same 4 drip types as RetroProducts landing */
const RELATED_FRAMES = [
  { name: "drip-left",   color: C.green,   rotate: -3, bodyW: 300, bodyH: 340, drips: 5, minD: 16, maxD: 42, corner: 26, side: "left"   as const, seed: 41 },
  { name: "drip-bottom", color: C.lilac,   rotate:  3, bodyW: 320, bodyH: 320, drips: 7, minD: 16, maxD: 70, corner: 22, side: "bottom" as const, seed: 9  },
  { name: "drip-top",    color: C.peach,   rotate: -2, bodyW: 320, bodyH: 320, drips: 4, minD: 22, maxD: 60, corner: 22, side: "top"    as const, seed: 23 },
  { name: "drip-right",  color: C.mustard, rotate:  4, bodyW: 300, bodyH: 340, drips: 6, minD: 12, maxD: 42, corner: 26, side: "right"  as const, seed: 53 },
];

/* ── Botanical helpers ── */
function botanicalAnim(color: string, size: number) {
  const h = (color.charCodeAt(1) + color.charCodeAt(2) + size) % 21;
  return {
    animate: { y: [0, h % 2 === 0 ? -(4 + h % 5) : 3 + h % 4, 0] as number[] },
    transition: { duration: 2.8 + (h % 6) * 0.45, repeat: Infinity, ease: "easeInOut" as const, delay: (h % 8) * 0.3 },
  };
}

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

function SmallLeaf({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 3);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: Math.round(size * 1.6), ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 40 64" style={{ width: "100%", height: "100%" }}>
        <path d="M20 60 C8 45 4 28 10 14 C14 4 26 4 30 14 C36 28 32 45 20 60Z" fill={color} opacity="0.82" />
        <path d="M20 60 L20 20" fill="none" stroke={color} strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

function Sparkle({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 7);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 40 40" style={{ width: "100%", height: "100%" }}>
        <path d="M20 2 L22 18 L38 20 L22 22 L20 38 L18 22 L2 20 L18 18 Z" fill={color} opacity="0.90" />
      </svg>
    </motion.div>
  );
}

function MiniClover({ color, size, style }: { color: string; size: number; style: CSSProperties }) {
  const { animate, transition } = botanicalAnim(color, size + 5);
  return (
    <motion.div className="pointer-events-none" style={{ position: "absolute", width: size, height: size, ...style }} animate={animate} transition={transition}>
      <svg viewBox="0 0 40 40" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <circle cx="20" cy="12" r="10" fill={color} opacity="0.80" />
        <circle cx="12" cy="26" r="10" fill={color} opacity="0.80" />
        <circle cx="28" cy="26" r="10" fill={color} opacity="0.80" />
        <rect x="18.5" y="20" width="3" height="16" rx="1.5" fill={color} opacity="0.72" />
      </svg>
    </motion.div>
  );
}

interface ProductDetailsClientProps {
  product: StorefrontProduct;
  /** The other size of this model, when it exists as a separate product. */
  sibling?: StorefrontProduct | null;
  related: StorefrontProduct[];
  lang: Locale;
  dictionary?: unknown;
}

export function ProductDetailsClient({ product: urlProduct, sibling = null, related, lang }: ProductDetailsClientProps) {
  useStoreHydration();
  const copy = getLandingCopy(lang);

  // Size variants live as two products, but we switch between them IN PLACE
  // (no navigation, the URL never changes). `product` below is always the
  // currently-selected size, so the rest of the page reflects its price/stock.
  const pairRole = urlProduct.size_sibling?.role;
  const hasPair = Boolean(pairRole && sibling);
  const [sizeRole, setSizeRole] = useState<"small" | "big">(pairRole ?? "small");
  const product = useMemo(
    () => (hasPair ? (sizeRole === pairRole ? urlProduct : sibling!) : urlProduct),
    [hasPair, sizeRole, pairRole, urlProduct, sibling],
  );

  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity,   setQuantity]   = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const isNecklace = product.category === "necklace";
  // Real two-size products are handled by the paired-products selector
  // (size_sibling) above. Every other product is a SINGLE size — its size text
  // comes from the admin `size` field and we never invent a small/large choice
  // (that made no sense for kids' bags, laptop sleeves, aprons, etc.). The price
  // is always the admin-set product price.
  const oneSizeText = (product.size || "").trim();
  const activeSizePrice = product.price;

  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  // Photos stay fixed to the page's primary product — switching size must NOT
  // swap the images (both sizes share the same photos).
  const photo     = urlProduct;
  const hasBack   = Boolean(photo.image_back);
  const activeImg = activeSide === "back" && photo.image_back ? photo.image_back : photo.image_front;
  const inStock   = product.in_stock && product.stock > 0;
  const isOnSale  = Boolean(product.original_price && product.original_price > product.price);
  const name      = product.name || product.code;
  const sub       = [product.size, product.color].filter(Boolean).join(" · ");
  const isKa      = lang === "ka";
  const curr      = product.currency === "GEL" ? "₾" : ` ${product.currency}`;
  // The filter dictionary only knows the canonical categories; custom ones
  // from the agent get displayed under their raw name.
  const filterKey = (product.category === "tote" ? "bag" : product.category) as keyof typeof copy.shop.filters;
  const categoryLabel = (copy.shop.filters as Record<string, string>)[filterKey] ?? product.category;
  const baseCatColor = CAT_COLORS[product.category] ?? { bg: C.rose, text: C.cream, shadow: "#9c6078" };
  /* Optional admin override — set a tag like `color:#hex` or `color:rose` to recolor banner + buttons */
  const tagColor = colorFromTags(product.tags || []);
  const catColor = tagColor
    ? { bg: tagColor, text: pickTextOn(tagColor), shadow: baseCatColor.shadow }
    : baseCatColor;

  const onAddToCart = () => {
    if (!inStock) return;
    // Necklaces are one-size with their own admin-set price. Bags also use
    // their admin-set price now — the hardcoded 69/74 was only ever a
    // placeholder when the admin couldn't set prices yet.
    let variantId: string, variantPrice: number, variantSize: string;
    let variantLabelKa: string, variantLabelEn: string;
    if (isNecklace) {
      variantId = product.id; variantPrice = product.price; variantSize = "one";
      variantLabelKa = product.name || product.code;
      variantLabelEn = product.name || product.code;
    } else if (hasPair) {
      // Each size is its own product — add the currently-selected one directly.
      const dim = sizeRole === "small" ? "33×25" : "37×27";
      variantId = product.id; variantPrice = product.price; variantSize = sizeRole;
      variantLabelKa = sizeRole === "small" ? `პატარა ${dim}სმ` : `დიდი ${dim}სმ`;
      variantLabelEn = sizeRole === "small" ? `Small ${dim}cm`  : `Large ${dim}cm`;
    } else {
      // One-size product — record its real admin-set size (no invented small/large).
      variantId = product.id; variantPrice = product.price; variantSize = oneSizeText || "one";
      variantLabelKa = oneSizeText || product.name || product.code;
      variantLabelEn = oneSizeText || product.name || product.code;
    }
    const variant = {
      id: variantId,
      size: variantSize,
      color: { en: variantLabelEn, ka: variantLabelKa },
      colorCode: catColor.bg,
      inStock: true,
      price: variantPrice,
    };
    try {
      addItem(
        {
          id: product.id, slug: product.id,
          name:        { en: name, ka: name },
          subtitle:    { en: sub,  ka: sub  },
          description: { en: "",   ka: ""   },
          materials: [], careInstructions: [], reviews: [],
          price:       variantPrice,
          images:      [photo.image_front, photo.image_back].filter(Boolean) as string[],
          variants: [variant],
          category: product.category as any, featured: true, badges: [],
          tags: product.tags ?? [],
        } as any,
        variant as any,
        quantity
      );
      openCart();
    } catch (err) {
      console.error("[cart] add failed", err);
      openCart();
    }
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>

      {/* ══ HERO — dynamic category colour + soft drip bottom ══ */}
      <section className="relative overflow-hidden" style={{ background: catColor.bg, paddingBottom: 190 }}>

        {/* Floating sparkles & botanicals */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <Sparkle color="white" size={20} style={{ left: "8%",   top: "28%", opacity: 0.35 }} />
          <Sparkle color="white" size={14} style={{ left: "16%",  top: "58%", opacity: 0.25 }} />
          <Sparkle color="white" size={18} style={{ right: "10%", top: "22%", opacity: 0.30 }} />
          <Sparkle color="white" size={12} style={{ right: "19%", top: "60%", opacity: 0.22 }} />
          <Sparkle color={C.cream} size={22} style={{ left: "32%", top: "16%", opacity: 0.26 }} />
          <Sparkle color={C.cream} size={14} style={{ right: "34%", top: "64%", opacity: 0.20 }} />
          <SmallLeaf color="white" size={26} style={{ left: "4%",  top: "22%", opacity: 0.18, transform: "rotate(16deg)" }} />
          <SmallLeaf color="white" size={20} style={{ right: "5%", top: "30%", opacity: 0.16, transform: "rotate(-22deg)" }} />
          <MiniClover color="white" size={18} style={{ left: "24%",  bottom: "36%", opacity: 0.18 }} />
          <MiniClover color="white" size={14} style={{ right: "26%", bottom: "33%", opacity: 0.16 }} />
        </div>

        <div className="relative z-10 text-center px-6 pt-12 md:pt-16">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 11,
              color: catColor.text, opacity: 0.65, marginBottom: 14,
              display: "flex", gap: 8, justifyContent: "center", alignItems: "center", flexWrap: "wrap",
            }}
          >
            <Link href={`/${lang}`}      style={{ color: "inherit", textDecoration: "none", opacity: 0.8 }}>{isKa ? "მთავარი" : "home"}</Link>
            <span style={{ opacity: 0.45 }}>→</span>
            <Link href={`/${lang}/shop`} style={{ color: "inherit", textDecoration: "none", opacity: 0.8 }}>{isKa ? "მაღაზია" : "shop"}</Link>
            <span style={{ opacity: 0.45 }}>→</span>
            <span>{categoryLabel || product.category}</span>
          </motion.div>

          {/* Product name — fades up (no overflow wrapper so descenders aren't clipped) */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1], delay: 0.15 }}
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(32px, 5.5vw, 72px)",
              color: catColor.text,
              lineHeight: 1.18,
              margin: 0,
              padding: "0.08em 0",
            }}
          >
            {name}
          </motion.h1>

          {sub && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 14, color: catColor.text, opacity: 0.62, marginTop: 10, marginBottom: 0 }}
            >
              {sub}
            </motion.p>
          )}
        </div>

        {/* Soft melting drip bottom — hero color drips down into white */}
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 96, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full block">
            <path d={DRIP_PATH} fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ══ PRODUCT AREA — white background ══ */}
      <div style={{ background: "#ffffff", position: "relative" }}>

        {/* Subtle side botanical decorations */}
        <div aria-hidden="true" className="absolute hidden lg:block pointer-events-none" style={{ top: 0, bottom: 0, left: 0, right: 0, zIndex: 0 }}>
          <Daisy     color={C.rose}    size={46} style={{ left: "1.5%", top: "6%",  opacity: 0.28, transform: "rotate(-12deg)" }} />
          <SmallLeaf color={C.sage}    size={20} style={{ left: "3%",   top: "22%", opacity: 0.26, transform: "rotate(20deg)" }} />
          <Sparkle   color={C.mustard} size={16} style={{ left: "1%",   top: "42%", opacity: 0.30 }} />
          <MiniClover color={C.champagne} size={14} style={{ left: "2.5%", top: "60%", opacity: 0.24 }} />
          <Daisy     color={C.mustard} size={42} style={{ right: "1.5%", top: "8%",  opacity: 0.26, transform: "rotate(10deg)" }} />
          <SmallLeaf color={C.rose}    size={22} style={{ right: "2.5%", top: "28%", opacity: 0.24, transform: "rotate(-18deg)" }} />
          <Sparkle   color={C.lavender} size={18} style={{ right: "1%",  top: "48%", opacity: 0.28 }} />
          <MiniClover color={C.sage}   size={14} style={{ right: "3%",   top: "66%", opacity: 0.22 }} />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-20 relative" style={{ zIndex: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 52, alignItems: "start" }}>

            {/* LEFT: Product photo */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.215, 0.61, 0.355, 1] }}
            >
              <div style={{
                position: "relative",
                borderRadius: 24,
                overflow: "hidden",
                aspectRatio: "4 / 5",
                boxShadow: `0 0 0 4px ${catColor.bg}, 0 0 0 8px rgba(201,168,108,0.14), 0 16px 48px rgba(42,29,20,0.13)`,
                background: "#f5f5f5",
              }}>
                <Image src={activeImg} alt={name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setWishlisted((w) => !w)}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  style={{
                    position: "absolute", top: 14, right: 14, zIndex: 2,
                    background: "white", border: "none", borderRadius: "50%",
                    width: 42, height: 42,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                  }}
                >
                  <Heart size={18} fill={wishlisted ? C.rose : "none"} stroke={wishlisted ? C.rose : "#bbb"} strokeWidth={2} />
                </motion.button>

                <div style={{
                  position: "absolute", bottom: 14, left: 14, zIndex: 2,
                  background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)",
                  borderRadius: 999, padding: "4px 14px",
                  fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 11,
                  color: inStock ? C.green : C.rose,
                }}>
                  {inStock
                    ? (isKa ? "✦ მარაგშია" : "✦ In stock")
                    : (isKa ? "გაყიდულია" : "Sold out")}
                </div>
              </div>

              {hasBack && (
                <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center" }}>
                  {(["front", "back"] as const).map((side) => {
                    const src    = side === "front" ? photo.image_front : photo.image_back!;
                    const active = activeSide === side;
                    return (
                      <motion.button
                        key={side}
                        onClick={() => setActiveSide(side)}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          width: 64, height: 64, borderRadius: 12, overflow: "hidden",
                          border: active ? `3px solid ${catColor.bg}` : `2px solid rgba(201,168,108,0.22)`,
                          padding: 0, cursor: "pointer", position: "relative",
                          boxShadow: active ? `0 3px 0 ${catColor.shadow}` : `0 2px 8px rgba(0,0,0,0.07)`,
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

            {/* RIGHT: Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.215, 0.61, 0.355, 1] }}
              style={{ paddingTop: 6 }}
            >
              {/* Category label + stock — subtle, no fill */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.22 }}
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontFamily: FRAUNCES, fontWeight: 600,
                  fontSize: 12, letterSpacing: "0.04em",
                  color: C.ink,
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: `1px solid rgba(42,29,20,0.14)`,
                  background: "transparent",
                }}>
                  <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: catColor.bg }} />
                  {categoryLabel || product.category}
                </span>
                <span style={{
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                  fontSize: 12, color: C.ink, opacity: 0.55,
                }}>
                  {inStock ? (isKa ? "მარაგშია" : "In stock") : (isKa ? "გაყიდულია" : "Sold out")}
                </span>
              </motion.div>

              {/* Price — big number with the currency tucked into the bottom-right corner */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
                style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 14 }}
              >
                <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 44, color: C.ink, lineHeight: 0.95, letterSpacing: "-0.02em" }}>
                  {activeSizePrice}
                </span>
                <span style={{
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                  fontWeight: 500, fontSize: 14, color: C.ink, opacity: 0.55,
                  marginBottom: 4,
                }}>
                  {curr.trim()}
                </span>
                {isOnSale && product.original_price && (
                  <span style={{
                    fontFamily: "system-ui, sans-serif", fontSize: 14,
                    color: C.ink, opacity: 0.4, textDecoration: "line-through",
                    marginLeft: 10, marginBottom: 4,
                  }}>
                    {product.original_price}{curr.trim()}
                  </span>
                )}
              </motion.div>

              {/* Reversible note — bags only. Necklaces don't get this line. */}
              {!isNecklace && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.30 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                  fontWeight: 500, fontSize: 13,
                  color: C.ink, opacity: 0.6,
                  margin: "0 0 22px 0",
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1, color: catColor.bg }}>↻</span>
                {isKa
                  ? "ორმხრივი — გადააბრუნე და ახალი ჩანთაა."
                  : "Reversible — flip inside-out for a fresh face."}
              </motion.p>
              )}

              {/* Description — plain paragraph, no decorative box */}
              {product.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.32 }}
                  style={{
                    fontSize: 14, lineHeight: 1.7,
                    color: C.ink, opacity: 0.72,
                    margin: "0 0 24px 0",
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {product.description}
                </motion.p>
              )}

              {/* Real size variants: this model exists as two separate products
                  (small + big). The toggle navigates to the sibling, which has
                  its own price + stock. */}
              {hasPair && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{
                    fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 11, color: C.champagne,
                    letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10,
                  }}>
                    {isKa ? "ზომა" : "Size"}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {([
                      { role: "small" as const, ka: "პატარა", en: "Small", dim: "33×25" },
                      { role: "big" as const,   ka: "დიდი",   en: "Large", dim: "37×27" },
                    ]).map((opt) => {
                      const active = sizeRole === opt.role;
                      return (
                        <motion.button
                          key={opt.role}
                          type="button"
                          onClick={() => setSizeRole(opt.role)}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            flex: "1 1 0", minWidth: 150, padding: "12px 16px",
                            border: active ? `1.5px solid ${catColor.bg}` : `1.5px solid rgba(42,29,20,0.14)`,
                            borderRadius: 14,
                            background: active ? catColor.bg : "transparent",
                            color: active ? catColor.text : C.ink,
                            cursor: "pointer", textAlign: "left",
                            transition: "background 0.18s, border-color 0.18s, color 0.18s",
                          }}
                        >
                          <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14 }}>
                            {isKa ? opt.ka : opt.en}
                          </div>
                          <div style={{ fontSize: 11, opacity: active ? 0.7 : 0.55, marginTop: 2, fontFamily: "system-ui, sans-serif" }}>
                            {opt.dim} {isKa ? "სმ" : "cm"}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* One-size products: show the real admin-set size as plain info —
                  no invented small/large selector. */}
              {!isNecklace && !hasPair && oneSizeText && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{
                    fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 11, color: C.champagne,
                    letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8,
                  }}>
                    {isKa ? "ზომა" : "Size"}
                  </div>
                  <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, color: C.ink }}>
                    {oneSizeText}
                  </div>
                </div>
              )}

              {/* Quantity + Add-to-bag — clean modern row */}
              <div style={{ display: "flex", alignItems: "stretch", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  border: `1.5px solid rgba(42,29,20,0.14)`,
                  borderRadius: 14,
                  background: "white",
                }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="decrease"
                    style={{ width: 40, height: 44, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ width: 30, textAlign: "center", fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, color: C.ink }}>{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} aria-label="increase"
                    style={{ width: 40, height: 44, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
                    <Plus size={14} />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: inStock ? 1.01 : 1 }}
                  whileTap={{ scale: inStock ? 0.98 : 1 }}
                  onClick={onAddToCart}
                  disabled={!inStock}
                  style={{
                    flex: "1 1 0", minWidth: 180,
                    background: inStock ? catColor.bg : "rgba(201,168,108,0.22)",
                    color: inStock ? catColor.text : "rgba(42,29,20,0.55)",
                    border: "none", borderRadius: 14,
                    padding: "0 22px", height: 44,
                    fontFamily: FRAUNCES, fontWeight: 600,
                    fontSize: 14, letterSpacing: "0.02em",
                    cursor: inStock ? "pointer" : "not-allowed",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "background 0.18s, transform 0.18s",
                  }}
                >
                  <ShoppingBag size={15} />
                  {inStock
                    ? (isKa ? "კალათში დამატება" : "Add to bag")
                    : (isKa ? "გაყიდულია" : "Sold out")}
                </motion.button>
              </div>

              {/* Care & Material — minimal divided sections, no boxy bg */}
              <div style={{ marginTop: 12, borderTop: `1px solid rgba(42,29,20,0.10)`, paddingTop: 18 }}>
                <div style={{
                  fontFamily: FRAUNCES, fontWeight: 600,
                  fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase",
                  color: C.ink, opacity: 0.55,
                  marginBottom: 12,
                }}>
                  {isKa ? "მოვლა" : "Care"}
                </div>
                <ul style={{
                  margin: "0 0 22px 0", padding: 0, listStyle: "none",
                  display: "flex", flexDirection: "column", gap: 7,
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                  fontSize: 14, lineHeight: 1.5, color: C.ink, opacity: 0.78,
                }}>
                  {(isNecklace
                    ? (isKa
                        ? [
                            "მოარიდე ხანგრძლივ წყალთან კონტაქტს",
                            "მოარიდე სუნამოს, კოსმეტიკას და ქიმიკატებს",
                          ]
                        : [
                            "Avoid prolonged contact with water",
                            "Keep away from perfume, cosmetics and chemicals",
                          ])
                    : (isKa
                        ? [
                            "გაწმინდე ნოტიო ნაჭრით",
                            "ნაზი რეცხვა 30°C-ზე",
                            "მათეთრებლების გარეშე",
                            "ჰაერზე გაშრობა რეკომენდებულია",
                          ]
                        : [
                            "Wipe clean with damp cloth",
                            "Gentle wash at 30°C",
                            "Do not bleach",
                            "Air dry recommended",
                          ])
                  ).map((line) => (
                    <li key={line} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span aria-hidden="true" style={{
                        width: 4, height: 4, borderRadius: "50%",
                        background: C.ink, opacity: 0.35, marginTop: 9, flexShrink: 0,
                      }} />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                {!isNecklace && (
                  <>
                    <div style={{
                      fontFamily: FRAUNCES, fontWeight: 600,
                      fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase",
                      color: C.ink, opacity: 0.55,
                      marginBottom: 8,
                    }}>
                      {isKa ? "მასალა" : "Material"}
                    </div>
                    <p style={{
                      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                      fontSize: 14, lineHeight: 1.5, color: C.ink, opacity: 0.78,
                      margin: 0,
                    }}>
                      {isKa ? "წყალგამძლე საღებავიანი ტილო (Duck Canvas)" : "Water-Repellent Duck Canvas"}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ LOOKBOOK strip — admin-uploaded showcase photos for THIS product ══ */}
      {photo.gallery_images && photo.gallery_images.length > 0 && (
        <section style={{ background: C.cream, padding: "56px 0 64px" }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 28 }}>
              <span style={{
                fontFamily: FRAUNCES, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: catColor.bg,
              }}>
                {isKa ? "ცხოვრებაში" : "In real life"}
              </span>
              <h2 style={{
                fontFamily: isKa ? "var(--font-alk-life), serif" : FRAUNCES,
                fontWeight: 900,
                fontStyle: isKa ? "normal" : "italic",
                fontSize: "clamp(24px, 3vw, 36px)",
                color: C.ink,
                margin: "8px 0 0",
              }}>
                {isKa ? "ფოტოები მოდელზე" : "On model"}
              </h2>
            </div>
            <div
              className="grid gap-3 md:gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              }}
            >
              {photo.gallery_images.filter(u => /^https?:\/\//i.test(u)).map((url, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "3 / 4",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#f5f5f5",
                    boxShadow: "0 6px 18px rgba(42,29,20,0.10)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ RELATED — auto-scrolling carousel ══ */}
      {related.length > 0 && (
        <section style={{ background: C.burnt, position: "relative", padding: "64px 0 72px", overflow: "hidden" }}>
          <style>{`
            @keyframes tissu-related-marquee {
              from { transform: translateX(0); }
              to   { transform: translateX(-50%); }
            }
            .tissu-related-track:hover { animation-play-state: paused; }
          `}</style>

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "repeating-linear-gradient(90deg, #f3b62b 0 18px, #fef0d6 18px 36px)" }} aria-hidden="true" />

          <div className="container relative">
            <div className="text-center" style={{ marginBottom: 44 }}>
              <h2 style={{
                fontFamily: isKa ? ALK_LIFE : FRAUNCES,
                fontStyle: isKa ? "normal" : "italic",
                fontWeight: 900,
                fontSize: "clamp(28px, 4vw, 52px)",
                color: C.cream, margin: 0,
              }}>
                {isKa ? "შეიძლება მოგეწონოს" : "You might also love"}
              </h2>
            </div>
          </div>

          {related.length >= 6 ? (
            <div
              className="tissu-related-track"
              style={{
                display: "flex",
                gap: 32,
                width: "max-content",
                padding: "0 24px",
                animation: `tissu-related-marquee ${Math.max(50, related.length * 10)}s linear infinite`,
                willChange: "transform",
              }}
            >
              {[...related, ...related].map((rp, idx) => (
                <div key={`${rp.id}-${idx}`} style={{ flex: "0 0 auto", width: 280 }}>
                  <DripCard product={rp} lang={lang} isKa={isKa} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            // Too few to loop the marquee — center them instead of leaving them
            // cramped against the left edge.
            <div
              style={{
                display: "flex",
                gap: 32,
                justifyContent: "center",
                flexWrap: "wrap",
                padding: "0 24px",
              }}
            >
              {related.map((rp, idx) => (
                <div key={`${rp.id}-${idx}`} style={{ flex: "0 0 auto", width: 280 }}>
                  <DripCard product={rp} lang={lang} isKa={isKa} index={idx} />
                </div>
              ))}
            </div>
          )}

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "repeating-linear-gradient(90deg, #f3b62b 0 18px, #fef0d6 18px 36px)" }} aria-hidden="true" />
        </section>
      )}
    </div>
  );
}

/* ── Drip card — matches RetroProducts MirrorCard look ── */
function DripCard({ product, lang, isKa, index }: { product: StorefrontProduct; lang: Locale; isKa: boolean; index: number }) {
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  // Same fallback dance as shop cards — cutout for the photos that work,
  // original URL for the ones where Cloudinary's background remover fails.
  const [cutoutFailed, setCutoutFailed] = useState(false);
  const frontSrc = cutoutFailed ? product.image_front : cloudinaryCutout(product.image_front);

  const frame     = RELATED_FRAMES[index % RELATED_FRAMES.length];
  const name      = product.name || product.code;
  const curr      = product.currency === "GEL" ? "₾" : ` ${product.currency}`;
  const outerPath = useMemo(() => dripPath(frame.bodyW, frame.bodyH, frame.drips, frame.minD, frame.maxD, frame.corner, frame.side, 200, 250, frame.seed), [frame]);
  const innerPath = useMemo(() => roundedRectPath(frame.bodyW - 28, frame.bodyH - 28, 200, 250, 10), [frame]);
  const clipId    = `dc-${frame.name}-${index}`;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addItem(
        { id: product.id, slug: product.id, name: { en: name, ka: name }, subtitle: { en: "", ka: "" }, description: { en: "", ka: "" },
          price: product.price, images: [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [{ id: `${product.id}-d`, size: "one", colorName: { en: "default", ka: "default" }, colorCode: "#c9a86c", inStock: true }],
          category: product.category as any, featured: true, badges: [], tags: product.tags ?? [] } as any,
        { id: `${product.id}-d`, size: "one", colorName: { en: "default", ka: "default" }, colorCode: "#c9a86c", inStock: true } as any,
        1
      );
      openCart();
    } catch { openCart(); }
  };

  return (
    <Link href={`/${lang}/product/${product.id}`} style={{ textDecoration: "none" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.85, delay: index * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
        className="group flex flex-col items-center"
        style={{ gap: 16 }}
      >
        <div style={{
          position: "relative", width: "100%", maxWidth: 320, aspectRatio: "4/5",
          transform: `rotate(${frame.rotate}deg)`,
          transition: "transform 0.6s cubic-bezier(0.215,0.61,0.355,1)",
        }}>
          <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true"
            className="absolute inset-0 w-full h-full"
            style={{ filter: "drop-shadow(0 18px 22px rgba(42,29,20,0.28))", overflow: "visible" }}
          >
            <defs><clipPath id={clipId}><path d={innerPath} /></clipPath></defs>
            {/* Frame body provides the coloured backdrop behind the transparent bag photo. */}
            <path d={outerPath} fill={frame.color} />
            {/* Photo: background removed by Cloudinary + a small inset so it
             *  reads more like a polaroid than a tight crop. */}
            <image href={frontSrc}
              x="22" y="22" width="356" height="456"
              preserveAspectRatio="xMidYMin meet" clipPath={`url(#${clipId})`}
              onError={() => setCutoutFailed(true)}
              style={{ filter: "saturate(0.96) sepia(0.04)" }}
            />
          </svg>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700, fontSize: 18, color: C.cream, lineHeight: 1.2, marginBottom: 4 }}>
            {name}
          </div>
          <div style={{ fontFamily: PACIFICO, fontSize: 22, color: C.mustard, marginBottom: 8 }}>
            {product.price}{curr}
          </div>
          <button
            onClick={handleAdd}
            style={{
              fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700,
              fontSize: 11, color: C.ink,
              background: C.cream, border: "none", borderRadius: 999,
              padding: "6px 16px", cursor: "pointer",
              boxShadow: `0 3px 0 ${C.mustardDeep}`,
              letterSpacing: "0.06em",
            }}
          >
            + {isKa ? "კალათი" : "Add"}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}
