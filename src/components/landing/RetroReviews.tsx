"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

interface Review {
  text: { en: string; ka: string };
  name: string;
  meta: { en: string; ka: string };
  photo: string;
}

interface RetroReviewsProps {
  isKa?: boolean;
  reviews?: Review[];
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  mustard: "#f3b62b",
  green: "#3f6f56",
  greenDeep: "#2c5640",
  ink: "#2a1d14",
};

const DEFAULT_REVIEWS: Review[] = [
  {
    text: {
      en: "Got caught in the rain and the stuff inside stayed dry. I flipped to the lemon side at brunch and felt like a different person.",
      ka: "წვიმაში მოვყევი და შიგნით ყველაფერი მშრალი დამრჩა. ბრანჩზე ლიმონის მხარეზე შევაბრუნე — სხვა ადამიანი გავხდი.",
    },
    name: "Mariam K.",
    meta: { en: "Tbilisi · Blueberry pouch", ka: "თბილისი · მოცვის ქისა" },
    photo: "/static/landing-bag-blue.jpg",
  },
  {
    text: {
      en: "Working with Tissu was a game-changer. They captured the essence of my brand and stitched it into the bag. Packaging is gorgeous.",
      ka: "Tissu-სთან თანამშრომლობამ ჩემი ბიზნესი ცხოვრება შეცვალა. ბრანდის სული ზუსტად ფოტოებში გადავიდა. შეფუთვა საოცრად ლამაზადაა.",
    },
    name: "Sofia R.",
    meta: { en: "Lisbon · Lemon laptop sleeve", ka: "ლისაბონი · ლიმონის გარსი" },
    photo: "/static/landing-bag-yellow.jpg",
  },
  {
    text: {
      en: "Finally, a laptop bag that looks like it belongs at brunch. Stitching is buttery, the ribbons are the sweetest detail.",
      ka: "საბოლოოდ ვიპოვე ლეპტოპის ჩანთა, რომელიც ბრანჩსაც კი მოუხდება. ნაკერი კარაქივით რბილია, ლენტები კი ყველაზე ტკბილი დეტალია.",
    },
    name: "Elene D.",
    meta: { en: "Berlin · Stripe sleeve", ka: "ბერლინი · ზოლიანი გარსი" },
    photo: "/static/landing-bag-striped.png",
  },
];

export default function RetroReviews({ isKa = false, reviews = DEFAULT_REVIEWS }: RetroReviewsProps) {
  const [active, setActive] = useState(0);
  const review = reviews[active] ?? reviews[0];

  // Decorative star + circle positions, scattered around the section
  const decor = [
    { left: "8%", top: "16%", size: 22, color: C.mustard, char: "✦" },
    { left: "16%", top: "62%", size: 14, color: C.green, char: "✦" },
    { right: "12%", top: "22%", size: 18, color: C.green, char: "✦" },
    { right: "8%", top: "70%", size: 26, color: C.mustard, char: "✦" },
    { left: "50%", top: "8%", size: 12, color: C.green, char: "✦" },
    { left: "75%", top: "82%", size: 10, color: C.mustard, char: "✦" },
  ];

  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32" style={{ background: C.cream }}>
      {/* Twinkling decorative stars in the background — text-readable now */}
      {decor.map((d, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            left: d.left,
            right: d.right,
            top: d.top,
            color: d.color,
            fontSize: d.size,
            opacity: 0.55,
          }}
          animate={{ rotate: [0, 360], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        >
          {d.char}
        </motion.span>
      ))}

      {/* Tiny "Reviews" kicker — clearly above the card, not overlapping */}
      <div className="container relative z-10">
        <div className="text-center mb-14 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
            style={{ color: C.green }}
          >
            {isKa ? "მოწონებები" : "Reviews"}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
            className="font-retro-display mt-3 leading-[0.95]"
            style={{
              fontFamily: PACIFICO,
              color: C.greenDeep,
              fontSize: "clamp(40px, 6vw, 76px)",
            }}
          >
            {isKa ? "ხალხს უყვარს." : "loved by humans."}
          </motion.h2>
        </div>

        {/* Foreground card — sits on a solid cream backdrop with soft mustard
            ring + shadow so the quote is fully readable, no decoration behind. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.215, 0.61, 0.355, 1] }}
          className="mx-auto max-w-3xl rounded-[28px] grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12 items-center p-6 md:p-10"
          style={{
            background: C.cream,
            boxShadow: `0 22px 40px rgba(42,29,20,0.12), 0 6px 0 ${C.mustard}`,
            border: `2px solid ${C.mustard}`,
          }}
        >
          {/* Photo */}
          <div
            className="relative aspect-square w-full max-w-[260px] mx-auto overflow-hidden border-[8px]"
            style={{
              borderColor: C.mustard,
              boxShadow: "0 12px 22px rgba(42,29,20,0.18)",
              transform: "rotate(-2deg)",
            }}
          >
            <Image
              src={review.photo}
              alt={review.name}
              fill
              sizes="260px"
              className="object-cover"
              style={{ filter: "saturate(0.95) sepia(0.05)" }}
              key={review.photo}
            />
            <span className="absolute -top-3 -right-3 text-3xl" style={{ color: C.mustard }}>✦</span>
            <span className="absolute -bottom-3 -left-3 text-2xl" style={{ color: C.green }}>✦</span>
          </div>

          {/* Quote */}
          <div className="text-center md:text-left">
            <h3
              className="font-retro-display"
              style={{
                fontFamily: FRAUNCES,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(22px, 2.6vw, 28px)",
                lineHeight: 1.25,
                color: C.greenDeep,
              }}
            >
              &ldquo;
              {isKa ? review.text.ka : review.text.en}
              &rdquo;
            </h3>

            <div className="mt-5">
              <div
                style={{
                  fontFamily: FRAUNCES,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.ink,
                }}
              >
                — {review.name}
              </div>
              <div
                className="text-[11px] uppercase tracking-[0.22em] mt-1"
                style={{ color: C.green, fontFamily: FRAUNCES, fontWeight: 700 }}
              >
                {isKa ? review.meta.ka : review.meta.en}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pagination dots */}
        <div className="mt-10 flex justify-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Review ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === active ? 28 : 10,
                height: 10,
                background: i === active ? C.green : "transparent",
                border: `1.5px solid ${C.green}`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
