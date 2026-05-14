import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import HomeClient from "./HomeClient";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import { fetchCMSSection } from "@/lib/admin-content";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const products = await fetchStorefrontProducts();
  // Pull the home hero block from the CMS (revalidates every 30s). If empty,
  // HomeClient falls back to the hard-coded copy in landingCopy.ts.
  const heroCMS = await fetchCMSSection<Record<string, string>>("home", "hero", { revalidate: 30 });

  return <HomeClient lang={locale} dictionary={dictionary} products={products} heroCMS={heroCMS || undefined} />;
}
