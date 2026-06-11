import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import { ProductDetailsClient } from "./ProductDetailsClient";
import { fetchStorefrontProducts, fetchStorefrontProduct } from "@/lib/admin-api";

const SITE_URL = process.env.SITE_URL?.replace(/\/$/, "") || "https://tissu.ge";

// Per-product title, description and share photo so each item looks good in
// Google and when shared (instead of the generic site card).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}): Promise<Metadata> {
  const { id, lang } = await params;
  const product = await fetchStorefrontProduct(id);
  if (!product) return {};
  const isKa = lang === "ka";
  const title = `${product.name} — Tissu`;
  const description =
    (product.description || "").trim() ||
    (isKa ? "ხელნაკეთი ნივთი Tissu-სგან — ნაკერი თბილისში." : "Handmade by Tissu — sewn in Tbilisi.");
  const images = product.image_front ? [product.image_front] : undefined;
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/product/${id}`,
      languages: { ka: `/ka/product/${id}`, en: `/en/product/${id}` },
    },
    openGraph: { type: "website", title, description, url: `/${lang}/product/${id}`, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const { id, lang } = await params;
  const locale = lang as Locale;

  const [product, allProducts, dictionary] = await Promise.all([
    fetchStorefrontProduct(id),
    fetchStorefrontProducts(),
    getDictionary(locale),
  ]);

  if (!product) notFound();

  const related = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // The other size of this model (if any), so the page can switch size in place.
  const sibling = product.size_sibling
    ? allProducts.find((p) => p.id === product.size_sibling!.sibling_id) ?? null
    : null;

  // Product structured data → lets Google show price + availability in results.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.image_front
      ? { image: [product.image_front, ...(product.image_back ? [product.image_back] : [])] }
      : {}),
    ...(product.code ? { sku: product.code } : {}),
    brand: { "@type": "Brand", name: "Tissu" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency && product.currency.length === 3 ? product.currency : "GEL",
      availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/${locale}/product/${id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailsClient
        product={product}
        sibling={sibling}
        related={related}
        lang={locale}
        dictionary={dictionary}
      />
    </>
  );
}
