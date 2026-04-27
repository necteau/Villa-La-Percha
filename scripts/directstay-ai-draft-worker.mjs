#!/usr/bin/env node
/**
 * Mac Studio DirectStay AI draft upgrader.
 *
 * Runs one pass by default. Schedule with launchd every 30-60 seconds.
 * Requires:
 *   DIRECTSTAY_SITE_URL=https://directstay.app
 *   DIRECTSTAY_INTERNAL_API_SECRET=...
 * Optional:
 *   DIRECTSTAY_AI_DEFAULT_MODEL=openai-codex/gpt-5.5
 *   DIRECTSTAY_AI_DRAFT_COMMAND=/path/to/generator
 *
 * The generator command receives a JSON job on stdin and must return JSON:
 *   { "subject": "...", "body": "...", "modelUsed": "..." }
 * If no generator command is configured, the worker records a failed attempt
 * and leaves the website template draft in place.
 */
import { spawn } from "node:child_process";

const siteUrl = (process.env.DIRECTSTAY_SITE_URL || "https://directstay.app").replace(/\/$/, "");
const secret = process.env.DIRECTSTAY_INTERNAL_API_SECRET;
const model = process.env.DIRECTSTAY_AI_DEFAULT_MODEL || "openai-codex/gpt-5.5";
const generatorCommand = process.env.DIRECTSTAY_AI_DRAFT_COMMAND;
const limit = Number(process.env.DIRECTSTAY_AI_WORKER_LIMIT || 5);

if (!secret) {
  console.error("DIRECTSTAY_INTERNAL_API_SECRET is required");
  process.exit(1);
}

function headers() {
  return { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok || data.ok === false) throw new Error(data.error || `${res.status} ${text}`);
  return data;
}

function buildPrompt(job) {
  return {
    model,
    instruction: "Create a polished, concise Villa La Percha guest reply draft. Keep it warm, accurate, direct-booking friendly, and safe. Do not invent availability, pricing, payment terms, or policies beyond supplied context. Return JSON only with subject and body.",
    job,
  };
}

function runGenerator(job) {
  if (!generatorCommand) throw new Error("DIRECTSTAY_AI_DRAFT_COMMAND is not configured");
  return new Promise((resolve, reject) => {
    const child = spawn(generatorCommand, { shell: true, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(stderr || `Generator exited ${code}`));
      try {
        const parsed = JSON.parse(stdout.trim());
        if (!parsed.body) throw new Error("Generator returned no body");
        resolve({ subject: parsed.subject || job.subject, body: parsed.body, modelUsed: parsed.modelUsed || model });
      } catch (error) {
        reject(new Error(`Invalid generator output: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
    child.stdin.end(JSON.stringify(buildPrompt(job), null, 2));
  });
}

async function markAttempt(draftId, error) {
  await fetchJson(`${siteUrl}/api/internal/ai-draft-jobs`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ draftId, error }),
  }).catch((err) => console.error(`Failed to mark attempt for ${draftId}:`, err.message));
}

async function main() {
  const data = await fetchJson(`${siteUrl}/api/internal/ai-draft-jobs?limit=${limit}`, { headers: headers() });
  const jobs = data.jobs || [];
  if (jobs.length === 0) {
    console.log("No pending DirectStay AI draft upgrades.");
    return;
  }

  for (const job of jobs) {
    try {
      await markAttempt(job.draftId);
      const draft = await runGenerator(job);
      const result = await fetchJson(`${siteUrl}/api/internal/ai-draft-jobs/complete`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ draftId: job.draftId, subject: draft.subject, body: draft.body, modelUsed: draft.modelUsed }),
      });
      console.log(`Upgraded draft ${job.draftId}: ${result.skipped ? "skipped" : draft.modelUsed}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markAttempt(job.draftId, message);
      console.error(`Failed draft ${job.draftId}: ${message}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
