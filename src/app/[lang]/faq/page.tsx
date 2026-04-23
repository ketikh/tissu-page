import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import FAQClient from "./FAQClient";
import { mockFAQs } from "@/lib/mock-data";

export default async function FAQPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return <FAQClient faqs={mockFAQs} dictionary={dictionary} lang={locale} />;
}
