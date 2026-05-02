import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You | DirectStay",
  description: "Thanks for contacting DirectStay.",
};

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] px-6 py-20 text-[#1f1f1b] md:px-10">
      <section className="mx-auto max-w-3xl rounded-[36px] bg-white p-8 text-center shadow-[0_18px_55px_rgba(31,31,27,0.08)] md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">Request received</p>
        <h1 className="mt-4 font-display text-5xl leading-tight">Thanks — we’ll review the fit.</h1>
        <p className="mt-5 text-lg leading-8 text-[#5b554b]">
          Your DirectStay request has been logged. We’ll look at the property, current booking path, direct-booking opportunity, and any domain or launch-timeline notes you shared.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#1e4536] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#18372b]">Back to DirectStay</Link>
      </section>
    </main>
  );
}
