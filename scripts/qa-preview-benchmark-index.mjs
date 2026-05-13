#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "src/app/admin/preview-benchmarks/page.tsx");
const statusPath = path.join(root, "docs/platform-leads/preview-build-benchmark-status-2026-05-11.md");

const [page, status] = await Promise.all([
  readFile(pagePath, "utf8"),
  readFile(statusPath, "utf8"),
]);

const requiredBenchmarkNames = [
  "Savannah Broughton Street carriage house",
  "Asheville Shope Creek cabin",
  "French Escape At The Lake",
  "Sarasota River Retreat",
];

const requiredSafetyLessons = [
  "promotional cards",
  "Calendar, price, and area-guide modules",
  "text-only sections",
  "bad-copy scan",
  "owner-share blockers separate",
  "Sarasota can only be rendered as an internal-only",
];

const failures = [];
for (const name of requiredBenchmarkNames) {
  if (!status.includes(name)) failures.push(`Status doc missing benchmark: ${name}`);
  if (!page.includes(name)) failures.push(`Admin benchmark index missing benchmark: ${name}`);
}

for (const phrase of requiredSafetyLessons) {
  if (!page.includes(phrase)) failures.push(`Admin benchmark index missing safety lesson: ${phrase}`);
}

if (!page.includes("admin.read.preview_benchmarks")) failures.push("Admin benchmark index must record read audit events.");
if (!page.includes("Source:") || !page.includes("preview-build-benchmark-status-2026-05-11.md")) failures.push("Admin benchmark index must link back to source status doc.");

if (failures.length) {
  console.error("Preview benchmark index QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Preview benchmark index QA passed: ${requiredBenchmarkNames.length} benchmarks and ${requiredSafetyLessons.length} safety lessons present.`);
