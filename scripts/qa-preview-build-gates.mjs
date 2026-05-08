#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const checks = [];
function check(name, pass, detail = "") {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const pRoute = read("src/app/p/[slug]/page.tsx");
const legacyRoute = read("src/app/preview/[slug]/page.tsx");
const platformLeads = read("src/lib/platformLeads.ts");
const schema = read("prisma/schema.prisma");
const adminDetail = read("src/app/admin/platform-leads/detail/page.tsx");
const adminPreviewRoute = read("src/app/admin/platform-leads/previews/route.ts");
const sitemap = read("src/app/sitemap.ts");

check("Canonical preview route is noindex/nofollow", pRoute.includes("robots: { index: false, follow: false }"));
check("Legacy /preview route is noindex/nofollow", legacyRoute.includes("robots: { index: false, follow: false }"));
check("Legacy /preview route redirects to /p", legacyRoute.includes("redirect(`/p/${slug}"));
check("Preview inquiry controls are explicitly disabled", ["<input disabled", "<textarea disabled", "<button disabled"].every((needle) => pRoute.includes(needle)));
check("Preview page exposes disabled-inquiry QA marker", pRoute.includes("data-preview-inquiry-disabled"));
check("Preview page supports read-only calendar and price comparison mocks", pRoute.includes("data-preview-calendar-mock") && pRoute.includes("data-preview-price-comparison-mock"));
check("Preview page renders sections JSON when present", pRoute.includes("asSections(preview.sections)") && pRoute.includes("data-preview-section"));
check("Placeholder route is explicitly labeled when sections are missing", pRoute.includes("data-preview-placeholder") && pRoute.includes("should not be treated as an owner-ready Preview Build"));
check("Owner artifacts are loaded for internal preview view", pRoute.includes("PREVIEW_ASSUMPTION_REGISTER") && pRoute.includes("PREVIEW_SHARE_NOTE"));
check("Owner callouts are hidden in guest view", pRoute.includes('const showOwnerNotes = view !== "guest"') && pRoute.includes("data-preview-owner-callout"));
check("Preview route has no form action", !/<form\b/i.test(pRoute));
check("Preview route has no payment/booking widget markers", !/(stripe|checkout|paymentintent|book now|reserve now)/i.test(pRoute));
check("Preview routes are not listed in sitemap", !sitemap.includes("/p/") && !sitemap.includes("/preview/"));

const requiredArtifactTypes = [
  "PREVIEW_PHOTO_GEO_AUDIT",
  "PREVIEW_DESIGN_BRIEF",
  "PREVIEW_FACT_REGISTER",
  "PREVIEW_ASSUMPTION_REGISTER",
  "PREVIEW_RUBRIC_REVIEW",
  "PREVIEW_SHARE_NOTE",
  "PREVIEW_CONVERSION_PACKET",
];
for (const type of requiredArtifactTypes) check(`Schema includes ${type}`, schema.includes(type));

check("READY_FOR_REVIEW gate uses packet blockers", platformLeads.includes('status === "READY_FOR_REVIEW" ? report.readyBlockers'));
check("SHARED_WITH_LEAD gate requires rubric/share blockers", platformLeads.includes('status === "SHARED_WITH_LEAD" ? report.sharedBlockers'));
check("PROMOTED_TO_SITE gate requires conversion blockers", platformLeads.includes('status === "PROMOTED_TO_SITE" ? report.promotedBlockers'));
check("Rubric approval is required before owner sharing", platformLeads.includes('approvedTypes.has("PREVIEW_RUBRIC_REVIEW")'));
check("Owner-share note approval is required before sharing", platformLeads.includes('approvedTypes.has("PREVIEW_SHARE_NOTE")'));
check("Conversion packet approval is required before promotion", platformLeads.includes('approvedTypes.has("PREVIEW_CONVERSION_PACKET")'));
check("Blocked preview status updates are audited", adminPreviewRoute.includes("admin.platform_lead.preview_status_blocked"));
check("Admin shows packet gate blockers", adminDetail.includes("Packet gates") && adminDetail.includes("Owner-share blocked") && adminDetail.includes("Production promotion blocked"));
check("Admin includes Preview Build section editor", adminDetail.includes("Sections JSON") && adminDetail.includes("Save preview content") && adminDetail.includes("DEFAULT_PREVIEW_SECTIONS"));
check("Preview content route validates and saves JSON", adminPreviewRoute.includes('action === "content"') && adminPreviewRoute.includes("Sections JSON must be an array") && adminPreviewRoute.includes("preview_content_updated"));
check("Admin can append one structured Preview section", adminDetail.includes("Append section") && adminPreviewRoute.includes('action === "add-section"') && platformLeads.includes("appendPreviewBuildSection"));
check("Admin can manage existing Preview sections", adminDetail.includes("Manage existing sections") && adminPreviewRoute.includes('action === "section"') && platformLeads.includes("movePreviewBuildSection") && platformLeads.includes("deletePreviewBuildSection"));
check("Admin includes guided Preview packet review", adminDetail.includes("Preview Build packet review") && adminDetail.includes("previewArtifactsByType") && adminDetail.includes("PREVIEW_CONVERSION_PACKET"));
check("Admin can generate starter preview packet", adminDetail.includes("Generate starter preview packet") && adminPreviewRoute.includes('action === "generate-packet"') && adminPreviewRoute.includes("preview_packet_generated"));
check("Starter packet generator creates packet artifacts and rendered sections", platformLeads.includes("generatePreviewBuildStarterPacket") && platformLeads.includes("PREVIEW_PHOTO_GEO_AUDIT") && platformLeads.includes("signatureMoments"));
check("Admin warns public-obscure is not confidential", adminDetail.includes("public-obscure, not confidential"));

const failed = checks.filter((item) => !item.pass);
console.log(`\nPreview Build QA: ${checks.length - failed.length}/${checks.length} checks passed.`);
if (failed.length) {
  console.error("\nFailed checks:");
  for (const item of failed) console.error(`- ${item.name}${item.detail ? `: ${item.detail}` : ""}`);
  process.exit(1);
}
