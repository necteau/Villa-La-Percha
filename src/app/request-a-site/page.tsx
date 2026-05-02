import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a DirectStay Site | DirectStay",
  description: "Tell DirectStay about the property you want to bring direct.",
};

export default function RequestASitePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] px-6 py-16 text-[#1f1f1b] md:px-10">
      <section className="mx-auto max-w-3xl rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(31,31,27,0.08)] md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">DirectStay owner intake</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">Request a direct-booking site.</h1>
        <p className="mt-5 text-lg leading-8 text-[#5b554b]">
          Share the basics about your main property. We’ll review the fit and follow up if DirectStay can help turn it into a polished owner-controlled booking presence.
        </p>

        <form action="/api/platform-leads" method="post" className="mt-10 grid gap-5">
          <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Name<input required name="fullName" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Email<input required type="email" name="email" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Phone<input required name="phone" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Property name<input required name="propertyName" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="e.g. Villa La Percha" /></label>
            <label className="grid gap-2 text-sm font-semibold">Property location<input required name="propertyLocation" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="e.g. Turks and Caicos" /></label>
          </div>
          <label className="grid gap-2 text-sm font-semibold">Current website or OTA listing<input name="currentWebsite" type="url" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="https://..." /></label>
          <label className="grid gap-2 text-sm font-semibold">Anything else we should know?<textarea name="message" rows={5} className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="A short note about the property, current booking setup, or what prompted you to reach out." /></label>
          <button className="rounded-full bg-[#1e4536] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#18372b]" type="submit">Submit request</button>
        </form>
      </section>
    </main>
  );
}
