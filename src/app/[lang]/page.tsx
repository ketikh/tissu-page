import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import HomeClient from "./HomeClient";
import { Suspense } from "react";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <Suspense fallback={<div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>}>
      <HomeClient lang={locale} dictionary={dictionary} />
    </Suspense>
  );
}
