"use client";

import { Locale } from "@/i18n/config";
import { getLandingCopy } from "./landingCopy";
import type { StorefrontProduct } from "@/lib/admin-api";
import RetroHero from "@/components/landing/RetroHero";
import RetroProducts from "@/components/landing/RetroProducts";
import RetroNecklaces from "@/components/landing/RetroNecklaces";
import RetroAbout from "@/components/landing/RetroAbout";
import RetroReviews from "@/components/landing/RetroReviews";
import RetroNewsletter from "@/components/landing/RetroNewsletter";

interface HomeProps {
  lang: Locale;
  dictionary: any;
  products: StorefrontProduct[];
}

export default function HomeClient({ lang, products: rawProducts }: HomeProps) {
  const copy = getLandingCopy(lang);

  return (
    <div style={{ background: "#fef0d6" }}>
      <RetroHero
        brand="Tissu"
        headlineLine1={copy.hero.titlePart1 + " " + copy.hero.titleItalic}
        headlineLine2={copy.hero.titlePart2}
        kicker={copy.hero.lead}
        ctaLabel={copy.hero.ctaPrimary}
        ctaHref={`/${lang}/shop`}
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
      <RetroNewsletter isKa={lang === "ka"} />
    </div>
  );
}
