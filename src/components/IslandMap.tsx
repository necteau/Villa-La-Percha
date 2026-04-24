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
  x: 250,
  y: 400,
  area: "Chalk Sound (Southwest)",
  description: "Your home base above Chalk Sound's turquoise inlets.",
};

const points: MapPoint[] = [
  {
    id: "da-conch-shack",
    name: "Da Conch Shack",
    category: "restaurant",
    x: 300,
    y: 210,
    area: "Blue Hills",
    description: "Legendary local conch spot with live island energy.",
    driveTime: "~18 min",
  },
  {
    id: "hemingways",
    name: "Hemingway's",
    category: "restaurant",
    x: 645,
    y: 190,
    area: "Grace Bay",
    description: "Beachfront classic for breakfast, lunch, and sunset dinners.",
    driveTime: "~24 min",
  },
  {
    id: "omars-beach-hut",
    name: "Omar's Beach Hut",
    category: "restaurant",
    x: 230,
    y: 365,
    area: "Five Cays",
    description: "Relaxed beachfront seafood and strong rum punches.",
    driveTime: "~9 min",
  },
  {
    id: "coco-bistro",
    name: "Coco Bistro",
    category: "restaurant",
    x: 615,
    y: 205,
    area: "Grace Bay",
    description: "Beloved fine dining under palms and twinkling lights.",
    driveTime: "~23 min",
  },
  {
    id: "provence-by-eric",
    name: "Provence by Eric",
    category: "restaurant",
    x: 675,
    y: 220,
    area: "Grace Bay",
    description: "Intimate chef-led tasting rooted in French technique.",
    driveTime: "~25 min",
  },
  {
    id: "infiniti",
    name: "Infiniti",
    category: "restaurant",
    x: 700,
    y: 200,
    area: "Grace Bay Club",
    description: "Elegant oceanfront dining and raw bar at golden hour.",
    driveTime: "~26 min",
  },
  {
    id: "magnolia",
    name: "Magnolia",
    category: "restaurant",
    x: 500,
    y: 190,
    area: "Turtle Cove / Grace Bay",
    description: "Hilltop sunsets with marina views and excellent seafood.",
    driveTime: "~20 min",
  },
  {
    id: "cocovan",
    name: "CocoVan",
    category: "restaurant",
    x: 590,
    y: 225,
    area: "Grace Bay",
    description: "Stylish airstream lounge for tacos and island bites.",
    driveTime: "~23 min",
  },
  {
    id: "bay-bistro",
    name: "Bay Bistro",
    category: "restaurant",
    x: 720,
    y: 225,
    area: "Grace Bay",
    description: "Ocean-view brunch favorite with island seafood classics.",
    driveTime: "~27 min",
  },
  {
    id: "blt-steak",
    name: "BLT Steak",
    category: "restaurant",
    x: 735,
    y: 210,
    area: "The Ritz-Carlton, Grace Bay",
    description: "Premium steakhouse experience for a special evening.",
    driveTime: "~27 min",
  },
  {
    id: "grace-bay",
    name: "Grace Bay",
    category: "beach",
    x: 675,
    y: 165,
    area: "North Shore",
    description: "World-famous white sand and crystal-clear water.",
    driveTime: "~24 min",
  },
  {
    id: "malcolms-road-beach",
    name: "Malcolm's Road Beach",
    category: "beach",
    x: 80,
    y: 140,
    area: "Far West",
    description: "Remote beach access to dramatic reef-wall snorkeling.",
    driveTime: "~40 min (4x4 advised)",
  },
  {
    id: "northwest-point-marine-park",
    name: "Northwest Point Marine Park",
    category: "beach",
    x: 120,
    y: 80,
    area: "Northwest Point",
    description: "Wild conchs, protected waters, and rugged beauty.",
    driveTime: "~45 min",
  },
  {
    id: "taylor-bay",
    name: "Taylor Bay",
    category: "beach",
    x: 195,
    y: 430,
    area: "South Coast",
    description: "Calm shallow water and one of the best sunset swims.",
    driveTime: "~6 min",
  },
  {
    id: "west-harbour-bluff",
    name: "West Harbour Bluff (Pirate's Cove)",
    category: "beach",
    x: 105,
    y: 470,
    area: "Southwest Coast",
    description: "Secluded cliffs, cave access, and raw ocean scenery.",
    driveTime: "~16 min",
  },
  {
    id: "sapodilla-bay",
    name: "Sapodilla Bay",
    category: "beach",
    x: 170,
    y: 455,
    area: "South Coast",
    description: "Gentle bay water with local beach-bar atmosphere.",
    driveTime: "~8 min",
  },
  {
    id: "caicos-wall",
    name: "Caicos Wall",
    category: "activity",
    x: 55,
    y: 185,
    area: "Off Malcolm's Road",
    description: "Iconic drop-off diving with turtles, rays, and reef life.",
    driveTime: "Boat charter from west coast",
  },
  {
    id: "pirates-cove-split-rock",
    name: "Pirate's Cove & Split Rock",
    category: "activity",
    x: 130,
    y: 490,
    area: "West Harbour Bluff",
    description: "Historic cave, limestone formations, and dramatic coast.",
    driveTime: "~16 min",
  },
  {
    id: "turtle-watching-conch-farm",
    name: "Turtle Watching at Conch Farm",
    category: "activity",
    x: 845,
    y: 180,
    area: "Leeward",
    description: "Family favorite conservation experience with sea turtles.",
    driveTime: "~30 min",
  },
  {
    id: "chalk-sound-national-park",
    name: "Chalk Sound National Park",
    category: "activity",
    x: 230,
    y: 455,
    area: "Next to Villa",
    description: "Kayak through glowing turquoise lagoons and tiny cays.",
    driveTime: "~2 min",
  },
  {
    id: "sundog-sail",
    name: "Sundog Sail",
    category: "activity",
    x: 470,
    y: 225,
    area: "Turtle Cove Marina",
    description: "Classic sunset schooner sail with snorkel stop.",
    driveTime: "~19 min",
  },
  {
    id: "shipwreck-diving",
    name: "Shipwreck Diving",
    category: "activity",
    x: 520,
    y: 110,
    area: "North Shore Reefs",
    description: "Dive coral-covered wrecks in clear blue water.",
    driveTime: "Marina departure ~20 min",
  },
  {
    id: "north-caicos-day-trip",
    name: "North Caicos Day Trip",
    category: "activity",
    x: 930,
    y: 75,
    area: "Ferry / Charter Route",
    description: "Easy day adventure to quieter sister-island beaches.",
    driveTime: "Ferry + drive day trip",
  },
  {
    id: "big-game-fishing",
    name: "Big Game Fishing",
    category: "activity",
    x: 445,
    y: 70,
    area: "Deep Water North of Provo",
    description: "Offshore charters for wahoo, tuna, marlin, and dorado.",
    driveTime: "Charter from marinas",
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
            Hover or tap points to explore beaches, restaurants, and adventures around Providenciales.
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
                  <stop offset="0%" stopColor="#F2EFE9" />
                  <stop offset="100%" stopColor="#E6DED2" />
                </linearGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2C2C2C" floodOpacity="0.22" />
                </filter>
              </defs>

              <path
                d="M55 355C40 300 58 244 116 193C162 152 227 129 289 126C352 121 394 103 465 102C542 101 611 118 669 145C736 178 816 213 860 262C896 303 903 353 861 395C827 429 770 439 710 445C636 453 564 468 501 493C441 516 389 525 328 522C251 518 183 493 126 451C95 428 68 396 55 355Z"
                fill="url(#islandGradient)"
                stroke="#D4C9BC"
                strokeWidth="3"
              />

              <path
                d="M137 408C160 430 193 455 230 470C280 490 340 505 397 507C456 511 517 500 577 477C622 460 675 448 732 440"
                stroke="#D8CEC1"
                strokeDasharray="6 8"
                strokeWidth="2"
                fill="none"
              />

              <ellipse cx="222" cy="430" rx="84" ry="52" fill="#93CDD6" opacity="0.45" />
              <ellipse cx="270" cy="445" rx="54" ry="30" fill="#93CDD6" opacity="0.34" />
              <ellipse cx="300" cy="406" rx="40" ry="22" fill="#93CDD6" opacity="0.33" />
              <ellipse cx="498" cy="220" rx="26" ry="12" fill="#A2D8E0" opacity="0.45" />
              <ellipse cx="625" cy="198" rx="30" ry="13" fill="#A2D8E0" opacity="0.38" />

              <text x="160" y="90" fill="#7A6A57" fontSize="18" letterSpacing="4" className="uppercase">
                Providenciales
              </text>

              <g filter="url(#softShadow)">
                <g
                  transform={`translate(${villaBase.x}, ${villaBase.y})`}
                  onMouseEnter={() => setHoveredId(villaBase.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(villaBase.id)}
                  className="cursor-pointer"
                >
                  <circle r="16" fill="#2C2C2C" />
                  <circle r="8" fill="#FAFAF8" />
                  <circle r="24" fill="none" stroke="#2C2C2C" strokeOpacity="0.3" strokeWidth="2">
                    <animate attributeName="r" values="18;28;18" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.45;0.2;0.45" dur="3s" repeatCount="indefinite" />
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
                    <circle r={isActive ? 17 : 13} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth="1.5" />
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
                Tip: filter by category, then tap nearby clusters to plan each day around your mood.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
