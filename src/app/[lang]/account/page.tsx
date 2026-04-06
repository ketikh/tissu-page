import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import AccountClient from "./AccountClient";

export default async function AccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <AccountClient dictionary={dictionary} lang={locale} />
  );
}
