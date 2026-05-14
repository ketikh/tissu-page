"use client";

import { Locale } from "@/i18n/config";
import { getLandingCopy } from "./landingCopy";
import type { StorefrontProduct } from "@/lib/admin-api";
import RetroHero from "@/components/landing/RetroHero";
import RetroProducts from "@/components/landing/RetroProducts";
import RetroNecklaces from "@/components/landing/RetroNecklaces";
import RetroAbout from "@/components/landing/RetroAbout";
import RetroReviews from "@/components/landing/RetroReviews";

interface HomeProps {
  lang: Locale;
  dictionary: any;
  products: StorefrontProduct[];
  heroCMS?: Record<string, string>;
}

function pickLocalized(cms: Record<string, string> | undefined, base: string, lang: Locale, fallback: string): string {
  if (!cms) return fallback;
  const key = `${base}_${lang}`;
  const v = cms[key];
  return v && v.trim() ? v.trim() : fallback;
}

export default function HomeClient({ lang, products: rawProducts, heroCMS }: HomeProps) {
  const copy = getLandingCopy(lang);

  // CMS values win when present; otherwise we keep the original copy.
  const eyebrow      = pickLocalized(heroCMS, "eyebrow",  lang, "");
  const titlePart1   = pickLocalized(heroCMS, "title",    lang, copy.hero.titlePart1);
  const titleItalic  = pickLocalized(heroCMS, "italic",   lang, copy.hero.titleItalic);
  const titlePart2   = ""; // Single-line headline once CMS is filled in.
  const lead         = pickLocalized(heroCMS, "lead",     lang, copy.hero.lead);
  const ctaText      = pickLocalized(heroCMS, "cta_text", lang, copy.hero.ctaPrimary);
  const ctaLink      = (heroCMS?.cta_link || "").trim() || `/${lang}/shop`;

  // If CMS is filled in we use its title; otherwise the legacy two-line copy.
  const headlineLine1 = heroCMS
    ? `${titlePart1} ${titleItalic}`.trim()
    : copy.hero.titlePart1 + " " + copy.hero.titleItalic;
  const headlineLine2 = heroCMS ? titlePart2 : copy.hero.titlePart2;

  return (
    <div style={{ background: "#fef0d6" }}>
      <RetroHero
        brand={eyebrow || "Tissu"}
        headlineLine1={headlineLine1}
        headlineLine2={headlineLine2}
        kicker={lead}
        ctaLabel={ctaText}
        ctaHref={ctaLink}
        lang={lang}
      />

      <RetroProducts
        isKa={lang === "ka"}
        shopHref={`/${lang}/shop`}
        products={rawProducts}
        limit={4}
      />

      <RetroNecklaces
        isKa={lang === "ka"}
        shopHref={`/${lang}/shop`}
        products={rawProducts}
      />

      <RetroAbout isKa={lang === "ka"} shopHref={`/${lang}/shop`} />
      <RetroReviews isKa={lang === "ka"} />
    </div>
  );
}
