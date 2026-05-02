import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a DirectStay Site | DirectStay",
  description: "Tell DirectStay about your vacation rental and direct-booking goals.",
};

export default function RequestASitePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] px-6 py-16 text-[#1f1f1b] md:px-10">
      <section className="mx-auto max-w-3xl rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(31,31,27,0.08)] md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">DirectStay owner intake</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">Request a direct-booking site.</h1>
        <p className="mt-5 text-lg leading-8 text-[#5b554b]">
          Share the basics. We’ll review fit, direct-booking potential, domain needs, and the fastest path to a polished owner-controlled booking presence.
        </p>

        <form action="/api/platform-leads" method="post" className="mt-10 grid gap-5">
          <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Name<input required name="fullName" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Email<input required type="email" name="email" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Phone<input name="phone" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Company / brand<input name="company" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Property count<input name="propertyCount" type="number" min="1" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Property location<input required name="propertyLocation" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="e.g. Turks and Caicos" /></label>
          </div>
          <label className="grid gap-2 text-sm font-semibold">Current website or OTA listing<input name="currentWebsite" type="url" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="https://..." /></label>
          <label className="grid gap-2 text-sm font-semibold">Desired custom domain<input name="desiredCustomDomain" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="e.g. yourvilla.com" /></label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">PMS / channel manager<input name="pms" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Launch timeline<input name="launchTimeline" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="ASAP, this quarter, exploring..." /></label>
          </div>
          <label className="grid gap-2 text-sm font-semibold">Primary goal<input required name="goal" className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" placeholder="More direct bookings, lower OTA dependence..." /></label>
          <label className="grid gap-2 text-sm font-semibold">Anything else?<textarea name="message" rows={5} className="rounded-2xl border border-[#ddd2c2] px-4 py-3 font-normal" /></label>
          <button className="rounded-full bg-[#1e4536] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#18372b]" type="submit">Submit request</button>
        </form>
      </section>
    </main>
  );
}
