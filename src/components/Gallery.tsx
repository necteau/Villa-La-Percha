import Image from "next/image";

const photos = [
  { src: "/images/exterior-sunset-golden-hour.jpg", span: "md:col-span-2 md:row-span-2", alt: "Villa La Percha exterior" },
  { src: "/images/pool-aerial-overview.jpg", span: "", alt: "Pool aerial view" },
  { src: "/images/ocean-sunset-distant-view.jpg", span: "", alt: "Ocean sunset" },
  { src: "/images/interior-open-plan-living.jpg", span: "", alt: "Living area" },
  { src: "/images/pool-hammock-lounge.jpg", span: "md:col-span-2", alt: "Pool hammock" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 md:py-32" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#8B7355' }}>Gallery</p>
          <h2 className="font-display text-3xl md:text-5xl font-light" style={{ color: '#2C2C2C' }}>
            Villa La Percha
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 md:gap-4" style={{ height: 'auto' }}>
          {photos.map((photo, i) => {
            const isLarge = photo.span.includes('md:col-span-2') || photo.span.includes('md:row-span-2');
            return (
              <div
                key={i}
                className={`relative overflow-hidden ${isLarge ? 'md:col-span-2 md:row-span-2' : ''} group`}
                style={{ aspectRatio: isLarge ? '1/1' : '4/3' }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={isLarge ? "(max-width: 768px) 100vw, 100vw" : "(max-width: 768px) 100vw, 33vw"}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
