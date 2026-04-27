import RetroHero from "@/components/landing/RetroHero";
import type { Locale } from "@/i18n/config";

export const metadata = { title: "Retro hero preview · Tissu" };

export default async function PreviewRetro({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isKa = (lang as Locale) === "ka";

  return (
    <RetroHero
      brand="Tissu &amp; Co."
      kicker={isKa ? "გაზაფხული · ზაფხული '26" : "Spring · Summer '26"}
      headlineLine1={isKa ? "ერთი ჩანთა." : "Your IRL Boogie Nights,"}
      headlineLine2={isKa ? "ორი განწყობა." : "Styled For Your Home"}
      ctaLabel={isKa ? "მაღაზია" : "Shop the drop"}
      ctaHref={`/${lang}/shop`}
      navLinks={[
        { label: isKa ? "მაღაზია" : "Shop", href: `/${lang}/shop` },
        { label: isKa ? "ჩვენი ამბავი" : "Story", href: `/${lang}/about` },
        { label: isKa ? "ბლოგი" : "Journal", href: `/${lang}#journal` },
        { label: isKa ? "კონტაქტი" : "Contact", href: `/${lang}/contact` },
      ]}
    />
  );
}
