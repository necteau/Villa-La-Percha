export type IslandMapCategory = "restaurant" | "beach" | "activity";

export type MapAnchor = {
  id: string;
  name: string;
  x: number;
  y: number;
  lat?: number;
  lon?: number;
  source?: string;
};

export type IslandMapLocation = {
  id: string;
  name: string;
  category: IslandMapCategory;
  x: number;
  y: number;
  area: string;
  description: string;
  driveTime?: string;
  lat?: number;
  lon?: number;
  source?: string;
  notes?: string;
};

export const islandMapImage = "/images/providenciales-map-reference.jpg";

// These anchors are the calibration layer for this exact background image.
// For now they are image-space placements with geography labels.
// Next step: replace/add lat/lon from confirmed Google Maps points and derive all other pin placements from them.
export const islandMapAnchors: MapAnchor[] = [
  {
    id: "northwest-point",
    name: "Northwest Point",
    x: 8.8,
    y: 4.8,
    source: "manual from reference map",
  },
  {
    id: "turtle-cove",
    name: "Turtle Cove",
    x: 56.5,
    y: 34.0,
    source: "manual from reference map",
  },
  {
    id: "grace-bay-central",
    name: "Grace Bay Central",
    x: 72.0,
    y: 37.0,
    source: "manual from reference map",
  },
  {
    id: "villa-la-percha",
    name: "Villa La Percha",
    x: 36.5,
    y: 67.5,
    source: "manual from reference map",
  },
  {
    id: "sapodilla-bay",
    name: "Sapodilla Bay",
    x: 27.8,
    y: 81.8,
    source: "manual from reference map",
  },
  {
    id: "conch-farm-leeward",
    name: "Conch Farm / Leeward",
    x: 87.4,
    y: 24.2,
    source: "manual from reference map",
  },
];

export const islandMapHomeBase = {
  id: "villa-la-percha",
  name: "Villa La Percha",
  x: 36.5,
  y: 67.5,
  area: "Chalk Sound",
  description:
    "Your home base on the southwest side of Providenciales, close to Chalk Sound, Taylor Bay, Sapodilla Bay, and Five Cays.",
  source: "manual from reference map",
};

