export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-[#2C2C2C] text-white">
      <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#A89279] mb-6">
          Contact
        </p>
        <h2
          className="font-display text-3xl md:text-5xl font-light mb-8 leading-tight"
          style={{ color: "#FFFFFF" }}
        >
          Make This Yours
        </h2>
        <div className="section-divider mb-10 mx-auto" />
        <p className="font-body text-white/60 leading-relaxed mb-10 max-w-lg mx-auto text-sm md:text-base">
          Book directly with the owner to save 15–20% and receive personalized attention. 
          Send an inquiry and the owner will respond within 24 hours.
        </p>
        <a
          href="mailto:reservations.villalapercha@gmail.com?subject=Villa%20La%20Percha%20Inquiry"
          className="inline-block px-8 md:px-10 py-3.5 md:py-4 border border-white/30 text-white text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
        >
          Inquire Now
        </a>
        <p className="font-body text-white/40 text-xs md:text-sm mt-8">
          <a href="mailto:reservations.villalapercha@gmail.com" className="underline underline-offset-4 hover:text-white/60 transition-colors">
            reservations.villalapercha@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}
