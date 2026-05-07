import type { Metadata } from "next";
import PropertySiteHome from "@/components/PropertySiteHome";
import { villaSeoGuides } from "@/data/seoGuides";
import { villaLaPerchaBreadcrumbs, villaLaPerchaEntity } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Villa La Percha | Private villa in Chalk Sound, Providenciales — Book direct",
  description:
    "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite bedrooms, dock swimming and fishing, kayaks, paddleboards, a private pool and hot tub, Sonos throughout.",
  alternates: {
    canonical: "/villa-la-percha",
  },
  keywords: [
    "Villa La Percha",
    "Chalk Sound villa rental",
    "Providenciales private villa",
    "Turks and Caicos direct villa rental",
    "book Villa La Percha direct",
    "Sapodilla Bay villa",
    "Taylor Bay villa",
    "Turks and Caicos family villa",
    "private pool villa Providenciales",
  ],
  openGraph: {
    title: "Villa La Percha | Private villa in Chalk Sound, Providenciales",
    description:
      "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite bedrooms, dock swimming and fishing, kayaks, paddleboards, private pool, hot tub, and Sonos throughout.",
    url: "/villa-la-percha",
    siteName: "DirectStay",
    type: "website",
    images: [
      {
        url: "/images/aerial-house-ocean-neighbors.jpg",
        width: 1200,
        height: 630,
        alt: "Villa La Percha aerial view",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa La Percha | Private villa in Chalk Sound, Providenciales",
    description:
      "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite bedrooms, dock swimming, kayaks, paddleboards, pool, hot tub, and Sonos throughout.",
    images: ["/images/aerial-house-ocean-neighbors.jpg"],
  },
};

export default function VillaLaPerchaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(villaLaPerchaEntity) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(villaLaPerchaBreadcrumbs) }}
      />
      <PropertySiteHome planningGuides={villaSeoGuides} />
    </>
  );
}
