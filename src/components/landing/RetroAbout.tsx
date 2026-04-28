"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface RetroAboutProps {
  isKa?: boolean;
  shopHref?: string;
  /** Two photos shown floating on the left/right of the title block. */
  photos?: { left: string; right: string };
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  green: "#3f6f56",
  greenDeep: "#2c5640",
  ink: "#2a1d14",
};

export default function RetroAbout({
  isKa = false,
  shopHref = "/shop",
  photos = {
    left: "/static/landing-bag-blue.jpg",
    right: "/static/landing-bag-yellow.jpg",
  },
}: RetroAboutProps) {
  return (
    <section
      className="relative w-full overflow-hidden py-24 md:py-36"
      style={{ background: C.cream }}
    >
      {/* Floating decorative daisies */}
      <DaisyFloating className="left-[6%] top-[18%]" delay={0.2} rotate={-6} />
      <DaisyFloating className="right-[8%] bottom-[14%]" delay={0.6} rotate={8} />

      <div className="container relative">
        {/* Side photo card — left, rotated */}
        <motion.div
          initial={{ opacity: 0, x: -30, rotate: -12 }}
          whileInView={{ opacity: 1, x: 0, rotate: -8 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
          className="absolute left-0 top-1/3 hidden md:block z-10"
        >
          <PhotoCard src={photos.left} rotate={-8} size={170} />
        </motion.div>

        {/* Side photo card — right, rotated */}
        <motion.div
          initial={{ opacity: 0, x: 30, rotate: 12 }}
          whileInView={{ opacity: 1, x: 0, rotate: 7 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
          className="absolute right-0 top-1/4 hidden md:block z-10"
        >
          <PhotoCard src={photos.right} rotate={7} size={190} />
        </motion.div>

        {/* Centred title block */}
        <div className="relative z-20 mx-auto max-w-2xl text-center px-4">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
            style={{ color: C.green }}
          >
            {isKa ? "ჩვენი ამბავი · ხელნაკეთი ბრენდი" : "Coaching for handmade brands"}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
            className="font-retro-display mt-6 leading-[0.9]"
            style={{
              fontFamily: PACIFICO,
              color: C.green,
              fontSize: "clamp(48px, 7vw, 92px)",
            }}
          >
            {isKa ? (
              <>
                ბებიასაც <br />
                კი ეშურდება
              </>
            ) : (
              <>
                Your Grandma Would <br />
                be Jealous
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-5 italic"
            style={{
              fontFamily: FRAUNCES,
              color: C.greenDeep,
              fontSize: "clamp(16px, 1.6vw, 19px)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {isKa
              ? "მცირე სტუდიიდან, ხელით ნაკერი ცალი ცალი — ვიზრდებით ერთად."
              : "to grow and scale your handmade business — one stitch at a time."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 200, damping: 16 }}
            className="mt-8"
          >
            <Link
              href={shopHref}
              className="inline-flex items-center justify-center px-7 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              style={{
                fontFamily: FRAUNCES,
                background: C.mustard,
                color: C.ink,
                boxShadow: `0 5px 0 ${C.mustardDeep}`,
                fontWeight: 800,
              }}
            >
              {isKa ? "ვნახოთ ერთად" : "Let's get there"}
            </Link>
          </motion.div>
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
        borderColor: "#fef0d6",
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
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true }}
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
