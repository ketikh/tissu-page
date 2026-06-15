"use client";

import { Locale } from "@/i18n/config";
import { getLandingCopy } from "./landingCopy";
import type { StorefrontProduct } from "@/lib/admin-api";
import RetroHero from "@/components/landing/RetroHero";
import RetroProducts from "@/components/landing/RetroProducts";
import RetroNecklaces from "@/components/landing/RetroNecklaces";
import RetroAbout from "@/components/landing/RetroAbout";
import RetroReviews from "@/components/landing/RetroReviews";
import { cloudinaryThumb } from "@/lib/cloudinary";

interface HomeProps {
  lang: Locale;
  dictionary: any;
  products: StorefrontProduct[];
  heroCMS?: Record<string, string>;
  aboutCMS?: Record<string, string>;
  productsCMS?: Record<string, string>;
  photoPositions?: import("@/lib/shop-photo-positions").PhotoPositions;
  reviews?: import("@/lib/admin-reviews").AdminReview[];
}

function pickLocalized(cms: Record<string, string> | undefined, base: string, lang: Locale, fallback: string): string {
  if (!cms) return fallback;
  const key = `${base}_${lang}`;
  const v = cms[key];
  return v && v.trim() ? v.trim() : fallback;
}

export default function HomeClient({ lang, products: rawProducts, heroCMS, aboutCMS, productsCMS, photoPositions = {}, reviews = [] }: HomeProps) {
  const copy = getLandingCopy(lang);

  // CMS values win when present; otherwise we keep the original copy.
  const eyebrow      = pickLocalized(heroCMS, "eyebrow",     lang, "");
  const titlePart1   = pickLocalized(heroCMS, "title",       lang, copy.hero.titlePart1);
  const titleItalic  = pickLocalized(heroCMS, "italic",      lang, copy.hero.titleItalic);
  const titleLine2   = pickLocalized(heroCMS, "title_line2", lang, copy.hero.titlePart2);
  const lead         = pickLocalized(heroCMS, "lead",        lang, copy.hero.lead);
  const ctaText      = pickLocalized(heroCMS, "cta_text",    lang, copy.hero.ctaPrimary);
  const ctaLink      = (heroCMS?.cta_link || "").trim() || `/${lang}/shop`;

  // Line 1 is title (+ optional italic suffix); line 2 is the second part.
  const headlineLine1 = `${titlePart1}${titleItalic ? ` ${titleItalic}` : ""}`.trim();
  const headlineLine2 = titleLine2;

  // CMS overrides for the products + about sections (empty → built-in copy).
  const productsTitle = pickLocalized(productsCMS, "title", lang, "");
  const productsSub   = pickLocalized(productsCMS, "sub",   lang, "");
  const aboutTitle    = pickLocalized(aboutCMS,    "title", lang, "");
  const aboutCta      = pickLocalized(aboutCMS,    "cta_text", lang, "");

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
        lang={lang}
        // This section showcases bags, so its CTA opens the shop already
        // filtered to bags (not the whole catalogue).
        shopHref={`/${lang}/shop?category=bag`}
        products={rawProducts}
        limit={4}
        photoPositions={photoPositions}
        titleOverride={productsTitle}
        subOverride={productsSub}
      />

      <RetroNecklaces
        isKa={lang === "ka"}
        // This section showcases necklaces, so its CTA opens the shop already
        // filtered to necklaces (not the whole catalogue).
        shopHref={`/${lang}/shop?category=necklace`}
        lang={lang}
        products={rawProducts}
      />

      <RetroAbout isKa={lang === "ka"} shopHref={`/${lang}/shop`} titleOverride={aboutTitle} ctaTextOverride={aboutCta} />
      <RetroReviews
        isKa={lang === "ka"}
        reviews={reviews.length > 0
          ? reviews.map(r => {
              // If the review is linked to a product, surface that product's
              // current stock status so we can stamp "sold out" over the photo.
              const linked = r.productId
                ? rawProducts.find(p => p.id === r.productId)
                : undefined;
              const soldOut = linked ? !linked.in_stock : false;
              return {
                text: { ka: r.comment, en: r.comment },
                name: r.name,
                meta: { ka: "", en: "" },
                photo: r.photoUrl ? cloudinaryThumb(r.photoUrl, 600) : "",
                soldOut,
              };
            })
          : undefined}
      />
    </div>
  );
}
