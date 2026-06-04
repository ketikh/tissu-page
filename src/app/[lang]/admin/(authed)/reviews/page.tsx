import { Locale } from "@/i18n/config";
import { fetchAdminReviews } from "@/lib/admin-reviews";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [reviews, products] = await Promise.all([
    fetchAdminReviews(),
    fetchStorefrontProducts(),
  ]);
  return <ReviewsClient lang={lang as Locale} initialReviews={reviews} products={products} />;
}
