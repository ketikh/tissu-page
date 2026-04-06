import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <RegisterClient dictionary={dictionary} lang={locale} />
  );
}
