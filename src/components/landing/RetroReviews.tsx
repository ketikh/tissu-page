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
  teal: "#3aa6a0",
};

const DEFAULT_REVIEWS: Review[] = [
  {
    text: {
      en: "Working with Tissu was a game-changer for my biz. They captured the essence of my brand and translated it into my visuals. The packaging looks beautifully made.",
      ka: "Tissu-სთან თანამშრომლობამ ჩემი ბიზნესი ცხოვრება შეცვალა. ბრანდის სული ზუსტად ფოტოებში გადავიდა. შეფუთვა საოცრად ლამაზადაა.",
    },
    name: "Sarah Williams",
    meta: { en: "e-commerce entrepreneur", ka: "ე-კომერციის მფლობელი" },
    photo: "/static/landing-bag-yellow.jpg",
  },
  {
    text: {
      en: "Got caught in the rain and stuff inside stayed dry. Flipped to the lemon side at brunch and felt like a different person.",
      ka: "წვიმაში მოვყევი და შიგნით ყველაფერი მშრალი დამრჩა. ბრანჩზე ლიმონის მხარეზე შევაბრუნე — სხვა ადამიანი გავხდი.",
    },
    name: "Mariam K.",
    meta: { en: "Tbilisi · Blueberry pouch", ka: "თბილისი · მოცვის ქისა" },
    photo: "/static/landing-bag-blue.jpg",
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

  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32 min-h-[640px]" style={{ background: C.cream }}>
      {/* Massive REVIEWS wordmark — outlined retro display, behind the card */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none z-[1]"
        aria-hidden="true"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.215, 0.61, 0.355, 1] }}
          style={{
            fontFamily: PACIFICO,
            fontSize: "clamp(96px, 17vw, 260px)",
            color: "transparent",
            WebkitTextStroke: `2px ${C.green}`,
            opacity: 0.22,
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {isKa ? "შეფასებები" : "Reviews"}
        </motion.span>
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: [0.215, 0.61, 0.355, 1] }}
          className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-center max-w-3xl mx-auto"
        >
          {/* Photo card */}
          <div
            className="relative aspect-square w-full max-w-[280px] mx-auto overflow-hidden border-[8px]"
            style={{
              borderColor: C.mustard,
              boxShadow: "0 18px 30px rgba(42,29,20,0.18), 0 5px 0 #d99820",
              transform: "rotate(-2deg)",
            }}
          >
            <Image
              src={review.photo}
              alt={review.name}
              fill
              sizes="280px"
              className="object-cover"
              style={{ filter: "saturate(0.95) sepia(0.05)" }}
            />
            {/* sparkles around photo */}
            <span className="absolute -top-2 -right-2 text-[var(--tissu-mustard)] text-3xl" style={{ color: C.mustard }}>✦</span>
            <span className="absolute -bottom-3 -left-3 text-[var(--tissu-green)] text-2xl" style={{ color: C.green }}>✦</span>
          </div>

          {/* Quote */}
          <div className="text-center md:text-left">
            <h3
              style={{
                fontFamily: FRAUNCES,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(22px, 2.8vw, 30px)",
                lineHeight: 1.25,
                color: C.greenDeep,
              }}
              className="font-retro-display"
            >
              {isKa
                ? `Tissu-სთან თანამშრომლობა — ჩემი ბიზნესის game-changer იყო`
                : `Working with Tissu was a game-changer for my biz`}
            </h3>

            <p
              className="mt-4"
              style={{
                fontFamily: FRAUNCES,
                fontStyle: "italic",
                fontSize: 16,
                lineHeight: 1.55,
                color: C.ink,
                opacity: 0.85,
              }}
            >
              {isKa ? review.text.ka : review.text.en}
            </p>

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
        <div className="mt-12 flex justify-center gap-2">
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
