#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(scriptDir, "../src/data/surfsong-villa-preview-fixture.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const sections = fixture.preview?.sections ?? [];
const hero = sections.find((section) => section.kind === "heroImage");
const imageSections = sections.filter((section) => section.imageUrl);
const guestSections = sections.filter((section) => !section.guestHidden);
const guestSectionTextCorpus = JSON.stringify(guestSections).toLowerCase();
const fullPreviewTextCorpus = JSON.stringify(fixture.preview ?? {}).toLowerCase();

assert(fixture.ok === true, "fixture should report ok=true");
assert(fixture.fixtureOnly === true, "fixture must remain marked fixtureOnly");
assert(/internal-only/i.test(fixture.sharePosture ?? ""), "share posture must be internal-only");
assert(/read-only/i.test(fixture.previewPosture ?? ""), "preview posture must be read-only");
assert(hero, "heroImage section is required");
assert(sections.length >= 8, "fixture should include the full preview section set");
assert(imageSections.length === 3, "hero and first two visual sections should use exactly three images");
assert(new Set(imageSections.map((section) => section.imageUrl)).size === imageSections.length, "rendered images should be distinct");
assert((fixture.preview?.ownerCallouts ?? []).length >= 3, "owner-review callouts should preserve fixture cautions");
assert((fixture.guestViewDenylist ?? []).includes("$1,728"), "guest denylist should include the observed public nightly figure");

const guestCopyDenylist = [
  "benchmark",
  "source material",
  "owner-share blocker",
  "photo rights",
  "strategy",
  "internal preview",
  "directstay process",
  "mock data",
  "candidate image",
  "public manager",
  "rent by owner",
  "vrbo",
  "$1,728"
];

for (const phrase of guestCopyDenylist) {
  assert(!guestSectionTextCorpus.includes(phrase), `guest sections must not contain internal/process phrase: ${phrase}`);
}

const blockedClaims = [
  "guaranteed",
  "best rate",
  "private beach",
  "swimmable",
  "lifeguard",
  "secluded",
  "verified",
  "official"
];
for (const phrase of blockedClaims) {
  assert(!fullPreviewTextCorpus.includes(phrase), `preview copy must not contain unsupported claim: ${phrase}`);
}

assert(!/\$\d/.test(fullPreviewTextCorpus), "preview copy must not contain a numeric price claim");
assert(!/\b\d+\s*(minutes?|mins?|mi|miles)\b/i.test(fullPreviewTextCorpus), "preview copy must not contain unsupported distance/time claims");

if (failures.length) {
  console.error("Surfsong fixture QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Surfsong fixture QA passed (${sections.length} sections, ${imageSections.length} distinct rendered images).`);
