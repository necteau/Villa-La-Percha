import type { User } from "@supabase/supabase-js";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return { url, anonKey };
}

export function hasSupabaseAuthConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getAllowedOwnerEmails(): string[] {
  const configured = process.env.OWNER_PORTAL_ALLOWED_EMAILS || process.env.OWNER_PORTAL_EMAIL || "owner@directstay.app";
  return configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowedOwnerEmails().includes(email.trim().toLowerCase());
}

export async function createOwnerServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can't always write cookies; route handlers can.
        }
      },
    },
  });
}

export function createOwnerBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}

export async function getOwnerSessionUser(): Promise<User | null> {
  if (!hasSupabaseAuthConfig()) return null;

  const supabase = await createOwnerServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAllowedOwnerEmail(user.email)) {
    return null;
  }

  return user;
}
