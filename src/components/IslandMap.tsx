"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  islandMapHomeBase as villaBase,
  islandMapImage,
  islandMapLocations as points,
  type IslandMapCategory as Category,
} from "@/data/islandMapData";

type Filter = "all" | Category;

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
                src={islandMapImage}
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
