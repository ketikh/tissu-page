import { Locale } from "@/i18n/config";
import { fetchNecklaceMaterials } from "@/lib/necklace-builder";
import NecklaceBuilderClient from "./NecklaceBuilderClient";

export const dynamic = "force-dynamic";

export default async function NecklaceBuilderPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const { fabrics, charms, basePrice } = await fetchNecklaceMaterials();

  return <NecklaceBuilderClient lang={locale} fabrics={fabrics} charms={charms} basePrice={basePrice} />;
}
