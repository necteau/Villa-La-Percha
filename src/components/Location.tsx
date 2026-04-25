import Image from "next/image";

export default function Location() {
  return (
    <section id="location" className="py-28 md:py-40 bg-white">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-sm tracking-[0.3em] uppercase text-[#8B7355] mb-6">Location</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[#2C2C2C] mb-8">
            Chalk Sound, Providenciales
          </h2>
          <div className="section-divider mb-8" />
          <p className="font-body text-[#6B6B6B] leading-relaxed mb-8">
            Villa La Percha is set in the Chalk Sound neighborhood between Taylor Bay and Sapodilla Bay,
            giving you easy access to some of the calmest, prettiest water on Providenciales without being
            stuck in the busier hotel zones.
          </p>
          <p className="font-body text-[#6B6B6B] leading-relaxed">
            Taylor Bay is just a one- to two-minute walk from the driveway, Sapodilla Bay is right nearby,
            and restaurants, groceries, and the rest of the island are all easy to reach by car.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-[#E8E4DF] bg-[#F0EDE8] shadow-sm aspect-[4/5] md:aspect-[5/6]">
          <Image
            src="/images/chalk-sound.jpg"
            alt="Aerial view of Chalk Sound"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
