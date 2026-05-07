import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const publicRoutes = [
  "",
  "/villa-la-percha",
  "/villa-la-percha/faq",
  "/villa-la-percha/experience-the-island",
  "/villa-la-percha/experience-the-island/interactive-map",
  "/villa-la-percha/experience-the-island/itinerary",
  "/for-property-owners",
  "/request-a-site",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/villa-la-percha" ? "weekly" : "monthly",
    priority: route === "" || route === "/villa-la-percha" ? 1 : 0.7,
  }));
}
