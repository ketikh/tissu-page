"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
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
 * Vintage-mirror frame variants. Each has its own organic border-radius
 * (creating the curvy, hand-cut shape) and a frame colour that paints a
 * slightly larger same-shape backdrop behind the photo, so it reads like
 * a colourful matte around a mirror.
 *
 * border-radius syntax with `/` lets the corners curve asymmetrically
 * — first set is horizontal radii, second is vertical.
 */
const FRAMES = [
  // 1. Cathedral arch — rounded top, gentle bottom corners (looks like a vintage hallway mirror)
  {
    name: "arch",
    radius: "55% 55% 18% 18% / 38% 38% 14% 14%",
    aspectRatio: "4 / 5",
    color: C.green,
    rotate: -2,
  },
  // 2. Soft oval — vertical capsule, classic vanity mirror
  {
    name: "oval",
    radius: "50%",
    aspectRatio: "4 / 5",
    color: C.mustard,
    rotate: 2,
  },
  // 3. Asymmetric blob — wonky organic outline (like blown glass)
  {
    name: "blob",
    radius: "62% 38% 55% 45% / 48% 60% 40% 52%",
    aspectRatio: "1 / 1",
    color: C.peach,
    rotate: -1.5,
  },
  // 4. Squircle / cushion — rounded square with soft sides
  {
    name: "cushion",
    radius: "32% / 28%",
    aspectRatio: "1 / 1",
    color: C.lilac,
    rotate: 2.5,
  },
  // 5. (extra) Wide oval lying on its side
  {
    name: "horizontalOval",
    radius: "45% 55% 50% 50% / 60% 60% 50% 50%",
    aspectRatio: "5 / 4",
    color: C.cobalt,
    rotate: -2,
  },
  // 6. (extra) Wavy bottom mirror
  {
    name: "wave",
    radius: "30% 30% 50% 50% / 25% 25% 60% 60%",
    aspectRatio: "4 / 5",
    color: C.burnt,
    rotate: 1.5,
  },
];

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
        <div className="text-center mb-16 md:mb-20">
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

        {/* 4 mirrors — each in its own organic frame.  Generous gap so the
            colourful frames have room to breathe. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-20 md:gap-y-28 max-w-3xl mx-auto">
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
      {/* Frame stack: outer coloured matte + inner photo, both shaped */}
      <div
        className="relative w-full max-w-[300px] cursor-pointer"
        style={{
          aspectRatio: frame.aspectRatio,
          transform: `rotate(${frame.rotate}deg)`,
          transition: "transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1)",
        }}
      >
        {/* Coloured matte / frame, slightly larger than photo */}
        <div
          aria-hidden="true"
          className="absolute -inset-3 sm:-inset-3.5"
          style={{
            background: frame.color,
            borderRadius: frame.radius,
            boxShadow: "0 18px 28px rgba(42,29,20,0.25), inset 0 0 0 4px rgba(254,240,214,0.55)",
          }}
        />

        {/* Photo, same shape, sits on top of the matte */}
        <div
          className="relative w-full h-full overflow-hidden"
          style={{ borderRadius: frame.radius }}
        >
          {/* FRONT */}
          <Image
            src={product.image_front}
            alt={product.name || product.code}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover"
            style={{
              filter: "saturate(0.95) sepia(0.04)",
              opacity: hover && hasBack ? 0 : 1,
              transition: "opacity 0.6s ease",
            }}
          />

          {/* BACK — fades in on hover */}
          {hasBack && (
            <Image
              src={product.image_back!}
              alt={`${product.name || product.code} — back`}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className="object-cover"
              style={{
                filter: "saturate(0.95) sepia(0.04)",
                opacity: hover ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            />
          )}
        </div>

        {/* New badge — sticks above the frame */}
        {isNew && (
          <span
            className="absolute -top-3 left-3 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em] z-10"
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

        {/* Flip indicator on hover */}
        {hasBack && (
          <div
            className="absolute -bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full z-10"
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

      {/* Caption — small mustard line + italic name + script price */}
      <div className="mt-8 text-center max-w-[260px]">
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
