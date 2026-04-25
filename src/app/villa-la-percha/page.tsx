import type { Metadata } from "next";
import PropertySiteHome from "@/components/PropertySiteHome";

export const metadata: Metadata = {
  title: "Villa La Percha | Private villa in Chalk Sound, Providenciales — Book direct",
  description:
    "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite suites, dock swimming and fishing, kayaks, paddle boards, a private pool and hot tub, Sonos throughout.",
  alternates: {
    canonical: "/villa-la-percha",
  },
  openGraph: {
    title: "Villa La Percha | Private villa in Chalk Sound, Providenciales",
    description:
      "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite suites, dock swimming and fishing, kayaks, paddle boards, private pool, hot tub, and Sonos throughout.",
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
      "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite suites, dock swimming, kayaks, paddle boards, pool, hot tub, and Sonos throughout.",
    images: ["/images/aerial-house-ocean-neighbors.jpg"],
  },
};

export default function VillaLaPerchaPage() {
  return <PropertySiteHome />;
}
