import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import FAQClient from "./FAQClient";

export default async function FAQPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <FAQClient dictionary={dictionary} lang={locale} />
  );
}
