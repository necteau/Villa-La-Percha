export default function Contact() {
  return (
    <section id="contact" className="py-28 md:py-40 bg-[#2C2C2C] text-white">
      <div className="max-w-3xl mx-auto px-8 text-center">
        <p className="text-sm tracking-[0.3em] uppercase text-[#A89279] mb-6">Contact</p>
        <h2 className="font-display text-4xl md:text-5xl font-light mb-8 leading-tight">
          Make This Yours
        </h2>
        <div className="section-divider mb-10" />
        <p className="font-body text-white/60 leading-relaxed mb-12 max-w-lg mx-auto">
          Book directly with the owner to save 15–20% and receive personalized attention. 
          Send an inquiry and the owner will respond within 24 hours.
        </p>
        <a
          href="mailto:reservations.villalapercha@gmail.com"
          className="inline-block px-10 py-4 border border-white/30 text-white text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
        >
          Inquire Now
        </a>
        <p className="font-body text-white/40 text-sm mt-8">
          reservations.villalapercha@gmail.com
        </p>
      </div>
    </section>
  );
}
