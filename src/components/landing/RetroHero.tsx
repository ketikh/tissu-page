"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface RetroHeroProps {
  /** Absolute or root-relative URL for the hero photo. */
  photoSrc?: string;
  /** Brand wordmark shown across the very top, in script. */
  brand?: string;
  /** Headline. Use \n for line breaks (the line break is preserved). */
  headlineLine1?: string;
  headlineLine2?: string;
  /** Sub-headline / kicker shown below the headline (optional). */
  kicker?: string;
  /** Mustard pill button */
  ctaLabel?: string;
  ctaHref?: string;
  /** Locale-aware nav links. Pass with text already localised. */
  navLinks?: { label: string; href: string }[];
}

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";

/* ---------- Palette (scoped to this component) ---------- */
const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  burnt: "#d56826",
  green: "#3f6f56",
  ink: "#2a1d14",
};

export default function RetroHero({
  photoSrc = "/background.png",
  brand = "Tissu & Co.",
  headlineLine1 = "Your IRL Boogie Nights,",
  headlineLine2 = "Styled For Your Home",
  kicker,
  ctaLabel = "Shop the drop",
  ctaHref = "/shop",
  navLinks,
}: RetroHeroProps) {
  const links =
    navLinks ?? [
      { label: "Shop", href: "#shop" },
      { label: "Story", href: "#story" },
      { label: "Journal", href: "#journal" },
      { label: "Contact", href: "#contact" },
    ];

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: C.beige, color: C.cream }}
    >
      {/* Background photo with slow Ken Burns motion */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1.0, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.215, 0.61, 0.355, 1] }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ scale: [1.02, 1.08, 1.02], x: [0, -12, 0], y: [0, -8, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={photoSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: "saturate(0.92) contrast(1.02) sepia(0.05)" }}
          />
        </motion.div>
      </motion.div>

      {/* Soft warm gradient over the photo so cream text reads on bright spots */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(42,29,20,0.25) 0%, rgba(42,29,20,0.05) 35%, rgba(42,29,20,0.45) 100%)",
        }}
      />

      {/* Vintage film grain — pure CSS so no extra asset needed */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.45) 1px, transparent 1px)",
          backgroundSize: "3px 3px, 4px 4px",
          backgroundPosition: "0 0, 1px 1px",
        }}
      />

      {/* Brand wordmark — top centred, retro script in mustard */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
        className="relative z-30 pt-7 md:pt-9 flex justify-center px-4"
      >
        <Link
          href="/"
          className="inline-block leading-none"
          style={{
            fontFamily: PACIFICO,
            color: C.mustard,
            fontSize: "clamp(22px, 3vw, 30px)",
            textShadow: "0 2px 14px rgba(0,0,0,0.35)",
          }}
        >
          {brand}
        </Link>
      </motion.div>

      {/* Tiny nav under the wordmark — retro uppercase */}
      {links.length > 0 && (
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative z-30 mt-3 hidden md:flex justify-center gap-7 px-4"
          style={{ color: C.cream }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[11px] font-extrabold uppercase tracking-[0.22em] hover:opacity-70 transition-opacity"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}
            >
              {l.label}
            </Link>
          ))}
        </motion.nav>
      )}

      {/* Headline + CTA — vertically centred */}
      <div className="relative z-20 min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-140px)] flex flex-col items-center justify-center text-center px-6">
        {kicker && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mb-5 inline-block text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: C.mustard, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
          >
            {kicker}
          </motion.span>
        )}

        {/* Letter-by-letter reveal — two stacked lines */}
        <h1
          className="font-retro-display select-none"
          style={{
            fontFamily: FRAUNCES,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: "clamp(40px, 7vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.01em",
            color: C.cream,
            textShadow: "0 6px 30px rgba(0,0,0,0.4)",
          }}
        >
          <RevealLine text={headlineLine1} delay={0.6} />
          <br />
          <RevealLine text={headlineLine2} delay={0.95} />
        </h1>

        {/* Decorative flowers floating either side of the headline (subtle) */}
        <FlowerCorner side="left" />
        <FlowerCorner side="right" />

        {/* Mustard pill CTA with elastic bounce on entrance */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.4, type: "spring", stiffness: 240, damping: 16 }}
          className="mt-9"
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-extrabold text-[13px] uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_0_rgba(0,0,0,0.18)] active:translate-y-0.5"
            style={{
              fontFamily: FRAUNCES,
              background: C.mustard,
              color: C.ink,
              boxShadow: `0 6px 0 ${C.mustardDeep}, 0 14px 30px rgba(0,0,0,0.25)`,
              fontWeight: 800,
            }}
          >
            {ctaLabel}
          </Link>
        </motion.div>
      </div>

      {/* Optional press band at the very bottom — subtle, retro green */}
      <div
        className="relative z-20 w-full border-t border-b"
        style={{
          background: C.green,
          borderColor: "rgba(255,255,255,0.12)",
          color: C.cream,
        }}
      >
        <div className="container py-3.5 md:py-4 flex items-center justify-between gap-6 overflow-x-auto whitespace-nowrap">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] opacity-80 shrink-0">
            As seen on
          </span>
          <div className="flex items-center gap-7 md:gap-10 text-[12px] font-bold uppercase tracking-[0.18em] opacity-90">
            <span>Vogue</span>
            <span>Forbes</span>
            <span>USA Today</span>
            <span>Wallpaper*</span>
            <span>Kinfolk</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Helpers ---------- */

function RevealLine({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.025, delayChildren: delay } },
      }}
      className="inline-block"
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 18 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.215, 0.61, 0.355, 1] } },
          }}
          className="inline-block"
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

function FlowerCorner({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: isLeft ? -10 : 10 }}
      transition={{ duration: 0.9, delay: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
      className={`absolute hidden md:block ${isLeft ? "left-[6%]" : "right-[6%]"} top-[42%] z-10 pointer-events-none`}
      style={{ width: 90, height: 90 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{ rotate: isLeft ? [0, 8, 0] : [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.25))" }}
      >
        {/* Simple 5-petal retro daisy */}
        <g transform="translate(50 50)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-20"
              rx="9"
              ry="18"
              fill="#f3b62b"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="9" fill="#3f6f56" />
        </g>
      </motion.svg>
    </motion.div>
  );
}
