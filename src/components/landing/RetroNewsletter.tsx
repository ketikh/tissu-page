"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface RetroNewsletterProps {
  isKa?: boolean;
}

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  burnt: "#d56826",
  green: "#3f6f56",
  ink: "#2a1d14",
};

export default function RetroNewsletter({ isKa = false }: RetroNewsletterProps) {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-28" style={{ background: C.green, color: C.cream }}>
      {/* Soft scattered stars */}
      {[
        { left: "8%", top: "20%", size: 18, delay: 0 },
        { right: "12%", top: "28%", size: 14, delay: 0.6 },
        { left: "18%", bottom: "18%", size: 12, delay: 1.2 },
        { right: "22%", bottom: "22%", size: 16, delay: 1.8 },
      ].map((s, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            left: s.left,
            right: s.right,
            top: s.top,
            bottom: s.bottom,
            color: C.mustard,
            fontSize: s.size,
          }}
          animate={{ rotate: [0, 360], opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}

      <div className="container relative text-center">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em]"
          style={{ color: C.mustard }}
        >
          {isKa ? "გამოგვწერე" : "Boogie with us"}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1 }}
          className="font-retro-display mt-4 leading-[0.95]"
          style={{
            fontFamily: PACIFICO,
            fontSize: "clamp(40px, 6.5vw, 84px)",
            color: C.cream,
          }}
        >
          {isKa ? "პირველს გითხარით." : "first dibs on the drop."}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-3 max-w-md mx-auto"
          style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 16, opacity: 0.85 }}
        >
          {isKa
            ? "თვეში ორი იმეილი, მეტი არა. ახალი ფერები, სტუდიის კადრები და 10%-იანი კოდი ჩვენგან."
            : "Two emails a month, max. New colours, studio peeks, and a 10% code on us."}
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 mx-auto flex flex-col sm:flex-row max-w-lg gap-2"
        >
          <input
            type="email"
            required
            placeholder={isKa ? "your@email.ge" : "you@lovely.com"}
            className="flex-1 rounded-full px-6 py-3.5 outline-none border-0 text-[15px]"
            style={{
              background: C.cream,
              color: C.ink,
              fontFamily: FRAUNCES,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)",
            }}
          />
          <button
            type="submit"
            className="rounded-full px-7 py-3.5 font-extrabold text-[12px] uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            style={{
              background: C.mustard,
              color: C.ink,
              boxShadow: `0 5px 0 ${C.mustardDeep}`,
              fontFamily: FRAUNCES,
              fontWeight: 800,
            }}
          >
            {isKa ? "გამოწერა" : "Sign me up"}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 flex flex-col items-center"
        >
          <Image
            src="/static/logo.png"
            alt="Tissu"
            width={150}
            height={48}
            className="h-9 w-auto"
            style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.3))" }}
          />
          <div className="mt-3 text-[10px] uppercase tracking-[0.3em] opacity-70">
            {isKa ? "სიყვარულით თბილისიდან" : "Made with love in Tbilisi"}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
