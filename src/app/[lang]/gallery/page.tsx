import { Locale } from "@/i18n/config";
import { fetchGalleryItems } from "@/lib/gallery";
import GalleryClient from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const items = await fetchGalleryItems();
  return <GalleryClient lang={lang as Locale} items={items} />;
}
