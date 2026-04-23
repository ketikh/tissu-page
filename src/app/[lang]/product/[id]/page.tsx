import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import { ProductDetailsClient } from "./ProductDetailsClient";
import { fetchStorefrontProducts, fetchStorefrontProduct } from "@/lib/admin-api";

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

  return (
    <ProductDetailsClient
      product={product}
      related={related}
      lang={locale}
      dictionary={dictionary}
    />
  );
}
