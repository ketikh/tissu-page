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
};

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
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {/* Top stripe */}
      <div
        className="h-2 w-full"
        style={{ background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
        aria-hidden="true"
      />

      <div className="container py-14 md:py-22 max-w-215">
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

        {/* Accordion list */}
        <div className="space-y-3">
          {visible.length === 0 ? (
            <div
              className="text-center py-14"
              style={{
                fontFamily: FRAUNCES,
                fontStyle: "italic",
                fontSize: 22,
                color: C.champagne,
                background: C.beige,
                border: `1.5px dashed ${C.champagne}`,
                borderRadius: 28,
              }}
            >
              {isKa ? "პასუხები ვერ მოიძებნა." : "Nothing matched that search."}
            </div>
          ) : (
            visible.map((f, i) => {
              const open = activeIndex === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden transition-all"
                  style={{
                    background: open ? C.beige : C.cream,
                    borderRadius: 22,
                    border: `1.5px solid ${open ? C.ink : C.champagne}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(open ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                  >
                    <span
                      style={{
                        fontFamily: isKa ? ALK_LIFE : FRAUNCES,
                        fontStyle: isKa ? "normal" : "italic",
                        fontWeight: 700,
                        fontSize: "clamp(16px, 1.5vw, 20px)",
                        color: open ? C.green : C.ink,
                        lineHeight: 1.3,
                        transition: "color 0.2s",
                      }}
                    >
                      {f.question[lang]}
                    </span>
                    <span
                      className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors"
                      style={{
                        background: open ? C.ink : C.beige,
                        color: open ? C.cream : C.ink,
                        border: `1.5px solid ${open ? C.ink : C.champagne}`,
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
                        <div className="px-6 pb-6">
                          <div
                            className="pt-4"
                            style={{ borderTop: `1.5px dashed ${C.champagne}` }}
                          >
                            <p
                              style={{
                                fontFamily: FRAUNCES,
                                fontStyle: "italic",
                                fontSize: 15,
                                color: C.greenDeep,
                                lineHeight: 1.7,
                              }}
                            >
                              {f.answer[lang]}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Still have questions */}
        <div
          className="mt-16 md:mt-24 py-12 px-8 md:px-14 text-center"
          style={{ background: C.ink, borderRadius: 32 }}
        >
          <h2
            className="mb-3"
            style={{
              fontFamily: isKa ? ALK_LIFE : PACIFICO,
              fontWeight: 400,
              fontSize: "clamp(24px, 3vw, 40px)",
              color: C.cream,
            }}
          >
            {isKa ? "კიდევ გაქვს კითხვა?" : "Still have a question?"}
          </h2>
          <p
            className="mb-7 mx-auto"
            style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 15, color: C.champagne, maxWidth: 420 }}
          >
            {isKa
              ? "მოგვწერე — პასუხს ხელით ვწერთ 1-2 დღეში."
              : "Drop us a line — we reply by hand within a day or two."}
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
              padding: "13px 30px",
              boxShadow: `0 5px 0 ${C.mustardDeep}`,
            }}
          >
            {isKa ? "კონტაქტი" : "Contact us"}
            <span aria-hidden="true">→</span>
          </Link>
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
