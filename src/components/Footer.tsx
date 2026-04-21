export default function Footer() {
  return (
    <footer className="py-12 bg-[#2C2C2C] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-body text-white/30 text-xs tracking-wider">
          © {new Date().getFullYear()} Villa La Percha · Providenciales, Turks &amp; Caicos
        </p>
        <div className="flex gap-8">
          <a href="#about" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">About</a>
          <a href="#gallery" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">Gallery</a>
          <a href="#contact" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">Contact</a>
        </div>
      </div>
    </footer>
  );
}
