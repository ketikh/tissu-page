import { Locale } from "@/i18n/config";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const products = await fetchStorefrontProducts();

  return <ProductsClient lang={locale} initialProducts={products} />;
}
