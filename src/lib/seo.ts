export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://directstay.app";

export const directStayEntity = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "DirectStay",
  url: siteUrl,
  description:
    "DirectStay builds direct-booking websites and AI-assisted operating workflows for independent vacation rental owners.",
  sameAs: [siteUrl],
};

export const villaLaPerchaEntity = {
  "@context": "https://schema.org",
  "@type": ["LodgingBusiness", "VacationRental"],
  "@id": `${siteUrl}/villa-la-percha#vacation-rental`,
  name: "Villa La Percha",
  url: `${siteUrl}/villa-la-percha`,
  description:
    "Villa La Percha is a private vacation villa in Chalk Sound, Providenciales, Turks and Caicos Islands, available for direct booking. The villa has four en-suite bedrooms, a private pool, hot tub, ocean and Chalk Sound views, dock swimming, kayaks, paddleboards, and island-planning guidance.",
  image: [
    `${siteUrl}/images/aerial-house-ocean-neighbors.jpg`,
    `${siteUrl}/images/pool-lounge-ocean.jpg`,
    `${siteUrl}/images/aerial-pool-house-chalk-sound.jpg`,
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "27 Ocean Point Drive",
    addressLocality: "Providenciales",
    addressRegion: "Turks and Caicos Islands",
    addressCountry: "TC",
  },
  amenityFeature: [
    "Four en-suite bedrooms",
    "Private pool",
    "Hot tub",
    "Dock swimming",
    "Kayaks",
    "Paddleboards",
    "Sonos audio",
    "Outdoor dining",
    "Direct booking",
  ].map((name) => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
  maximumAttendeeCapacity: 8,
  containsPlace: {
    "@type": "Accommodation",
    name: "Villa La Percha private villa",
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: 8,
      unitText: "people present at the property at any time",
    },
    numberOfBedrooms: 4,
  },
};

export const villaLaPerchaBreadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "DirectStay",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Villa La Percha",
      item: `${siteUrl}/villa-la-percha`,
    },
  ],
};
