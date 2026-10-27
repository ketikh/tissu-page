// Meta Commerce (catalog) product feed. Pure mapping + serialisation so the
// CSV and XML routes share one source of truth and the unit tests can run it.

import type { StorefrontProduct } from "../admin-api";

export const FEED_BRAND = "TISSU";
export const FEED_CURRENCY = "GEL";
const MAX_TITLE = 150;
const MAX_DESCRIPTION = 5000;
const MAX_EXTRA_IMAGES = 10;

export type FeedAvailability = "in stock" | "out of stock" | "available for order";

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  availability: FeedAvailability;
  condition: "new";
  price: string;
  sale_price: string;
  link: string;
  image_link: string;
  additional_image_link: string[];
  brand: string;
  item_group_id: string;
  color: string;
  size: string;
  google_product_category: string;
}

export const CSV_COLUMNS = [
  "id", "title", "description", "availability", "condition", "price", "sale_price",
  "link", "image_link", "additional_image_link", "brand", "item_group_id", "color",
  "size", "google_product_category",
] as const satisfies ReadonlyArray<keyof FeedItem>;

const GOOGLE_PRODUCT_CATEGORY: Record<string, string> = {
  tote: "Luggage & Bags > Shopping Totes",
  kidsbackpack: "Luggage & Bags > Backpacks",
  laptop: "Apparel & Accessories > Handbags, Wallets & Cases",
  pouch: "Apparel & Accessories > Handbags, Wallets & Cases",
  bag: "Apparel & Accessories > Handbags, Wallets & Cases",
  apron: "Home & Garden > Kitchen & Dining > Kitchen Tools & Utensils > Aprons",
  necklace: "Apparel & Accessories > Jewelry > Necklaces",
};
const DEFAULT_GOOGLE_PRODUCT_CATEGORY = "Apparel & Accessories > Handbags, Wallets & Cases";

export function googleCategoryFor(category: string): string {
  return GOOGLE_PRODUCT_CATEGORY[category.trim().toLowerCase()] ?? DEFAULT_GOOGLE_PRODUCT_CATEGORY;
}

export function formatFeedPrice(amount: number): string {
  return `${amount.toFixed(2)} ${FEED_CURRENCY}`;
}

export function availabilityFor(
  product: Pick<StorefrontProduct, "in_stock" | "stock" | "preorder_available">,
): FeedAvailability {
  if (product.in_stock && product.stock > 0) return "in stock";
  if (product.preorder_available) return "available for order";
  return "out of stock";
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}

function absoluteUrl(url: string, siteUrl: string): string {
  return url.startsWith("/") ? `${siteUrl}${url}` : url;
}

/** Products with no photo, no price or no name cannot be listed. */
export function isFeedEligible(product: StorefrontProduct): boolean {
  return Boolean(product.image_front) && product.price > 0 && Boolean(product.name);
}

export function toFeedItem(product: StorefrontProduct, siteUrl: string, locale: string): FeedItem {
  const regularPrice = product.original_price ?? 0;
  const onSale = regularPrice > product.price;
  const extraImages = [product.image_back, ...(product.gallery_images ?? [])]
    .filter((url): url is string => Boolean(url))
    .map((url) => absoluteUrl(url, siteUrl))
    .filter((url) => url !== absoluteUrl(product.image_front, siteUrl));
  return {
    id: product.id,
    title: oneLine(product.name).slice(0, MAX_TITLE),
    description: oneLine(product.description || product.name).slice(0, MAX_DESCRIPTION),
    availability: availabilityFor(product),
    condition: "new",
    price: formatFeedPrice(onSale ? regularPrice : product.price),
    sale_price: onSale ? formatFeedPrice(product.price) : "",
    link: `${siteUrl}/${locale}/product/${encodeURIComponent(product.id)}`,
    image_link: absoluteUrl(product.image_front, siteUrl),
    additional_image_link: Array.from(new Set(extraImages)).slice(0, MAX_EXTRA_IMAGES),
    brand: FEED_BRAND,
    item_group_id: slugify(product.model || ""),
    color: oneLine(product.color || ""),
    size: oneLine(product.size || ""),
    google_product_category: googleCategoryFor(product.category),
  };
}

export function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return /[",\r\n]/.test(value) ? `"${escaped}"` : escaped;
}

export function feedToCsv(items: FeedItem[]): string {
  const rows = items.map((item) =>
    CSV_COLUMNS.map((column) => {
      const value = item[column];
      return csvEscape(Array.isArray(value) ? value.join(",") : String(value));
    }).join(","),
  );
  return [CSV_COLUMNS.join(","), ...rows].join("\r\n") + "\r\n";
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xmlTag(name: string, value: string): string {
  return value ? `<${name}>${xmlEscape(value)}</${name}>` : "";
}

export interface FeedChannelInfo {
  title: string;
  link: string;
  description: string;
}

/** RSS 2.0 with the Google Merchant namespace, which Meta accepts. */
export function feedToXml(items: FeedItem[], channel: FeedChannelInfo): string {
  const entries = items.map((item) =>
    [
      "<item>",
      xmlTag("g:id", item.id),
      xmlTag("g:title", item.title),
      xmlTag("g:description", item.description),
      xmlTag("g:availability", item.availability),
      xmlTag("g:condition", item.condition),
      xmlTag("g:price", item.price),
      xmlTag("g:sale_price", item.sale_price),
      xmlTag("g:link", item.link),
      xmlTag("g:image_link", item.image_link),
      ...item.additional_image_link.map((url) => xmlTag("g:additional_image_link", url)),
      xmlTag("g:brand", item.brand),
      xmlTag("g:item_group_id", item.item_group_id),
      xmlTag("g:color", item.color),
      xmlTag("g:size", item.size),
      xmlTag("g:google_product_category", item.google_product_category),
      "</item>",
    ].filter(Boolean).join(""),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "<channel>",
    xmlTag("title", channel.title),
    xmlTag("link", channel.link),
    xmlTag("description", channel.description),
    ...entries,
    "</channel>",
    "</rss>",
    "",
  ].join("\n");
}
