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

/**
 * "Sticker" highlight on inline text. Each line of wrapped text gets its own
 * solid cream rectangle (clone via box-decoration-break) with a tiny shadow,
 * so the line itself reads on a clean panel while the big background wordmark
 * stays visible in the gaps. The effect lives on the TEXT, not on a div.
 */
const STICKER_STYLE: React.CSSProperties = {
  background: "#fef0d6",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
  padding: "0.18em 0.55em",
  // Pad the line ends slightly via box-shadow; gives a marker-tape look.
  boxShadow: "0.55em 0 0 #fef0d6, -0.55em 0 0 #fef0d6",
  borderRadius: 4,
  // Subtle outline so the sticker reads as its own thing on top of the cream bg
  outline: "1px solid rgba(63, 111, 86, 0.18)",
};

export default function RetroReviews({ isKa = false, reviews = DEFAULT_REVIEWS }: RetroReviewsProps) {
  const [active, setActive] = useState(0);
  const review = reviews[active] ?? reviews[0];

  return (
    <section
      className="relative w-full overflow-hidden py-24 md:py-36"
      style={{ background: C.cream }}
    >
      {/* The huge "Reviews" wordmark, behind everything. Outlined (stroke only)
          retro PACIFICO so it reads as decoration, not a real heading. */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-1"
        aria-hidden="true"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
          style={{
            fontFamily: PACIFICO,
            fontSize: "clamp(120px, 22vw, 360px)",
            color: "transparent",
            WebkitTextStroke: `2px ${C.green}`,
            opacity: 0.2,
            lineHeight: 0.85,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {isKa ? "შეფასებები" : "Reviews"}
        </motion.span>
      </div>

      {/* A second, slightly offset solid-fill wordmark for that screen-printed depth */}
      <div
        className="absolute inset-x-0 top-[14%] flex items-center justify-center pointer-events-none select-none z-2"
        aria-hidden="true"
      >
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
          style={{
            fontFamily: PACIFICO,
            fontSize: "clamp(72px, 12vw, 200px)",
            color: C.green,
            opacity: 0.18,
            lineHeight: 0.85,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {isKa ? "შეფასებები" : "Reviews"}
        </motion.span>
      </div>

      {/* Decorative twinkling stars on the edges */}
      {[
        { left: "8%", top: "18%", size: 22, color: C.mustard },
        { left: "12%", bottom: "24%", size: 14, color: C.green },
        { right: "10%", top: "22%", size: 26, color: C.mustard },
        { right: "8%", bottom: "18%", size: 18, color: C.green },
      ].map((d, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute pointer-events-none z-3"
          style={{
            left: d.left,
            right: d.right,
            top: d.top,
            bottom: d.bottom,
            color: d.color,
            fontSize: d.size,
            opacity: 0.7,
          }}
          animate={{ rotate: [0, 360], opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        >
          ✦
        </motion.span>
      ))}

      <div className="container relative z-10">
        {/* No card wrapper — just photo + quote, both on top of the wordmark.
            The quote text itself wears its own sticker highlight. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
          className="mx-auto max-w-3xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-14 items-center"
        >
          {/* Photo card — mustard border, rotated */}
          <div
            className="relative aspect-square w-full max-w-65 mx-auto overflow-hidden border-8"
            style={{
              borderColor: C.mustard,
              boxShadow: "0 18px 28px rgba(42,29,20,0.22)",
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

          {/* Quote — text wears its own marker-tape highlight */}
          <div className="text-center md:text-left">
            <h3
              className="font-retro-display"
              style={{
                fontFamily: FRAUNCES,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(20px, 2.5vw, 26px)",
                lineHeight: 1.85, // breathing room so the sticker bands don't touch
                color: C.greenDeep,
              }}
            >
              <span style={STICKER_STYLE}>
                &ldquo;{isKa ? review.text.ka : review.text.en}&rdquo;
              </span>
            </h3>

            <div className="mt-6 flex flex-col gap-1 items-center md:items-start">
              <span
                style={{
                  ...STICKER_STYLE,
                  fontFamily: FRAUNCES,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.ink,
                }}
              >
                — {review.name}
              </span>
              <span
                style={{
                  ...STICKER_STYLE,
                  fontFamily: FRAUNCES,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.green,
                }}
              >
                {isKa ? review.meta.ka : review.meta.en}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 flex justify-center gap-2 relative z-10">
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
