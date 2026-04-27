import type { MetadataRoute } from "next";
import { fetchStorefrontProducts } from "@/lib/admin-api";
import { i18n } from "@/i18n/config";

const SITE_URL = process.env.SITE_URL?.replace(/\/$/, "") || "https://tissu-page-production.up.railway.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchStorefrontProducts();
  const now = new Date();

  const staticPaths = ["", "/shop", "/about", "/contact", "/faq", "/privacy", "/terms"];

  const entries: MetadataRoute.Sitemap = [];

  // Top-level (no locale) — redirects to /ka by middleware, but include for completeness.
  entries.push({
    url: SITE_URL,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  });

  for (const locale of i18n.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 0.9 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            i18n.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])
          ),
        },
      });
    }

    for (const product of products) {
      entries.push({
        url: `${SITE_URL}/${locale}/product/${product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            i18n.locales.map((l) => [l, `${SITE_URL}/${l}/product/${product.id}`])
          ),
        },
      });
    }
  }

  return entries;
}
