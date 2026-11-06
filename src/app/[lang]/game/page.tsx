import type { Metadata } from "next";
import { i18n } from "@/i18n/config";
import { QuiltGame } from "@/components/game/QuiltGame";
import { fetchCMSSection } from "@/lib/admin-content";
import { buildFollowLinks } from "@/lib/game/follow";
import { QUILT_PRODUCTS, getQuiltCopy, type QuiltLocale } from "@/lib/game/content";

const PAGE_PATH = "/game";

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
  // Same social addresses the site footer shows, managed in the shop admin.
  const contact = await fetchCMSSection<Record<string, string>>("contact", "details", { revalidate: 600 });
  const followLinks = buildFollowLinks({ instagram: contact?.instagram_url, facebook: contact?.facebook_url });
  return <QuiltGame locale={toQuiltLocale(lang)} followLinks={followLinks} />;
}
