import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const products = await fetchStorefrontProducts();

  return (
    <CheckoutClient dictionary={dictionary} lang={locale} products={products} />
  );
}
