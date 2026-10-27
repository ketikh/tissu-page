import { feedToXml } from "@/lib/meta/feed";
import { feedCacheHeaders, loadFeedItems } from "@/lib/meta/feed-items";

/** Meta Commerce catalogue feed (RSS 2.0 XML). Public, no auth, cached ~1h. */
// Next.js needs a literal here; keep in sync with FEED_CACHE_SECONDS in feed-items.ts.
export const revalidate = 3600;

export async function GET() {
  const { items, siteUrl } = await loadFeedItems();
  const xml = feedToXml(items, {
    title: "TISSU",
    link: siteUrl,
    description: "TISSU handmade bags, aprons and necklaces",
  });
  return new Response(xml, {
    headers: feedCacheHeaders("application/xml; charset=utf-8"),
  });
}
