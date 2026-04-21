import Image from "next/image";

const photos = [
  { src: "/images/exterior-sunset-golden-hour.jpg", span: "md:col-span-2 md:row-span-2" },
  { src: "/images/pool-aerial-overview.jpg", span: "" },
  { src: "/images/ocean-sunset-distant-view.jpg", span: "" },
  { src: "/images/interior-open-plan-living.jpg", span: "" },
  { src: "/images/pool-hammock-lounge.jpg", span: "md:col-span-2" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-28 md:py-40 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-[#8B7355] mb-6">Gallery</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[#2C2C2C]">
            Villa La Percha
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[250px]">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`relative overflow-hidden ${photo.span} group`}
            >
              <Image
                src={photo.src}
                alt="Villa La Percha"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
