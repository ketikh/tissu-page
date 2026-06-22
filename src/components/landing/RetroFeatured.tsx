"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { StorefrontProduct } from "@/lib/admin-api";
import { cloudinaryThumb } from "@/lib/cloudinary";

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
  /** Product ids the admin picked (Site → Home → Featured). First 3 are shown. */
  featuredIds?: string[];
  /** CMS title override (home → "featured"). */
  titleOverride?: string;
}

/** "Featured products" — exactly 3 in one row, hand-picked from the admin.
 *  Falls back to a category-spanning sample so the row is never empty. */
export default function RetroFeatured({ isKa = false, lang, products, featuredIds, titleOverride }: RetroFeaturedProps) {
  const picks = useMemo(() => {
    const eligible = products.filter((p) => Boolean(p.image_front));

    // Admin-picked ids win, in the chosen order.
    if (featuredIds && featuredIds.length) {
      const byId = new Map(eligible.map((p) => [String(p.id), p]));
      const chosen = featuredIds.map((id) => byId.get(String(id))).filter(Boolean) as StorefrontProduct[];
      if (chosen.length) return chosen.slice(0, 3);
    }

    // Fallback: one per category (round-robin) so the row spans kinds.
    const groups = new Map<string, StorefrontProduct[]>();
    for (const p of eligible) {
      const k = (p.category || "_").toLowerCase();
      const l = groups.get(k); if (l) l.push(p); else groups.set(k, [p]);
    }
    const lists = [...groups.values()];
    const out: StorefrontProduct[] = [];
    for (let i = 0, added = true; added && out.length < 3; i++) {
      added = false;
      for (const l of lists) { if (i < l.length && out.length < 3) { out.push(l[i]); added = true; } }
    }
    return out;
  }, [products, featuredIds]);

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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cloudinaryThumb(p.image_front, 600)}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: "saturate(0.96)" }}
                    />
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
