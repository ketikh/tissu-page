"use client";

import { useState } from "react";
import Link from "next/link";
import { FAQItem } from "@/lib/types";
import { Locale } from "@/i18n/config";
import { Plus, Minus, Search, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="bg-[var(--tissu-cream)]">
      <div className="container py-16 md:py-24 max-w-[900px]">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink-soft)]">
            <span className="w-2 h-2 rounded-full bg-[var(--tissu-mustard)]" />
            {isKa ? "დახმარება" : "Care & support"}
          </span>
          <h1 className="ka-display-xl font-serif text-[42px] sm:text-[56px] md:text-[72px] leading-[1.05] tracking-[-0.02em] mt-6 mb-5 text-[var(--tissu-ink)]">
            {isKa ? (
              <>
                ხშირად <em className="not-italic italic text-[var(--tissu-terracotta)]">დასმული</em>
                <br />
                კითხვები.
              </>
            ) : (
              <>
                Questions, <em className="not-italic italic text-[var(--tissu-terracotta)]">answered</em>
                <br />
                softly.
              </>
            )}
          </h1>
          <p className="text-[17px] leading-[1.6] text-[var(--tissu-ink-soft)] max-w-[580px]">
            {isKa
              ? "მოკლე პასუხები ყველაფერზე — მასალა, მოვლა, მიწოდება, დაბრუნება."
              : "Short answers to the questions we get most — material, care, shipping, returns."}
          </p>

          {/* Search */}
          <div className="relative max-w-[520px] mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tissu-ink-soft)]" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isKa ? "მოძებნე..." : "Search the FAQ..."}
              className="w-full pl-12 pr-5 py-3.5 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[15px] text-[var(--tissu-ink)] outline-none focus:border-[var(--tissu-ink)] placeholder:text-[var(--tissu-ink-soft)]"
            />
          </div>
        </div>

        {/* List */}
        <div className="space-y-3.5">
          {visible.length === 0 ? (
            <div className="text-center py-16 bg-[var(--tissu-white)] border border-dashed border-[var(--border)] rounded-[28px] font-serif text-[22px] text-[var(--tissu-ink-soft)]">
              {isKa ? "პასუხები ვერ მოიძებნა." : "Nothing matched that search."}
            </div>
          ) : (
            visible.map((f, i) => {
              const open = activeIndex === i;
              return (
                <div
                  key={i}
                  className={`rounded-[22px] border bg-[var(--tissu-white)] transition-colors overflow-hidden ${
                    open
                      ? "border-[var(--tissu-ink)]"
                      : "border-[var(--border)] hover:border-[var(--tissu-ink)]/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(open ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                  >
                    <span
                      className={`font-serif text-[19px] md:text-[21px] leading-snug transition-colors ${
                        open ? "text-[var(--tissu-terracotta)]" : "text-[var(--tissu-ink)]"
                      }`}
                    >
                      {f.question[lang]}
                    </span>
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors ${
                        open
                          ? "bg-[var(--tissu-ink)] text-[var(--tissu-cream)]"
                          : "bg-[var(--tissu-cream)] text-[var(--tissu-ink)]"
                      }`}
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
                          <div className="border-t border-dashed border-[var(--border)] pt-4">
                            <p className="text-[15px] leading-[1.65] text-[var(--tissu-ink-soft)]">
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
        <div className="mt-16 md:mt-24 p-8 md:p-12 rounded-[28px] bg-[var(--tissu-ink)] text-[var(--tissu-cream)] text-center">
          <h2 className="ka-display-md font-serif text-[28px] md:text-[36px] leading-[1.1] mb-3">
            {isKa ? "კიდევ გაქვს კითხვა?" : "Still have a question?"}
          </h2>
          <p className="text-[15px] opacity-80 max-w-[460px] mx-auto mb-6">
            {isKa
              ? "მოგვწერე — პასუხს ხელით ვწერთ 1-2 დღეში."
              : "Drop us a line — we reply by hand within a day or two."}
          </p>
          <Link
            href={`/${lang}/contact`}
            className="inline-flex items-center gap-2.5 bg-[var(--tissu-terracotta)] text-white px-6 py-3.5 rounded-full font-extrabold text-[14px] tracking-[0.04em] hover:bg-[var(--tissu-mustard)] hover:text-[var(--tissu-ink)] transition-colors"
          >
            {dictionary?.footer?.help?.contact ?? (isKa ? "კონტაქტი" : "Contact")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
