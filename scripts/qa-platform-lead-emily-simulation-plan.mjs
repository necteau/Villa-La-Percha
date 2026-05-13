#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const planPath = resolve(process.cwd(), "docs/platform-lead-emily-simulation-plan.md");
const packPath = resolve(process.cwd(), "docs/platform-lead-emily-simulation-artifact-pack.md");

const plan = readFileSync(planPath, "utf8");
const pack = readFileSync(packPath, "utf8");

const requiredPlanSections = [
  "## Boundaries",
  "## Persona",
  "## Rehearsal Script",
  "### 1. Intake",
  "### 2. Lead Brief",
  "### 3. Discovery Reply",
  "### 4. Preview Build Recommendation",
  "### 5. Proposal Draft",
  "### 6. Agreement / Contract Gate",
  "### 7. Onboarding Prep",
  "## Pass/Fail Checklist",
  "## Exit Evidence To Capture",
];

const requiredSafetyPhrases = [
  "without external owner communication",
  "Do not send emails, DMs, proposal terms, contracts, or onboarding invites externally.",
  "Do not create production Owner/Property records from the simulation.",
  "Owner/platform agreement remains legal-review-blocked before owner-facing use.",
  "Public-but-obscure/noindex requirement",
  "No signature provider or owner-facing send is triggered.",
  "Launch readiness remains incomplete until contract",
];

const requiredPlanToPackAnchors = [
  ["Emily QA Owner", "Owner name: Emily QA Owner"],
  ["Property: lake/mountain/beach villa with 3–5 bedrooms", "Property name: Blue Heron Lake Villa"],
  ["Draft first response", "## First Response Draft"],
  ["Have Emily provide a mock reply", "## Mock Emily Discovery Reply"],
  ["Preview Build rationale", "## Preview Build Rationale Draft"],
  ["Proposal Rationale", "## Proposal Rationale Draft"],
  ["Agreement / Contract Gate", "## Agreement / Contract Gate Check"],
  ["Onboarding Prep", "## Onboarding Prep Draft"],
];

function missingFrom(body, list) {
  return list.filter((needle) => !body.includes(needle));
}

const failures = [
  ...missingFrom(plan, requiredPlanSections).map((item) => `Plan missing section: ${item}`),
  ...missingFrom(plan, requiredSafetyPhrases).map((item) => `Plan missing safety phrase: ${item}`),
];

for (const [planNeedle, packNeedle] of requiredPlanToPackAnchors) {
  if (!plan.includes(planNeedle)) failures.push(`Plan missing artifact-pack anchor: ${planNeedle}`);
  if (!pack.includes(packNeedle)) failures.push(`Artifact pack missing matching anchor: ${packNeedle}`);
}

if (failures.length > 0) {
  console.error("Emily PlatformLead simulation plan QA failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Emily PlatformLead simulation plan QA passed.");
console.log(`Checked ${requiredPlanSections.length} sections, ${requiredSafetyPhrases.length} safety phrases, and ${requiredPlanToPackAnchors.length} plan-to-pack anchors.`);
