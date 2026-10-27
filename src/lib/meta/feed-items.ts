// Loads the catalogue and maps it to feed rows. Shared by the CSV and XML
// feed routes so both always describe the same products.

import { fetchStorefrontProducts } from "../admin-api";
import { i18n } from "../../i18n/config";
import { getMetaConfig } from "./config";
import { isFeedEligible, toFeedItem, type FeedItem } from "./feed";

/** Meta re-fetches feeds on a schedule; an hour of caching is plenty. */
export const FEED_CACHE_SECONDS = 3600;

export interface FeedData {
  items: FeedItem[];
  siteUrl: string;
}

export async function loadFeedItems(): Promise<FeedData> {
  const { siteUrl } = getMetaConfig();
  const products = await fetchStorefrontProducts();
  const items = products
    .filter(isFeedEligible)
    .map((product) => toFeedItem(product, siteUrl, i18n.defaultLocale));
  return { items, siteUrl };
}

export function feedCacheHeaders(contentType: string): HeadersInit {
  return {
    "Content-Type": contentType,
    "Cache-Control": `public, max-age=${FEED_CACHE_SECONDS}, s-maxage=${FEED_CACHE_SECONDS}`,
  };
}
