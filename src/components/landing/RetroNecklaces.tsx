"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { StorefrontProduct } from "@/lib/admin-api";
import { cloudinaryThumb } from "@/lib/cloudinary";

interface RetroNecklacesProps {
  isKa?: boolean;
  shopHref?: string;
  lang?: string;
  products: StorefrontProduct[];
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

const C = {
  bg: "#1e4d43",          // deep forest teal
  cream: "#fef0d6",
  mustard: "#f3b62b",
  ink: "#2a1d14",
  // card frame colours — none are orange
  rose: "#c4849a",        // dusty rose
  champagne: "#c9a86c",   // warm gold / champagne
  lavender: "#9e8abf",    // soft lavender
  sage: "#7aaa8a",        // sage green
};

/* ── Deterministic noise ── */
function seedNoise(i: number, seed: number): number {
  const n = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/* ── Flower / scallop path ── */
function flowerPath(
  bumps: number,
  baseR: number,
  bumpH: number,
  cx = 200,
  cy = 250,
  jitter = 0
): string {
  const step = (Math.PI * 2) / bumps;
  let d = "";
  for (let i = 0; i <= bumps; i++) {
    const a = i * step;
    const x = cx + baseR * Math.cos(a);
    const y = cy + baseR * Math.sin(a);
    if (i === 0) {
      d += `M ${x.toFixed(1)} ${y.toFixed(1)} `;
    } else {
      const midA = a - step / 2;
      const h = bumpH * (1 + (jitter ? Math.sin(i * 7.3) * jitter : 0));
      const mx = cx + (baseR + h) * Math.cos(midA);
      const my = cy + (baseR + h) * Math.sin(midA);
      d += `Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  }
  return d + "Z";
}

/* ── Organic blob path ── */
function blobPath(
  points: number,
  rx: number,
  ry: number,
  variance: number,
  cx = 200,
  cy = 250,
  seed = 0
): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const mult = 1 + (seedNoise(i, seed) * 2 - 1) * variance;
    pts.push([cx + mult * rx * Math.cos(a), cy + mult * ry * Math.sin(a)]);
  }
  const mid = (i: number, j: number): [number, number] => [
    (pts[i][0] + pts[j][0]) / 2,
    (pts[i][1] + pts[j][1]) / 2,
  ];
  const start = mid(points - 1, 0);
  let d = `M ${start[0].toFixed(1)} ${start[1].toFixed(1)} `;
  for (let i = 0; i < points; i++) {
    const next = (i + 1) % points;
    const m = mid(i, next);
    d += `Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)} `;
  }
  return d + "Z";
}

type FlowerSpec = { kind: "flower"; bumps: number; baseR: number; bumpH: number; jitter?: number };
type BlobSpec = { kind: "blob"; points: number; rx: number; ry: number; variance: number; seed: number };
type NecklaceFrameSpec = FlowerSpec | BlobSpec;

interface NecklaceFrame {
  name: string;
  color: string;
  rotate: number;
  spec: NecklaceFrameSpec;
}

/* Four distinct shapes — all flowers or blobs, no drips */
const FRAMES: readonly NecklaceFrame[] = [
  // #1 — 8-petal flower bloom
  {
    name: "bloom",
    color: C.rose,
    rotate: -3,
    spec: { kind: "flower", bumps: 8, baseR: 155, bumpH: 56 },
  },
  // #2 — wide organic blob
  {
    name: "pebble",
    color: C.champagne,
    rotate: 4,
    spec: { kind: "blob", points: 12, rx: 172, ry: 148, variance: 0.14, seed: 7 },
  },
  // #3 — fine scallop frill
  {
    name: "frill",
    color: C.lavender,
    rotate: -2,
    spec: { kind: "flower", bumps: 14, baseR: 150, bumpH: 28, jitter: 0.15 },
  },
  // #4 — tall pendant blob
  {
    name: "pendant",
    color: C.sage,
    rotate: 3,
    spec: { kind: "blob", points: 10, rx: 148, ry: 185, variance: 0.12, seed: 31 },
  },
] as const;

function buildOuter(spec: NecklaceFrameSpec): string {
  if (spec.kind === "flower") return flowerPath(spec.bumps, spec.baseR, spec.bumpH, 200, 250, spec.jitter ?? 0);
  return blobPath(spec.points, spec.rx, spec.ry, spec.variance, 200, 250, spec.seed);
}

function buildInner(spec: NecklaceFrameSpec): string {
  if (spec.kind === "flower") return flowerPath(spec.bumps, spec.baseR - 14, Math.max(spec.bumpH - 6, 6), 200, 250, spec.jitter ?? 0);
  return blobPath(spec.points, spec.rx - 14, spec.ry - 14, spec.variance, 200, 250, spec.seed);
}

export default function RetroNecklaces({
  isKa = false,
  shopHref = "/shop",
  lang,
  products,
}: RetroNecklacesProps) {
  const resolvedLang = lang ?? shopHref.split("/").filter(Boolean)[0] ?? "en";
  const necklaces = useMemo(
    () => products.filter((p) => p.category === "necklace" && Boolean(p.image_front)),
    [products]
  );

  if (necklaces.length === 0) return null;

  const showcase = necklaces.slice(0, 2);

  return (
    <section
      className="relative w-full overflow-hidden py-8 md:py-12"
      style={{ background: C.bg, color: C.cream }}
    >
      {/* Top stripe */}
      <div
        className="absolute inset-x-0 top-0 h-2"
        style={{ background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
        aria-hidden="true"
      />

      <div className="container relative">
        <div className="text-center mb-6 md:mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
            className="font-retro-display leading-[0.95]"
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(28px, 5vw, 58px)",
              color: C.cream,
            }}
          >
            {isKa
              ? <>შარფი-ყელსაბამი.</>
              : <>A scarf, a necklace — your way.</>}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 md:gap-y-6 max-w-4xl mx-auto">
          {showcase.map((p, i) => (
            <NecklaceCard
              key={p.id}
              product={p}
              frame={FRAMES[i % FRAMES.length]}
              index={i}
              isKa={isKa}
              lang={resolvedLang}
            />
          ))}
          <BuildYourOwnCard isKa={isKa} lang={resolvedLang} />
        </div>

        <div className="mt-6 md:mt-8 flex justify-center">
          <Link
            href={shopHref}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            style={{
              fontFamily: FRAUNCES,
              background: C.cream,
              color: C.ink,
              boxShadow: "0 5px 0 rgba(42,29,20,0.35)",
              fontWeight: 800,
            }}
          >
            {isKa ? "ყველა ყელსაბამი" : "See all necklaces"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Bottom stripe */}
      <div
        className="absolute inset-x-0 bottom-0 h-2"
        style={{ background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
        aria-hidden="true"
      />
    </section>
  );
}

function NecklaceCard({
  product,
  frame,
  index,
  isKa,
  lang,
}: {
  product: StorefrontProduct;
  frame: NecklaceFrame;
  index: number;
  isKa: boolean;
  lang: string;
}) {
  const productHref = `/${lang}/product/${product.id}`;
  const [hover, setHover] = useState(false);
  const hasBack = Boolean(product.image_back);

  const outerPath = useMemo(() => buildOuter(frame.spec), [frame]);
  const innerPath = useMemo(() => buildInner(frame.spec), [frame]);
  const clipId = `necklace-clip-${frame.name}-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.85, delay: 0.15 + index * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
      className="group flex flex-col items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover((v) => !v)}
    >
      <Link
        href={productHref}
        className="relative w-full max-w-80 cursor-pointer block"
        style={{
          aspectRatio: "4 / 5",
          transform: `rotate(${frame.rotate}deg)`,
          transition: "transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1)",
        }}
      >
        <svg
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.3))" }}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={innerPath} />
            </clipPath>
          </defs>

