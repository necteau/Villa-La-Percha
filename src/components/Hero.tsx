import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[75vh] md:h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/cover-page-hero.jpg"
          alt="Villa La Percha"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-black/30" />

      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-16 py-5 md:py-6">
        <span className="text-white font-display text-base md:text-lg tracking-[0.15em] uppercase">Villa La Percha</span>
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">About</a>
          <a href="#amenities" className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">Amenities</a>
          <a href="#gallery" className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">Gallery</a>
          <a href="#availability" className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">Availability</a>
        </div>
      </nav>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 px-6">
        <p className="text-xs md:text-sm tracking-[0.35em] uppercase mb-4 md:mb-6 text-white/80">
          Chalk Sound · Providenciales
        </p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light tracking-wide mb-6 md:mb-8 leading-tight">
          Villa La Percha
        </h1>
        <a
          href="#contact"
          className="inline-block px-8 md:px-10 py-3 md:py-4 border border-white/50 text-white text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-slate-900 transition-all duration-500"
        >
          Inquire
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <a href="#about" className="block text-white/60 hover:text-white transition-colors">
          <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
            <rect x="1" y="1" width="16" height="26" rx="8" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="9" cy="9" r="2" fill="currentColor" className="animate-pulse"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
