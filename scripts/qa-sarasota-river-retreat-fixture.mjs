#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fixtureScript = join(scriptDir, "create-sarasota-river-retreat-preview-fixture.mjs");

const raw = execFileSync(process.execPath, [fixtureScript, "--json"], { encoding: "utf8" });

const fixture = JSON.parse(raw);
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const sections = fixture.preview?.sections ?? [];
const hero = sections.find((section) => section.kind === "heroTextOnly");
const imageStories = sections.filter((section) => section.imageUrl);
const livingRoomImage = "uploads/Home_Page/Sarasota_Main-6089374.jpg?format=webp";
const textCorpus = JSON.stringify(fixture.preview ?? {}).toLowerCase();

assert(fixture.ok === true, "fixture should report ok=true");
assert(fixture.fixtureOnly === true, "fixture must remain marked fixtureOnly");
assert(/internal-only/i.test(fixture.sharePosture ?? ""), "share posture must be internal-only");
assert(/read-only/i.test(fixture.previewPosture ?? ""), "preview posture must be read-only");
assert(hero, "heroTextOnly section is required");
assert(hero?.imageUrl === null, "hero must not use an image");
assert(sections.length >= 8, "fixture should include the full preview section set");
assert(imageStories.length === 1, "only one preview section may use an image");
assert(imageStories[0]?.imageUrl === livingRoomImage, "the only rendered image must be the approved living-room asset");
assert((fixture.allowedImages ?? []).length === 1, "allowed image inventory should stay intentionally narrow");
assert((fixture.rejectedForHeroOrPropertyStory ?? []).length >= 10, "rejected image inventory should preserve source-integrity guardrails");
assert((fixture.preview?.ownerCallouts ?? []).length >= 3, "owner-review callouts should preserve fixture cautions");
assert((fixture.guestViewDenylist ?? []).includes("benchmark"), "guest denylist should include benchmark/process language");

const blockedPhrases = [
  "guaranteed wildlife",
  "exact savings",
  "exact drive time",
  "swimming permission",
  "boating permission",
  "named restaurant recommendation"
];
for (const phrase of blockedPhrases) {
  assert(!textCorpus.includes(phrase), `guest-facing preview copy must not contain blocked phrase: ${phrase}`);
}

const bannedNumericClaims = [/\$\d/, /\b\d+\s*(minutes?|mins?|mi|miles)\b/i];
for (const pattern of bannedNumericClaims) {
  assert(!pattern.test(JSON.stringify(fixture.preview ?? {})), `preview copy must not contain unsupported numeric claim matching ${pattern}`);
}

if (failures.length) {
  console.error("Sarasota fixture QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Sarasota fixture QA passed (${sections.length} sections, ${fixture.rejectedForHeroOrPropertyStory.length} rejected assets).`);
