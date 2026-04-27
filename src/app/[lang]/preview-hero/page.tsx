import HeroSection from "@/components/landing/HeroSection";
import type { Locale } from "@/i18n/config";

export const metadata = { title: "Hero preview · Tissu" };

export default async function PreviewHero({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <HeroSection shopHref={`/${(lang as Locale) || "ka"}/shop`} />;
}
