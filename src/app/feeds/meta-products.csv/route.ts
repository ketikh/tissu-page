import { feedToCsv } from "@/lib/meta/feed";
import { FEED_CACHE_SECONDS, feedCacheHeaders, loadFeedItems } from "@/lib/meta/feed-items";

/** Meta Commerce catalogue feed (CSV). Public, no auth, cached ~1h. */
export const revalidate = FEED_CACHE_SECONDS;

export async function GET() {
  const { items } = await loadFeedItems();
  return new Response(feedToCsv(items), {
    headers: feedCacheHeaders("text/csv; charset=utf-8"),
  });
}
