import { notFound } from "next/navigation";
import { getPrismaClient } from "@/lib/db";

export const metadata = { robots: { index: false, follow: false } };

type OwnerCallout = { label?: string; body?: string };
type PreviewSection = {
  kind?: string;
  eyebrow?: string;
  title?: string;
  heading?: string;
  body?: string;
  items?: Array<string | { label?: string; title?: string; body?: string }>;
  imageUrl?: string;
  imageAlt?: string;
  kicker?: string;
  heroOnly?: boolean;
};

function asCallouts(value: unknown): OwnerCallout[] {
  return Array.isArray(value) ? value as OwnerCallout[] : [];
}

function asSections(value: unknown): PreviewSection[] {
  if (!Array.isArray(value)) return [];
  return value.filter((section): section is PreviewSection => Boolean(section && typeof section === "object"));
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function sectionTitle(section: PreviewSection) {
  return text(section.title, text(section.heading, "Preview section"));
}

function sectionTone(kind?: string) {
  if (kind === "signatureMoments" || kind === "imageStory") return { background: "#17211a", color: "#f7f3eb", border: "1px solid rgba(247, 243, 235, .18)" };
  if (kind === "missingInputs" || kind === "ownerCallout" || kind === "calendarMock" || kind === "priceComparison") return { background: "#fffaf0", color: "#17211a", border: "1px solid #d8c7a3" };
  if (kind === "areaGuide") return { background: "#ffffff", color: "#17211a", border: "1px solid #d8c7a3" };
  return { background: "#ffffff", color: "#17211a", border: "1px solid #e7decf" };
}

function RenderItems({ items }: { items?: PreviewSection["items"] }) {
  if (!Array.isArray(items) || !items.length) return null;
  return <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
    {items.map((item, index) => {
      if (typeof item === "string") return <p key={index} style={{ margin: 0 }}>• {item}</p>;
      return <article key={index} style={{ padding: 14, borderRadius: 16, background: "rgba(123, 109, 88, .09)" }}>
        <strong>{text(item.label, text(item.title, `Detail ${index + 1}`))}</strong>
        {item.body ? <p style={{ margin: "6px 0 0" }}>{item.body}</p> : null}
      </article>;
    })}
  </div>;
}

function PreviewContentSection({ section, index }: { section: PreviewSection; index: number }) {
  const tone = sectionTone(section.kind);
  const imageFirst = index % 2 === 1;
  const isCalendar = section.kind === "calendarMock";
  const isPrice = section.kind === "priceComparison";
  return <section data-preview-section={section.kind || "custom"} style={{ padding: "42px 24px" }}>
    <article style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 24, gridTemplateColumns: section.imageUrl ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr", alignItems: "stretch", padding: 28, borderRadius: 32, boxShadow: "0 24px 80px rgba(23, 33, 26, .08)", ...tone }}>
      {section.imageUrl && imageFirst ? <div role="img" aria-label={section.imageAlt || sectionTitle(section)} style={{ minHeight: 420, borderRadius: 26, backgroundImage: `url(${section.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", order: -1 }} /> : null}
      <div style={{ alignSelf: "center" }}>
        <p style={{ letterSpacing: 2.4, textTransform: "uppercase", color: tone.color === "#f7f3eb" ? "#d8c7a3" : "#7b6d58", margin: 0 }}>{text(section.eyebrow, text(section.kind, `Preview ${index + 1}`)).replace(/([A-Z])/g, " $1")}</p>
        <h2 style={{ fontSize: "clamp(30px, 4.6vw, 58px)", lineHeight: .98, margin: "12px 0" }}>{sectionTitle(section)}</h2>
        {section.body ? <p style={{ fontSize: 18, lineHeight: 1.65, margin: 0 }}>{section.body}</p> : null}
        {isCalendar ? <CalendarMock /> : null}
        {isPrice ? <PriceComparisonMock /> : null}
        <RenderItems items={section.items} />
      </div>
      {section.imageUrl && !imageFirst ? <div role="img" aria-label={section.imageAlt || sectionTitle(section)} style={{ minHeight: 420, borderRadius: 26, backgroundImage: `url(${section.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} /> : null}
    </article>
  </section>;
}

function CalendarMock() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells = Array.from({ length: 35 }, (_, index) => index + 1);
  return <div data-preview-calendar-mock="true" style={{ marginTop: 24, padding: 18, borderRadius: 24, background: "#fff", border: "1px solid #e7decf" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}><strong>Sample availability view</strong><span style={{ color: "#7b6d58" }}>Read-only mock</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6, marginTop: 16 }}>{days.map((day) => <span key={day} style={{ fontSize: 12, color: "#7b6d58", textAlign: "center" }}>{day}</span>)}{cells.map((day) => <span key={day} style={{ minHeight: 42, borderRadius: 12, display: "grid", placeItems: "center", background: day >= 10 && day <= 16 ? "#d8c7a3" : day === 22 || day === 23 ? "#eee6d8" : "#f7f3eb", color: "#17211a", border: day >= 10 && day <= 16 ? "1px solid #9b7a3a" : "1px solid #efe5d4" }}>{day}</span>)}</div>
    <p style={{ margin: "14px 0 0", color: "#7b6d58", lineHeight: 1.5 }}>In a live site, this block would connect approved availability, minimum-stay rules, and inquiry context so guests can choose dates before asking questions.</p>
  </div>;
}

function PriceComparisonMock() {
  return <div data-preview-price-comparison-mock="true" style={{ marginTop: 24, display: "grid", gap: 12 }}>
    {[{ label: "Direct estimate", value: "$2,950", note: "Owner-approved direct rate would appear here" }, { label: "Marketplace-style estimate", value: "$3,410", note: "Mock fees/taxes comparison for owner review" }, { label: "Potential guest savings", value: "$460", note: "Illustrative only until rates and fee assumptions are approved" }].map((row) => <article key={row.label} style={{ padding: 16, borderRadius: 18, background: "#fff", border: "1px solid #e7decf", display: "grid", gap: 4 }}><span style={{ color: "#7b6d58" }}>{row.label}</span><strong style={{ fontSize: 28 }}>{row.value}</strong><small>{row.note}</small></article>)}
  </div>;
}

function FallbackSections() {
  return <section data-preview-placeholder="true" style={{ background: "#17211a", color: "#f7f3eb", padding: "56px 24px" }}>
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <p style={{ letterSpacing: 2.4, textTransform: "uppercase", color: "#d8c7a3" }}>Placeholder preview record</p>
      <h2 style={{ fontSize: "clamp(30px, 5vw, 56px)", marginTop: 0 }}>Section plan not loaded yet</h2>
      <p style={{ maxWidth: 760, fontSize: 18, lineHeight: 1.65 }}>This route is only a safe, non-functional shell until the required Preview Build packet includes property-specific sections, design brief, fact register, and assumptions. It should not be treated as an owner-ready Preview Build.</p>
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 28 }}>
        <article><h3>Why stay here</h3><p>Pending owner/property evidence.</p></article>
        <article><h3>Location guide</h3><p>Pending micro-geography audit.</p></article>
        <article><h3>Direct inquiry</h3><p>Disabled until launch readiness is approved.</p></article>
      </div>
    </div>
  </section>;
}

