import Image from "next/image";

const photos = [
  { src: "/images/aerial-pool-house-chalk-sound.jpg", span: "md:col-span-2 md:row-span-2", alt: "Direct aerial of pool house and Chalk Sound" },
  { src: "/images/kitchen.jpg", span: "", alt: "Kitchen" },
  { src: "/images/hot-tub-pool-ocean-sapodilla-bay.jpg", span: "", alt: "Angled view of hot tub, pool, lounge chairs, ocean, and Sapodillo Bay" },
  { src: "/images/pool-lounge-ocean.jpg", span: "", alt: "View of pool, lounge chairs, and ocean" },
  { src: "/images/downstairs-suite-hammock.jpg", span: "md:col-span-2", alt: "Downstairs suite opening to hammock area" },
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
