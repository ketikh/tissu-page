import { Suspense } from "react";
import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import ShopClient from "./ShopClient";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import { fetchPhotoPositions } from "@/lib/shop-photo-positions";
import { fetchStorefrontCategories } from "@/lib/storefront-categories";
import { fetchCMSSection } from "@/lib/admin-content";

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const [products, photoPositions, categories, heroCMS] = await Promise.all([
    fetchStorefrontProducts(),
    fetchPhotoPositions(),
    fetchStorefrontCategories(),
    // Shop page title comes from the CMS "shop → hero" section when set,
    // otherwise ShopClient keeps its built-in copy.
    fetchCMSSection<Record<string, string>>("shop", "hero", { revalidate: 600 }),
  ]);

  return (
    <Suspense fallback={<div className="min-h-[60vh] container py-24 text-[var(--tissu-ink-soft)]">Loading…</div>}>
      <ShopClient
        lang={locale}
        dictionary={dictionary}
        products={products}
        photoPositions={photoPositions}
        categories={categories}
        heroCMS={heroCMS || undefined}
      />
    </Suspense>
  );
}
