import { feedToCsv } from "@/lib/meta/feed";
import { feedCacheHeaders, loadFeedItems } from "@/lib/meta/feed-items";

/** Meta Commerce catalogue feed (CSV). Public, no auth, cached ~1h. */
// Next.js needs a literal here; keep in sync with FEED_CACHE_SECONDS in feed-items.ts.
export const revalidate = 3600;

export async function GET() {
  const { items } = await loadFeedItems();
  return new Response(feedToCsv(items), {
    headers: feedCacheHeaders("text/csv; charset=utf-8"),
  });
}
