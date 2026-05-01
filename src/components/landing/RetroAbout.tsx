"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface RetroAboutProps {
  isKa?: boolean;
  shopHref?: string;
  photos?: { front: string; back: string };
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

const C = {
  cream: "#fef0d6",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  green: "#3f6f56",
  greenDeep: "#2c5640",
  ink: "#2a1d14",
};

const STEPS = [
  {
    num: "01",
    ka: "ერთი ჩანთა — ორი სახე.",
    en: "One bag — two looks.",
  },
  {
    num: "02",
    ka: "გადაბრუნე. 17 წამი.",
    en: "Flip it. 17 seconds.",
  },
  {
    num: "03",
    ka: "შიგნით ყველაფერი ადგილზეა.",
    en: "Everything inside stays put.",
  },
];

export default function RetroAbout({
  isKa = false,
  shopHref = "/shop",
  photos = {
    front: "/static/landing-bag-blue.jpg",
    back: "/static/landing-bag-yellow.jpg",
  },
}: RetroAboutProps) {
  return (
    <section
      className="relative w-full overflow-hidden py-20 md:py-32"
      style={{ background: C.cream }}
    >
      {/* Decorative daisies */}
      <DaisyFloating className="left-[5%] top-[12%]" delay={0.2} rotate={-6} />
      <DaisyFloating className="right-[6%] bottom-[10%]" delay={0.6} rotate={9} />

      <div className="container relative">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Left — two stacked photo cards */}
          <div className="relative shrink-0 w-56 h-72 md:w-64 md:h-80">
            <motion.div
              initial={{ opacity: 0, x: -20, rotate: -10 }}
              whileInView={{ opacity: 1, x: 0, rotate: -7 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
              className="absolute top-0 left-0 z-10"
            >
              <PhotoCard src={photos.front} rotate={-7} size={160} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20, rotate: 10 }}
              whileInView={{ opacity: 1, x: 0, rotate: 6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
              className="absolute bottom-0 right-0 z-20"
            >
              <PhotoCard src={photos.back} rotate={6} size={172} />
            </motion.div>
          </div>

          {/* Right — headline + steps + CTA */}
          <div className="flex-1 max-w-lg">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
              style={{ color: C.green }}
            >
              {isKa ? "როგორ მუშაობს" : "How it works"}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
              className="mt-4 leading-[0.92]"
              style={{
                fontFamily: isKa ? ALK_LIFE : PACIFICO,
                color: C.green,
                fontSize: "clamp(38px, 5.5vw, 72px)",
              }}
            >
              {isKa ? (
                <>გადაბრუნე,<br />შეიცვალე.</>
              ) : (
                <>Flip it,<br />be new.</>
              )}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-4 italic"
              style={{
                fontFamily: FRAUNCES,
                color: C.greenDeep,
                fontSize: "clamp(15px, 1.5vw, 17px)",
                fontStyle: "italic",
              }}
            >
              {isKa
                ? "ყოველ Tissu ჩანთას ორი სახე აქვს. გადაბრუნე და სულ ახლებური სახე გაქვს — ერთ ფასად."
                : "Every Tissu bag has two sides. Flip it inside-out and you have a whole new look — one price, two bags."}
            </motion.p>

            <ul className="mt-7 flex flex-col gap-3">
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.num}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.35 + i * 0.1 }}
                  className="flex items-baseline gap-3"
                >
                  <span
                    style={{
                      fontFamily: PACIFICO,
                      color: C.mustard,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {s.num}
                  </span>
                  <span
                    style={{
                      fontFamily: FRAUNCES,
                      color: C.ink,
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {isKa ? s.ka : s.en}
                  </span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.65, type: "spring", stiffness: 200, damping: 16 }}
              className="mt-8"
            >
              <Link
                href={shopHref}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                style={{
                  fontFamily: FRAUNCES,
                  background: C.mustard,
                  color: C.ink,
                  boxShadow: `0 5px 0 ${C.mustardDeep}`,
                  fontWeight: 800,
                }}
              >
                {isKa ? "ვნახოთ ჩანთები" : "Shop the bags"}
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoCard({ src, rotate, size }: { src: string; rotate: number; size: number }) {
  return (
    <div
      className="overflow-hidden border-[6px]"
      style={{
        width: size,
        height: size * 1.15,
        transform: `rotate(${rotate}deg)`,
        borderColor: C.cream,
        boxShadow: "0 18px 30px rgba(42,29,20,0.18), 0 4px 0 #d99820",
      }}
    >
      <Image
        src={src}
        alt=""
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-cover"
        style={{ filter: "saturate(0.92) sepia(0.04)" }}
      />
    </div>
  );
}

function DaisyFloating({
  className = "",
  delay = 0,
  rotate = 0,
}: {
  className?: string;
  delay?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ duration: 0.9, delay, ease: [0.215, 0.61, 0.355, 1] }}
      className={`absolute pointer-events-none ${className}`}
      style={{ width: 70, height: 70 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{ rotate: [rotate - 6, rotate + 6, rotate - 6] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <g transform="translate(50 50)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-18"
              rx="8"
              ry="16"
              fill={C.mustard}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="8" fill={C.green} />
        </g>
      </motion.svg>
    </motion.div>
  );
}
