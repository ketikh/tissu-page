"use client";

import { Locale } from "@/i18n/config";
import { getLandingCopy } from "./landingCopy";
import type { StorefrontProduct } from "@/lib/admin-api";
import RetroHero from "@/components/landing/RetroHero";
import RetroProducts from "@/components/landing/RetroProducts";
import RetroNecklaces from "@/components/landing/RetroNecklaces";
import RetroAbout from "@/components/landing/RetroAbout";
import RetroReviews from "@/components/landing/RetroReviews";
import { EditableText } from "@/components/admin/AdminEditProvider";

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
  const lead         = pickLocalized(heroCMS, "lead",     lang, copy.hero.lead);
  const ctaText      = pickLocalized(heroCMS, "cta_text", lang, copy.hero.ctaPrimary);
  const ctaLink      = (heroCMS?.cta_link || "").trim() || `/${lang}/shop`;

  // Build the headline as editable nodes. When inline editing is OFF
  // EditableText just renders the inner text — visual result is identical.
  const headlineLine1Node = heroCMS ? (
    <>
      <EditableText page="home" section="hero" fieldKey={`title_${lang}`} defaultValue={titlePart1} />
      {" "}
      <EditableText page="home" section="hero" fieldKey={`italic_${lang}`} defaultValue={titleItalic} />
    </>
  ) : (
    `${copy.hero.titlePart1} ${copy.hero.titleItalic}`
  );
  const headlineLine2 = heroCMS ? "" : copy.hero.titlePart2;

  return (
    <div style={{ background: "#fef0d6" }}>
      <RetroHero
        brand={eyebrow ? (
          <EditableText page="home" section="hero" fieldKey={`eyebrow_${lang}`} defaultValue={eyebrow} />
        ) : "Tissu"}
        headlineLine1={headlineLine1Node}
        headlineLine2={headlineLine2}
        kicker={
          <EditableText page="home" section="hero" fieldKey={`lead_${lang}`} defaultValue={lead} multiline />
        }
        ctaLabel={
          <EditableText page="home" section="hero" fieldKey={`cta_text_${lang}`} defaultValue={ctaText} />
        }
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
