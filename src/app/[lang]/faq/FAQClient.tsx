"use client";

import { useState } from "react";
import Link from "next/link";
import { FAQItem } from "@/lib/types";
import { Locale } from "@/i18n/config";
import { Plus, Minus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";
const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";

const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  ink: "#2a1d14",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  green: "#3f6f56",
  greenDeep: "#2c5640",
  champagne: "#c9a86c",
  rose: "#c4849a",
  burnt: "#d56826",
  lilac: "#9e8abf",
};

// Rotating card accents — each FAQ card picks the next colour in the cycle so
// the list reads as a colourful zine rather than a uniform accordion.
const ACCENTS = [
  { color: C.burnt,   shadow: "rgba(213,104,38,0.30)" },
  { color: C.mustard, shadow: "rgba(217,152,32,0.34)" },
  { color: C.green,   shadow: "rgba(63,111,86,0.30)" },
  { color: C.rose,    shadow: "rgba(196,132,154,0.30)" },
  { color: C.lilac,   shadow: "rgba(158,138,191,0.28)" },
];

interface FAQClientProps {
  faqs: FAQItem[];
  lang: Locale;
  dictionary: any;
}

export default function FAQClient({ faqs, lang, dictionary }: FAQClientProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [q, setQ] = useState("");
  const isKa = lang === "ka";

  const visible = faqs.filter(
    (f) =>
      f.question[lang].toLowerCase().includes(q.toLowerCase()) ||
      f.answer[lang].toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{
      background: "#fffcf5",
      backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
      backgroundSize: "26px 26px",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Sprinkled stars + pebbles — home-page vibe */}
      <span aria-hidden="true" style={{ position: "absolute", top: 80, left: "5%", opacity: 0.85, color: C.mustard }}>
        <svg width={18} height={18} viewBox="0 0 24 24"><path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill="currentColor" /></svg>
      </span>
      <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "8%", opacity: 0.7, color: "#d56826" }}>
        <svg width={12} height={12} viewBox="0 0 24 24"><path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill="currentColor" /></svg>
      </span>
      <span aria-hidden="true" style={{ position: "absolute", top: "40%", right: "3%", opacity: 0.6, color: C.rose }}>
        <svg width={14} height={14} viewBox="0 0 24 24"><path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill="currentColor" /></svg>
      </span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 200, left: "8%", opacity: 0.7, color: C.mustard }}>
        <svg width={16} height={16} viewBox="0 0 24 24"><path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill="currentColor" /></svg>
      </span>
      <div aria-hidden="true" style={{ position: "absolute", top: 200, left: "-3%", width: 120, height: 120, background: "#d56826", opacity: 0.22, borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%", transform: "rotate(-12deg)" }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 90, right: "-2%", width: 90, height: 90, background: C.mustard, opacity: 0.34, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%", transform: "rotate(18deg)" }} />
      <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "-2%", width: 70, height: 70, background: C.green, opacity: 0.22, borderRadius: "50%" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 80, right: "-3%", width: 130, height: 130, background: C.mustard, opacity: 0.28, borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%", transform: "rotate(10deg)" }} />

      <div className="container py-14 md:py-22 max-w-215" style={{ position: "relative" }}>
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span
            className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em] mb-5"
            style={{ color: C.green, fontFamily: FRAUNCES }}
          >
            {isKa ? "დახმარება" : "Care & support"}
          </span>

          <h1
            className="leading-[0.95] mb-5"
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(34px, 5.5vw, 72px)",
              color: C.ink,
            }}
          >
            {isKa ? "ხშირად დასმული კითხვები." : <>Questions,<br />answered.</>}
          </h1>

          <p
            style={{
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              fontSize: "clamp(14px, 1.5vw, 17px)",
              color: C.greenDeep,
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            {isKa
              ? "მოკლე პასუხები ყველაფერზე — მასალა, მოვლა, მიწოდება, დაბრუნება."
              : "Short answers to the questions we get most — material, care, shipping, returns."}
          </p>

          {/* Search */}
          <div className="relative max-w-[520px] mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.champagne }} />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isKa ? "მოძებნე..." : "Search the FAQ..."}
              className="w-full pl-12 pr-5 py-3.5 outline-none"
              style={{
                fontFamily: FRAUNCES,
                fontSize: 14,
                background: C.beige,
                border: `1.5px solid ${C.champagne}`,
                borderRadius: 999,
                color: C.ink,
              }}
            />
          </div>
        </div>

        {/* Accordion list — colourful cards with a rotating accent colour. */}
        <div className="space-y-4">
          {visible.length === 0 ? (
            <div
              className="text-center py-14"
              style={{
                fontFamily: FRAUNCES,
                fontStyle: "italic",
                fontSize: 22,
                color: C.champagne,
                background: "white",
                border: `1.5px solid ${C.champagne}`,
                borderRadius: 28,
              }}
            >
              {isKa ? "პასუხები ვერ მოიძებნა." : "Nothing matched that search."}
            </div>
          ) : (
            visible.map((f, i) => {
              const open = activeIndex === i;
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <motion.div
                  key={i}
                  layout
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden"
                  style={{
                    background: "white",
                    borderRadius: 22,
                    border: `1.5px solid ${open ? accent.color : "rgba(42,29,20,0.08)"}`,
                    boxShadow: open
                      ? `0 12px 0 ${accent.shadow}, 0 18px 32px rgba(42,29,20,0.10)`
                      : `0 4px 0 rgba(42,29,20,0.06)`,
                    transform: open ? "translateY(-2px)" : "translateY(0)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                  }}
                >
                  {/* Coloured left edge — grows wider when expanded. */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0, top: 0, bottom: 0,
                      width: open ? 8 : 5,
                      background: accent.color,
                      transition: "width 0.25s ease",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setActiveIndex(open ? null : i)}
                    className="w-full pl-7 pr-5 py-5 flex items-center justify-between text-left gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Number bubble in the accent colour. */}
                      <span
                        style={{
                          width: 38, height: 38,
                          borderRadius: 999,
                          background: open ? accent.color : `${accent.color}1f`,
                          color: open ? C.cream : accent.color,
                          fontFamily: FRAUNCES, fontWeight: 800, fontSize: 13,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                          transition: "background 0.25s ease, color 0.25s ease",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontFamily: isKa ? ALK_LIFE : FRAUNCES,
                          fontStyle: isKa ? "normal" : "italic",
                          fontWeight: 700,
                          fontSize: "clamp(16px, 1.55vw, 20px)",
                          color: C.ink,
                          lineHeight: 1.3,
                        }}
                      >
                        {f.question[lang]}
                      </span>
                    </div>
                    <span
                      className="shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center"
                      style={{
                        background: open ? accent.color : "white",
                        color: open ? C.cream : accent.color,
                        border: `1.5px solid ${accent.color}`,
                        transition: "background 0.25s ease, color 0.25s ease",
                      }}
                    >
                      {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="pl-20 pr-6 pb-6">
                          <p
                            style={{
                              fontFamily: FRAUNCES,
                              fontSize: 15,
                              color: C.ink,
                              opacity: 0.75,
                              lineHeight: 1.7,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {f.answer[lang]}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Still have questions — bright green block, mustard CTA, decorative spots */}
        <div
          className="relative mt-16 md:mt-24 py-14 px-8 md:px-14 text-center overflow-hidden"
          style={{ background: C.green, borderRadius: 32 }}
        >
          {/* Decorative pebbles inside the CTA */}
          <span aria-hidden="true" style={{ position: "absolute", top: -24, left: -24, width: 100, height: 100, background: C.mustard, opacity: 0.32, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%" }} />
          <span aria-hidden="true" style={{ position: "absolute", bottom: -30, right: -10, width: 130, height: 130, background: C.rose, opacity: 0.28, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%" }} />
          <span aria-hidden="true" style={{ position: "absolute", top: 30, right: "30%", color: C.mustard, opacity: 0.65 }}>
            <svg width={20} height={20} viewBox="0 0 24 24"><path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill="currentColor" /></svg>
          </span>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              className="mb-3"
              style={{
                fontFamily: isKa ? ALK_LIFE : PACIFICO,
                fontWeight: 400,
                fontSize: "clamp(26px, 3.3vw, 44px)",
                color: C.cream,
              }}
            >
              {isKa ? "კიდევ გაქვს კითხვა?" : "Still have a question?"}
            </h2>
            <p
              className="mb-7 mx-auto"
              style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 16, color: C.cream, opacity: 0.85, maxWidth: 420 }}
            >
              {isKa ? "უბრალოდ დაგვიკავშირდი." : "Just get in touch."}
            </p>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2.5 font-extrabold text-[13px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              style={{
                fontFamily: FRAUNCES,
                fontWeight: 800,
                background: C.mustard,
                color: C.ink,
                borderRadius: 999,
                padding: "14px 32px",
                boxShadow: `0 6px 0 ${C.mustardDeep}`,
              }}
            >
              {isKa ? "კონტაქტი" : "Contact us"}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom stripe */}
      <div
        className="h-2 w-full"
        style={{ background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
        aria-hidden="true"
      />
    </div>
  );
}
