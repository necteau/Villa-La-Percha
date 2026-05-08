#!/usr/bin/env npx --yes tsx

if (process.env.RUN_DB_PREVIEW_QA !== "1") {
  console.log("Skipping DB-backed Preview Build gate QA. Set RUN_DB_PREVIEW_QA=1 against a migrated database to run.");
  process.exit(0);
}

const platformLeads = await import("../src/lib/platformLeads.ts");
const db = await import("../src/lib/db.ts");
const prisma = await db.getPrismaClient();

const {
  createPlatformLead,
  createPreviewBuild,
  createPlatformLeadArtifact,
  generatePreviewBuildStarterPacket,
  updatePreviewBuildStatus,
  getPreviewBuildGateReport,
} = platformLeads;

const email = `preview-gate-qa-${Date.now()}@example.invalid`;
const lead = await createPlatformLead({
  fullName: "Preview Gate QA",
  email,
  propertyName: "QA Lake House",
  propertyLocation: "Lake Norman, North Carolina",
  currentWebsite: "https://example.invalid/qa-lake-house",
  source: "qa",
  message: "Temporary QA record for Preview Build status gates.",
});

const cleanup = async () => {
  await prisma.platformLead.delete({ where: { id: lead.id } }).catch(() => undefined);
};

const expectBlocked = async (label: string, fn: () => Promise<unknown>, includes: string) => {
  try {
    await fn();
    throw new Error(`${label} unexpectedly succeeded.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(includes)) throw new Error(`${label} blocked with wrong message: ${message}`);
    console.log(`✅ ${label} blocked — ${includes}`);
  }
};

try {
  const preview = await createPreviewBuild({
    leadId: lead.id,
    propertyName: "QA Lake House",
    location: "Lake Norman, North Carolina",
    sourceUrls: ["https://example.invalid/qa-lake-house"],
    heroTitle: "QA Lake House Preview",
    positioning: "A temporary QA preview for gate tests.",
  });

  await expectBlocked("READY_FOR_REVIEW without packet", () => updatePreviewBuildStatus(preview.id, "READY_FOR_REVIEW"), "Missing preview packet artifact");

  const starter = await generatePreviewBuildStarterPacket({ previewBuildId: preview.id, createdByEmail: "preview-gate-qa@example.invalid" });
  if (starter.artifacts.length !== 5) throw new Error(`Expected 5 starter artifacts, created ${starter.artifacts.length}.`);
  const starterTypes = new Set(starter.artifacts.map((artifact) => artifact.type));
  for (const type of ["PREVIEW_PHOTO_GEO_AUDIT", "PREVIEW_DESIGN_BRIEF", "PREVIEW_FACT_REGISTER", "PREVIEW_ASSUMPTION_REGISTER", "PREVIEW_SHARE_NOTE"] as const) {
    if (!starterTypes.has(type)) throw new Error(`Starter packet missing ${type}.`);
  }
  const starterPreview = await prisma.previewBuild.findUnique({ where: { id: preview.id } });
  if (!starterPreview || !Array.isArray(starterPreview.sections) || starterPreview.sections.length < 5) throw new Error("Starter packet did not populate rendered sections.");
  if (!Array.isArray(starterPreview.ownerCallouts) || starterPreview.ownerCallouts.length < 2) throw new Error("Starter packet did not populate owner callouts.");
  console.log("✅ Starter packet generator created artifacts, sections, and owner callouts");

  for (const artifact of starter.artifacts.filter((artifact) => ["PREVIEW_PHOTO_GEO_AUDIT", "PREVIEW_DESIGN_BRIEF", "PREVIEW_FACT_REGISTER", "PREVIEW_ASSUMPTION_REGISTER"].includes(artifact.type))) {
    await prisma.platformLeadArtifact.update({ where: { id: artifact.id }, data: { status: "APPROVED", approvedAt: new Date(), approvedByEmail: "preview-gate-qa@example.invalid" } });
  }

  await updatePreviewBuildStatus(preview.id, "READY_FOR_REVIEW");
  console.log("✅ READY_FOR_REVIEW allowed after generated packet basics are approved");

  await expectBlocked("SHARED_WITH_LEAD without approval artifacts", () => updatePreviewBuildStatus(preview.id, "SHARED_WITH_LEAD"), "rubric review");

  await createPlatformLeadArtifact({ leadId: lead.id, type: "PREVIEW_RUBRIC_REVIEW", status: "APPROVED", title: "Rubric review", body: "Average score: 4.4\nSafety: pass" });
  await createPlatformLeadArtifact({ leadId: lead.id, type: "PREVIEW_SHARE_NOTE", status: "APPROVED", title: "Owner-share note", body: "Draft/noindex/public-obscure/non-functional/correctable/removable." });

  await updatePreviewBuildStatus(preview.id, "SHARED_WITH_LEAD");
  console.log("✅ SHARED_WITH_LEAD allowed after approved rubric + share note");

  await expectBlocked("PROMOTED_TO_SITE without conversion packet", () => updatePreviewBuildStatus(preview.id, "PROMOTED_TO_SITE"), "conversion packet");
  await createPlatformLeadArtifact({ leadId: lead.id, type: "PREVIEW_CONVERSION_PACKET", status: "APPROVED", title: "Conversion packet", body: "Owner truth reconciled and launch gate ready for QA." });
  await updatePreviewBuildStatus(preview.id, "PROMOTED_TO_SITE");
  console.log("✅ PROMOTED_TO_SITE allowed after approved conversion packet");

  const report = await getPreviewBuildGateReport(preview.id);
  if (report.promotedBlockers.length) throw new Error(`Unexpected promotion blockers: ${report.promotedBlockers.join("; ")}`);
  console.log("\nDB-backed Preview Build status gate QA passed.");
} finally {
  await cleanup();
}
