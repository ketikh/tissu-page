import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import FAQClient from "./FAQClient";
import { mockFAQs } from "@/lib/mock-data";
import { fetchCMSSection } from "@/lib/admin-content";
import type { FAQItem } from "@/lib/types";

export default async function FAQPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  // FAQ entries come from the CMS "faq → items" editor when set; otherwise we
  // fall back to the built-in list so the page is never empty.
  const cms = await fetchCMSSection<{ questions?: Array<Record<string, string>> }>(
    "faq",
    "items",
    { revalidate: 600 },
  );
  const cmsFaqs: FAQItem[] = (cms?.questions || [])
    .map((q) => ({
      question: { ka: q.q_ka || "", en: q.q_en || "" },
      answer: { ka: q.a_ka || "", en: q.a_en || "" },
    }))
    .filter((f) => (f.question.ka || f.question.en) && (f.answer.ka || f.answer.en));
  const faqs = cmsFaqs.length > 0 ? cmsFaqs : mockFAQs;

  return <FAQClient faqs={faqs} dictionary={dictionary} lang={locale} />;
}
