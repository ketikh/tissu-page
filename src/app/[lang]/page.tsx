import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import HomeClient from "./HomeClient";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import { fetchCMSPage } from "@/lib/admin-content";
import { fetchPhotoPositions } from "@/lib/shop-photo-positions";
import { fetchAdminReviews } from "@/lib/admin-reviews";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const [products, homeCMS, photoPositions, adminReviews] = await Promise.all([
    fetchStorefrontProducts(),
    // Pull the whole home page from the CMS once. Each section (hero, about,
    // products_grid) is handed to HomeClient, which falls back to the built-in
    // copy when a field is empty — so the site is never left blank.
    fetchCMSPage("home", { revalidate: 600 }),
    fetchPhotoPositions(),
    fetchAdminReviews(),
  ]);

  const section = (name: string) =>
    (homeCMS?.sections?.find((s) => s.section === name)?.payload as Record<string, string> | undefined) || undefined;

  // Featured products are hand-picked in the admin (Site → Home → Featured).
  const featuredPayload = homeCMS?.sections?.find((s) => s.section === "featured")?.payload as
    | Record<string, unknown>
    | undefined;
  const featuredIds = Array.isArray(featuredPayload?.attached_product_ids)
    ? (featuredPayload!.attached_product_ids as unknown[]).map(String)
    : [];

  return (
    <HomeClient
      lang={locale}
      dictionary={dictionary}
      products={products}
      heroCMS={section("hero")}
      aboutCMS={section("about")}
      productsCMS={section("products_grid")}
      featuredCMS={section("featured")}
      featuredIds={featuredIds}
      photoPositions={photoPositions}
      reviews={adminReviews}
    />
  );
}
