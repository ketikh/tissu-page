import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import SuccessClient from "./SuccessClient";

interface SuccessPageProps {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { lang } = await params;
  const { orderId } = await searchParams;
  const dictionary = await getDictionary(lang);

  return <SuccessClient lang={lang} dictionary={dictionary} orderId={orderId} />;
}
