"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Experience", href: "/experience-the-island", isRoute: true },
  { label: "Availability", href: "#availability" },
];

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-[#1a1a1a]">
      <div className="relative w-full" style={{ height: "50vh" }}>
        <Image
          src="/images/aerial-house-ocean-neighbors.jpg"
          alt="Villa La Percha"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 md:px-10 md:py-6 lg:px-16">
        <span className="text-white font-display text-base md:text-lg tracking-[0.15em] uppercase">
          Villa La Percha
        </span>

        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) =>
            item.isRoute ? (
              <Link key={item.label} href={item.href} className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="text-white/80 text-sm tracking-wider uppercase hover:text-white transition-colors">
                {item.label}
              </a>
            )
          )}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/30 lg:hidden"
        >
          <span className="relative block h-4 w-5">
            <span className={`absolute left-0 top-0 h-[1.5px] w-5 bg-white transition ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[7px] h-[1.5px] w-5 bg-white transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-[14px] h-[1.5px] w-5 bg-white transition ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>
      </nav>

      {menuOpen ? (
        <div className="absolute top-[72px] right-4 z-30 w-[min(280px,calc(100%-2rem))] rounded-3xl border border-white/15 bg-black/55 p-4 text-white shadow-2xl backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.18em] text-white/90 transition hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.18em] text-white/90 transition hover:bg-white/10"
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      ) : null}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 px-6 pt-14 md:pt-0">
        <p className="text-xs md:text-sm tracking-[0.35em] uppercase mb-4 md:mb-6 text-white/80">
          Chalk Sound · Providenciales
        </p>
        <h1
          className="font-display text-3xl md:text-6xl lg:text-7xl font-light tracking-wide mb-5 md:mb-8 leading-tight"
          style={{ maxWidth: "90vw" }}
        >
          A Private Villa in Chalk Sound
        </h1>
        <p className="max-w-xl text-sm md:text-lg text-white/82 leading-relaxed mb-8 md:mb-10">
          Waterfront, private, and made for an easy Turks and Caicos stay.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <a
            href="#availability"
            className="inline-block px-8 md:px-10 py-3 md:py-4 bg-[#8B7355] border border-[#8B7355] text-white text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-[#9B8262] hover:border-[#9B8262] transition-all duration-500"
          >
            Check Availability
          </a>
          <a
            href="#contact"
            className="inline-block px-8 md:px-10 py-3 md:py-4 border border-white/50 text-white text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-slate-900 transition-all duration-500"
          >
            Ask a Question
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <a href="#about" className="block text-white/60 hover:text-white transition-colors">
          <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
            <rect x="1" y="1" width="16" height="26" rx="8" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="9" cy="9" r="2" fill="currentColor" className="animate-pulse" />
          </svg>
        </a>
      </div>
    </section>
  );
}