export const islandMapLocations: IslandMapLocation[] = [
  {
    id: "da-conch-shack",
    name: "Da Conch Shack",
    category: "restaurant",
    x: 49.0,
    y: 34.8,
    area: "Blue Hills",
    description: "The island's iconic conch institution on the north shore west of Grace Bay.",
    driveTime: "~18 min",
    notes: "Approximate Blue Hills shoreline placement.",
  },
  {
    id: "hemingways",
    name: "Hemingway's",
    category: "restaurant",
    x: 72.0,
    y: 37.0,
    area: "Grace Bay",
    description: "Beachfront favorite at The Sands, in the central Grace Bay stretch.",
    driveTime: "~24 min",
  },
  {
    id: "omars-beach-hut",
    name: "Omar's Beach Hut",
    category: "restaurant",
    x: 39.2,
    y: 74.5,
    area: "Five Cays",
    description: "Laid-back seafood spot near the beach and fishing docks in Five Cays.",
    driveTime: "~9 min",
  },
  {
    id: "coco-bistro",
    name: "Coco Bistro",
    category: "restaurant",
    x: 68.4,
    y: 40.2,
    area: "Grace Bay",
    description: "Romantic fine dining tucked just inland from Grace Bay Beach.",
    driveTime: "~23 min",
  },
  {
    id: "provence-by-eric",
    name: "Provence by Eric",
    category: "restaurant",
    x: 74.8,
    y: 40.5,
    area: "Grace Bay",
    description: "Chef-led tasting experience in the eastern Grace Bay corridor.",
    driveTime: "~25 min",
  },
  {
    id: "infiniti",
    name: "Infiniti",
    category: "restaurant",
    x: 75.8,
    y: 36.2,
    area: "Grace Bay Club",
    description: "Elegant oceanfront dinner destination along central Grace Bay.",
    driveTime: "~25 min",
  },
  {
    id: "magnolia",
    name: "Magnolia",
    category: "restaurant",
    x: 56.5,
    y: 34.0,
    area: "Turtle Cove",
    description: "Hilltop dining overlooking Turtle Cove Marina and the north shore.",
    driveTime: "~19 min",
  },
  {
    id: "cocovan",
    name: "CocoVan",
    category: "restaurant",
    x: 66.8,
    y: 42.6,
    area: "Grace Bay",
    description: "Palm-grove Airstream lounge for tacos and casual island bites.",
    driveTime: "~23 min",
  },
  {
    id: "bay-bistro",
    name: "Bay Bistro",
    category: "restaurant",
    x: 80.2,
    y: 40.0,
    area: "Grace Bay",
    description: "Ocean-view brunch and seafood spot on the eastern Grace Bay strip.",
    driveTime: "~27 min",
  },
  {
    id: "blt-steak",
    name: "BLT Steak",
    category: "restaurant",
    x: 82.4,
    y: 36.5,
    area: "Ritz-Carlton / Grace Bay",
    description: "Luxury steakhouse at the eastern end of the Grace Bay corridor.",
    driveTime: "~27 min",
  },
  {
    id: "grace-bay",
    name: "Grace Bay Beach",
    category: "beach",
    x: 73.5,
    y: 31.5,
    area: "North Shore",
    description: "The island's most famous beach, stretching along the north coast east of Turtle Cove.",
    driveTime: "~24 min",
  },
  {
    id: "malcolms-road-beach",
    name: "Malcolm's Road Beach",
    category: "beach",
    x: 15.2,
    y: 17.5,
    area: "Far West",
    description: "Remote northwestern beach access with dramatic reef-wall snorkeling offshore.",
    driveTime: "~40 min (4x4 advised)",
  },
  {
    id: "northwest-point-marine-park",
    name: "Northwest Point Marine Park",
    category: "beach",
    x: 8.8,
    y: 4.8,
    area: "Northwest Point",
    description: "Protected marine area at the island's far northwest edge.",
    driveTime: "~45 min",
  },
  {
    id: "taylor-bay",
    name: "Taylor Bay",
    category: "beach",
    x: 24.2,
    y: 79.5,
    area: "Southwest Coast",
    description: "Quiet shallow bay just west of Chalk Sound, close to the villa.",
    driveTime: "~6 min",
  },
  {
    id: "west-harbour-bluff",
    name: "West Harbour Bluff",
    category: "beach",
    x: 3.8,
    y: 72.5,
    area: "Southwest Tip",
    description: "Rugged ocean-facing coast with caves, cliffs, and Pirate's Cove nearby.",
    driveTime: "~16 min",
  },
  {
    id: "sapodilla-bay",
    name: "Sapodilla Bay",
    category: "beach",
    x: 27.8,
    y: 81.8,
    area: "Southwest Coast",
    description: "Calm bay just southeast of Taylor Bay with a local, easygoing atmosphere.",
    driveTime: "~8 min",
  },
  {
    id: "caicos-wall",
    name: "Caicos Wall",
    category: "activity",
    x: 6.4,
    y: 15.0,
    area: "Off the West Coast",
    description: "Best accessed by boat from the west side; the wall lies offshore beyond the Malcolm's Road area.",
    driveTime: "West-side charter",
  },
  {
    id: "pirates-cove-split-rock",
    name: "Pirate's Cove & Split Rock",
    category: "activity",
    x: 5.4,
    y: 69.6,
    area: "West Harbour Bluff",
    description: "Sea cliffs, cave formations, and historic pirate-hideout folklore on the southwest coast.",
    driveTime: "~16 min",
  },
  {
    id: "turtle-watching-conch-farm",
    name: "Turtle Watching at Conch Farm",
    category: "activity",
    x: 87.4,
    y: 24.2,
    area: "Leeward",
    description: "Far east near Leeward and the old conch farm area.",
    driveTime: "~30 min",
  },
  {
    id: "chalk-sound-national-park",
    name: "Chalk Sound National Park",
    category: "activity",
    x: 29.8,
    y: 63.5,
    area: "By the Villa",
    description: "The glowing turquoise lagoon system directly beside Villa La Percha.",
    driveTime: "~2 min",
  },
  {
    id: "sundog-sail",
    name: "Sundog Sail",
    category: "activity",
    x: 57.5,
    y: 41.2,
    area: "Turtle Cove Marina",
    description: "Sunset sail departure from Turtle Cove on the island's north side.",
    driveTime: "~19 min",
  },
  {
    id: "shipwreck-diving",
    name: "Shipwreck Diving",
    category: "activity",
    x: 55.2,
    y: 18.5,
    area: "Off North Shore Reefs",
    description: "Boat-diving territory offshore north of Providenciales.",
    driveTime: "Marina departure",
  },
  {
    id: "north-caicos-day-trip",
    name: "North Caicos Day Trip",
    category: "activity",
    x: 97.8,
    y: 10.5,
    area: "Ferry / Charter East",
    description: "Day-trip route outward from Provo toward North Caicos and Middle Caicos.",
    driveTime: "Ferry + drive",
  },
  {
    id: "big-game-fishing",
    name: "Big Game Fishing",
    category: "activity",
    x: 49.8,
    y: 11.0,
    area: "Deep Water North",
    description: "Offshore fishing charters head into deep water north of the island.",
    driveTime: "Marina departure",
  },
];
