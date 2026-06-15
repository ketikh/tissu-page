"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useStoreHydration } from "@/store/useHydration";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

interface RetroHeroProps {
  photoSrc?: string;
  brand?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  kicker?: string;
  ctaLabel?: string;
  ctaHref?: string;
  lang?: Locale;
}

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

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
  brand = "Tissu",
  headlineLine1 = "Two sides. One",
  headlineLine2 = "bag.",
  kicker,
  ctaLabel = "Shop the drop",
  ctaHref = "/shop",
  lang = "en",
}: RetroHeroProps) {
  const hydrated = useStoreHydration();
  const openCart = useUIStore((state) => state.openCart);
  const cartItemCount = hydrated ? useCartStore.getState().getSummary().itemsCount : 0;
  const copy = getLandingCopy(lang);

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: C.beige, color: C.cream }}
    >
      {/* Background photo */}
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

      {/* Warm gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(42,29,20,0.35) 0%, rgba(42,29,20,0.05) 35%, rgba(42,29,20,0.55) 100%)",
        }}
      />

      {/* Film grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.45) 1px, transparent 1px)",
          backgroundSize: "3px 3px, 4px 4px",
          backgroundPosition: "0 0, 1px 1px",
        }}
      />

      {/* ── Top nav bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="relative z-30 w-full grid grid-cols-3 items-center px-5 md:px-10 pt-5 md:pt-7"
      >
        {/* LEFT — nav links (desktop only) */}
        <div className="flex items-center gap-1">
          <Link
            href={`/${lang}/shop`}
            className="hidden md:inline-flex px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] rounded-full transition-colors hover:bg-[rgba(254,240,214,0.15)]"
            style={{ fontFamily: FRAUNCES, color: C.cream, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            {copy.nav.shop}
          </Link>
          <Link
            href={`/${lang}/gallery`}
            className="hidden md:inline-flex px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] rounded-full transition-colors hover:bg-[rgba(254,240,214,0.15)]"
            style={{ fontFamily: FRAUNCES, color: C.cream, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            {lang === "ka" ? "გალერეა" : "Gallery"}
          </Link>
        </div>

        {/* CENTER — TISSU wordmark */}
        <div className="flex justify-center">
          <Link href={`/${lang}`} aria-label={brand}>
            <svg
              viewBox="0 0 1282.8 410"
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 md:h-10 w-auto"
              style={{ filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.4))", display: "block" }}
              aria-hidden="true"
            >
              <g fill="#fef0d6">
                <path d="M223.3,341.6c-17.2,0-29.8-4.6-37.7-13.7-8-9.1-11.9-22.4-11.9-39.8s.4-17.9,1.3-25.2c.9-7.3,1.8-14.4,2.7-21.4.9-6.9,1.8-14.1,2.7-21.4.9-7.3,1.3-15.7,1.3-25.2s0-7.2-.2-11c-.1-3.7-.5-7.1-1.2-10.2-.6-3.1-1.7-5.6-3.3-7.7-1.5-2.1-3.7-3.1-6.5-3.1-4.4,0-8.2,0-11.4.2-3.2.1-6.4.3-9.4.4-3.1.1-6.5.3-10.2.4-3.7.1-8.3.2-13.7.2s-6.7-2.2-9.4-6.5c-2.7-4.4-4.9-9.4-6.7-15.2-1.8-5.8-3.1-11.4-4-16.9-.9-5.5-1.3-9.6-1.3-12.1s0-3.1-.2-4.8c-.1-1.7,0-3.3.6-4.8,1.5-7.7,5.6-14.1,12.3-19.1,6.7-5,15.2-8.9,25.6-11.5,10.4-2.7,22.3-4.6,35.6-5.6,13.3-1,27.5-1.5,42.3-1.5s29.4.5,43.5,1.5c14.1,1,26.6,3.3,37.5,6.9,10.9,3.6,19.7,8.7,26.4,15.2,6.7,6.5,10,15.5,10,26.8s-.2,9.9-.6,15.8c-.4,5.9-1.3,11.5-2.7,16.9-1.4,5.4-3.3,9.9-5.8,13.5-2.4,3.6-5.6,5.4-9.4,5.4s-11.2-.8-18.3-2.3c-7.1-1.5-14.6-2.3-22.5-2.3s-7.3.5-9.6,1.5c-2.3,1-4,2.5-5,4.4-1,1.9-1.6,4.2-1.7,6.9-.1,2.7-.2,5.6-.2,8.7,0,10.3.6,19.8,1.9,28.5,1.3,8.7,2.7,17.3,4.2,25.8,1.5,8.5,2.9,17.3,4.2,26.4,1.3,9.1,1.9,19.3,1.9,30.6s-1.4,14.4-4.2,20.2c-2.8,5.8-6.6,10.5-11.4,14.2-4.8,3.7-10.2,6.5-16.4,8.3-6.2,1.8-12.6,2.7-19.2,2.7Z"/>
                <path d="M405.8,334.7c-17.2,0-30.2-4.8-39.1-14.4-8.9-9.6-14.3-23-16.4-40.2-3.6-31.6-4.9-62.8-4-93.5.9-30.8,3.5-61.7,7.9-92.8.8-5.4,3-9.9,6.7-13.7,3.7-3.7,8.1-6.6,13.1-8.7,5-2.1,10.1-3.5,15.4-4.4,5.3-.9,9.9-1.3,14.1-1.3,9.8,0,18.5,2.3,26.4,6.9,7.8,4.6,12.8,13,14.8,25,2.3,13.3,4.2,28.6,5.8,45.6,1.5,17.1,2.9,34.5,4,52.4,1.2,17.8,2,35.4,2.5,52.7.5,17.3.8,32.9.8,46.8s-1.7,12.9-5,17.9c-3.3,5-7.5,9.1-12.5,12.3-5,3.2-10.6,5.6-16.7,7.1-6.2,1.5-12.1,2.3-17.7,2.3Z"/>
                <path d="M572.9,340.1c-18,0-33.5-1-46.6-3.1-13.1-2.1-23.7-5.5-32-10.4-8.2-4.9-14.3-11.2-18.3-19.1-4-7.8-6-17.6-6-29.5s3.7-28.1,11.2-36.6c7.4-8.5,15.9-12.7,25.4-12.7s8.5,1.2,12.5,3.7c4,2.4,8.3,5.1,12.9,7.9,4.6,2.8,9.8,5.5,15.6,7.9,5.8,2.4,12.5,3.7,20.2,3.7s4.7-.3,8.1-1c3.3-.6,5-2.5,5-5.6s-1.9-6.7-5.6-10c-3.7-3.3-6.9-5.9-9.4-7.7-6.4-4.6-13-8.5-19.8-11.5-6.8-3.1-13.3-6-19.6-8.9-6.3-2.8-12.3-5.8-18.1-9-5.8-3.2-10.8-7.2-15-12.1-4.2-4.9-7.6-10.9-10-18.1-2.4-7.2-3.7-16-3.7-26.6s2.6-25.5,7.9-35.6c5.3-10.1,12.3-18.6,21.2-25.4,8.9-6.8,19.1-11.9,30.6-15.4,11.5-3.5,23.6-5.2,36.2-5.2,38.2,0,67.2,4.8,86.8,14.4,19.6,9.6,29.5,24.6,29.5,44.9s-1,8-3.1,13.1c-2.1,5.1-4.7,10-7.9,14.6-3.2,4.6-6.9,8.6-11,11.9-4.1,3.3-8.2,5-12.3,5s-6.5-1-9.6-2.9c-3.1-1.9-6.6-4-10.6-6.4-4-2.3-8.7-4.4-14.2-6.4-5.5-1.9-12.5-2.9-21-2.9s-2.4,0-4.2.2c-1.8.1-3.5.5-5,1-1.5.5-2.9,1.2-4,2.1-1.2.9-1.7,2.2-1.7,4,0,3.8,1.9,7.3,5.6,10.2,3.7,3,8.2,5.6,13.5,7.9,5.3,2.3,10.6,4.4,16,6.2,5.4,1.8,9.6,3.3,12.7,4.6,8,3.3,15.7,6.4,23.3,9.2,7.6,2.8,14.3,6.5,20.2,11,5.9,4.5,10.6,10.3,14.2,17.5,3.6,7.2,5.4,16.6,5.4,28.1,0,32.3-10.1,55.9-30.4,70.6-20.3,14.8-51.8,22.1-94.7,22.1Z"/>
                <path d="M810.4,340.1c-18,0-33.5-1-46.6-3.1-13.1-2.1-23.7-5.5-32-10.4-8.2-4.9-14.3-11.2-18.3-19.1-4-7.8-6-17.6-6-29.5s3.7-28.1,11.2-36.6c7.4-8.5,15.9-12.7,25.4-12.7s8.5,1.2,12.5,3.7c4,2.4,8.3,5.1,12.9,7.9,4.6,2.8,9.8,5.5,15.6,7.9,5.8,2.4,12.5,3.7,20.2,3.7s4.7-.3,8.1-1c3.3-.6,5-2.5,5-5.6s-1.9-6.7-5.6-10c-3.7-3.3-6.9-5.9-9.4-7.7-6.4-4.6-13-8.5-19.8-11.5-6.8-3.1-13.3-6-19.6-8.9-6.3-2.8-12.3-5.8-18.1-9-5.8-3.2-10.8-7.2-15-12.1-4.2-4.9-7.6-10.9-10-18.1-2.4-7.2-3.7-16-3.7-26.6s2.6-25.5,7.9-35.6c5.3-10.1,12.3-18.6,21.2-25.4,8.9-6.8,19.1-11.9,30.6-15.4,11.5-3.5,23.6-5.2,36.2-5.2,38.2,0,67.2,4.8,86.8,14.4,19.6,9.6,29.5,24.6,29.5,44.9s-1,8-3.1,13.1c-2.1,5.1-4.7,10-7.9,14.6-3.2,4.6-6.9,8.6-11,11.9-4.1,3.3-8.2,5-12.3,5s-6.5-1-9.6-2.9c-3.1-1.9-6.6-4-10.6-6.4-4-2.3-8.7-4.4-14.2-6.4-5.5-1.9-12.5-2.9-21-2.9s-2.4,0-4.2.2c-1.8.1-3.5.5-5,1-1.5.5-2.9,1.2-4,2.1-1.2.9-1.7,2.2-1.7,4,0,3.8,1.9,7.3,5.6,10.2,3.7,3,8.2,5.6,13.5,7.9,5.3,2.3,10.6,4.4,16,6.2,5.4,1.8,9.6,3.3,12.7,4.6,8,3.3,15.7,6.4,23.3,9.2,7.6,2.8,14.3,6.5,20.2,11,5.9,4.5,10.6,10.3,14.2,17.5,3.6,7.2,5.4,16.6,5.4,28.1,0,32.3-10.1,55.9-30.4,70.6-20.3,14.8-51.8,22.1-94.7,22.1Z"/>
                <path d="M1020.8,341c-11.1-4.3-21.6-10.1-31.3-16.9-18.9-13.3-24.4-27.9-30.9-49.6-3.3-11.2-5.9-22.5-7.7-34.1-1.8-11.5-3-22.8-3.5-33.9-.5-11-.8-20.7-.8-28.9,0-13.6.3-27.5,1-41.6.6-14.1,2.1-27.8,4.4-41.2,1-5.4,3.3-9.9,6.7-13.7,3.5-3.7,7.6-6.7,12.3-9,4.7-2.3,9.8-4,15.2-5,5.4-1,10.5-1.5,15.4-1.5s10.5.6,16,1.7c5.5,1.2,10.7,3,15.6,5.4,4.9,2.4,8.9,5.8,11.9,10,3.1,4.2,4.6,9.4,4.6,15.6s-.3,8.7-1,12.9c-.6,4.2-1.2,8.5-1.7,12.9-1.3,8.2-2.1,16.3-2.5,24.3-.4,8-.6,16-.6,24.3s0,6.5.2,11.9c.1,5.4.4,11.4,1,18.1.5,6.7,1.2,13.5,2.1,20.6.9,7.1,2.2,13.5,3.8,19.4,1.7,5.9,3.7,10.7,6,14.4,2.3,3.7,5.1,5.6,8.5,5.6s6.5-2.2,8.9-6.7c2.3-4.5,4.2-10.1,5.6-16.9,1.4-6.8,2.5-14.4,3.3-22.9.8-8.5,1.3-16.6,1.7-24.4.4-7.8.6-14.9.6-21.4v-13.9c0-11.3-1.3-21.2-4-29.8-2.7-8.6-4-17-4-25.2s1.3-11.4,3.8-15.8c2.6-4.4,6-8,10.2-10.8,4.2-2.8,8.9-4.9,14.1-6.2,5.1-1.3,10.4-1.9,15.8-1.9,9.2,0,17.1,2.2,23.5,6.5,6.4,4.4,11.7,10.1,16,17.3,4.2,7.2,7.5,15.3,9.8,24.4,2.3,9.1,4,18.3,5.2,27.5,1.2,9.2,1.9,18.3,2.1,27.1.3,8.9.4,16.5.4,22.9,0,45.7,5.1,93.2-31.7,127.6-24.5,22.9-59.6,33-92.9,29.1-11.3-1.3-22.4-4.2-33.1-8.3Z"/>
              </g>
            </svg>
          </Link>
        </div>

        {/* RIGHT — language + account + cart */}
        <div className="flex items-center justify-end gap-2 md:gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher currentLang={lang} />
          </div>

          <Link
            href={`/${lang}/account`}
            aria-label="Account"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[rgba(254,240,214,0.55)] inline-flex items-center justify-center text-[#fef0d6] hover:bg-[rgba(254,240,214,0.15)] transition-colors"
          >
            <User className="w-[17px] h-[17px]" />
          </Link>

          <button
            type="button"
            onClick={openCart}
            aria-label="Cart"
            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[rgba(254,240,214,0.55)] inline-flex items-center justify-center text-[#fef0d6] hover:bg-[rgba(254,240,214,0.15)] transition-colors"
          >
            <ShoppingBag className="w-[17px] h-[17px]" />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#f3b62b] text-[#2a1d14] text-[10px] font-extrabold inline-flex items-center justify-center px-1"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Headline + CTA — vertically centred */}
      <div className="relative z-20 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-6">
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

        <h1
          className="font-retro-display"
          style={{
            fontFamily: lang === "ka" ? ALK_LIFE : FRAUNCES,
            fontWeight: 900,
            fontStyle: lang === "ka" ? "normal" : "italic",
            fontSize: "clamp(30px, 7vw, 96px)",
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

        <FlowerCorner side="left" />
        <FlowerCorner side="right" />

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
    </section>
  );
}

/* ── Helpers ── */

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
      {text.split(/(\s+)/).map((tok, ti) => {
        // Whitespace tokens must keep their width — an inline-block span that
        // holds only a space collapses to zero, gluing neighbouring words
        // together ("A little" → "Alittle"). Render the gap with white-space:pre.
        if (/^\s+$/.test(tok)) {
          return (
            <span key={ti} style={{ whiteSpace: "pre" }}>{tok}</span>
          );
        }
        const isRainbow = RAINBOW_WORDS.includes(tok.toLowerCase());
        return (
          <span key={ti} className="inline-block">
            {Array.from(tok).map((ch, ci) => (
              <motion.span
                key={ci}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.215, 0.61, 0.355, 1] } },
                }}
                className="inline-block"
                style={isRainbow ? { color: RAINBOW_COLORS[ci % RAINBOW_COLORS.length] } : undefined}
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </span>
        );
      })}
    </motion.span>
  );
}

// Words that get rainbow per-letter colouring. Each character cycles through
// the brand palette so the headline word stands out playfully.
const RAINBOW_WORDS = ["ფერადი", "colour", "colorful"];
const RAINBOW_COLORS = ["#d56826", "#f3b62b", "#3f6f56", "#c4849a", "#9e8abf", "#6b9eb5"];

function FlowerCorner({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
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
        <g transform="translate(50 50)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="0" cy="-20" rx="9" ry="18" fill="#f3b62b" transform={`rotate(${deg})`} />
          ))}
          <circle r="9" fill="#3f6f56" />
        </g>
      </motion.svg>
    </motion.div>
  );
}
