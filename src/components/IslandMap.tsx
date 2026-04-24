"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Category = "restaurant" | "beach" | "activity";
type Filter = "all" | Category;

type MapPoint = {
  id: string;
  name: string;
  category: Category;
  x: number;
  y: number;
  area: string;
  description: string;
  driveTime?: string;
};

const villaBase = {
  id: "villa-la-percha",
  name: "Villa La Percha",
  x: 35.8,
  y: 66.2,
  area: "Chalk Sound",
  description:
    "Your home base on the southwest side of Providenciales, close to Chalk Sound, Taylor Bay, Sapodilla Bay, and Five Cays.",
};

const points: MapPoint[] = [
  {
    id: "da-conch-shack",
    name: "Da Conch Shack",
    category: "restaurant",
    x: 42.8,
    y: 38.5,
    area: "Blue Hills",
    description: "The island's iconic conch institution on the north shore west of Grace Bay.",
    driveTime: "~18 min",
  },
  {
    id: "hemingways",
    name: "Hemingway's",
    category: "restaurant",
    x: 72.5,
    y: 39.2,
    area: "Grace Bay",
    description: "Beachfront favorite at The Sands, in the central Grace Bay stretch.",
    driveTime: "~24 min",
  },
  {
    id: "omars-beach-hut",
    name: "Omar's Beach Hut",
    category: "restaurant",
    x: 40.4,
    y: 76.8,
    area: "Five Cays",
    description: "Laid-back seafood spot near the beach and fishing docks in Five Cays.",
    driveTime: "~9 min",
  },
  {
    id: "coco-bistro",
    name: "Coco Bistro",
    category: "restaurant",
    x: 69.6,
    y: 39.8,
    area: "Grace Bay",
    description: "Romantic fine dining tucked just inland from Grace Bay Beach.",
    driveTime: "~23 min",
  },
  {
    id: "provence-by-eric",
    name: "Provence by Eric",
    category: "restaurant",
    x: 78.4,
    y: 39.8,
    area: "Grace Bay",
    description: "Chef-led tasting experience in the eastern Grace Bay corridor.",
    driveTime: "~25 min",
  },
  {
    id: "infiniti",
    name: "Infiniti",
    category: "restaurant",
    x: 75.9,
    y: 36.8,
    area: "Grace Bay Club",
    description: "Elegant oceanfront dinner destination along central Grace Bay.",
    driveTime: "~25 min",
  },
  {
    id: "magnolia",
    name: "Magnolia",
    category: "restaurant",
    x: 56.2,
    y: 35.9,
    area: "Turtle Cove",
    description: "Hilltop dining overlooking Turtle Cove Marina and the north shore.",
    driveTime: "~19 min",
  },
  {
    id: "cocovan",
    name: "CocoVan",
    category: "restaurant",
    x: 68.8,
    y: 43.1,
    area: "Grace Bay",
    description: "Palm-grove Airstream lounge for tacos and casual island bites.",
    driveTime: "~23 min",
  },
  {
    id: "bay-bistro",
    name: "Bay Bistro",
    category: "restaurant",
    x: 81.1,
    y: 40.5,
    area: "Grace Bay",
    description: "Ocean-view brunch and seafood spot on the eastern Grace Bay strip.",
    driveTime: "~27 min",
  },
  {
    id: "blt-steak",
    name: "BLT Steak",
    category: "restaurant",
    x: 83.2,
    y: 38.3,
    area: "Ritz-Carlton / Grace Bay",
    description: "Luxury steakhouse at the eastern end of the Grace Bay corridor.",
    driveTime: "~27 min",
  },
  {
    id: "grace-bay",
    name: "Grace Bay Beach",
    category: "beach",
    x: 74.1,
    y: 32.6,
    area: "North Shore",
    description: "The island's most famous beach, stretching along the north coast east of Turtle Cove.",
    driveTime: "~24 min",
  },
  {
    id: "malcolms-road-beach",
    name: "Malcolm's Road Beach",
    category: "beach",
    x: 13.6,
    y: 21.2,
    area: "Far West",
    description: "Remote northwestern beach access with dramatic reef-wall snorkeling offshore.",
    driveTime: "~40 min (4x4 advised)",
  },
  {
    id: "northwest-point-marine-park",
    name: "Northwest Point Marine Park",
    category: "beach",
    x: 10.6,
    y: 5.8,
    area: "Northwest Point",
    description: "Protected marine area at the island's far northwest edge.",
    driveTime: "~45 min",
  },
  {
    id: "taylor-bay",
    name: "Taylor Bay",
    category: "beach",
    x: 30.9,
    y: 72.4,
    area: "Southwest Coast",
    description: "Quiet shallow bay just west of Chalk Sound, close to the villa.",
    driveTime: "~6 min",
  },
  {
    id: "west-harbour-bluff",
    name: "West Harbour Bluff",
    category: "beach",
    x: 8.2,
    y: 74.6,
    area: "Southwest Tip",
    description: "Rugged ocean-facing coast with caves, cliffs, and Pirate's Cove nearby.",
    driveTime: "~16 min",
  },
  {
    id: "sapodilla-bay",
    name: "Sapodilla Bay",
    category: "beach",
    x: 28.7,
    y: 77.4,
    area: "Southwest Coast",
    description: "Calm bay just southeast of Taylor Bay with a local, easygoing atmosphere.",
    driveTime: "~8 min",
  },
  {
    id: "caicos-wall",
    name: "Caicos Wall",
    category: "activity",
    x: 5.9,
    y: 17.8,
    area: "Off the West Coast",
    description: "Best accessed by boat from the west side; the wall lies offshore beyond the Malcolm's Road area.",
    driveTime: "West-side charter",
  },
  {
    id: "pirates-cove-split-rock",
    name: "Pirate's Cove & Split Rock",
    category: "activity",
    x: 10.2,
    y: 70.8,
    area: "West Harbour Bluff",
    description: "Sea cliffs, cave formations, and historic pirate-hideout folklore on the southwest coast.",
    driveTime: "~16 min",
  },
  {
    id: "turtle-watching-conch-farm",
    name: "Turtle Watching at Conch Farm",
    category: "activity",
    x: 90.8,
    y: 28.4,
    area: "Leeward",
    description: "Far east near Leeward and the old conch farm area.",
    driveTime: "~30 min",
  },
  {
    id: "chalk-sound-national-park",
    name: "Chalk Sound National Park",
    category: "activity",
    x: 32.4,
    y: 64.1,
    area: "By the Villa",
    description: "The glowing turquoise lagoon system directly beside Villa La Percha.",
    driveTime: "~2 min",
  },
  {
    id: "sundog-sail",
    name: "Sundog Sail",
    category: "activity",
    x: 54.1,
    y: 41.5,
    area: "Turtle Cove Marina",
    description: "Sunset sail departure from Turtle Cove on the island's north side.",
    driveTime: "~19 min",
  },
  {
    id: "shipwreck-diving",
    name: "Shipwreck Diving",
    category: "activity",
    x: 53.3,
    y: 20.5,
    area: "Off North Shore Reefs",
    description: "Boat-diving territory offshore north of Providenciales.",
    driveTime: "Marina departure",
  },
  {
    id: "north-caicos-day-trip",
    name: "North Caicos Day Trip",
    category: "activity",
    x: 96.2,
    y: 6.2,
    area: "Ferry / Charter East",
    description: "Day-trip route outward from Provo toward North Caicos and Middle Caicos.",
    driveTime: "Ferry + drive",
  },
  {
    id: "big-game-fishing",
    name: "Big Game Fishing",
    category: "activity",
    x: 46.8,
    y: 11.8,
    area: "Deep Water North",
    description: "Offshore fishing charters head into deep water north of the island.",
    driveTime: "Marina departure",
  },
];

