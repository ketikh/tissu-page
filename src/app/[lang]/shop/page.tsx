import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import ShopClient from "./ShopClient";
import { Suspense } from "react";

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading shop...</div>}>
      <ShopClient dictionary={dictionary} lang={locale} />
    </Suspense>
  );
}
