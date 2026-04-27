"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, RotateCw } from "lucide-react";
import { useState } from "react";

interface HeroSectionProps {
  shopHref?: string;
  wordmark?: string;
  headline?: React.ReactNode;
  subheadline?: string;
  ctaLabel?: string;
}

const FRONT_SRC = "/bag-front.jpg";
const BACK_SRC = "/bag-back.jpg";

export default function HeroSection({
  shopHref = "/shop",
  wordmark = "TISSU",
  headline,
  subheadline,
  ctaLabel,
}: HeroSectionProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col bg-[var(--tissu-cream-2)]">
      {/* Soft top→bottom tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fbf3e4] via-[#f6ead7] to-[#e9d3a9]"
      />

      <Dots />

      {/* Eyebrow */}
      <header className="relative z-30 pt-8 md:pt-10 flex justify-center px-4">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--tissu-white)]/85 backdrop-blur-sm border border-[var(--border)] text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tissu-ink-soft)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--tissu-mustard)]" />
          Tissu · spring drop
        </motion.span>
      </header>

      {/* Bag stage — flex-1 fills available space, no absolute → no overlap with text */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        {/* The big background WORDMARK — sits behind the bag */}
        <Wordmark text={wordmark} />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.05, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
          className="relative"
          style={{ perspective: "1400px" }}
        >
          {/* Spotlight disc — STAYS still while the bag jumps over it (light pole) */}
          <motion.div
            aria-hidden="true"
            animate={{ rotate: flipped ? -8 : 8 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 m-auto rounded-full bg-gradient-to-br from-[var(--tissu-mustard)] to-[var(--tissu-mustard-soft)] shape-blob-morph"
            style={{
              width: "min(80vw, 460px)",
              height: "min(80vw, 460px)",
              filter: "drop-shadow(0 25px 35px rgba(232,178,58,0.35))",
            }}
          />

          {/* Floor shadow — synced to jump cycle. Squashes when bag is up, expands when bag lands. */}
          <motion.div
            aria-hidden="true"
            animate={{
              scaleX: [1,    1.18, 0.6,  0.55, 0.85, 1.18, 1],
              opacity:[0.5,  0.55, 0.18, 0.15, 0.3,  0.55, 0.5],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.15, 0.3, 0.5, 0.7, 0.8, 1],
              repeatDelay: 0.6,
            }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-8 sm:-bottom-12 w-[72%] h-10 rounded-[100%] bg-[var(--tissu-ink)]/40 blur-2xl"
            style={{ transformOrigin: "center" }}
          />

          {/* Tiny celebration sparks that flash at the apex of every jump */}
          <Sparks />

          {/* Energetic jump loop — keyframes cycle through:
              0%   idle
              15%  squash (anticipation): scaleY 0.85, scaleX 1.1, rotate -3
              30%  jump up (apex): y -54, scaleY 1.08, scaleX 0.94, rotate +4
              50%  hang at apex: y -56, rotate -2
              70%  fall: y -10, scaleY 1.02, rotate +1
              80%  land squash: y 8, scaleY 0.86, scaleX 1.12, rotate 0
              100% return to idle */}
          <motion.div
            animate={{
              y:      [0,    8,    -54,   -56,  -10,  8,    0],
              scaleY: [1,    0.86, 1.08,  1.04, 1.02, 0.86, 1],
              scaleX: [1,    1.12, 0.94,  0.97, 0.99, 1.12, 1],
              rotate: [0,   -3,    4,     -2,   1,    0,    0],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.15, 0.3, 0.5, 0.7, 0.8, 1],
              repeatDelay: 0.6,
            }}
            className="relative"
            style={{ transformOrigin: "center bottom" }}
            onHoverStart={() => setFlipped(true)}
            onHoverEnd={() => setFlipped(false)}
            onTap={() => setFlipped((v) => !v)}
          >

            {/* Bag flip card.  The bag image is set inside a circular CLIP so the
                JPG-baked checker outside the bag silhouette is hidden (the disc
                shows through instead of the checkerboard). */}
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.95, ease: [0.6, 0.05, 0.2, 1] }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative cursor-pointer"
            >
              <div
                className="relative grid place-items-center"
                style={{
                  width: "min(80vw, 460px)",
                  height: "min(80vw, 460px)",
                }}
              >
                {/* FRONT — uses next/image with object-contain so a transparent
                    PNG dropped in at /public/bag-front.* renders with no
                    background. (Right now the file is a JPG with baked-in
                    transparency checker — replace it with a clean PNG to get
                    the perfect look without any code change.) */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <Image
                    src={FRONT_SRC}
                    alt="Tissu bag — front side"
                    fill
                    priority
                    sizes="(max-width: 640px) 80vw, 460px"
                    className="object-contain select-none"
                    style={{
                      filter: "drop-shadow(0 24px 28px rgba(0,0,0,0.18))",
                    }}
                  />
                </div>

                {/* BACK */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <Image
                    src={BACK_SRC}
                    alt="Tissu bag — back side"
                    fill
                    sizes="(max-width: 640px) 80vw, 460px"
                    className="object-contain select-none"
                    style={{
                      filter: "drop-shadow(0 24px 28px rgba(0,0,0,0.18))",
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Flip hint */}
            <motion.div
              animate={{ opacity: flipped ? 0 : 0.95, scale: flipped ? 0.9 : 1 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--tissu-ink)] text-[var(--tissu-cream)] text-[10px] font-extrabold uppercase tracking-[0.14em] shadow-[0_4px_0_var(--tissu-terracotta)]"
            >
              <RotateCw className="w-3 h-3" />
              flip
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer — headline + subhead + CTA. Lives in its own flex zone so it
          NEVER overlaps the bag, regardless of viewport height. */}
      <footer className="relative z-20 px-6 pb-10 md:pb-14 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          className="ka-display-xl font-serif text-[var(--tissu-ink)] text-[30px] sm:text-[40px] md:text-[52px] lg:text-[60px] leading-[1.05] tracking-[-0.02em] max-w-[780px]"
        >
          {headline ?? (
            <>
              ერთი ჩანთა.{" "}
              <em className="not-italic italic text-[var(--tissu-terracotta)]">ორი</em> განწყობა.
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.65, ease: [0.215, 0.61, 0.355, 1] }}
          className="mt-3 text-[var(--tissu-ink-soft)] text-[14px] md:text-[16px] leading-[1.55] max-w-[520px]"
        >
          {subheadline ??
            "Tissu-ს ორმხრივი დიზაინი — ერთი მოძრაობით იცვლება შენი mood."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="mt-6"
        >
          <Link
            href={shopHref}
            className="inline-flex items-center gap-3 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-7 py-4 rounded-full font-extrabold text-[13px] tracking-[0.04em] uppercase shadow-[0_6px_0_var(--tissu-terracotta)] hover:translate-y-[3px] hover:shadow-[0_3px_0_var(--tissu-terracotta)] transition-[transform,box-shadow] duration-200"
          >
            {ctaLabel ?? "ნახე მეორე მხარე"}
            <span className="w-7 h-7 rounded-full bg-[var(--tissu-terracotta)] inline-flex items-center justify-center text-white">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </motion.div>
      </footer>
    </section>
  );
}

/* Big background wordmark — letters fade + drop in, sits at very low opacity
   so it reads as texture, not text. */
function Wordmark({ text }: { text: string }) {
  const letters = text.split("");
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
      }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[1]"
    >
      <h2
        aria-hidden="true"
        className="font-serif leading-[0.85] tracking-[-0.04em] text-[var(--tissu-ink)] flex"
        style={{ fontSize: "clamp(120px, 26vw, 380px)", opacity: 0.07 }}
      >
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: -14 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] } },
            }}
            className="inline-block"
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </h2>
    </motion.div>
  );
}

