import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <ForgotPasswordClient dictionary={dictionary} lang={locale} />
  );
}
