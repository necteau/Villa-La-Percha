#!/usr/bin/env node
/**
 * Local DirectStay wake doorbell for Bishop/OpenClaw.
 *
 * This service is intentionally tiny: it accepts an authenticated POST from the
 * production site through a tunnel, then starts the appropriate local worker in
 * the background and returns immediately. The durable job remains in Supabase;
 * this is only the low-latency doorbell.
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";

const host = process.env.DIRECTSTAY_WAKE_HOST || "127.0.0.1";
const port = Number(process.env.DIRECTSTAY_WAKE_PORT || 18987);
const secret = process.env.DIRECTSTAY_WAKE_SECRET || process.env.DIRECTSTAY_INTERNAL_API_SECRET;
const workspace = process.env.DIRECTSTAY_WORKSPACE || "/Users/agents/.openclaw/workspace";
const villaDir = `${workspace}/villa-la-percha`;
const aiWorker = `${villaDir}/scripts/run-directstay-ai-draft-worker.sh`;
const leadWorker = `${villaDir}/scripts/run-directstay-platform-lead-worker.sh`;

if (!secret) {
  console.error("DIRECTSTAY_WAKE_SECRET or DIRECTSTAY_INTERNAL_API_SECRET is required");
  process.exit(1);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 32_000) {
        req.destroy();
        reject(new Error("request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function send(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function authorized(req) {
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${secret}`;
}

function spawnWorker(kind) {
  const command = kind === "platform_lead_intake" ? leadWorker : aiWorker;
  const child = spawn(command, {
    cwd: villaDir,
    detached: true,
    stdio: "ignore",
    env: { ...process.env, DIRECTSTAY_AI_WORKER_LIMIT: "3" },
  });
  child.unref();
  return { command, pid: child.pid };
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/healthz" || req.url === "/health")) {
    return send(res, 200, { ok: true, service: "directstay-wake-doorbell" });
  }

  if (req.method !== "POST" || req.url !== "/wake") {
    return send(res, 404, { ok: false, error: "not found" });
  }

  if (!authorized(req)) {
    return send(res, 401, { ok: false, error: "unauthorized" });
  }

  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const kind = payload.kind;

    if (kind !== "villa_ai_revision" && kind !== "platform_lead_intake") {
      return send(res, 400, { ok: false, error: "unsupported wake kind" });
    }

    const worker = spawnWorker(kind);
    return send(res, 202, { ok: true, accepted: true, kind, id: payload.id || null, worker });
  } catch (error) {
    return send(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, host, () => {
  console.log(`DirectStay wake doorbell listening on http://${host}:${port}`);
});
