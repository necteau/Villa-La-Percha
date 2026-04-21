import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src="/images/cover-page-hero.jpg"
        alt="Villa La Percha — Providenciales"
        fill
        className="object-cover"
        priority
        quality={95}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Minimal nav */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 md:px-16 py-6">
        <span className="text-white/90 font-display text-lg tracking-[0.15em] uppercase">Villa La Percha</span>
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">About</a>
          <a href="#amenities" className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">Amenities</a>
          <a href="#gallery" className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">Gallery</a>
          <a href="#location" className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">Location</a>
        </div>
      </nav>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 px-6">
        <p className="text-sm md:text-base tracking-[0.35em] uppercase mb-6 text-white/80">
          Chalk Sound · Providenciales
        </p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light tracking-wide mb-8">
          Villa La Percha
        </h1>
        <a
          href="#contact"
          className="inline-block px-10 py-4 border border-white/50 text-white text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-slate-900 transition-all duration-500"
        >
          Inquire
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <a href="#about" className="block text-white/60 hover:text-white transition-colors">
          <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
            <rect x="1" y="1" width="18" height="30" rx="9" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="10" cy="10" r="2.5" fill="currentColor" className="animate-pulse"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
