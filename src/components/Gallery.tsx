import Image from "next/image";

const photos = [
  // ——— Outdoors ———
  { src: "/images/aerial-house-ocean-neighbors.jpg", span: "md:col-span-2 md:row-span-2", alt: "Aerial view of the house, pool and ocean" },
  { src: "/images/aerial-house-pool-ocean.jpg", span: "md:col-span-2", alt: "Aerial with house, pool and ocean" },
  { src: "/images/aerial-dock-house-pool-area.jpg", span: "md:col-span-2", alt: "Aerial showing dock, house and pool area" },
  { src: "/images/aerial-ocean-dock-stairs-pool-house.jpg", span: "md:col-span-2", alt: "Wide aerial covering ocean, dock, stairs and pool" },
  { src: "/images/aerial-cliff-taylor-bay-chalk-sound.jpg", span: "md:col-span-2", alt: "Cliffside view toward Taylor Bay and Chalk Sound" },
  { src: "/images/aerial-pool-cabana-chalk-sound.jpg", span: "md:col-span-2", alt: "Pool cabana with Chalk Sound behind" },
  { src: "/images/aerial-pool-house-chalk-sound.jpg", span: "md:col-span-2", alt: "Pool and house with Chalk Sound backdrop" },
  { src: "/images/pool-lounge-chairs-artistic.jpg", span: "", alt: "Pool with lounge chairs" },
  { src: "/images/pool-lounge-ocean.jpg", span: "", alt: "View of pool, lounge chairs and ocean" },
  { src: "/images/pool-lounge-ocean-ambient.jpg", span: "", alt: "Pool and ocean ambient view" },
  { src: "/images/pool-lounge-umbrellas-wide.jpg", span: "", alt: "Pool lounge with umbrellas, wide view" },
  { src: "/images/pool-hot-tub-lounge-umbrellas-ocean.jpg", span: "md:col-span-2", alt: "Pool, hot tub, lounge chairs and umbrellas facing the ocean" },
  { src: "/images/hot-tub-view-pool-cabana.jpg", span: "", alt: "Hot tub view overlooking the pool and cabana" },
  { src: "/images/hot-tub-pool-ocean-sapodilla-bay.jpg", span: "", alt: "Angled view of hot tub, pool and Sapodilla Bay" },
  { src: "/images/outdoor-kitchen-dining-cabana.jpg", span: "", alt: "Outdoor kitchen and dining at the cabana" },
  { src: "/images/lounge-chairs-landscaping-sapodilla-bay.jpg", span: "", alt: "Lounge chairs with landscaping and Sapodilla Bay" },
  { src: "/images/nighttime-pergola-pool-fire-pit-ocean.jpg", span: "", alt: "Nighttime pergola, pool and fire pit overlooking the ocean" },

  // ——— Kitchen & Living ———
  { src: "/images/kitchen.jpg", span: "md:col-span-2", alt: "Kitchen" },
  { src: "/images/living-room-dining-entrance.jpg", span: "", alt: "Living room, dining area and entrance" },
  { src: "/images/living-dining-to-screened-room.jpg", span: "", alt: "Living and dining area leading to the screened room" },
  { src: "/images/screened-living-room-ocean-pool.jpg", span: "md:col-span-2", alt: "Screened living room with ocean and pool views" },

  // ——— Bedrooms ———
  { src: "/images/master-suite-balcony-taylor-bay.jpg", span: "md:col-span-2", alt: "Master suite balcony overlooking Taylor Bay" },
  { src: "/images/secondary-suite-balcony-ocean.jpg", span: "", alt: "Secondary suite balcony with ocean view" },
  { src: "/images/downstairs-suite-hammock.jpg", span: "", alt: "Downstairs suite opening to hammock area" },
  { src: "/images/lower-suite-bedroom-hammock-pool.jpg", span: "md:col-span-2", alt: "Lower suite bedroom with hammock and pool view" },

  // ——— Bathrooms ———
  { src: "/images/secondary-suite-bathroom.jpg", span: "md:col-span-2", alt: "Secondary suite bathroom" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Gallery
          </p>
          <h2
            className="font-display text-3xl md:text-5xl font-light"
            style={{ color: "#2C2C2C" }}
          >
            Villa La Percha
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 md:gap-4" style={{ minHeight: "500px" }}>
          {photos.map((photo, i) => {
            const isLarge = photo.span.includes("md:col-span-2") || photo.span.includes("md:row-span-2");
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-lg group ${isLarge ? "md:col-span-2 md:row-span-2" : ""}`}
                style={{
                  aspectRatio: isLarge ? "1/1" : "4/3",
                  height: "100%",
                  minHeight: isLarge ? "400px" : "180px",
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={isLarge ? "100vw" : "50vw"}
                  priority={i < 2}
                  quality={85}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
