"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OwnerPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@directstay.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/owner-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error || "Unable to sign in");
        return;
      }

      router.push("/owner-portal");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#1f1f1b]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16 md:px-10">
        <section className="w-full rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] md:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">DirectStay</p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Owner Portal Login</h1>
          <p className="mt-4 text-sm leading-6 text-[#5b554b]">
            Sign in to manage reservations, pricing, and payment options for each property site.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm text-[#1f1f1b] outline-none focus:border-[#8B7355]"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm text-[#1f1f1b] outline-none focus:border-[#8B7355]"
                required
              />
            </div>

            {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#1e4536] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#18372b] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-4 text-xs text-[#7b7468]">
            <span>Set OWNER_PORTAL_EMAIL / OWNER_PORTAL_PASSWORD in env for production.</span>
            <Link href="/" className="underline underline-offset-4">
              Back to DirectStay
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
