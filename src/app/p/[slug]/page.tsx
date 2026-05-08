import { notFound } from "next/navigation";
import { getPrismaClient } from "@/lib/db";

export const metadata = { robots: { index: false, follow: false } };

function asArray(value: unknown): Array<{ label?: string; body?: string }> {
  return Array.isArray(value) ? value as Array<{ label?: string; body?: string }> : [];
}

export default async function PreviewBuildPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ view?: string }> }) {
  const { slug } = await params;
  const { view } = await searchParams;
  const prisma = await getPrismaClient();
  const preview = await prisma.previewBuild.findUnique({ where: { slug } });
  if (!preview) notFound();
  const showOwnerNotes = view !== "guest";
  const callouts = asArray(preview.ownerCallouts);
  return (
    <main style={{ fontFamily: "Inter, ui-sans-serif, system-ui", color: "#17211a", background: "#f7f3eb", minHeight: "100vh" }}>
      <section style={{ padding: "72px 24px", maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ letterSpacing: 3, textTransform: "uppercase", color: "#7b6d58" }}>DirectStay Preview Build</p>
        <h1 style={{ fontSize: "clamp(44px, 8vw, 92px)", lineHeight: .9, margin: "16px 0" }}>{preview.heroTitle || preview.propertyName}</h1>
        <p style={{ fontSize: 22, maxWidth: 760 }}>{preview.positioning || `A direct-booking preview concept for ${preview.propertyName} in ${preview.location}.`}</p>
        <p style={{ marginTop: 24, color: "#7b6d58" }}>{preview.location}</p>
        {showOwnerNotes && callouts[0] ? <aside data-preview-owner-callout="true" style={{ marginTop: 32, padding: 18, border: "1px solid #d8c7a3", borderRadius: 18, background: "#fffaf0" }}><strong>Owner note: {callouts[0].label}</strong><p>{callouts[0].body}</p></aside> : null}
      </section>
      <section style={{ background: "#17211a", color: "#f7f3eb", padding: "56px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <article><h2>Why stay here</h2><p>This section will become the emotionally sharp guest-facing story once the owner brain dump and property materials are collected.</p></article>
          <article><h2>Location guide</h2><p>DirectStay adds local context so guests understand not only the home, but the trip they are choosing.</p></article>
          <article><h2>Direct inquiry</h2><p>This preview shows the future inquiry experience, but submissions are intentionally disabled until launch readiness is approved.</p></article>
        </div>
      </section>
      <section style={{ padding: "56px 24px", maxWidth: 960, margin: "0 auto" }}>
        <h2>Preview inquiry</h2>
        <div data-preview-inquiry-disabled="true" style={{ display: "grid", gap: 12, opacity: .82 }}>
          <input disabled placeholder="Guest name" style={{ padding: 14, borderRadius: 12, border: "1px solid #d7d0c3" }} />
          <input disabled placeholder="Email" style={{ padding: 14, borderRadius: 12, border: "1px solid #d7d0c3" }} />
          <textarea disabled placeholder="Trip details" rows={4} style={{ padding: 14, borderRadius: 12, border: "1px solid #d7d0c3" }} />
          <button disabled style={{ padding: 14, borderRadius: 999, border: 0, background: "#9b7a3a", color: "white" }}>Inquiry disabled in preview</button>
        </div>
        {showOwnerNotes && callouts.slice(1).map((callout, index) => <aside data-preview-owner-callout="true" key={index} style={{ marginTop: 18, padding: 16, border: "1px solid #d8c7a3", borderRadius: 18, background: "#fffaf0" }}><strong>Owner note: {callout.label}</strong><p>{callout.body}</p></aside>)}
        <p style={{ marginTop: 32, color: "#7b6d58" }}>Public-obscure, noindex Preview Build. Guest-clean view: add <code>?view=guest</code>.</p>
      </section>
    </main>
  );
}
