"use client";

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
  x: 412,
  y: 466,
  area: "Chalk Sound",
  description: "Your home base on the southwest side of Providenciales, above Chalk Sound and close to Taylor Bay, Sapodilla Bay, and Five Cays.",
};

const points: MapPoint[] = [
  {
    id: "da-conch-shack",
    name: "Da Conch Shack",
    category: "restaurant",
    x: 272,
    y: 278,
    area: "Blue Hills",
    description: "The island's iconic conch institution on the north shore west of Grace Bay.",
    driveTime: "~18 min",
  },
  {
    id: "hemingways",
    name: "Hemingway's",
    category: "restaurant",
    x: 640,
    y: 268,
    area: "Grace Bay",
    description: "Beachfront favorite at The Sands, in the central Grace Bay stretch.",
    driveTime: "~24 min",
  },
  {
    id: "omars-beach-hut",
    name: "Omar's Beach Hut",
    category: "restaurant",
    x: 388,
    y: 538,
    area: "Five Cays",
    description: "Laid-back seafood spot near the beach and fishing docks in Five Cays.",
    driveTime: "~9 min",
  },
  {
    id: "coco-bistro",
    name: "Coco Bistro",
    category: "restaurant",
    x: 606,
    y: 281,
    area: "Grace Bay",
    description: "Romantic fine dining tucked just inland from Grace Bay Beach.",
    driveTime: "~23 min",
  },
  {
    id: "provence-by-eric",
    name: "Provence by Eric",
    category: "restaurant",
    x: 690,
    y: 280,
    area: "Grace Bay",
    description: "Chef-led tasting experience in the eastern Grace Bay corridor.",
    driveTime: "~25 min",
  },
  {
    id: "infiniti",
    name: "Infiniti",
    category: "restaurant",
    x: 672,
    y: 255,
    area: "Grace Bay Club",
    description: "Elegant oceanfront dinner destination along central Grace Bay.",
    driveTime: "~25 min",
  },
  {
    id: "magnolia",
    name: "Magnolia",
    category: "restaurant",
    x: 478,
    y: 252,
    area: "Turtle Cove",
    description: "Hilltop dining overlooking Turtle Cove Marina and the north shore.",
    driveTime: "~19 min",
  },
  {
    id: "cocovan",
    name: "CocoVan",
    category: "restaurant",
    x: 596,
    y: 307,
    area: "Grace Bay",
    description: "Palm-grove Airstream lounge for tacos and casual island bites.",
    driveTime: "~23 min",
  },
  {
    id: "bay-bistro",
    name: "Bay Bistro",
    category: "restaurant",
    x: 726,
    y: 278,
    area: "Grace Bay",
    description: "Ocean-view brunch and seafood spot on the eastern Grace Bay strip.",
    driveTime: "~27 min",
  },
  {
    id: "blt-steak",
    name: "BLT Steak",
    category: "restaurant",
    x: 748,
    y: 266,
    area: "Ritz-Carlton / Grace Bay",
    description: "Luxury steakhouse at the eastern end of the Grace Bay corridor.",
    driveTime: "~27 min",
  },
  {
    id: "grace-bay",
    name: "Grace Bay Beach",
    category: "beach",
    x: 670,
    y: 228,
    area: "North Shore",
    description: "The island's most famous beach, stretching along the north coast east of Turtle Cove.",
    driveTime: "~24 min",
  },
  {
    id: "malcolms-road-beach",
    name: "Malcolm's Road Beach",
    category: "beach",
    x: 62,
    y: 189,
    area: "Far West",
    description: "Remote northwestern beach access with dramatic reef-wall snorkeling offshore.",
    driveTime: "~40 min (4x4 advised)",
  },
  {
    id: "northwest-point-marine-park",
    name: "Northwest Point Marine Park",
    category: "beach",
    x: 58,
    y: 66,
    area: "Northwest Point",
    description: "Protected marine area at the island's far northwest edge.",
    driveTime: "~45 min",
  },
  {
    id: "taylor-bay",
    name: "Taylor Bay",
    category: "beach",
    x: 330,
    y: 462,
    area: "Southwest Coast",
    description: "Quiet shallow bay just west of Chalk Sound, close to the villa.",
    driveTime: "~6 min",
  },
  {
    id: "west-harbour-bluff",
    name: "West Harbour Bluff",
    category: "beach",
    x: 162,
    y: 449,
    area: "Southwest Tip",
    description: "Rugged ocean-facing coast with caves, cliffs, and Pirate's Cove nearby.",
    driveTime: "~16 min",
  },
  {
    id: "sapodilla-bay",
    name: "Sapodilla Bay",
    category: "beach",
    x: 346,
    y: 502,
    area: "Southwest Coast",
    description: "Calm bay just southeast of Taylor Bay with a local, easygoing atmosphere.",
    driveTime: "~8 min",
  },
  {
    id: "caicos-wall",
    name: "Caicos Wall",
    category: "activity",
    x: 40,
    y: 148,
    area: "Off the West Coast",
    description: "Best accessed by boat from the west side; the wall lies offshore beyond the Malcolm's Road area.",
    driveTime: "West-side charter",
  },
  {
    id: "pirates-cove-split-rock",
    name: "Pirate's Cove & Split Rock",
    category: "activity",
    x: 145,
    y: 474,
    area: "West Harbour Bluff",
    description: "Sea cliffs, cave formations, and historic pirate-hideout folklore on the southwest coast.",
    driveTime: "~16 min",
  },
  {
    id: "turtle-watching-conch-farm",
    name: "Turtle Watching at Conch Farm",
    category: "activity",
    x: 878,
    y: 176,
    area: "Leeward",
    description: "Far east near Leeward and the old conch farm area.",
    driveTime: "~30 min",
  },
  {
    id: "chalk-sound-national-park",
    name: "Chalk Sound National Park",
    category: "activity",
    x: 382,
    y: 470,
    area: "By the Villa",
    description: "The glowing turquoise lagoon system directly beside Villa La Percha.",
    driveTime: "~2 min",
  },
  {
    id: "sundog-sail",
    name: "Sundog Sail",
    category: "activity",
    x: 476,
    y: 287,
    area: "Turtle Cove Marina",
    description: "Sunset sail departure from Turtle Cove on the island's north side.",
    driveTime: "~19 min",
  },
  {
    id: "shipwreck-diving",
    name: "Shipwreck Diving",
    category: "activity",
    x: 515,
    y: 118,
    area: "Off North Shore Reefs",
    description: "Boat-diving territory offshore north of Providenciales.",
    driveTime: "Marina departure",
  },
  {
    id: "north-caicos-day-trip",
    name: "North Caicos Day Trip",
    category: "activity",
    x: 952,
    y: 54,
    area: "Ferry / Charter East",
    description: "Day-trip route outward from Provo toward North Caicos and Middle Caicos.",
    driveTime: "Ferry + drive",
  },
  {
    id: "big-game-fishing",
    name: "Big Game Fishing",
    category: "activity",
    x: 444,
    y: 80,
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
            A more faithful island guide: shaped like Providenciales, with points placed by their real area on Provo.
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
          <div className="relative rounded-2xl border border-[#E8E4DF] bg-white p-2 md:p-4 shadow-[0_15px_50px_rgba(44,44,44,0.08)]">
            <svg
              viewBox="0 0 1000 620"
              className="w-full h-auto rounded-xl bg-[#EAF3F5]"
              role="img"
              aria-label="Stylized map of Providenciales with points of interest"
            >
              <defs>
                <linearGradient id="islandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F3EFE8" />
                  <stop offset="100%" stopColor="#E5DDD0" />
                </linearGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2C2C2C" floodOpacity="0.2" />
                </filter>
              </defs>

              <path
                d="M52 275C82 218 140 177 217 160C303 141 384 141 490 119C602 95 734 111 816 160C887 202 928 249 949 307C970 365 945 413 884 447C822 481 733 486 640 487C545 488 470 502 382 529C296 555 202 562 130 533C72 509 43 465 37 416C30 365 25 328 52 275Z"
                fill="url(#islandGradient)"
                stroke="#CFBEAB"
                strokeWidth="3"
              />

              <path
                d="M74 275C110 223 170 193 240 182C342 166 421 160 507 142C618 119 739 129 815 171C877 205 911 247 927 300"
                fill="none"
                stroke="#E8DED1"
                strokeWidth="7"
                opacity="0.65"
              />

              <path
                d="M120 500C215 525 318 527 404 500C491 474 562 466 658 464C731 462 802 457 863 431"
                fill="none"
                stroke="#D9CDBF"
                strokeDasharray="6 9"
                strokeWidth="2"
              />

              <ellipse cx="390" cy="462" rx="112" ry="56" fill="#93CDD6" opacity="0.52" />
              <ellipse cx="332" cy="450" rx="55" ry="28" fill="#93CDD6" opacity="0.38" />
              <ellipse cx="428" cy="487" rx="42" ry="18" fill="#93CDD6" opacity="0.34" />
              <ellipse cx="684" cy="230" rx="76" ry="20" fill="#A8DBE1" opacity="0.22" />
              <ellipse cx="518" cy="286" rx="42" ry="14" fill="#A8DBE1" opacity="0.18" />

              <text x="175" y="118" fill="#7A6A57" fontSize="18" letterSpacing="4" className="uppercase">
                Providenciales
              </text>
              <text x="301" y="432" fill="#6C93A1" fontSize="14" letterSpacing="2">Chalk Sound</text>
              <text x="583" y="246" fill="#6C93A1" fontSize="14" letterSpacing="2">Grace Bay</text>
              <text x="448" y="262" fill="#6C93A1" fontSize="13" letterSpacing="2">Turtle Cove</text>
              <text x="295" y="546" fill="#6C93A1" fontSize="13" letterSpacing="2">Taylor / Sapodilla</text>
              <text x="355" y="575" fill="#6C93A1" fontSize="13" letterSpacing="2">Five Cays</text>
              <text x="52" y="40" fill="#6C93A1" fontSize="12" letterSpacing="2">Northwest Point</text>
              <text x="860" y="145" fill="#6C93A1" fontSize="12" letterSpacing="2">Leeward</text>

              <g filter="url(#softShadow)">
                <g
                  transform={`translate(${villaBase.x}, ${villaBase.y})`}
                  onMouseEnter={() => setHoveredId(villaBase.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(villaBase.id)}
                  className="cursor-pointer"
                >
                  <circle r="17" fill="#2C2C2C" />
                  <circle r="8" fill="#FAFAF8" />
                  <circle r="28" fill="none" stroke="#2C2C2C" strokeOpacity="0.3" strokeWidth="2">
                    <animate attributeName="r" values="20;32;20" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.45;0.15;0.45" dur="3s" repeatCount="indefinite" />
                  </circle>
                </g>
              </g>

              {filteredPoints.map((point) => {
                const isActive = point.id === selectedId || point.id === hoveredId;
                const color = categoryMeta[point.category].color;

                return (
                  <g
                    key={point.id}
                    transform={`translate(${point.x}, ${point.y})`}
                    onMouseEnter={() => setHoveredId(point.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId(point.id)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={isActive ? 11 : 8}
                      fill={color}
                      stroke="#FAFAF8"
                      strokeWidth="2"
                      style={{ transition: "all 180ms ease" }}
                    />
                    <circle r={isActive ? 18 : 13} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth="1.5" />
                  </g>
                );
              })}
            </svg>
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
                I&apos;ve moved these to better match their real area on Providenciales — especially the Grace Bay, Turtle Cove, Five Cays, and southwest-coast groupings.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
