"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { StorefrontProduct } from "@/lib/admin-api";
import { cloudinaryThumb } from "@/lib/cloudinary";
import { isHomeFeatured, buildHomePhotoTransform, type PhotoPositions } from "@/lib/shop-photo-positions";

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

const C = {
  cream: "#fef0d6",
  green: "#3f6f56",
  ink: "#2a1d14",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
};

interface RetroFeaturedProps {
  isKa?: boolean;
  lang: string;
  products: StorefrontProduct[];
  /** Per-product "show on home" flags. Any ticked product that is not a
   *  laptop-case or a necklace lands in this section. */
  photoPositions?: PhotoPositions;
  /** CMS title override (home → "featured"). */
  titleOverride?: string;
}

/** "Featured products" — exactly 3 in one row, hand-picked from the admin.
 *  Falls back to a category-spanning sample so the row is never empty. */
export default function RetroFeatured({ isKa = false, lang, products, photoPositions = {}, titleOverride }: RetroFeaturedProps) {
  // Everything ticked "show on home" that isn't a laptop-case or a necklace
  // (those have their own sections) shows here — up to 3, in one row.
  const picks = useMemo(
    () =>
      products
        .filter(
          (p) =>
            Boolean(p.image_front) &&
            isHomeFeatured(photoPositions[p.id]) &&
            p.category !== "laptop-cases" &&
            p.category !== "necklace",
        )
        .slice(0, 3),
    [products, photoPositions],
  );

  if (picks.length === 0) return null;

  const title = (titleOverride || "").trim() || (isKa ? "გამორჩეული პროდუქტები" : "Featured products");

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-20" style={{ background: C.green, color: C.cream }}>
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <h2
            className="leading-[1.05]"
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(26px, 4.2vw, 50px)",
              color: C.cream,
            }}
          >
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
          {picks.map((p) => {
            const name = p.name || p.code;
            const soldOut = !p.in_stock;
            return (
              <Link key={p.id} href={`/${lang}/product/${p.id}`} className="group block">
                <div className="relative overflow-hidden" style={{ borderRadius: 16, background: C.cream, aspectRatio: "1 / 1" }}>
                  {p.image_front && (
                    // SVG render (not <img>) so the admin's home photo position
                    // (zoom/pan) applies inside this square, matching the editor.
                    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" className="w-full h-full block" style={{ filter: "saturate(0.96)" }} aria-label={name}>
                      <image
                        href={cloudinaryThumb(p.image_front, 600)}
                        x="0" y="0" width="400" height="400"
                        preserveAspectRatio="xMidYMid meet"
                        transform={buildHomePhotoTransform(photoPositions[p.id], 400, 400)}
                      />
                    </svg>
                  )}
                  {soldOut && (
                    <span style={{ position: "absolute", top: 8, left: 8, background: C.ink, color: C.cream, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, fontFamily: FRAUNCES }}>
                      {isKa ? "გაყიდულია" : "Sold out"}
                    </span>
                  )}
                </div>
                <div className="mt-2.5 text-center px-1">
                  <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13, color: C.cream, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </div>
                  <div style={{ fontFamily: FRAUNCES, fontWeight: 800, fontSize: 14, color: C.mustard, marginTop: 2 }}>
                    {p.price}₾
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 md:mt-14 flex justify-center">
          <Link
            href={`/${lang}/shop`}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            style={{ fontFamily: FRAUNCES, background: C.mustard, color: C.ink, boxShadow: `0 5px 0 ${C.mustardDeep}`, fontWeight: 800 }}
          >
            {isKa ? "ყველა პროდუქტი" : "Shop everything"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
