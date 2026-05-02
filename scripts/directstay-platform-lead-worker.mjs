#!/usr/bin/env node
/**
 * Mac Studio DirectStay PlatformLead intake worker fallback.
 *
 * Runs one durable-job recovery pass. Schedule with launchd every 60 seconds.
 * This is intentionally a fallback/watchdog: the DirectStay app creates
 * PlatformLeadProcessingJob rows transactionally, and webhook wake is only a
 * best-effort doorbell. If the Mac Studio is not internet-accessible, this
 * worker still catches pending jobs through the database.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(here, "../..");
const helper = path.join(workspace, "tools/directstay/platform-lead-ops.mjs");
const limit = process.env.DIRECTSTAY_PLATFORM_LEAD_WORKER_LIMIT || "5";

const result = spawnSync("/opt/homebrew/bin/node", [helper, "process-pending", `--limit=${limit}`], {
  cwd: path.join(workspace, "villa-la-percha"),
  encoding: "utf8",
});

if (result.stdout.trim()) process.stdout.write(result.stdout);
if (result.stderr.trim()) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
