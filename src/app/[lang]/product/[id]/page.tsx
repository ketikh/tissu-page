import { notFound } from "next/navigation";
import { mockProducts } from "@/lib/mock-data";
import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import { ProductDetailsClient } from "./ProductDetailsClient";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
  const { id, lang } = await params;
  const locale = lang as Locale;
  const product = mockProducts.find((p) => p.id === id);
  
  if (!product) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <ProductDetailsClient 
      product={product} 
      lang={locale} 
      dictionary={dictionary} 
    />
  );
}
