import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-10 md:py-12 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-body text-white/30 text-xs tracking-wider text-center md:text-left">
          © {new Date().getFullYear()} Villa La Percha · Providenciales, Turks &amp; Caicos
        </p>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <a href="#about" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
            About
          </a>
          <a href="#gallery" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
            Gallery
          </a>
          <Link href="/experience-the-island" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
            Experience
          </Link>
          <Link href="/faq" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
            FAQ
          </Link>
          <a href="#contact" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
