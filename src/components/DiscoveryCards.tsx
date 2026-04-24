"use client";

import { useState } from "react";

const experiences = [
  {
    name: "Chalk Sound Kayaking",
    category: "Adventure · 2 min",
    copy: "Kayaks right by the dock — glide through pink-sand coves and mangrove tunnels.",
    image: "/images/aerial-pool-cabana-chalk-sound.jpg",
    tags: ["Adventure", "Nearby"] as const,
  },
  {
    name: "Grace Bay at Sunrise",
    category: "Beach · 20 min",
    copy: "Eight miles of the world's best beach. You'll be first in line.",
    image: "/images/pool-lounge-ocean.jpg",
    tags: ["Beach", "Must Do"] as const,
  },
  {
    name: "Malcolm's Road Snorkeling",
    category: "Dive · 35 min",
    copy: "Where the reef wall drops into the abyss. World-class snorkeling at your doorstep.",
    image: "/images/aerial-cliff-taylor-bay-chalk-sound.jpg",
    tags: ["Dive", "Remote"] as const,
  },
  {
    name: "Da Conch Shack",
    category: "Dining · 15 min",
    copy: "Legendary conch salad, live Junkanoo music, zero pretense. Pure island culture.",
    image: "/images/dock-lounge-chairs-ocean.jpg",
    tags: ["Dining", "Iconic"] as const,
  },
  {
    name: "Hemingway's Sunday Brunch",
    category: "Dining · 25 min",
    copy: "Eggs on the Beach. Beachfront. Sunday. What more do you need?",
    image: "/images/pool-lounge-chairs-artistic.jpg",
    tags: ["Dining", "Legendary"] as const,
  },
  {
    name: "Omar's Beach Hut",
    category: "Dining · 30 min",
    copy: "Lobster pasta where dinner was swimming this morning. Fisherman's dock next door.",
    image: "/images/hot-tub-pool-ocean-sapodilla-bay.jpg",
    tags: ["Dining", "Beachfront"] as const,
  },
  {
    name: "Pirate's Cove Exploration",
    category: "Adventure · 40 min",
    copy: "Limestone sea stacks, hidden caves, a secret cove. Pirates used to love this place.",
    image: "/images/aerial-ocean-dock-stairs-pool-house.jpg",
    tags: ["Adventure", "Hidden"] as const,
  },
  {
    name: "Taylor Bay Swimming",
    category: "Beach · 10 min",
    copy: "Knee-deep turquoise water in total silence. The kind of bay you never want to leave.",
    image: "/images/aerial-cliff-taylor-bay-chalk-sound.jpg",
    tags: ["Beach", "Hidden Gem"] as const,
  },
  {
    name: "Sundog Sunset Sail",
    category: "Experience · 60 min",
    copy: "A wooden schooner, rum punch, and the Caribbean sun going down. Absolute magic.",
    image: "/images/nighttime-pergola-pool-fire-pit-ocean.jpg",
    tags: ["Romance", "Unforgettable"] as const,
  },
  {
    name: "Coco Bistro",
    category: "Dining · 25 min",
    copy: "Fresh catch under twinkling lights in a palm grove. Your own herb garden in every dish.",
    image: "/images/aerial-pool-house-chalk-sound.jpg",
    tags: ["Dining", "Romantic"] as const,
  },
  {
    name: "Caicos Wall Diving",
    category: "Dive · Offshore",
    copy: "From 50 feet to 6,000 feet of ocean drop-off. Sea turtles, sharks, everything.",
    image: "/images/aerial-house-pool-ocean.jpg",
    tags: ["Dive", "Epic"] as const,
  },
  {
    name: "Northwest Point Marine Park",
    category: "Nature · 45 min",
    copy: "300+ wild conchs on the beach. The only place on earth you'll see that.",
    image: "/images/aerial-house-ocean-neighbors.jpg",
    tags: ["Nature", "Unique"] as const,
  },
  {
    name: "Sapodilla Bay",
    category: "Beach Bar · 30 min",
    copy: "Endless white sand, trade winds, beach bar energy. No resort gates, no cover charge.",
    image: "/images/lounge-chairs-landscaping-sapodilla-bay.jpg",
    tags: ["Beach", "Local Vibes"] as const,
  },
  {
    name: "Turtle Watching at Conch Farm",
    category: "Wildlife · 30 min",
    copy: "Swim alongside hundreds of wild green sea turtles. Kids lose their minds. Adults lose their minds.",
    image: "/images/downstairs-suite-hammock.jpg",
    tags: ["Wildlife", "Family"] as const,
  },
];

export default function DiscoveryCards() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("All");

  const toggleSave = (name: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const categories = ["All", "Adventure", "Beach", "Dining", "Dive", "Romance", "Wildlife"];
  const filtered = filter === "All" ? experiences : experiences.filter((e) => e.tags.some((t) => t === filter));

  const savedArr = experiences.filter((e) => saved.has(e.name));

  return (
    <div className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            Discover
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Curated Experiences
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
            Swipe through our favorites. Tap the heart to save to your list. We'll build your week around what you love.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 text-xs tracking-wider uppercase rounded-full transition-all duration-300 ${
                filter === cat
                  ? "text-white"
                  : "text-[#8B7355] bg-[#F5F0E8] hover:bg-[#E8E4DF]"
              }`}
              style={filter === cat ? { backgroundColor: "#8B7355" } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((exp) => (
            <div
              key={exp.name}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer h-72"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${exp.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-5">
                <span className="text-[10px] tracking-wider uppercase font-medium text-white/70 mb-1">
                  {exp.category}
                </span>
                <h3 className="font-display text-lg font-light text-white mb-1 leading-snug">
                  {exp.name}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                  {exp.copy}
                </p>

                {/* Save Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(exp.name);
                  }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all duration-300 group/btn"
                >
                  <svg
                    className={`w-4 h-4 transition-colors duration-300 ${
                      saved.has(exp.name) ? "text-red-400 fill-red-400" : "text-white/70 fill-none"
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Saved Favorites */}
        {savedArr.length > 0 && (
          <div className="mt-16 bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-light" style={{ color: "#2C2C2C" }}>
                My Favorites
              </h3>
              <span className="text-xs text-[#6B6B6B] tracking-wider uppercase">
                {savedArr.length} saved
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {savedArr.map((exp) => (
                <div
                  key={exp.name}
                  className="flex items-center gap-3 bg-white border border-[#E8E4DF] rounded-xl px-4 py-3 hover:shadow-md transition-shadow duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${exp.image})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "#2C2C2C" }}>
                      {exp.name}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">{exp.category}</p>
                  </div>
                  <button
                    onClick={() => toggleSave(exp.name)}
                    className="text-red-400 hover:text-red-500 flex-shrink-0"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
