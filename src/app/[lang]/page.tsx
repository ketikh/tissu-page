import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import HomeClient from "./HomeClient";
import { fetchStorefrontProducts } from "@/lib/admin-api";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const products = await fetchStorefrontProducts();

  return <HomeClient lang={locale} dictionary={dictionary} products={products} />;
}
