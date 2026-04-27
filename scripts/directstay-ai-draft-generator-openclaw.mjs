#!/usr/bin/env node
/**
 * OpenClaw model adapter for the DirectStay Mac Studio draft upgrader.
 * Reads a JSON draft job from stdin and returns JSON:
 *   { "subject": "...", "body": "...", "modelUsed": "..." }
 */
import { spawn } from "node:child_process";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
const model = input.model || process.env.DIRECTSTAY_AI_DEFAULT_MODEL || "openai-codex/gpt-5.5";
const job = input.job || {};
const context = job.context || { inquiry: job.inquiry || {}, threadMessages: job.inquiry?.messages || [] };

function latestInbound(ctx) {
  const messages = [...(ctx.threadMessages || [])].reverse();
  return messages.find((message) => message.direction === "inbound")?.body || ctx.inquiry?.message || "";
}

const prompt = `You are DirectStay's guest-reply drafting assistant for Villa La Percha.

Write a polished owner-review draft reply for the guest inquiry below.
Rules:
- Return JSON only: {"subject":"...","body":"..."}
- Warm, concise, professional hospitality tone.
- Do not invent availability, prices, payment terms, policies, amenities, or guarantees.
- Use only the DirectStay context provided in this prompt.
- Do not use memory, assumptions, prior conversations with Jaimal, other customers, other properties, or unrelated OpenClaw context.
- Use the customer history only if it is present in the provided customer object and relevant to the reply.
- If facts are missing, ask for them instead of guessing.
- Preserve the owner's ability to review before sending.

Current deterministic draft to improve:
Subject: ${job.subject || ""}
Body:
${job.body || ""}

DirectStay scoped context JSON:
${JSON.stringify(context, null, 2)}

Latest guest message:
${latestInbound(context)}
`;

function runOpenClaw() {
  return new Promise((resolve, reject) => {
    const child = spawn("openclaw", ["capability", "model", "run", "--gateway", "--json", "--model", model, "--prompt", prompt], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(stderr || `openclaw exited ${code}`));
      try {
        const result = JSON.parse(stdout);
        const text = result.outputs?.[0]?.text || result.text || "";
        const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
        if (!parsed.body) throw new Error("model returned no body");
        resolve({ subject: parsed.subject || job.subject, body: parsed.body, modelUsed: `${result.provider || "openclaw"}/${result.model || model}` });
      } catch (error) {
        reject(new Error(`Invalid OpenClaw output: ${error instanceof Error ? error.message : String(error)}\n${stdout.slice(0, 1000)}`));
      }
    });
  });
}

const output = await runOpenClaw();
process.stdout.write(JSON.stringify(output));
