"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function NotFound() {
  const params = useParams();
  const lang = (params?.lang as string) || "ka";
  const isKa = lang === "ka";

  return (
    <div className="bg-[var(--tissu-cream)] min-h-[70vh] flex items-center">
      <div className="container py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1.05fr_1fr] items-center">
          <div>
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink-soft)]">
              <span className="w-2 h-2 rounded-full bg-[var(--tissu-mustard)]" />
              {isKa ? "შეცდომა · 404" : "Error · 404"}
            </span>

            <h1 className="ka-display-xl font-serif text-[44px] sm:text-[60px] md:text-[78px] lg:text-[96px] leading-[1] tracking-[-0.02em] mt-6 mb-5 text-[var(--tissu-ink)]">
              {isKa ? (
                <>
                  ეს გვერდი{" "}
                  <em className="not-italic italic text-[var(--tissu-terracotta)]">დაიკარგა</em>.
                </>
              ) : (
                <>
                  This page got <em className="not-italic italic text-[var(--tissu-terracotta)]">lost</em>.
                </>
              )}
            </h1>

            <p className="text-[17px] leading-[1.6] text-[var(--tissu-ink-soft)] max-w-[480px] mb-8">
              {isKa
                ? "ბმული, რომელიც გახსენი, ან წაშლილია, ან ცოტა ხანში დაბრუნდება. ამასობაში — შემოგვიარე მაღაზიაში."
                : "The link you opened is gone, or it'll be back soon. Meanwhile — pop into the shop."}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${lang}/shop`}
                className="inline-flex items-center gap-3 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-7 py-4 rounded-full font-extrabold text-[15px] tracking-[0.02em] shadow-[0_6px_0_var(--tissu-terracotta)] hover:translate-y-[3px] hover:shadow-[0_3px_0_var(--tissu-terracotta)] transition-[transform,box-shadow] duration-200"
              >
                <ShoppingBag className="w-4 h-4" />
                {isKa ? "მაღაზია" : "Go to shop"}
                <span className="w-7 h-7 rounded-full bg-[var(--tissu-terracotta)] inline-flex items-center justify-center text-white">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              <Link
                href={`/${lang}`}
                className="inline-flex items-center px-7 py-4 rounded-full font-bold text-[15px] text-[var(--tissu-ink)] border-[1.5px] border-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
              >
                {isKa ? "მთავარი" : "Home"}
              </Link>
            </div>
          </div>

          {/* Decorative side */}
          <div className="relative h-[320px] md:h-[420px]">
            <div className="absolute inset-0 m-auto w-[88%] h-[88%] bg-[var(--tissu-lilac-soft)] shape-blob-morph" />
            <div className="absolute inset-0 m-auto w-[260px] md:w-[320px] h-[260px] md:h-[320px] rounded-full bg-[var(--tissu-mustard)] animate-bob flex items-center justify-center">
              <span className="font-serif text-[120px] md:text-[160px] leading-none text-[var(--tissu-ink)]">
                404
              </span>
            </div>
            <div className="absolute top-[8%] right-[6%] w-[100px] h-[100px] z-[2]">
              <div className="relative w-full h-full rounded-full bg-[var(--tissu-cream)] border border-[var(--border)] flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 120 120">
                  <defs>
                    <path
                      id="nf-spin"
                      d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0"
                    />
                  </defs>
                  <text
                    fill="#2a1d14"
                    style={{
                      fontFamily: "var(--font-nunito), sans-serif",
                      fontWeight: 800,
                      fontSize: 10,
                      letterSpacing: "0.2em",
                    }}
                  >
                    <textPath href="#nf-spin">
                      · oops · ეს · გვერდი · დაიკარგა ·
                    </textPath>
                  </text>
                </svg>
                <span className="font-serif text-[18px] text-[var(--tissu-terracotta)]">♡</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
