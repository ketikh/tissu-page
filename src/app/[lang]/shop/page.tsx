import { Suspense } from "react";
import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import ShopClient from "./ShopClient";
import { fetchStorefrontProducts } from "@/lib/admin-api";

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const products = await fetchStorefrontProducts();

  return (
    <Suspense fallback={<div className="min-h-[60vh] container py-24 text-[var(--tissu-ink-soft)]">Loading…</div>}>
      <ShopClient lang={locale} dictionary={dictionary} products={products} />
    </Suspense>
  );
}