const categoryMeta: Record<Category, { label: string; color: string }> = {
  restaurant: { label: "Restaurant", color: "#8B7355" },
  beach: { label: "Beach", color: "#2F7F9D" },
  activity: { label: "Activity", color: "#6A5E4B" },
};

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "restaurant", label: "Restaurants" },
  { key: "beach", label: "Beaches" },
  { key: "activity", label: "Activities" },
];

export default function IslandMap() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string>(villaBase.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredPoints = useMemo(
    () => points.filter((point) => filter === "all" || point.category === filter),
    [filter],
  );

  const detail = useMemo(() => {
    if (hoveredId === villaBase.id || selectedId === villaBase.id) {
      return { ...villaBase, category: "Home Base" };
    }

    const id = hoveredId ?? selectedId;
    return points.find((point) => point.id === id) ?? { ...villaBase, category: "Home Base" };
  }, [hoveredId, selectedId]);

  return (
    <section className="py-16 md:py-24 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Villa La Percha Guide
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Interactive Island Map
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto text-[#6B6B6B] leading-relaxed">
            Built on the actual Providenciales map silhouette, with pins positioned by their real area on the island.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filters.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              className={`px-5 py-2.5 text-xs md:text-sm tracking-[0.16em] uppercase border transition-all duration-300 ${
                filter === option.key
                  ? "text-white border-[#8B7355] bg-[#8B7355]"
                  : "text-[#2C2C2C] border-[#E8E4DF] bg-white hover:border-[#8B7355]/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-8 items-start">
          <div className="relative rounded-2xl border border-[#E8E4DF] bg-white p-3 md:p-4 shadow-[0_15px_50px_rgba(44,44,44,0.08)]">
            <div className="relative aspect-[1200/716] overflow-hidden rounded-xl bg-[#EEF1F3]">
              <Image
                src="/images/providenciales-map-reference.jpg"
                alt="Providenciales island map"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 65vw"
                priority
              />

              <div className="absolute inset-0">
                <button
                  type="button"
                  onMouseEnter={() => setHoveredId(villaBase.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(villaBase.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${villaBase.x}%`, top: `${villaBase.y}%` }}
                  aria-label="Villa La Percha"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#2C2C2C] shadow-lg">
                    <span className="h-3.5 w-3.5 rounded-full bg-white" />
                    <span className="absolute inset-0 rounded-full border-2 border-[#2C2C2C]/30 animate-ping" />
                  </span>
                </button>

                {filteredPoints.map((point) => {
                  const isActive = point.id === selectedId || point.id === hoveredId;
                  const color = categoryMeta[point.category].color;

                  return (
                    <button
                      key={point.id}
                      type="button"
                      onMouseEnter={() => setHoveredId(point.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedId(point.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      aria-label={point.name}
                    >
                      <span
                        className="relative flex items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-200"
                        style={{
                          width: isActive ? 22 : 16,
                          height: isActive ? 22 : 16,
                          backgroundColor: color,
                        }}
                      >
                        <span
                          className="absolute rounded-full border"
                          style={{
                            inset: isActive ? -7 : -5,
                            borderColor: `${color}55`,
                          }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#E8E4DF] bg-white p-6 md:p-7 shadow-[0_15px_40px_rgba(44,44,44,0.07)]">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#8B7355] mb-2">
              {"category" in detail && detail.category in categoryMeta
                ? categoryMeta[detail.category as Category].label
                : "Home Base"}
            </p>
            <h3 className="font-display text-3xl font-light text-[#2C2C2C] mb-3">{detail.name}</h3>
            <p className="text-xs tracking-[0.12em] uppercase text-[#8B7355] mb-4">{detail.area}</p>
            <p className="text-sm leading-relaxed text-[#6B6B6B] mb-4">{detail.description}</p>
            {"driveTime" in detail && detail.driveTime && (
              <p className="inline-flex items-center rounded-full bg-[#F5F0E8] px-3 py-1.5 text-xs text-[#6A5E4B]">
                Drive time from villa: {detail.driveTime}
              </p>
            )}
            <div className="mt-6 pt-6 border-t border-[#E8E4DF]">
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                This version uses your supplied island map as the exact base, then overlays the filtered points of interest on top.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
