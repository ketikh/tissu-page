"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { Locale } from "@/i18n/config";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const C = { cream: "#fef0d6", ink: "#2a1d14", burnt: "#d56826", mustard: "#f3b62b", rose: "#c4849a" };

interface FailedClientProps {
  lang: Locale;
  dictionary?: any;
}

export default function FailedClient({ lang }: FailedClientProps) {
  const isKa = lang === "ka";
  return (
    <div
      style={{
        background: "#fffcf5",
        backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
        backgroundSize: "26px 26px",
        position: "relative",
        overflow: "hidden",
        padding: "60px 16px 80px",
        minHeight: "60vh",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div className="container max-w-xl mx-auto" style={{ textAlign: "center" }}>
        <span
          aria-hidden="true"
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: `${C.rose}1f`, color: C.rose,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <AlertCircle size={36} />
        </span>
        <h1 style={{
          fontFamily: FRAUNCES, fontWeight: 700,
          fontSize: "clamp(26px, 4vw, 38px)",
          color: C.ink, letterSpacing: "-0.01em",
          lineHeight: 1.15,
          margin: "0 0 12px",
        }}>
          {isKa ? "შეკვეთის გაგზავნა ვერ მოხერხდა" : "We couldn't send your order"}
        </h1>
        <p style={{
          fontFamily: SANS, fontSize: 15,
          color: C.ink, opacity: 0.7, lineHeight: 1.6,
          maxWidth: 440, margin: "0 auto 28px",
        }}>
          {isKa
            ? "შეიძლება ქსელის პრობლემაა. ცადე ხელახლა — შენი მონაცემები არსად არ წავსულა, არცერთი თანხა არ ჩამოგვირიცხავს."
            : "Probably a network hiccup. Try again — your details weren't sent anywhere yet and no money has been taken."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href={`/${lang}/checkout`}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
              background: C.burnt, color: C.cream,
              borderRadius: 14, padding: "14px 24px",
              textDecoration: "none",
            }}
            className="hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            {isKa ? "ხელახლა ცდა" : "Try again"}
          </Link>
          <Link
            href={`/${lang}/contact`}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
              background: "transparent", color: C.ink,
              border: `1.5px solid rgba(42,29,20,0.18)`,
              borderRadius: 14, padding: "14px 24px",
              textDecoration: "none",
            }}
            className="hover:bg-[rgba(42,29,20,0.04)]"
          >
            <MessageCircle size={16} />
            {isKa ? "მოგვწერე" : "Contact us"}
          </Link>
        </div>
      </div>
    </div>
  );
}
