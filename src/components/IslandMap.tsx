"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  islandMapHomeBase as villaBase,
  islandMapImage,
  islandMapLocations as points,
  type IslandMapCategory as Category,
} from "@/data/islandMapData";
import { gpsToSvg, provMapAnchors } from "@/data/mapCalibration";
import { guideAnchor } from "@/data/islandGuide";

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

type PositionedPoint = (typeof points)[number] & { renderX: number; renderY: number };
type PositionedBase = typeof villaBase & { renderX: number; renderY: number };
type MapCluster = {
  id: string;
  x: number;
  y: number;
  points: PositionedPoint[];
};

const clusterDistance = 4.8;
const spiderRadius = 4.2;
const unclusteredZoom = 1.65;
const minZoom = 1;
const maxZoom = 3.2;

function getRenderedPosition(item: { x: number; y: number; lat?: number; lon?: number }) {
  if (typeof item.lat === "number" && typeof item.lon === "number") {
    const calibrated = gpsToSvg(item.lat, item.lon, provMapAnchors);
    if (calibrated) return calibrated;
  }

  return { x: item.x, y: item.y };
}

function distance(a: { renderX: number; renderY: number }, b: { renderX: number; renderY: number }) {
  return Math.hypot(a.renderX - b.renderX, a.renderY - b.renderY);
}

function buildClusters(items: PositionedPoint[]) {
  const clusters: MapCluster[] = [];

  items.forEach((point) => {
    const cluster = clusters.find((candidate) =>
      candidate.points.some((clusterPoint) => distance(clusterPoint, point) <= clusterDistance),
    );

    if (cluster) {
      cluster.points.push(point);
      cluster.x = cluster.points.reduce((sum, item) => sum + item.renderX, 0) / cluster.points.length;
      cluster.y = cluster.points.reduce((sum, item) => sum + item.renderY, 0) / cluster.points.length;
    } else {
      clusters.push({ id: point.id, x: point.renderX, y: point.renderY, points: [point] });
    }
  });

  return clusters.map((cluster) => ({
    ...cluster,
    id: cluster.points.map((point) => point.id).sort().join("--"),
  }));
}

function spiderPoint(cluster: MapCluster, point: PositionedPoint, index: number) {
  if (cluster.points.length === 1) {
    return { x: point.renderX, y: point.renderY };
  }

  const angle = (index / cluster.points.length) * Math.PI * 2 - Math.PI / 2;
  return {
    x: cluster.x + Math.cos(angle) * spiderRadius,
    y: cluster.y + Math.sin(angle) * spiderRadius,
  };
}

