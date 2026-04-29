"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { StorefrontProduct } from "@/lib/admin-api";

interface RetroNecklacesProps {
  isKa?: boolean;
  shopHref?: string;
  products: StorefrontProduct[];
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

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
  // #1 — 8-petal flower bloom (elegant, jewellery feel)
  {
    name: "bloom",
    color: C.rose,
    rotate: -3,
    spec: { kind: "flower", bumps: 8, baseR: 120, bumpH: 44 },
  },
  // #2 — wide organic blob (soft, approachable)
  {
    name: "pebble",
    color: C.champagne,
    rotate: 4,
    spec: { kind: "blob", points: 12, rx: 138, ry: 118, variance: 0.14, seed: 7 },
  },
  // #3 — fine scallop frill (delicate, lace-like)
  {
    name: "frill",
    color: C.lavender,
    rotate: -2,
    spec: { kind: "flower", bumps: 14, baseR: 118, bumpH: 22, jitter: 0.15 },
  },
  // #4 — tall organic blob (like a pendant shape)
  {
    name: "pendant",
    color: C.sage,
    rotate: 3,
    spec: { kind: "blob", points: 10, rx: 118, ry: 148, variance: 0.12, seed: 31 },
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
  products,
}: RetroNecklacesProps) {
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
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
            style={{ color: C.champagne }}
          >
            {isKa ? "ყელსაბამები" : "Handcrafted necklaces"}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="mt-4 leading-[0.95]"
            style={{
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "clamp(36px, 6vw, 76px)",
              color: C.cream,
            }}
          >
            {isKa ? <>ხელნაკეთი, სულდგმული.</> : <>Worn close, made by hand.</>}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-3 max-w-md mx-auto"
            style={{ fontFamily: FRAUNCES, fontStyle: "italic", opacity: 0.8, fontSize: 16 }}
          >
            {isKa
              ? "ყოველი ცალი ხელით ნაკეთია თბილისში."
              : "Each piece crafted by hand in our Tbilisi studio."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 md:gap-y-6 max-w-2xl mx-auto">
          {showcase.map((p, i) => (
            <NecklaceCard
              key={p.id}
              product={p}
              frame={FRAMES[i % FRAMES.length]}
              index={i}
              isKa={isKa}
            />
          ))}
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
}: {
  product: StorefrontProduct;
  frame: NecklaceFrame;
  index: number;
  isKa: boolean;
}) {
  const [hover, setHover] = useState(false);
  const hasBack = Boolean(product.image_back);
  const isNew = product.tags.includes("new");

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
      <div
        className="relative w-full max-w-80 cursor-pointer"
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
            href={product.image_front}
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
              href={product.image_back!}
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

        {isNew && (
          <span
            className="absolute -top-3 left-2 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em] z-10"
            style={{
              background: C.champagne,
              color: C.ink,
              fontFamily: FRAUNCES,
              transform: "rotate(-6deg)",
              boxShadow: "0 3px 0 #a0804a",
              borderRadius: 999,
            }}
          >
            {isKa ? "ახალი" : "New"}
          </span>
        )}
      </div>

      <div className="mt-5 text-center max-w-65">
        <div
          className="text-[10px] uppercase tracking-[0.3em] mb-1"
          style={{ color: C.champagne, fontFamily: FRAUNCES, fontWeight: 700 }}
        >
          {[product.size, product.color].filter(Boolean).join(" · ") || (isKa ? "ხელით ნაკეთი" : "Handmade")}
        </div>
        <Link
          href={`#product-${product.id}`}
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
