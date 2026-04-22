const photos = [
  { src: "/images/exterior-sunset-golden-hour.jpg", span: "md:col-span-2 md:row-span-2" },
  { src: "/images/pool-aerial-overview.jpg", span: "" },
  { src: "/images/ocean-sunset-distant-view.jpg", span: "" },
  { src: "/images/interior-open-plan-living.jpg", span: "" },
  { src: "/images/pool-hammock-lounge.jpg", span: "md:col-span-2" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4">Gallery</p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#2C2C2C]">
            Villa La Percha
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[300px]">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`relative overflow-hidden ${photo.span} group`}
            >
              <img
                src={photo.src}
                alt="Villa La Percha"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