          <path d={outerPath} fill={frame.color} />

          <image
            href={cloudinaryThumb(product.image_front, 600)}
            x="0"
            y="0"
            width="400"
            height="500"
            preserveAspectRatio="xMidYMid meet"
            clipPath={`url(#${clipId})`}
            style={{
              filter: "saturate(0.95) sepia(0.03)",
              opacity: hover && hasBack ? 0 : 1,
              transition: "opacity 0.6s ease",
            }}
          />

          {hasBack && (
            <image
              href={cloudinaryThumb(product.image_back!, 600)}
              x="0"
              y="0"
              width="400"
              height="500"
              preserveAspectRatio="xMidYMid meet"
              clipPath={`url(#${clipId})`}
              style={{
                filter: "saturate(0.95) sepia(0.03)",
                opacity: hover ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            />
          )}
        </svg>

      </Link>

      <div className="mt-5 text-center max-w-65">
        <Link
          href={productHref}
          className="leading-tight hover:underline underline-offset-4 decoration-1"
          style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: C.cream }}
        >
          {product.name || product.code}
        </Link>
        <div style={{ fontFamily: PACIFICO, fontSize: 26, color: C.champagne }}>
          {product.price}
          {product.currency === "GEL" ? "₾" : ` ${product.currency}`}
        </div>
      </div>
    </motion.div>
  );
}

function BuildYourOwnCard({ isKa, lang }: { isKa: boolean; lang: string }) {
  const swatches = ["#c4849a", "#c9a86c", "#9e8abf", "#7aaa8a", "#f3b62b", "#6b9eb5"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.85, delay: 0.35, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex flex-col items-center"
    >
      <Link
        href={`/${lang}/necklace-builder`}
        className="relative w-full max-w-80 group"
        style={{ aspectRatio: "4 / 5", display: "block" }}
      >
        {/* Card body */}
        <div
          className="w-full h-full rounded-[28px] flex flex-col items-center justify-center gap-5 px-7 transition-transform duration-500 group-hover:-translate-y-2"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: `2px dashed ${C.champagne}`,
            transform: "rotate(2deg)",
          }}
        >
          {/* Swatch mosaic */}
          <div className="grid grid-cols-3 gap-2">
            {swatches.map((color, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{ width: 28, height: 28, background: color, opacity: 0.85 }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>

          {/* Plus icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition-transform duration-300 group-hover:scale-110"
            style={{ background: C.mustard, color: C.ink }}
          >
            +
          </div>

          {/* Stars */}
          {["top-4 left-5", "bottom-6 right-6"].map((pos, i) => (
            <motion.span
              key={i}
              className={`absolute ${pos} text-[14px] pointer-events-none`}
              style={{ color: C.champagne, opacity: 0.7 }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "linear" }}
            >
              ✦
            </motion.span>
          ))}
        </div>
      </Link>

      <div className="mt-5 text-center max-w-65">
        <div
          style={{ fontFamily: isKa ? ALK_LIFE : FRAUNCES, fontStyle: isKa ? "normal" : "italic", fontWeight: 700, fontSize: 22, color: C.cream }}
        >
          {isKa ? "ააწყვე შენი" : "Build yours"}
        </div>
        <div
          className="mt-1 text-[11px] uppercase tracking-[0.25em]"
          style={{ color: C.champagne, fontFamily: FRAUNCES }}
        >
          {isKa ? "ქსოვილი + ჩარმები" : "Fabric + charms"}
        </div>
      </div>
    </motion.div>
  );
}
