import { Locale } from "@/i18n/config";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import { fetchPhotoPositions } from "@/lib/shop-photo-positions";
import PhotosClient from "./PhotosClient";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [products, positions] = await Promise.all([
    fetchStorefrontProducts(),
    fetchPhotoPositions(),
  ]);

  return (
    <PhotosClient
      lang={lang as Locale}
      products={products}
      initialPositions={positions}
    />
  );
}
