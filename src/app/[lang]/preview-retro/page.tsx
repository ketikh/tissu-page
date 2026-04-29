import RetroHero from "@/components/landing/RetroHero";
import RetroAbout from "@/components/landing/RetroAbout";
import RetroProducts from "@/components/landing/RetroProducts";
import RetroReviews from "@/components/landing/RetroReviews";
import RetroNewsletter from "@/components/landing/RetroNewsletter";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import type { Locale } from "@/i18n/config";

export const metadata = { title: "Retro preview · Tissu" };

export default async function PreviewRetro({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isKa = (lang as Locale) === "ka";
  const products = await fetchStorefrontProducts();

  return (
    <>
      <RetroHero
        brand="Tissu &amp; Co."
        kicker={isKa ? "გაზაფხული · ზაფხული '26" : "Spring · Summer '26"}
        headlineLine1={isKa ? "ერთი ჩანთა." : "Your IRL Boogie Nights,"}
        headlineLine2={isKa ? "ორი განწყობა." : "Styled For Your Home"}
        ctaLabel={isKa ? "მაღაზია" : "Shop the drop"}
        ctaHref={`/${lang}/shop`}
        lang={lang as Locale}
      />

      <RetroAbout isKa={isKa} shopHref={`/${lang}/shop`} />
      <RetroProducts isKa={isKa} shopHref={`/${lang}/shop`} products={products} />
      <RetroReviews isKa={isKa} />
      <RetroNewsletter isKa={isKa} />
    </>
  );
}
