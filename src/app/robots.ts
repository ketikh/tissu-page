import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL?.replace(/\/$/, "") || "https://tissu-page-production.up.railway.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account", "/checkout", "/cart"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