export default async function PreviewBuildPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ view?: string }> }) {
  const { slug } = await params;
  const { view } = await searchParams;
  const prisma = await getPrismaClient();
  const preview = await prisma.previewBuild.findUnique({
    where: { slug },
    include: { platformLead: { include: { artifacts: { where: { type: { in: ["PREVIEW_ASSUMPTION_REGISTER", "PREVIEW_SHARE_NOTE"] }, status: { notIn: ["REJECTED", "SUPERSEDED"] } }, orderBy: { createdAt: "desc" }, take: 4 } } } },
  });
  if (!preview) notFound();
  const showOwnerNotes = view !== "guest";
  const callouts = asCallouts(preview.ownerCallouts);
  const sections = asSections(preview.sections);
  const heroSection = sections.find((section) => section.heroOnly || section.kind === "heroImage");
  const visibleSections = sections.filter((section) => !(section.heroOnly || section.kind === "heroImage"));
  const heroImage = heroSection?.imageUrl || visibleSections.find((section) => section.imageUrl)?.imageUrl;
  const assumptionArtifacts = preview.platformLead.artifacts.filter((artifact) => artifact.type === "PREVIEW_ASSUMPTION_REGISTER");
  const shareNote = preview.platformLead.artifacts.find((artifact) => artifact.type === "PREVIEW_SHARE_NOTE");

  return (
    <main style={{ fontFamily: "Inter, ui-sans-serif, system-ui", color: "#17211a", background: "#f7f3eb", minHeight: "100vh" }}>
      <section style={{ padding: "28px 24px 56px", maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "stretch", minHeight: 620 }}>
          <div style={{ padding: "44px 0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ letterSpacing: 3, textTransform: "uppercase", color: "#7b6d58", margin: 0 }}>{view === "guest" ? "Direct booking preview" : "Owner review preview"}</p>
            <h1 style={{ fontSize: "clamp(38px, 5.8vw, 72px)", lineHeight: .94, margin: "16px 0" }}>{preview.heroTitle || preview.propertyName}</h1>
            <p style={{ fontSize: 22, lineHeight: 1.45, maxWidth: 720 }}>{preview.positioning || `A direct-booking preview concept for ${preview.propertyName} in ${preview.location}.`}</p>
            <p style={{ marginTop: 18, color: "#7b6d58", fontSize: 18 }}>{preview.location}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
              <span style={{ padding: "10px 14px", borderRadius: 999, background: "#fff", border: "1px solid #e7decf" }}>Direct booking concept</span>
              <span style={{ padding: "10px 14px", borderRadius: 999, background: "#fff", border: "1px solid #e7decf" }}>Non-functional preview</span>
              <span style={{ padding: "10px 14px", borderRadius: 999, background: "#fff", border: "1px solid #e7decf" }}>Owner-review draft</span>
            </div>
            {showOwnerNotes && callouts[0] ? <aside data-preview-owner-callout="true" style={{ marginTop: 32, padding: 18, border: "1px solid #d8c7a3", borderRadius: 18, background: "#fffaf0" }}><strong>Owner note: {callouts[0].label}</strong><p>{callouts[0].body}</p></aside> : null}
          </div>
          <div role="img" aria-label={`${preview.propertyName} preview image`} style={{ minHeight: 560, borderRadius: 36, background: heroImage ? `linear-gradient(180deg, rgba(23,33,26,.08), rgba(23,33,26,.18)), url(${heroImage})` : "linear-gradient(135deg, #d8c7a3, #7b6d58)", backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 30px 90px rgba(23, 33, 26, .18)" }} />
        </div>
      </section>

      {visibleSections.length ? visibleSections.map((section, index) => <PreviewContentSection key={`${section.kind || "section"}-${index}`} section={section} index={index} />) : <FallbackSections />}

      <section style={{ padding: "56px 24px", maxWidth: 960, margin: "0 auto" }}>
        <h2>{view === "guest" ? "Sample inquiry experience" : "Preview inquiry"}</h2>
        {view === "guest" ? <p style={{ color: "#7b6d58", lineHeight: 1.6 }}>This is a read-only mock of the future direct inquiry path. Nothing can be submitted from this preview. Calendar and savings modules above show the type of decision support a direct site can add before the form.</p> : null}
        <div data-preview-inquiry-disabled="true" style={{ display: "grid", gap: 12, opacity: .62 }}>
          <input disabled placeholder="Guest name" style={{ padding: 14, borderRadius: 12, border: "1px solid #d7d0c3" }} />
          <input disabled placeholder="Email" style={{ padding: 14, borderRadius: 12, border: "1px solid #d7d0c3" }} />
          <textarea disabled placeholder="Trip details" rows={4} style={{ padding: 14, borderRadius: 12, border: "1px solid #d7d0c3" }} />
          <button disabled style={{ padding: 14, borderRadius: 999, border: 0, background: "#9b7a3a", color: "white" }}>Inquiry disabled in preview</button>
        </div>
        {showOwnerNotes && callouts.slice(1).map((callout, index) => <aside data-preview-owner-callout="true" key={index} style={{ marginTop: 18, padding: 16, border: "1px solid #d8c7a3", borderRadius: 18, background: "#fffaf0" }}><strong>Owner note: {callout.label}</strong><p>{callout.body}</p></aside>)}
        {showOwnerNotes && assumptionArtifacts.map((artifact) => <aside data-preview-owner-callout="true" key={artifact.id} style={{ marginTop: 18, padding: 16, border: "1px solid #d8c7a3", borderRadius: 18, background: "#fffaf0" }}><strong>{artifact.title}</strong><p style={{ whiteSpace: "pre-wrap" }}>{artifact.body}</p></aside>)}
        {showOwnerNotes && shareNote ? <aside data-preview-owner-callout="true" style={{ marginTop: 18, padding: 16, border: "1px solid #d8c7a3", borderRadius: 18, background: "#fffaf0" }}><strong>{shareNote.title}</strong><p style={{ whiteSpace: "pre-wrap" }}>{shareNote.body}</p></aside> : null}
        {showOwnerNotes ? <p style={{ marginTop: 32, color: "#7b6d58" }}>Public-obscure, noindex Preview Build. Guest-clean view: add <code>?view=guest</code>.</p> : null}
      </section>
    </main>
  );
}
