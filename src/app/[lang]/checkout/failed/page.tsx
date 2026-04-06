import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import FailedClient from "./FailedClient";

interface FailedPageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function FailedPage({ params }: FailedPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <FailedClient lang={lang} dictionary={dictionary} />;
}
