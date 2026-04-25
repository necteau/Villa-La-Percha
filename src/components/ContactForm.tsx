"use client";

import { useState, useEffect } from "react";

interface Props {
  checkIn: string | null;
  checkOut: string | null;
}

export default function ContactForm({ checkIn, checkOut }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const datesSelected = checkIn !== null && checkOut !== null;
  const canSubmit = datesSelected && fullName.trim() !== "" && email.trim() !== "";

  useEffect(() => {
    setSubmitted(false);
    setError("");
  }, [checkIn, checkOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          checkIn,
          checkOut,
          comments: comments.trim(),
          website,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("There was an error submitting your inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-[#2C2C2C] text-white">
      <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#A89279] mb-6">
          Contact
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-light mb-8 leading-tight" style={{ color: "#FFFFFF" }}>
          Make This Yours
        </h2>
        <div className="section-divider mb-10 mx-auto" />
        <p className="font-body text-white/60 leading-relaxed mb-10 max-w-lg mx-auto text-sm md:text-base">
          Book directly for pricing that is typically 15–30% lower than the total cost guests often see on Airbnb and VRBO, with no extra taxes or booking fees added here.
        </p>

        {submitted ? (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-8">
            <p className="text-lg font-medium mb-2" style={{ color: "#A8E6CF" }}>Inquiry Sent!</p>
            <p className="text-white/60 text-sm">Thank you, {fullName}. We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto text-left" noValidate>
            <div className="hidden" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* Dates (read-only, auto-filled from calendar) */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs tracking-wider uppercase text-white/40 mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn || ""}
                  readOnly
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-white/40 mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut || ""}
                  readOnly
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <label htmlFor="contact-name" className="block text-xs tracking-wider uppercase text-white/40 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#A89279] transition-colors"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="contact-email" className="block text-xs tracking-wider uppercase text-white/40 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#A89279] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* Comments */}
            <div className="mb-6">
              <label htmlFor="contact-comments" className="block text-xs tracking-wider uppercase text-white/40 mb-1">
                Comments
              </label>
              <textarea
                id="contact-comments"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#A89279] transition-colors resize-none"
                placeholder="Any questions or special requests?"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 border"
              style={{
                backgroundColor: canSubmit ? "#8B7355" : "transparent",
                color: canSubmit ? "#FFFFFF" : "#FFFFFF/30",
                borderColor: canSubmit ? "#8B7355" : "white/30",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.4,
              }}
            >
              {loading ? "Sending..." : "Inquire Now"}
            </button>

            <p className="font-body text-white/40 text-xs md:text-sm mt-8">
              <a href="mailto:VillaLaPercha@gmail.com" className="underline underline-offset-4 hover:text-white/60 transition-colors">
                VillaLaPercha@gmail.com
              </a>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
