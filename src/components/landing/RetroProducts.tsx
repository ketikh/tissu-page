"use client";

import Image from "next/image";
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
 * Builds a closed scalloped/flower SVG path centred at (cx, cy) with
 * `bumps` outward Q-curves around a base radius.
 *
 * - bumps    — how many petals/scallops around the perimeter (more = curlier)
 * - baseR    — radius of the inner valley (where the bumps "start")
 * - bumpH    — how far each bump pokes out past baseR
 * - jitter   — 0..1: when > 0, alternates bump heights for an asymmetric, hand-cut feel
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
      // Sin-based wobble so neighbouring bumps differ slightly when jitter > 0
      const h = bumpH * (1 + (jitter ? Math.sin(i * 7.3) * jitter : 0));
      const mx = cx + (baseR + h) * Math.cos(midA);
      const my = cy + (baseR + h) * Math.sin(midA);
      d += `Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  }
  return d + "Z";
}

/**
 * Each frame defines:
 *   - path config that drives the scalloped matte behind the photo
 *   - colour of that matte
 *   - the "inner shape" of the photo itself (kept simple so the bag stays clear)
 */
const FRAMES = [
  {
    name: "daisy",
    color: C.green,
    bumps: 14,
    baseR: 175,
    bumpH: 16,
    jitter: 0,
    rotate: -2,
    photoShape: "ellipse(46% 56% at 50% 50%)", // tall oval
  },
  {
    name: "mushroom",
    color: C.mustard,
    bumps: 9,
    baseR: 175,
    bumpH: 24,
    jitter: 0,
    rotate: 2,
    photoShape: "ellipse(48% 56% at 50% 50%)",
  },
  {
    name: "tight-scallop",
    color: C.peach,
    bumps: 22,
    baseR: 180,
    bumpH: 9,
    jitter: 0,
    rotate: -1.5,
    photoShape: "circle(46% at 50% 50%)",
  },
  {
    name: "wonky",
    color: C.lilac,
    bumps: 11,
    baseR: 175,
    bumpH: 22,
    jitter: 0.25,
    rotate: 2.5,
    photoShape: "ellipse(48% 50% at 50% 50%)",
  },
  {
    name: "wavy",
    color: C.cobalt,
    bumps: 16,
    baseR: 178,
    bumpH: 14,
    jitter: 0.15,
    rotate: -2,
    photoShape: "ellipse(46% 54% at 50% 50%)",
  },
  {
    name: "sunflower",
    color: C.burnt,
    bumps: 18,
    baseR: 175,
    bumpH: 18,
    jitter: 0,
    rotate: 1.5,
    photoShape: "circle(46% at 50% 50%)",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-24 md:gap-y-28 max-w-3xl mx-auto">
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
  const offsetY = index % 2 === 0 ? 0 : 36;
  const hasBack = Boolean(product.image_back);
  const isNew = product.tags.includes("new");

  // Outer scalloped matte path. Inner ring = same path one bump shorter for a
  // double-frame look (like an enamel inset on a vintage mirror).
  const outerPath = useMemo(
    () => flowerPath(frame.bumps, frame.baseR, frame.bumpH, 200, 250, frame.jitter),
    [frame]
  );
  const innerPath = useMemo(
    () =>
      flowerPath(
        frame.bumps,
        frame.baseR - frame.bumpH * 0.7,
        frame.bumpH * 0.55,
        200,
        250,
        frame.jitter
      ),
    [frame]
  );

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
      {/* Card stack: scalloped SVG matte → centred photo cutout */}
      <div
        className="relative w-full max-w-80 cursor-pointer"
        style={{
          aspectRatio: "4 / 5",
          transform: `rotate(${frame.rotate}deg)`,
          transition: "transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1)",
        }}
      >
        {/* Scalloped matte — fills the card. The two paths form a double-ring
            "frame" so the inside rim reads as a separate enamel detail. */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid meet"
          style={{
            filter: "drop-shadow(0 18px 22px rgba(42,29,20,0.25))",
          }}
          aria-hidden="true"
        >
          <path d={outerPath} fill={frame.color} />
          <path d={innerPath} fill="none" stroke={C.cream} strokeWidth={4} opacity={0.55} />
        </svg>

        {/* Photo — small, centered, with a SIMPLE shape so the bag itself
            stays clearly visible. The scallops are the matte's job, not the
            photo's. */}
        <div
          className="absolute inset-[18%] overflow-hidden"
          style={{
            clipPath: frame.photoShape,
            WebkitClipPath: frame.photoShape,
          }}
        >
          <Image
            src={product.image_front}
            alt={product.name || product.code}
            fill
            sizes="(max-width: 640px) 240px, 280px"
            className="object-cover"
            style={{
              filter: "saturate(0.96) sepia(0.04)",
              opacity: hover && hasBack ? 0 : 1,
              transition: "opacity 0.6s ease",
            }}
          />
          {hasBack && (
            <Image
              src={product.image_back!}
              alt={`${product.name || product.code} — back`}
              fill
              sizes="(max-width: 640px) 240px, 280px"
              className="object-cover"
              style={{
                filter: "saturate(0.96) sepia(0.04)",
                opacity: hover ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            />
          )}
        </div>

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
