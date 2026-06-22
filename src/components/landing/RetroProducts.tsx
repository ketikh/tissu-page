"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import type { StorefrontProduct } from "@/lib/admin-api";
import {
  type PhotoPosition,
  type PhotoPositions,
  buildHomePhotoTransform,
  buildHomeBackPhotoTransform,
  isHomeFeatured,
} from "@/lib/shop-photo-positions";
import { cloudinaryThumb } from "@/lib/cloudinary";

interface RetroProductsProps {
  isKa?: boolean;
  shopHref?: string;
  /** Locale prefix used when linking to individual product pages (e.g. "en" or "ka"). */
  lang?: string;
  products: StorefrontProduct[];
  /** Spotlight only a few; max 6. */
  limit?: number;
  photoPositions?: PhotoPositions;
  /** CMS overrides (home → "products_grid" section). Empty keeps the defaults. */
  titleOverride?: string;
  subOverride?: string;
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

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

/* ---------- Path generators (3 styles in the same family) ---------- */

// Deterministic 0..1 noise from a sine hash.
function seedNoise(i: number, seed: number): number {
  const n = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Flower / scalloped path — closed loop of `bumps` outward Q-curves around
 * `baseR`. Big chunky petals with high `bumpH`, fine frill with low `bumpH`.
 */
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

/**
 * Smooth organic blob — points placed at varying radii on an ellipse,
 * connected by Q-curves through midpoints. rx<ry = tall, rx>ry = wide.
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

/**
 * Paint-drip rectangle. The drips are placed on one of the four edges
 * (`side`); the two corners on the *opposite* edge get rounded (`cornerR`)
 * so the silhouette feels intentional rather than a raw cut-out rectangle.
 *
 * - side="bottom" → drips drop *down*, rounded top corners.
 * - side="top"    → drips rise *up*, rounded bottom corners.
 * - side="left"   → drips reach *left*, rounded right corners.
 * - side="right"  → drips reach *right*, rounded left corners.
 */
function dripPath(
  bodyW: number,
  bodyH: number,
  drips: number,
  minDepth: number,
  maxDepth: number,
  cornerR: number,
  side: "top" | "bottom" | "left" | "right",
  cx = 200,
  cy = 250,
  seed = 0
): string {
  const halfW = bodyW / 2;
  const halfH = bodyH / 2;
  const top = cy - halfH;
  const left = cx - halfW;
  const right = cx + halfW;
  const bot = cy + halfH;
  // Drips iterate along the perpendicular edge: top/bottom drips slide
  // along X, left/right drips slide along Y.
  const isHorizontal = side === "top" || side === "bottom";
  const slot = (isHorizontal ? bodyW : bodyH) / drips;
  const r = Math.min(cornerR, halfW * 0.5, halfH * 0.5);
  const bulge = slot * 0.32;

  const dripCurve = (
    edgeY: number,
    fromX: number,
    toX: number,
    midX: number,
    apexY: number,
    bulge: number,
    halfDepthY: number
  ) => {
    let s = `C ${fromX.toFixed(1)} ${halfDepthY.toFixed(1)}, `;
    s += `${(midX + Math.sign(toX - fromX) * -bulge).toFixed(1)} ${apexY.toFixed(1)}, `;
    s += `${midX.toFixed(1)} ${apexY.toFixed(1)} `;
    s += `C ${(midX - Math.sign(toX - fromX) * -bulge).toFixed(1)} ${apexY.toFixed(1)}, `;
    s += `${toX.toFixed(1)} ${halfDepthY.toFixed(1)}, `;
    s += `${toX.toFixed(1)} ${edgeY.toFixed(1)} `;
    return s;
  };

  let d = "";

  if (side === "bottom") {
    // Rounded top corners → flat sides → drips along the bottom edge
    d += `M ${(left + r).toFixed(1)} ${top.toFixed(1)} `;
    d += `L ${(right - r).toFixed(1)} ${top.toFixed(1)} `;
    d += `A ${r} ${r} 0 0 1 ${right.toFixed(1)} ${(top + r).toFixed(1)} `;
    d += `L ${right.toFixed(1)} ${bot.toFixed(1)} `;

    // Drips from right to left
    for (let i = drips - 1; i >= 0; i--) {
      const dripRight = left + (i + 1) * slot;
      const dripLeft = left + i * slot;
      const dripMid = (dripLeft + dripRight) / 2;
      const depth = minDepth + seedNoise(i, seed) * (maxDepth - minDepth);
      const apex = bot + depth;
      const halfDepthY = bot + depth * 0.55;
      d += dripCurve(bot, dripRight, dripLeft, dripMid, apex, bulge, halfDepthY);
    }

    d += `L ${left.toFixed(1)} ${(top + r).toFixed(1)} `;
    d += `A ${r} ${r} 0 0 1 ${(left + r).toFixed(1)} ${top.toFixed(1)} `;
    d += `Z`;
  } else if (side === "top") {
    // Drips along the top edge → flat sides → rounded bottom corners
    d += `M ${left.toFixed(1)} ${top.toFixed(1)} `;

    // Drips from left to right
    for (let i = 0; i < drips; i++) {
      const dripLeft = left + i * slot;
      const dripRight = left + (i + 1) * slot;
      const dripMid = (dripLeft + dripRight) / 2;
      const depth = minDepth + seedNoise(i, seed) * (maxDepth - minDepth);
      const apex = top - depth;
      const halfDepthY = top - depth * 0.55;
      d += dripCurve(top, dripLeft, dripRight, dripMid, apex, bulge, halfDepthY);
    }

    d += `L ${right.toFixed(1)} ${(bot - r).toFixed(1)} `;
    d += `A ${r} ${r} 0 0 1 ${(right - r).toFixed(1)} ${bot.toFixed(1)} `;
    d += `L ${(left + r).toFixed(1)} ${bot.toFixed(1)} `;
    d += `A ${r} ${r} 0 0 1 ${left.toFixed(1)} ${(bot - r).toFixed(1)} `;
    d += `Z`;
  } else if (side === "left") {
    // Drips along the LEFT edge (reaching leftward) → rounded right corners.
    // CW traverse: top edge → top-right corner → right side → bottom-right
    // corner → bottom edge → drips bottom→top up the left side → close.
    d += `M ${left.toFixed(1)} ${top.toFixed(1)} `;
    d += `L ${(right - r).toFixed(1)} ${top.toFixed(1)} `;
    d += `A ${r} ${r} 0 0 1 ${right.toFixed(1)} ${(top + r).toFixed(1)} `;
    d += `L ${right.toFixed(1)} ${(bot - r).toFixed(1)} `;
    d += `A ${r} ${r} 0 0 1 ${(right - r).toFixed(1)} ${bot.toFixed(1)} `;
    d += `L ${left.toFixed(1)} ${bot.toFixed(1)} `;

    // Drips iterate bottom-to-top so we end where we started.
    for (let i = drips - 1; i >= 0; i--) {
      const dripTop = top + i * slot;
      const dripBot = top + (i + 1) * slot;
      const dripMid = (dripTop + dripBot) / 2;
      const depth = minDepth + seedNoise(i, seed) * (maxDepth - minDepth);
      const apexX = left - depth;
      const halfDepthX = left - depth * 0.55;

      // (left, dripBot) → apex (apexX, dripMid) → (left, dripTop)
      d += `C ${halfDepthX.toFixed(1)} ${dripBot.toFixed(1)}, `;
      d += `${apexX.toFixed(1)} ${(dripMid + bulge).toFixed(1)}, `;
      d += `${apexX.toFixed(1)} ${dripMid.toFixed(1)} `;
      d += `C ${apexX.toFixed(1)} ${(dripMid - bulge).toFixed(1)}, `;
      d += `${halfDepthX.toFixed(1)} ${dripTop.toFixed(1)}, `;
      d += `${left.toFixed(1)} ${dripTop.toFixed(1)} `;
    }
    d += `Z`;
  } else {
    // side === "right" — drips reach RIGHTWARD → rounded left corners.
    // CW: start top-left (just past corner), across top, drips down right
    // side, across bottom, up left side with rounded corners.
    d += `M ${(left + r).toFixed(1)} ${top.toFixed(1)} `;
    d += `L ${right.toFixed(1)} ${top.toFixed(1)} `;

    // Drips iterate top-to-bottom along the right edge.
    for (let i = 0; i < drips; i++) {
      const dripTop = top + i * slot;
      const dripBot = top + (i + 1) * slot;
      const dripMid = (dripTop + dripBot) / 2;
      const depth = minDepth + seedNoise(i, seed) * (maxDepth - minDepth);
      const apexX = right + depth;
      const halfDepthX = right + depth * 0.55;

      // (right, dripTop) → apex (apexX, dripMid) → (right, dripBot)
      d += `C ${halfDepthX.toFixed(1)} ${dripTop.toFixed(1)}, `;
      d += `${apexX.toFixed(1)} ${(dripMid - bulge).toFixed(1)}, `;
      d += `${apexX.toFixed(1)} ${dripMid.toFixed(1)} `;
      d += `C ${apexX.toFixed(1)} ${(dripMid + bulge).toFixed(1)}, `;
      d += `${halfDepthX.toFixed(1)} ${dripBot.toFixed(1)}, `;
      d += `${right.toFixed(1)} ${dripBot.toFixed(1)} `;
    }

    d += `L ${(left + r).toFixed(1)} ${bot.toFixed(1)} `;
    d += `A ${r} ${r} 0 0 1 ${left.toFixed(1)} ${(bot - r).toFixed(1)} `;
    d += `L ${left.toFixed(1)} ${(top + r).toFixed(1)} `;
    d += `A ${r} ${r} 0 0 1 ${(left + r).toFixed(1)} ${top.toFixed(1)} `;
    d += `Z`;
  }

  return d;
}

/** Rounded rectangle path — used as the inner clip for drip frames so the
 *  photo stays cleanly inside the body and the drips are pure matte. */
function roundedRectPath(
  width: number,
  height: number,
  cx = 200,
  cy = 250,
  radius = 8
): string {
  const x = cx - width / 2;
  const y = cy - height / 2;
  return [
    `M ${x + radius} ${y}`,
    `h ${width - 2 * radius}`,
    `a ${radius} ${radius} 0 0 1 ${radius} ${radius}`,
    `v ${height - 2 * radius}`,
    `a ${radius} ${radius} 0 0 1 ${-radius} ${radius}`,
    `h ${-(width - 2 * radius)}`,
    `a ${radius} ${radius} 0 0 1 ${-radius} ${-radius}`,
    `v ${-(height - 2 * radius)}`,
    `a ${radius} ${radius} 0 0 1 ${radius} ${-radius}`,
    "Z",
  ].join(" ");
}

/**
 * Each frame defines:
 *   - path config that drives the scalloped matte behind the photo
 *   - colour of that matte
 *   - the "inner shape" of the photo itself (kept simple so the bag stays clear)
 */
// Each frame uses a different SHAPE FAMILY: chunky flower petals, paint drips,
// organic blobs, and fine scallop frills. Variety is intentional — the four
// product cards should each feel distinct, not four versions of the same idea.
type FlowerSpec = {
  kind: "flower";
  bumps: number;
  baseR: number;
  bumpH: number;
  jitter?: number;
};
type BlobSpec = {
  kind: "blob";
  points: number;
  rx: number;
  ry: number;
  variance: number;
  seed: number;
};
type DripSpec = {
  kind: "drip";
  bodyW: number;
  bodyH: number;
  drips: number;
  minDepth: number;
  maxDepth: number;
  cornerR: number;
  side: "top" | "bottom" | "left" | "right";
  seed: number;
};
type FrameSpec = FlowerSpec | BlobSpec | DripSpec;

export interface Frame {
  name: string;
  color: string;
  rotate: number;
  spec: FrameSpec;
}

// Each card uses the same paint-drip family but the drips emerge from a
// different edge. Drip count + depth profile + corner radius are tuned so
// the four feel related but visually distinct. (4 sides: L, B, T, R.)
export const FRAMES: readonly Frame[] = [
  // #1 — drips reaching out to the LEFT.
  {
    name: "drip-left",
    color: C.green,
    rotate: -3,
    spec: {
      kind: "drip",
      bodyW: 300,
      bodyH: 340,
      drips: 5,
      minDepth: 16,
      maxDepth: 42,
      cornerR: 26,
      side: "left",
      seed: 41,
    },
  },
  // #2 — drips dropping DOWN from the bottom.
  {
    name: "drip-bottom",
    color: C.lilac,
    rotate: 3,
    spec: {
      kind: "drip",
      bodyW: 320,
      bodyH: 320,
      drips: 7,
      minDepth: 16,
      maxDepth: 70,
      cornerR: 22,
      side: "bottom",
      seed: 9,
    },
  },
  // #3 — fewer, gentler drips coming DOWN from above.
  {
    name: "drip-top",
    color: C.peach,
    rotate: -2,
    spec: {
      kind: "drip",
      bodyW: 320,
      bodyH: 320,
      drips: 4,
      minDepth: 22,
      maxDepth: 60,
      cornerR: 22,
      side: "top",
      seed: 23,
    },
  },
  // #4 — drips reaching out to the RIGHT.
  {
    name: "drip-right",
    color: C.mustard,
    rotate: 4,
    spec: {
      kind: "drip",
      bodyW: 300,
      bodyH: 340,
      drips: 6,
      minDepth: 12,
      maxDepth: 42,
      cornerR: 26,
      side: "right",
      seed: 53,
    },
  },
] as const;

export function buildOuterPath(spec: FrameSpec): string {
  switch (spec.kind) {
    case "flower":
      return flowerPath(spec.bumps, spec.baseR, spec.bumpH, 200, 250, spec.jitter ?? 0);
    case "blob":
      return blobPath(spec.points, spec.rx, spec.ry, spec.variance, 200, 250, spec.seed);
    case "drip":
      return dripPath(
        spec.bodyW,
        spec.bodyH,
        spec.drips,
        spec.minDepth,
        spec.maxDepth,
        spec.cornerR,
        spec.side,
        200,
        250,
        spec.seed
      );
  }
}

export function buildInnerPath(spec: FrameSpec): string {
  switch (spec.kind) {
    case "flower":
      return flowerPath(
        spec.bumps,
        spec.baseR - 12,
        Math.max(spec.bumpH - 3, 4),
        200,
        250,
        spec.jitter ?? 0
      );
    case "blob":
      return blobPath(
        spec.points,
        spec.rx - 14,
        spec.ry - 14,
        spec.variance,
        200,
        250,
        spec.seed
      );
    case "drip":
      // Photo stays in a clean rounded rectangle inside the body — drips are
      // pure decorative matte underneath.
      return roundedRectPath(spec.bodyW - 28, spec.bodyH - 28, 200, 250, 10);
  }
}

export default function RetroProducts({
  isKa = false,
  shopHref = "/shop",
  lang,
  products,
  limit = 4,
  photoPositions = {},
  titleOverride,
  subOverride,
}: RetroProductsProps) {
  /* Derive lang from shopHref when not passed (e.g. "/en/shop" → "en") so legacy callers still get working links. */
  const resolvedLang = lang ?? shopHref.split("/").filter(Boolean)[0] ?? "en";
  const headingTitle = (titleOverride || "").trim();
  const headingSub = (subOverride || "").trim();

  // This is the laptop-cases section ("ერთი ჩანთა ორი განწყობა"). Only
  // laptop-cases the admin ticked "show on home" appear here — no fallback, so
  // if nothing is ticked the whole section simply doesn't render.
  const showcase = products
    .filter((p) => Boolean(p.image_front) && p.category === "laptop-cases" && isHomeFeatured(photoPositions[p.id]))
    .slice(0, Math.min(limit, FRAMES.length));

  if (showcase.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden py-16 md:py-20"
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
        <div className="text-center mb-3 md:mb-4">
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
            style={{ color: C.mustard }}
          >
            {headingSub
              ? headingSub
              : isKa
              ? "ორმხრივი ჩანთები მათთვის, ვისაც ცვალებადი ხასიათი აქვს"
              : "Reversible bags for the ever-changing mood"}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="font-retro-display mt-4 leading-[0.95] whitespace-nowrap"
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(28px, 4.5vw, 56px)",
              color: C.cream,
            }}
          >
            {headingTitle ? headingTitle : isKa ? "ერთი ჩანთა ორი განწყობა" : "One bag, two moods"}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 md:gap-y-6 max-w-2xl mx-auto">
          {showcase.map((p, i) => (
            <MirrorCard
              key={p.id}
              product={p}
              frame={FRAMES[i % FRAMES.length]}
              index={i}
              isKa={isKa}
              lang={resolvedLang}
              position={photoPositions[p.id]}
            />
          ))}
        </div>

        <div className="mt-10 md:mt-14 flex justify-center">
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
            {isKa ? "ჩანთების ნახვა" : "Shop all bags"}
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
  lang,
  position,
}: {
  product: StorefrontProduct;
  frame: Frame;
  index: number;
  isKa: boolean;
  lang: string;
  position?: PhotoPosition;
}) {
  const [hover, setHover] = useState(false);
  // No alternating offset — keeps the rows visually compact.
  const offsetY = 0;
  const hasBack = Boolean(product.image_back);

  // Outer silhouette of the frame and inner shape used to clip the photo.
  // Style is dispatched on `frame.spec.kind` (flower / blob / drip).
  const outerPath = useMemo(() => buildOuterPath(frame.spec), [frame]);
  const innerPath = useMemo(() => buildInnerPath(frame.spec), [frame]);

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
    >
      <Link
        href={`/${lang}/product/${product.id}`}
        className="relative w-full max-w-80 cursor-pointer block"
        aria-label={product.name || product.code}
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

          {/* Photo group — wrapped in the clip so the per-product zoom/x/y
              transform can never overflow the scallop. The transform is
              centred for a 400×500 viewBox (different from /shop's 400×400). */}
          <g clipPath={`url(#${clipId})`}>
            <image
              href={cloudinaryThumb(product.image_front, 700)}
              x="0"
              y="0"
              width="400"
              height="500"
              preserveAspectRatio="xMidYMid meet"
              transform={buildHomePhotoTransform(position)}
              style={{
                filter: "saturate(0.96) sepia(0.04)",
                opacity: hover && hasBack ? 0 : 1,
                transition: "opacity 0.6s ease",
              }}
            />

            {hasBack && (
              <image
                href={cloudinaryThumb(product.image_back!, 700)}
                x="0"
                y="0"
                width="400"
                height="500"
                preserveAspectRatio="xMidYMid meet"
                transform={buildHomeBackPhotoTransform(position)}
                style={{
                  filter: "saturate(0.96) sepia(0.04)",
                  opacity: hover ? 1 : 0,
                  transition: "opacity 0.6s ease",
                }}
              />
            )}
          </g>
        </svg>

        {/* "New" badge removed — agent's admin panel owns product tags. */}

        {/* Flip button — hover or click to reveal the back photo */}
        {hasBack && (
          <button
            type="button"
            aria-label={isKa ? "გადმოატრიალე" : "Flip"}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={(e) => {
              // The button sits inside the product <Link>; just stop it from
              // navigating. Flipping is driven purely by hover so the click no
              // longer fights the hover state (which used to make it stick).
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute -bottom-3 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full z-10"
            style={{
              background: hover ? C.mustard : C.cream,
              color: C.ink,
              fontFamily: FRAUNCES,
              transition: "background 0.3s ease, transform 0.3s ease",
              transform: hover ? "rotate(0deg)" : "rotate(-4deg)",
              boxShadow: "0 4px 8px rgba(42,29,20,0.18)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <RotateCw className="w-3 h-3" />
            {hover ? (isKa ? "უკანა მხარე" : "back side") : (isKa ? "გადმოატრიალე" : "flip")}
          </button>
        )}
      </Link>

      {/* Caption */}
      <div className="mt-5 text-center max-w-65">
        <Link
          href={`/${lang}/product/${product.id}`}
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
