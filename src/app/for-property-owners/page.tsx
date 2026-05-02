import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Property Owners | DirectStay",
  description: "DirectStay helps vacation-rental owners build direct-booking brands with AI-assisted operations.",
};

const points = [
  "A premium property site that feels like a hospitality brand, not a copied OTA listing.",
  "Owner-controlled guest relationships, inquiry history, and repeat-booking data.",
  "AI-assisted inquiry response, operations visibility, and direct-booking workflow support.",
];

export default function ForPropertyOwnersPage() {
  return (
    <main className="min-h-screen bg-[#10261f] text-white">
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">For vacation-rental owners</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">Build a direct-booking business guests can trust.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78">
            DirectStay is for strong properties that deserve more than marketplace dependency: better presentation, cleaner guest communication, direct relationships, and an operating system behind the scenes.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/request-a-site" className="inline-flex justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#10261f] transition hover:bg-[#f2efe8]">Request a site</Link>
            <Link href="/villa-la-percha" className="inline-flex justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">View example property</Link>
          </div>
        </div>
        <aside className="rounded-[34px] border border-white/12 bg-white/10 p-6 backdrop-blur-md">
          <h2 className="font-display text-3xl">What DirectStay gives owners</h2>
          <ul className="mt-6 grid gap-4">
            {points.map((point) => (
              <li key={point} className="rounded-2xl bg-white/10 p-5 text-sm leading-6 text-white/78">{point}</li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
