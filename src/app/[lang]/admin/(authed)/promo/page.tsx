import { Locale } from "@/i18n/config";
import PromoClient from "./PromoClient";

export const dynamic = "force-dynamic";

export default async function AdminPromoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <PromoClient lang={lang as Locale} />;
}
