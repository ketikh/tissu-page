import type { Metadata } from "next";
import { i18n } from "@/i18n/config";
import { QuiltGame } from "@/components/game/QuiltGame";
import { DEFAULT_QUILT_PROMO_CODE, QUILT_PRODUCTS, getQuiltCopy, type QuiltLocale } from "@/lib/game/content";

const PAGE_PATH = "/game";

/** Promo code handed to winners. It must also exist, active, in the shop admin. */
function readPromoCode(): string {
  return process.env.GAME_PROMO_CODE?.trim() || DEFAULT_QUILT_PROMO_CODE;
}

/** Optional address that receives winners' emails (Mailchimp, a form, …). */
function readSubmitUrl(): string | null {
  const raw = process.env.GAME_SUBMIT_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol === "https:") return url.toString();
  } catch {
    // Not a URL at all: reported below together with non-https addresses.
  }
  console.warn("[quilt-game] GAME_SUBMIT_URL is not a valid https address, so winners' emails are not being stored.");
  return null;
}

function toQuiltLocale(lang: string): QuiltLocale {
  return lang === "ka" ? "ka" : "en";
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = toQuiltLocale(lang);
  const copy = getQuiltCopy(locale);
  const shareImage = QUILT_PRODUCTS[0].image;
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: {
      canonical: `/${locale}${PAGE_PATH}`,
      languages: Object.fromEntries(i18n.locales.map((l) => [l, `/${l}${PAGE_PATH}`])),
    },
    openGraph: {
      type: "website",
      siteName: "Tissu",
      locale: locale === "ka" ? "ka_GE" : "en_US",
      url: `/${locale}${PAGE_PATH}`,
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [{ url: shareImage, width: 900, height: 900, alt: copy.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [shareImage],
    },
  };
}

export default async function GamePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <QuiltGame locale={toQuiltLocale(lang)} promoCode={readPromoCode()} submitUrl={readSubmitUrl()} />;
}
