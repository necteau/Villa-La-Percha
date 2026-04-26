"use client";

import { useState, useEffect } from "react";

interface Props {
  checkIn: string | null;
  checkOut: string | null;
  embedded?: boolean;
}

export default function ContactForm({ checkIn, checkOut, embedded = false }: Props) {
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

  const wrapperClass = embedded
    ? "rounded-3xl border border-[#E8E4DF] bg-white p-6 md:p-8"
    : "py-12 md:py-20 bg-[#2C2C2C] text-white";

  const bodyClass = embedded ? "max-w-xl mx-auto" : "max-w-2xl mx-auto px-6 md:px-8 text-center";

  return (
    <section id="contact" className={wrapperClass}>
      <div className={bodyClass}>
        <p className={`text-xs tracking-[0.3em] uppercase mb-4 md:mb-6 ${embedded ? "text-[#8B7355] text-left" : "text-[#A89279]"}`}>
          Inquiry
        </p>
        <h2
          className={`font-display text-3xl md:text-5xl font-light mb-4 md:mb-6 leading-tight ${embedded ? "text-[#2C2C2C] text-left md:text-4xl" : "text-white"}`}
        >
          Ask About Your Dates
        </h2>
        {!embedded && <div className="section-divider mb-6 md:mb-8 mx-auto" />}
        <p className={`leading-relaxed mb-6 md:mb-8 max-w-lg text-sm md:text-base ${embedded ? "text-[#6B6B6B] text-left" : "font-body text-white/60 mx-auto"}`}>
          Choose your dates, send your inquiry, and we&apos;ll get back to you within 24 hours.
        </p>

        {submitted ? (
          <div className={`${embedded ? "bg-[#EEF6F0] border-[#CBE4D4]" : "bg-green-900/30 border-green-700"} border rounded-lg p-8`}>
            <p className="text-lg font-medium mb-2" style={{ color: embedded ? "#1E5E3E" : "#A8E6CF" }}>Inquiry Sent!</p>
            <p className={`${embedded ? "text-[#4A6A57]" : "text-white/60"} text-sm`}>
              Thank you, {fullName}. We&apos;ll review your requested dates and get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`max-w-lg mx-auto text-left ${embedded ? "" : ""}`} noValidate>
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

            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-5">
              <div>
                <label className={`block text-xs tracking-wider uppercase mb-1 ${embedded ? "text-[#7B7468]" : "text-white/40"}`}>Check-in</label>
                <input
                  type="date"
                  value={checkIn || ""}
                  readOnly
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm ${embedded ? "bg-[#FAFAF8] border-[#E8E4DF] text-[#2C2C2C]" : "bg-white/5 border-white/10 text-white"}`}
                  aria-describedby="contact-dates-help"
                />
              </div>
              <div>
                <label className={`block text-xs tracking-wider uppercase mb-1 ${embedded ? "text-[#7B7468]" : "text-white/40"}`}>Check-out</label>
                <input
                  type="date"
                  value={checkOut || ""}
                  readOnly
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm ${embedded ? "bg-[#FAFAF8] border-[#E8E4DF] text-[#2C2C2C]" : "bg-white/5 border-white/10 text-white"}`}
                  aria-describedby="contact-dates-help"
                />
              </div>
            </div>
            <p id="contact-dates-help" className={`text-xs mb-4 -mt-1 ${embedded ? "text-[#7B7468]" : "text-white/45"}`}>
              Pick your dates in the calendar and they&apos;ll appear here automatically.
            </p>

            <div className="mb-4">
              <label htmlFor="contact-name" className={`block text-xs tracking-wider uppercase mb-1 ${embedded ? "text-[#7B7468]" : "text-white/40"}`}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${embedded ? "bg-white border-[#D8D1C5] text-[#2C2C2C] focus:border-[#8B7355]" : "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-[#A89279]"}`}
                placeholder="Your full name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="contact-email" className={`block text-xs tracking-wider uppercase mb-1 ${embedded ? "text-[#7B7468]" : "text-white/40"}`}>
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${embedded ? "bg-white border-[#D8D1C5] text-[#2C2C2C] focus:border-[#8B7355]" : "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-[#A89279]"}`}
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-5 md:mb-6">
              <label htmlFor="contact-comments" className={`block text-xs tracking-wider uppercase mb-1 ${embedded ? "text-[#7B7468]" : "text-white/40"}`}>
                Comments
              </label>
              <textarea
                id="contact-comments"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none ${embedded ? "bg-white border-[#D8D1C5] text-[#2C2C2C] focus:border-[#8B7355]" : "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-[#A89279]"}`}
                placeholder="Questions, group details, or anything helpful for your stay"
              />
            </div>

            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 border"
              style={{
                backgroundColor: canSubmit ? "#8B7355" : "transparent",
                color: canSubmit ? "#FFFFFF" : embedded ? "#A39A8C" : "#FFFFFF30",
                borderColor: canSubmit ? "#8B7355" : embedded ? "#D8D1C5" : "white/30",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.6,
              }}
            >
              {loading ? "Sending..." : "Send Inquiry"}
            </button>

            {!embedded && (
              <p className="font-body text-white/40 text-xs md:text-sm mt-6 md:mt-8">
                <a href="mailto:VillaLaPercha@gmail.com" className="underline underline-offset-4 hover:text-white/60 transition-colors">
                  VillaLaPercha@gmail.com
                </a>
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
