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

interface RetroMixedProps {
  isKa?: boolean;
  lang: string;
  products: StorefrontProduct[];
}

/** A mixed "new in" showcase — one product per category, round-robin, so the
 *  home surfaces variety (bags, aprons, totes, necklaces…) rather than one kind. */
export default function RetroMixed({ isKa = false, lang, products }: RetroMixedProps) {
  const mixed = useMemo(() => {
    const eligible = products.filter((p) => Boolean(p.image_front));
    const groups = new Map<string, StorefrontProduct[]>();
    for (const p of eligible) {
      const key = (p.category || "_").toLowerCase();
      const list = groups.get(key);
      if (list) list.push(p); else groups.set(key, [p]);
    }
    const lists = [...groups.values()];
    const out: StorefrontProduct[] = [];
    for (let i = 0, added = true; added && out.length < 8; i++) {
      added = false;
      for (const list of lists) {
        if (i < list.length && out.length < 8) { out.push(list[i]); added = true; }
      }
    }
    return out;
  }, [products]);

  if (mixed.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-20" style={{ background: C.green, color: C.cream }}>
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]" style={{ color: C.mustard, fontFamily: FRAUNCES }}>
            {isKa ? "სიახლეები" : "New in"}
          </span>
          <h2
            className="mt-3 leading-[1.05]"
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(28px, 4.5vw, 52px)",
              color: C.cream,
            }}
          >
            {isKa ? "ცოტა ყველაფრიდან" : "A little of everything"}
          </h2>
          <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 15, opacity: 0.85, maxWidth: 520, margin: "12px auto 0", lineHeight: 1.55 }}>
            {isKa ? "ჩანთები, წინსაფრები, ყელსაბამები — ერთ ადგილას." : "Bags, aprons, necklaces — a bit of everything."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {mixed.map((p) => {
            const name = p.name || p.code;
            const soldOut = !p.in_stock;
            return (
              <Link key={p.id} href={`/${lang}/product/${p.id}`} className="group block">
                <div className="relative overflow-hidden" style={{ borderRadius: 18, background: C.cream, aspectRatio: "1 / 1" }}>
                  {p.image_front && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cloudinaryThumb(p.image_front, 500)}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: "saturate(0.96)" }}
                    />
                  )}
                  {soldOut && (
                    <span style={{ position: "absolute", top: 10, left: 10, background: C.ink, color: C.cream, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, fontFamily: FRAUNCES }}>
                      {isKa ? "გაყიდულია" : "Sold out"}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-center px-1">
                  <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.cream, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </div>
                  <div style={{ fontFamily: FRAUNCES, fontWeight: 800, fontSize: 15, color: C.mustard, marginTop: 2 }}>
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
