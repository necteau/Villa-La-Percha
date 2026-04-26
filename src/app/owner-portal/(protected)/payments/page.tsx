"use client";

import { useEffect, useState } from "react";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

interface PaymentSettings {
  primaryMethod: "Stripe" | "Zelle" | "Venmo" | "Cash App";
  depositPercent: number;
  finalDueDays: number;
  allowFallbacks: boolean;
}

interface PaymentDraft {
  primaryMethod: PaymentSettings["primaryMethod"];
  depositPercent: string;
  finalDueDays: string;
  allowFallbacks: boolean;
}

function toDraft(settings: PaymentSettings): PaymentDraft {
  return {
    primaryMethod: settings.primaryMethod,
    depositPercent: String(settings.depositPercent),
    finalDueDays: String(settings.finalDueDays),
    allowFallbacks: settings.allowFallbacks,
  };
}

export default function OwnerPaymentsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [draft, setDraft] = useState<PaymentDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(apiUrl("/api/owner-portal/payments"), { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load payment settings");
        if (!cancelled) {
          setSettings(data.settings);
          setDraft(toDraft(data.settings));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load payment settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasChanges = !!draft && !!settings && JSON.stringify(draft) !== JSON.stringify(toDraft(settings));

  const save = async () => {
    if (!draft) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: PaymentSettings = {
        primaryMethod: draft.primaryMethod,
        depositPercent: Number(draft.depositPercent || 0),
        finalDueDays: Number(draft.finalDueDays || 0),
        allowFallbacks: draft.allowFallbacks,
      };

      const response = await fetch(apiUrl("/api/owner-portal/payments"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to save payment settings");
      setSettings(data.settings);
      setDraft(toDraft(data.settings));
      setSuccess("Payment settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Payments</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Payment strategy by property</h1>
        <p className="mt-4 text-base leading-7 text-[#5b554b]">
          Configure how guests pay: primary rail, fallback options, deposit policy, and final payment timing.
        </p>
        {saving ? <p className="mt-3 text-sm text-[#7b7468]">Saving changes…</p> : null}
        {success ? <p className="mt-3 text-sm text-[#1e4536]">{success}</p> : null}
        {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
      </div>

      {loading || !draft ? (
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          Loading payment settings…
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
              <h2 className="font-display text-3xl text-[#1b1a17]">Default payment flow</h2>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Primary method</label>
                  <select
                    value={draft.primaryMethod}
                    onChange={(e) => setDraft((current) => (current ? { ...current, primaryMethod: e.target.value as PaymentSettings["primaryMethod"] } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  >
                    <option>Stripe</option>
                    <option>Zelle</option>
                    <option>Venmo</option>
                    <option>Cash App</option>
                  </select>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-[#5b554b]">
                  <input
                    type="checkbox"
                    checked={draft.allowFallbacks}
                    onChange={(e) => setDraft((current) => (current ? { ...current, allowFallbacks: e.target.checked } : current))}
                  />
                  Allow fallback methods on owner approval
                </label>
              </div>
            </article>

            <article className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
              <h2 className="font-display text-3xl text-[#1b1a17]">Deposit policy</h2>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Deposit percentage</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.depositPercent}
                    onChange={(e) => setDraft((current) => (current ? { ...current, depositPercent: e.target.value } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Final payment due (days before check-in)</label>
                  <input
                    type="number"
                    min={0}
                    value={draft.finalDueDays}
                    onChange={(e) => setDraft((current) => (current ? { ...current, finalDueDays: e.target.value } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
              </div>
            </article>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving || !hasChanges}
              className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save payments"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(settings ? toDraft(settings) : null)}
              disabled={saving || !hasChanges}
              className="inline-flex items-center justify-center rounded-full border border-[#ddd4c7] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b] transition hover:bg-[#f7f3eb] disabled:opacity-60"
            >
              Reset changes
            </button>
          </div>
        </>
      )}
    </section>
  );
}
