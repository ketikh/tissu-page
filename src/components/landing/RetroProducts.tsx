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
  /** How many products to spotlight on the landing — keep this small. */
  limit?: number;
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  mustard: "#f3b62b",
  burnt: "#d56826",
  ink: "#2a1d14",
};

export default function RetroProducts({
  isKa = false,
  shopHref = "/shop",
  products,
  limit = 4,
}: RetroProductsProps) {
  // Pick a small editorial selection — featured-ish picks rather than the whole grid.
  const showcase = products
    .filter((p) => Boolean(p.image_front))
    .slice(0, Math.min(limit, 6));

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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
            style={{ color: C.mustard }}
          >
            {isKa ? "გაზაფხულის კოლექცია" : "Spring drop · curated few"}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
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
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-3 max-w-md mx-auto"
            style={{
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              opacity: 0.85,
              fontSize: 16,
            }}
          >
            {isKa
              ? "გადმოიტანე კურსორი — და ჩანთა შენთვის უცებ სხვა ხდება."
              : "Hover the photo — the bag turns into a whole other thing."}
          </motion.p>
        </div>

        {/* Editorial 2-column flow.  Each row offsets vertically for that
            magazine-spread feel. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-16 md:gap-y-24 max-w-4xl mx-auto">
          {showcase.map((p, i) => (
            <EditorialCard
              key={p.id}
              product={p}
              index={i}
              isKa={isKa}
            />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
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

/* Editorial-style card.
 * - No box, no border, no shadow on the card itself — just the photo and text.
 * - Slight rotation per index gives that "scrapbook / magazine cutout" feel.
 * - Hover cross-fades to image_back if it exists. */
function EditorialCard({
  product,
  index,
  isKa,
}: {
  product: StorefrontProduct;
  index: number;
  isKa: boolean;
}) {
  const [hover, setHover] = useState(false);
  const tilt = [-2, 2, -1.5, 2.5][index % 4] ?? 0;
  const offsetY = index % 2 === 0 ? 0 : 32; // every other card sits a bit lower

  const hasBack = Boolean(product.image_back);
  const isNew = product.tags.includes("new");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, delay: index * 0.08, ease: [0.215, 0.61, 0.355, 1] }}
      style={{ marginTop: offsetY }}
      className="group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover((v) => !v)}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden cursor-pointer"
        style={{
          transform: `rotate(${tilt}deg)`,
          transition: "transform 0.6s ease",
        }}
      >
        {/* FRONT */}
        <Image
          src={product.image_front}
          alt={product.name || product.code}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
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
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            style={{
              filter: "saturate(0.95) sepia(0.04)",
              opacity: hover ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          />
        )}

        {/* New badge */}
        {isNew && (
          <span
            className="absolute top-4 left-4 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em]"
            style={{
              background: C.mustard,
              color: C.ink,
              fontFamily: FRAUNCES,
              transform: "rotate(-4deg)",
              boxShadow: "0 3px 0 #d99820",
            }}
          >
            {isKa ? "ახალი" : "New"}
          </span>
        )}

        {/* Flip hint — fades when hovered (or out when no back) */}
        {hasBack && (
          <div
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full"
            style={{
              background: hover ? C.mustard : "rgba(254,240,214,0.92)",
              color: C.ink,
              fontFamily: FRAUNCES,
              transition: "background 0.3s ease",
            }}
          >
            <RotateCw className="w-3 h-3" />
            {hover ? (isKa ? "უკანა მხარე" : "back side") : (isKa ? "დააჭირე" : "hover")}
          </div>
        )}
      </div>

      {/* Caption strip — just italic name + script price, no box */}
      <div className="mt-5 flex items-baseline justify-between gap-4 px-1">
        <Link
          href={`#product-${product.id}`}
          className="leading-tight hover:underline underline-offset-4 decoration-[1px]"
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
        <span
          style={{
            fontFamily: PACIFICO,
            fontSize: 26,
            color: C.mustard,
          }}
        >
          {product.price}
          {product.currency === "GEL" ? "₾" : ` ${product.currency}`}
        </span>
      </div>

      {/* Sub-caption */}
      <div
        className="mt-1 px-1 text-[11px] uppercase tracking-[0.18em]"
        style={{ color: C.cream, opacity: 0.75, fontFamily: FRAUNCES, fontWeight: 700 }}
      >
        {[product.size, product.color].filter(Boolean).join(" · ") ||
          (isKa ? "ხელით ნაკერი · ორმხრივი" : "Handmade · reversible")}
      </div>
    </motion.div>
  );
}
