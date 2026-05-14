#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = path.resolve(repoRoot, '..');
const pullScript = path.join(workspaceRoot, 'tools/browser-operator/trackhs-owner-availability-pull.mjs');
const secretCtl = path.join(workspaceRoot, 'tools/secrets/secretctl.py');

function secret(field) {
  const code = `import sys; sys.path.insert(0, ${JSON.stringify(path.dirname(secretCtl))}); import secretctl; print(secretctl.run_op(['item','get','TrackHS','--vault',secretctl.VAULT,'--fields',${JSON.stringify(field)},'--reveal']).stdout.strip())`;
  const proc = spawnSync('python3', ['-c', code], { cwd: workspaceRoot, encoding: 'utf8' });
  if (proc.status !== 0 || !proc.stdout.trim()) throw new Error(`Unable to read TrackHS ${field} from 1Password`);
  return proc.stdout.trim();
}

const env = {
  ...process.env,
  TRACKHS_USERNAME: process.env.TRACKHS_USERNAME || secret('username'),
  TRACKHS_PASSWORD: process.env.TRACKHS_PASSWORD || secret('password'),
  TRACKHS_OUT_JSON: process.env.TRACKHS_OUT_JSON || path.join(repoRoot, 'src/data/owner-portal-reservations.json'),
};

const pull = spawnSync('node', [pullScript], { cwd: workspaceRoot, env, encoding: 'utf8' });
process.stdout.write(pull.stdout || '');
process.stderr.write(pull.stderr || '');
if (pull.status !== 0) process.exit(pull.status ?? 1);

const apply = spawnSync('node', ['scripts/directstay-external-import.mjs', '--apply'], { cwd: repoRoot, env: process.env, encoding: 'utf8' });
process.stdout.write(apply.stdout || '');
process.stderr.write(apply.stderr || '');
process.exit(apply.status ?? 1);
