"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import type { StorefrontProduct } from "@/lib/admin-api";

interface RetroProductsProps {
  isKa?: boolean;
  shopHref?: string;
  products: StorefrontProduct[];
  /** Spotlight only a few; max 6. */
  limit?: number;
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  mustard: "#f3b62b",
  burnt: "#d56826",
  green: "#3f6f56",
  peach: "#e9a574",
  lilac: "#b89bd9",
  cobalt: "#264ba0",
  ink: "#2a1d14",
};

/**
 * Smooth organic blob path. Drops `points` evenly around an ellipse of
 * radii (rx, ry) and pushes each point in/out by a deterministic amount
 * driven by `seed`. The points are then connected by quadratic curves that
 * pass through midpoints, which keeps the silhouette buttery-smooth — no
 * sharp scallops, just soft pebble / wave / drop deformations.
 *
 * - points    — anchor points around the perimeter (more = subtler shape)
 * - rx, ry    — ellipse radii. Equal = round blob. rx<ry = tall (drop-like).
 *               rx>ry = wide (wave-like).
 * - variance  — 0..1. How much each point may push in/out from the base ellipse.
 * - seed      — distinct number per frame so each blob has its own silhouette.
 */
function blobPath(
  points: number,
  rx: number,
  ry: number,
  variance: number,
  cx = 200,
  cy = 250,
  seed = 0
): string {
  // Deterministic 0..1 noise from a sine hash — same seed always gives the
  // same shape, so server-rendered HTML matches the client exactly.
  const noise = (i: number) => {
    const n = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
    return n - Math.floor(n);
  };

  const pts: Array<[number, number]> = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const mult = 1 + (noise(i) * 2 - 1) * variance;
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

/**
 * Each frame defines:
 *   - path config that drives the scalloped matte behind the photo
 *   - colour of that matte
 *   - the "inner shape" of the photo itself (kept simple so the bag stays clear)
 */
// Each frame is a different organic silhouette in the same hand-drawn family —
// pebbles, drops, waves, stones. Variety comes from (a) ellipse aspect via
// rx/ry and (b) per-frame `seed` which seeds the deterministic noise that
// pushes each point in or out.
const FRAMES = [
  {
    // Round pebble — gentle wobbles, mostly circular.
    name: "pebble",
    color: C.green,
    points: 7,
    rx: 168,
    ry: 168,
    variance: 0.11,
    seed: 3,
    rotate: -3,
  },
  {
    // Drop — taller than wide, soft asymmetric deformations.
    name: "drop",
    color: C.mustard,
    points: 7,
    rx: 152,
    ry: 188,
    variance: 0.1,
    seed: 11,
    rotate: 4,
  },
  {
    // Wave — wider than tall, undulating side bumps.
    name: "wave",
    color: C.peach,
    points: 8,
    rx: 192,
    ry: 152,
    variance: 0.13,
    seed: 19,
    rotate: -2,
  },
  {
    // Stone — irregular round, more chaotic noise.
    name: "stone",
    color: C.lilac,
    points: 8,
    rx: 170,
    ry: 165,
    variance: 0.18,
    seed: 31,
    rotate: 5,
  },
  {
    // Lozenge — tall + chunky, fewer points = smoother lobes.
    name: "lozenge",
    color: C.cobalt,
    points: 6,
    rx: 158,
    ry: 182,
    variance: 0.14,
    seed: 47,
    rotate: -1.5,
  },
  {
    // Puddle — wide, low, organic spread.
    name: "puddle",
    color: C.burnt,
    points: 7,
    rx: 188,
    ry: 158,
    variance: 0.16,
    seed: 59,
    rotate: 2,
  },
] as const;

export default function RetroProducts({
  isKa = false,
  shopHref = "/shop",
  products,
  limit = 4,
}: RetroProductsProps) {
  const showcase = products
    .filter((p) => Boolean(p.image_front))
    .slice(0, Math.min(limit, FRAMES.length));

  return (
    <section
      className="relative w-full overflow-hidden py-24 md:py-32"
      style={{ background: C.burnt, color: C.cream }}
    >
      {/* Top decorative band */}
      <div
        className="absolute inset-x-0 top-0 h-2"
        style={{
          background:
            "repeating-linear-gradient(90deg, #f3b62b 0 18px, #fef0d6 18px 36px)",
        }}
        aria-hidden="true"
      />

      <div className="container relative">
        <div className="text-center mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
            style={{ color: C.mustard }}
          >
            {isKa ? "გაზაფხულის კოლექცია" : "Spring drop · curated few"}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="font-retro-display mt-4 leading-[0.95]"
            style={{
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "clamp(40px, 6.5vw, 80px)",
              color: C.cream,
            }}
          >
            {isKa ? <>ერთი ცალი, ორი მხარე.</> : <>One bag, two sides.</>}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-3 max-w-md mx-auto"
            style={{
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              opacity: 0.85,
              fontSize: 16,
            }}
          >
            {isKa
              ? "გადმოატარე კურსორი — ჩანთა მეორე მხარეზე გადადის."
              : "Hover the photo — the bag turns to its other side."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 md:gap-y-14 max-w-3xl mx-auto">
          {showcase.map((p, i) => (
            <MirrorCard
              key={p.id}
              product={p}
              frame={FRAMES[i % FRAMES.length]}
              index={i}
              isKa={isKa}
            />
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <Link
            href={shopHref}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            style={{
              fontFamily: FRAUNCES,
              background: C.cream,
              color: C.ink,
              boxShadow: `0 5px 0 #c5a974`,
              fontWeight: 800,
            }}
          >
            {isKa ? "მთელი კოლექცია" : "View the full drop"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Bottom decorative band */}
      <div
        className="absolute inset-x-0 bottom-0 h-2"
        style={{
          background:
            "repeating-linear-gradient(90deg, #f3b62b 0 18px, #fef0d6 18px 36px)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}

function MirrorCard({
  product,
  frame,
  index,
  isKa,
}: {
  product: StorefrontProduct;
  frame: (typeof FRAMES)[number];
  index: number;
  isKa: boolean;
}) {
  const [hover, setHover] = useState(false);
  // Lighter alternating offset so cards no longer feel half a screen apart.
  const offsetY = index % 2 === 0 ? 0 : 14;
  const hasBack = Boolean(product.image_back);
  const isNew = product.tags.includes("new");

  // Outer organic blob path — the visible silhouette of the whole frame.
  const outerPath = useMemo(
    () =>
      blobPath(
        frame.points,
        frame.rx,
        frame.ry,
        frame.variance,
        200,
        250,
        frame.seed
      ),
    [frame]
  );

  // Inner blob — same shape with a tighter ellipse so a coloured ring is
  // visible around the photo. Clipped on the <image> below so the photo's
  // rectangular corners disappear inside the blob's curves.
  const innerPath = useMemo(
    () =>
      blobPath(
        frame.points,
        frame.rx - 14,
        frame.ry - 14,
        frame.variance,
        200,
        250,
        frame.seed
      ),
    [frame]
  );

  // Stable, unique id for the SVG clipPath element.
  const clipId = `scallop-${frame.name}-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.85,
        delay: 0.2 + index * 0.1,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      style={{ marginTop: offsetY }}
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
        {/* The whole frame is one SVG: the colourful curly matte sits underneath
            and the product photo is rendered as <image> on top, clipped to the
            same scallop shape (slightly smaller). The corners of a rectangular
            photo never show — they're tucked inside the scallop's curves. */}
        <svg
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 18px 22px rgba(42,29,20,0.25))" }}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={innerPath} />
            </clipPath>
          </defs>

          {/* Outer matte — the visible curly colour ring */}
          <path d={outerPath} fill={frame.color} />

          {/* Front photo, clipped to the inner scallop. Rectangular source,
              curly visible shape — corners hidden by the clip. */}
          <image
            href={product.image_front}
            x="0"
            y="0"
            width="400"
            height="500"
            preserveAspectRatio="xMidYMid meet"
            clipPath={`url(#${clipId})`}
            style={{
              filter: "saturate(0.96) sepia(0.04)",
              opacity: hover && hasBack ? 0 : 1,
              transition: "opacity 0.6s ease",
            }}
          />

          {/* Back photo (revealed on hover) */}
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
                filter: "saturate(0.96) sepia(0.04)",
                opacity: hover ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            />
          )}
        </svg>

        {/* New badge */}
        {isNew && (
          <span
            className="absolute -top-3 left-2 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em] z-10"
            style={{
              background: C.mustard,
              color: C.ink,
              fontFamily: FRAUNCES,
              transform: "rotate(-6deg)",
              boxShadow: "0 3px 0 #d99820",
              borderRadius: 999,
            }}
          >
            {isKa ? "ახალი" : "New"}
          </span>
        )}

        {/* Hover hint */}
        {hasBack && (
          <div
            className="absolute -bottom-3 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full z-10"
            style={{
              background: hover ? C.mustard : C.cream,
              color: C.ink,
              fontFamily: FRAUNCES,
              transition: "background 0.3s ease, transform 0.3s ease",
              transform: hover ? "rotate(0deg)" : "rotate(-4deg)",
              boxShadow: "0 4px 8px rgba(42,29,20,0.18)",
            }}
          >
            <RotateCw className="w-3 h-3" />
            {hover ? (isKa ? "უკანა მხარე" : "back side") : (isKa ? "გადმოატარე" : "hover")}
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mt-8 text-center max-w-65">
        <div
          className="text-[10px] uppercase tracking-[0.3em] mb-1"
          style={{ color: C.mustard, fontFamily: FRAUNCES, fontWeight: 700 }}
        >
          {[product.size, product.color].filter(Boolean).join(" · ") ||
            (isKa ? "ხელით ნაკერი" : "Handmade")}
        </div>
        <Link
          href={`#product-${product.id}`}
          className="leading-tight hover:underline underline-offset-4 decoration-1"
          style={{
            fontFamily: FRAUNCES,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 22,
            color: C.cream,
          }}
        >
          {product.name || product.code}
        </Link>
        <div
          className="mt-1"
          style={{
            fontFamily: PACIFICO,
            fontSize: 26,
            color: C.mustard,
          }}
        >
          {product.price}
          {product.currency === "GEL" ? "₾" : ` ${product.currency}`}
        </div>
      </div>
    </motion.div>
  );
}
