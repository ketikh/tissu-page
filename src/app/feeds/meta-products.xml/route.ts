import { feedToXml } from "@/lib/meta/feed";
import { FEED_CACHE_SECONDS, feedCacheHeaders, loadFeedItems } from "@/lib/meta/feed-items";

/** Meta Commerce catalogue feed (RSS 2.0 XML). Public, no auth, cached ~1h. */
export const revalidate = FEED_CACHE_SECONDS;

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