/* Sparks — small dots that pop out around the bag at the apex of every jump
   (~30% into the 3.4s loop) and fade quickly. Synced via the same `times`
   array as the bag/floor-shadow so the timing matches without a state hookup. */
function Sparks() {
  const positions = [
    { angle: -90, distance: 95, size: 6, color: "var(--tissu-terracotta)" },
    { angle: -45, distance: 110, size: 8, color: "var(--tissu-mustard)" },
    { angle: 0,   distance: 100, size: 5, color: "var(--tissu-cobalt)" },
    { angle: 45,  distance: 110, size: 7, color: "var(--tissu-lilac)" },
    { angle: 135, distance: 105, size: 6, color: "var(--tissu-mustard)" },
    { angle: 225, distance: 95,  size: 5, color: "var(--tissu-terracotta)" },
  ];
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[5]">
      {positions.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * p.distance;
        const dy = Math.sin(rad) * p.distance;
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              left: -p.size / 2,
              top: -p.size / 2,
            }}
            animate={{
              x:       [0,  0,    dx,    dx * 1.15, dx * 1.15, 0,    0],
              y:       [0,  0,    dy,    dy * 1.15, dy * 1.15, 0,    0],
              opacity: [0,  0,    1,     0.9,       0,         0,    0],
              scale:   [0,  0,    1.1,   1,         0.7,       0,    0],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.15, 0.3, 0.5, 0.7, 0.8, 1],
              repeatDelay: 0.6,
              delay: i * 0.025,
            }}
          />
        );
      })}
    </div>
  );
}

/* Small floating accent dots in brand colours */
function Dots() {
  const dots = [
    { left: "8%", top: "22%", size: 10, color: "var(--tissu-terracotta)", delay: 0 },
    { left: "12%", top: "62%", size: 14, color: "var(--tissu-mustard)", delay: 0.4 },
    { left: "85%", top: "28%", size: 12, color: "var(--tissu-cobalt)", delay: 0.8 },
    { left: "92%", top: "70%", size: 8, color: "var(--tissu-lilac)", delay: 1.2 },
    { left: "20%", top: "84%", size: 6, color: "var(--tissu-terracotta)", delay: 1.6 },
    { left: "78%", top: "88%", size: 10, color: "var(--tissu-mustard)", delay: 2 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none z-[2]">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.85, 0.85],
            scale: [0, 1, 1],
            y: [0, -12, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: d.delay },
            scale: { duration: 0.6, delay: d.delay, ease: "backOut" },
            y: { duration: 4 + i * 0.4, delay: d.delay, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: d.color,
          }}
        />
      ))}
    </div>
  );
}
