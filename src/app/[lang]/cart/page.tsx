import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import CartClient from "./CartClient";

export default async function CartPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <CartClient dictionary={dictionary} lang={lang} />
  );
}
