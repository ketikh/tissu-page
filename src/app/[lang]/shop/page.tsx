import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import ShopClient from "./ShopClient";
import { fetchStorefrontProducts } from "@/lib/admin-api";

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const products = await fetchStorefrontProducts();

  return <ShopClient lang={locale} dictionary={dictionary} products={products} />;
}
