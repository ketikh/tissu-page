import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import LoginClient from "./LoginClient";
import { Suspense } from "react";

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginClient dictionary={dictionary} lang={locale} />
    </Suspense>
  );
}
