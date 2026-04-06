import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <CheckoutClient dictionary={dictionary} lang={locale} />
  );
}
