"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const photos = [
  { src: "/images/aerial-house-ocean-neighbors.jpg", alt: "Aerial view of the house, pool and ocean" },
  { src: "/images/aerial-house-pool-ocean.jpg", alt: "Aerial with house, pool and ocean" },
  { src: "/images/aerial-dock-house-pool-area.jpg", alt: "Aerial showing dock, house and pool area" },
  { src: "/images/aerial-ocean-dock-stairs-pool-house.jpg", alt: "Wide aerial covering ocean, dock, stairs and pool" },
  { src: "/images/aerial-cliff-taylor-bay-chalk-sound.jpg", alt: "Cliffside view toward Taylor Bay and Chalk Sound" },
  { src: "/images/aerial-pool-cabana-chalk-sound.jpg", alt: "Pool cabana with Chalk Sound behind" },
  { src: "/images/aerial-pool-house-chalk-sound.jpg", alt: "Pool and house with Chalk Sound backdrop" },
  { src: "/images/pool-lounge-chairs-artistic.jpg", alt: "Pool with lounge chairs" },
  { src: "/images/pool-lounge-ocean.jpg", alt: "View of pool, lounge chairs and ocean" },
  { src: "/images/pool-lounge-ocean-ambient.jpg", alt: "Pool and ocean ambient view" },
  { src: "/images/pool-lounge-umbrellas-wide.jpg", alt: "Pool lounge with umbrellas, wide view" },
  { src: "/images/pool-hot-tub-lounge-umbrellas-ocean.jpg", alt: "Pool, hot tub, lounge chairs and umbrellas facing the ocean" },
  { src: "/images/hot-tub-view-pool-cabana.jpg", alt: "Hot tub view overlooking the pool and cabana" },
  { src: "/images/hot-tub-pool-ocean-sapodilla-bay.jpg", alt: "Angled view of hot tub, pool and Sapodilla Bay" },
  { src: "/images/outdoor-kitchen-dining-cabana.jpg", alt: "Outdoor kitchen and dining at the cabana" },
  { src: "/images/lounge-chairs-landscaping-sapodilla-bay.jpg", alt: "Lounge chairs with landscaping and Sapodilla Bay" },
  { src: "/images/nighttime-pergola-pool-fire-pit-ocean.jpg", alt: "Nighttime pergola, pool and fire pit overlooking the ocean" },
  { src: "/images/kitchen.jpg", alt: "Kitchen" },
  { src: "/images/living-room-dining-entrance.jpg", alt: "Living room, dining area and entrance" },
  { src: "/images/living-dining-to-screened-room.jpg", alt: "Living and dining area leading to the screened room" },
  { src: "/images/screened-living-room-ocean-pool.jpg", alt: "Screened living room with ocean and pool views" },
  { src: "/images/master-suite-balcony-taylor-bay.jpg", alt: "Master suite balcony overlooking Taylor Bay" },
  { src: "/images/secondary-suite-balcony-ocean.jpg", alt: "Secondary suite balcony with ocean view" },
  { src: "/images/downstairs-suite-hammock.jpg", alt: "Downstairs suite opening to hammock area" },
  { src: "/images/lower-suite-bedroom-hammock-pool.jpg", alt: "Lower suite bedroom with hammock and pool view" },
  { src: "/images/secondary-suite-bathroom.jpg", alt: "Secondary suite bathroom" },
];

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const showPhoto = (index: number) => {
    const total = photos.length;
    setActiveIndex((index + total) % total);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const deltaX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 40;

    if (deltaX > swipeThreshold) showPhoto(activeIndex + 1);
    if (deltaX < -swipeThreshold) showPhoto(activeIndex - 1);

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activePhoto = photos[activeIndex];

  return (
    <section id="gallery" className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Gallery
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light" style={{ color: "#2C2C2C" }}>
            Villa La Percha
          </h2>
        </div>

        <div className="rounded-[28px] border border-[#E8E4DF] bg-white p-3 md:p-5 shadow-[0_18px_60px_rgba(44,44,44,0.08)]">
          <div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#EEF1F3] md:aspect-[16/9]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              key={activePhoto.src}
              src={activePhoto.src}
              alt={activePhoto.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
              quality={90}
            />

            <button
              type="button"
              onClick={() => showPhoto(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/55 text-[#2C2C2C] shadow-lg transition hover:bg-white/75 md:left-5 md:h-12 md:w-12"
              aria-label="Previous photo"
            >
              <span className="text-2xl leading-none">‹</span>
            </button>

            <button
              type="button"
              onClick={() => showPhoto(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/55 text-[#2C2C2C] shadow-lg transition hover:bg-white/75 md:right-5 md:h-12 md:w-12"
              aria-label="Next photo"
            >
              <span className="text-2xl leading-none">›</span>
            </button>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {photos.map((photo, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => showPhoto(index)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border transition-all md:h-24 md:w-32 ${
                    isActive
                      ? "border-[#8B7355] ring-2 ring-[#8B7355]/25"
                      : "border-[#E8E4DF] hover:border-[#8B7355]/50"
                  }`}
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={isActive}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="128px"
                    quality={75}
                  />
                  {isActive && <div className="absolute inset-0 bg-[#2C2C2C]/10" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
