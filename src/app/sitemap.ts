import type { MetadataRoute } from "next";
import { villaSeoGuides } from "@/data/seoGuides";
import { siteUrl } from "@/lib/seo";

const publicRoutes = [
  "",
  "/villa-la-percha",
  "/villa-la-percha/faq",
  "/villa-la-percha/experience-the-island",
  "/villa-la-percha/experience-the-island/interactive-map",
  "/villa-la-percha/experience-the-island/itinerary",
  "/villa-la-percha/guides",
  "/for-property-owners",
  "/request-a-site",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const guideRoutes = villaSeoGuides.map((guide) => `/villa-la-percha/guides/${guide.slug}`);

  return [...publicRoutes, ...guideRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/villa-la-percha" ? "weekly" : "monthly",
    priority: route === "" || route === "/villa-la-percha" ? 1 : route.includes("/guides/") ? 0.8 : 0.7,
  }));
}