export default function IslandMap() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string>(villaBase.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const positionedVillaBase = useMemo<PositionedBase>(() => {
    const { x, y } = getRenderedPosition(villaBase);
    return { ...villaBase, renderX: x, renderY: y };
  }, []);

  const positionedPoints = useMemo<PositionedPoint[]>(
    () =>
      points.map((point) => {
        const { x, y } = getRenderedPosition(point);
        return { ...point, renderX: x, renderY: y };
      }),
    [],
  );

  const filteredPoints = useMemo(
    () => positionedPoints.filter((point) => filter === "all" || point.category === filter),
    [filter, positionedPoints],
  );

  const clusters = useMemo(() => buildClusters(filteredPoints), [filteredPoints]);
  const shouldCluster = zoom < unclusteredZoom;

  const detail = useMemo(() => {
    if (hoveredId === positionedVillaBase.id || selectedId === positionedVillaBase.id) {
      return { ...positionedVillaBase, category: "Home Base" };
    }

    const id = hoveredId ?? selectedId;
    return positionedPoints.find((point) => point.id === id) ?? { ...positionedVillaBase, category: "Home Base" };
  }, [hoveredId, selectedId, positionedPoints, positionedVillaBase]);

  const selectPoint = (pointId: string) => {
    setSelectedId(pointId);
    const cluster = clusters.find((candidate) => candidate.points.some((point) => point.id === pointId));
    if (shouldCluster && cluster && cluster.points.length > 1) setExpandedClusterId(cluster.id);
  };

  const setClampedZoom = (nextZoom: number) => {
    const clamped = Math.min(maxZoom, Math.max(minZoom, nextZoom));
    setZoom(clamped);
    if (clamped >= unclusteredZoom) setExpandedClusterId(null);
  };

  const getPinchDistance = () => {
    const pointers = Array.from(activePointers.current.values());
    if (pointers.length < 2) return null;
    return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setExpandedClusterId(null);
  };

  const mapTransform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  return (
    <section id="island-map" className="scroll-mt-24 py-16 md:py-24 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Villa La Percha Guide
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Interactive Island Map
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto text-[#6B6B6B] leading-relaxed">
            Use the map to understand where each place sits relative to the villa, then jump into the planning notes below when something catches your eye.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filters.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setFilter(option.key);
                setExpandedClusterId(null);
              }}
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
          <div className="relative rounded-2xl border border-[#E8E4DF] bg-white p-4 shadow-[0_15px_50px_rgba(44,44,44,0.08)] md:p-5">
            <div
              className="relative aspect-[1280/764] overflow-hidden rounded-xl bg-white p-4 touch-none select-none sm:p-5 md:p-6"
              onPointerDown={(event) => {
                activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
                event.currentTarget.setPointerCapture(event.pointerId);
                if (activePointers.current.size === 1 && zoom > 1) {
                  dragStart.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
                }
                if (activePointers.current.size === 2) {
                  dragStart.current = null;
                  const distance = getPinchDistance();
                  if (distance) pinchStart.current = { distance, zoom };
                }
              }}
              onPointerMove={(event) => {
                if (!activePointers.current.has(event.pointerId)) return;
                activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
                const distance = getPinchDistance();
                if (distance && pinchStart.current) {
                  setClampedZoom((pinchStart.current.zoom * distance) / pinchStart.current.distance);
                  return;
                }
                if (zoom > 1 && activePointers.current.size === 1 && dragStart.current) {
                  setPan({
                    x: dragStart.current.panX + event.clientX - dragStart.current.x,
                    y: dragStart.current.panY + event.clientY - dragStart.current.y,
                  });
                }
              }}
              onPointerUp={(event) => {
                activePointers.current.delete(event.pointerId);
                if (activePointers.current.size < 2) pinchStart.current = null;
                if (activePointers.current.size === 0) dragStart.current = null;
                if (activePointers.current.size === 0) dragStart.current = null;
              }}
              onPointerCancel={(event) => {
                activePointers.current.delete(event.pointerId);
                if (activePointers.current.size < 2) pinchStart.current = null;
                if (activePointers.current.size === 0) dragStart.current = null;
              }}
            >
              <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur">
                <button type="button" onClick={() => setClampedZoom(zoom - 0.25)} className="h-7 w-7 rounded-full border border-[#E8E4DF] text-sm text-[#2C2C2C]" aria-label="Zoom out">−</button>
                <button type="button" onClick={() => setClampedZoom(zoom + 0.25)} className="h-7 w-7 rounded-full border border-[#E8E4DF] text-sm text-[#2C2C2C]" aria-label="Zoom in">+</button>
                {zoom > 1 && <button type="button" onClick={resetZoom} className="px-2 text-[10px] uppercase tracking-[0.12em] text-[#8B7355]">Reset</button>}
              </div>

              <div className="absolute inset-4 transition-transform duration-150 sm:inset-5 md:inset-6" style={{ transform: mapTransform, transformOrigin: "50% 50%" }}>
                <Image
                  src={islandMapImage}
                  alt="Providenciales island map"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
              </div>

              <div className="absolute inset-4 transition-transform duration-150 sm:inset-5 md:inset-6" style={{ transform: mapTransform, transformOrigin: "50% 50%" }}>
                <button
                  type="button"
                  onMouseEnter={() => setHoveredId(positionedVillaBase.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    setSelectedId(positionedVillaBase.id);
                    setExpandedClusterId(null);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2"
                  style={{ left: `${positionedVillaBase.renderX}%`, top: `${positionedVillaBase.renderY}%` }}
                  aria-label="Villa La Percha"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#2C2C2C] shadow-lg">
                    <span className="h-3.5 w-3.5 rounded-full bg-white" />
                    <span className="absolute inset-0 rounded-full border-2 border-[#2C2C2C]/30 animate-ping" />
                  </span>
                </button>

                {clusters.map((cluster) => {
                  const isExpanded = expandedClusterId === cluster.id;
                  const hasSelectedPoint = cluster.points.some((point) => point.id === selectedId);

                  if (shouldCluster && cluster.points.length > 1 && !isExpanded) {
                    return (
                      <button
                        key={cluster.id}
                        type="button"
                        onClick={() => setExpandedClusterId(cluster.id)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2"
                        style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
                        aria-label={`Expand ${cluster.points.length} places near ${cluster.points[0].area}`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-lg transition-transform duration-200 ${
                            hasSelectedPoint ? "scale-110" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: "#2C2C2C" }}
                        >
                          {cluster.points.length}
                        </span>
                      </button>
                    );
                  }

                  return cluster.points.map((point, index) => {
                    const isActive = point.id === selectedId || point.id === hoveredId;
                    const color = categoryMeta[point.category].color;
                    const position = spiderPoint(cluster, point, index);

                    return (
                      <button
                        key={point.id}
                        type="button"
                        onMouseEnter={() => setHoveredId(point.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => selectPoint(point.id)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2"
                        style={{ left: `${position.x}%`, top: `${position.y}%` }}
                        aria-label={point.name}
                      >
                        {isExpanded && cluster.points.length > 1 && (
                          <span
                            className="pointer-events-none absolute left-1/2 top-1/2 h-px origin-left bg-[#2C2C2C]/20"
                            style={{ width: `${spiderRadius * 3.6}px`, transform: `rotate(${Math.atan2(position.y - cluster.y, position.x - cluster.x)}rad)` }}
                          />
                        )}
                        <span
                          className="relative flex items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-200"
                          style={{
                            width: isActive ? 24 : 18,
                            height: isActive ? 24 : 18,
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
                  });
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
            {"id" in detail && detail.id !== positionedVillaBase.id && (
              <a
                href={`#${guideAnchor(detail.id)}`}
                className="mt-4 block w-fit rounded-full bg-[#2C2C2C] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#8B7355]"
              >
                View planning notes below
              </a>
            )}
            <p className="mt-5 border-t border-[#E8E4DF] pt-5 text-xs leading-relaxed text-[#6B6B6B]">
              Pinch or use the zoom controls to inspect crowded areas. At closer zoom levels, numbered clusters automatically become individual pins.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
