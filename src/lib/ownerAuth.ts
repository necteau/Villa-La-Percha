import crypto from "crypto";

export const OWNER_SESSION_COOKIE = "directstay_owner_session";
const DEFAULT_OWNER_EMAIL = "owner@directstay.app";
const DEFAULT_OWNER_PASSWORD = "DirectStay2026!";

interface SessionPayload {
  email: string;
  exp: number;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function getSessionSecret(): string {
  return process.env.OWNER_PORTAL_SESSION_SECRET || "change-me-directstay-owner-session-secret";
}

export function getOwnerCredentials() {
  return {
    email: process.env.OWNER_PORTAL_EMAIL || DEFAULT_OWNER_EMAIL,
    password: process.env.OWNER_PORTAL_PASSWORD || DEFAULT_OWNER_PASSWORD,
  };
}

export function createOwnerSessionToken(email: string, ttlSeconds = 60 * 60 * 24 * 7): string {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${encodedPayload}.${signature}`;
}

export function verifyOwnerSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
