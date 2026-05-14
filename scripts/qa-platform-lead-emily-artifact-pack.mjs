#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const docPath = resolve(process.cwd(), "docs/platform-lead-emily-simulation-artifact-pack.md");
const body = readFileSync(docPath, "utf8");

const requiredSections = [
  "## Admin Timeline Rehearsal Steps",
  "## QA Lead Fixture",
  "## Lead Brief Draft",
  "## First Response Draft",
  "## Mock Emily Discovery Reply",
  "## Reply Summary / Next Move",
  "## Preview Build Rationale Draft",
  "## Proposal Rationale Draft",
  "## Proposal Email Draft",
  "## Agreement / Contract Gate Check",
  "## Onboarding Prep Draft",
  "## Defects / Gaps To Watch During Rehearsal",
  "## Exit Recommendation",
];

const requiredSafetyPhrases = [
  "Draft only — requires Jaimal approval before sending.",
  "Do not email, DM, sign, launch, or convert any record to a real owner/property",
  "clearly non-functional",
  "public-obscure/noindex",
  "Launch remains blocked until contract executed",
  "not ready for external owner use",
];

const requiredTimelineSteps = [
  "Intake received",
  "Lead Brief drafted",
  "First response drafted",
  "Mock owner reply summarized",
  "Preview rationale drafted",
  "Proposal rationale drafted",
  "Agreement gate checked",
  "Onboarding prep drafted",
  "Exit evidence captured",
];

const requiredFixtureFields = [
  "Owner name:",
  "Email:",
  "Phone:",
  "Property name:",
  "Location:",
  "Current channel/source:",
  "Owner note:",
];

function missingFrom(list) {
  return list.filter((needle) => !body.includes(needle));
}

const failures = [
  ...missingFrom(requiredSections).map((item) => `Missing section: ${item}`),
  ...missingFrom(requiredSafetyPhrases).map((item) => `Missing safety phrase: ${item}`),
  ...missingFrom(requiredTimelineSteps).map((item) => `Missing timeline step: ${item}`),
  ...missingFrom(requiredFixtureFields).map((item) => `Missing fixture field: ${item}`),
];

if (failures.length > 0) {
  console.error("Emily PlatformLead artifact pack QA failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Emily PlatformLead artifact pack QA passed.");
console.log(`Checked ${requiredSections.length} sections, ${requiredSafetyPhrases.length} safety phrases, ${requiredTimelineSteps.length} timeline steps, and ${requiredFixtureFields.length} fixture fields.`);
