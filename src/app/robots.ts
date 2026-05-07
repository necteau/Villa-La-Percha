import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/villa-la-percha",
          "/villa-la-percha/faq",
          "/villa-la-percha/experience-the-island",
          "/for-property-owners",
          "/request-a-site",
          "/villa-la-percha/guides",
          "/llms.txt",
        ],
        disallow: ["/admin", "/owner-portal", "/api"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: [
          "/",
          "/villa-la-percha",
          "/villa-la-percha/faq",
          "/villa-la-percha/experience-the-island",
          "/for-property-owners",
          "/villa-la-percha/guides",
          "/llms.txt",
        ],
        disallow: ["/admin", "/owner-portal", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
