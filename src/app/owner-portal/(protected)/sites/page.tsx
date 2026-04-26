"use client";

import { useEffect, useState } from "react";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

interface SiteConfig {
  id: string;
  name: string;
  domain: string;
  minStayNights: number;
  inquiryEnabled: boolean;
  paymentMethods: { stripe: boolean; zelle: boolean; venmo: boolean; cashApp: boolean };
}

interface SiteDraft {
  id: string;
  name: string;
  domain: string;
  minStayNights: string;
  inquiryEnabled: boolean;
  paymentMethods: { stripe: boolean; zelle: boolean; venmo: boolean; cashApp: boolean };
}

function toDraft(site: SiteConfig): SiteDraft {
  return {
    ...site,
    minStayNights: String(site.minStayNights),
  };
}

export default function OwnerSitesPage() {
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [draft, setDraft] = useState<SiteDraft | null>(null);
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
        const response = await fetch(apiUrl("/api/owner-portal/sites"), { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load site settings");
        if (!cancelled) {
          setSite(data.site);
          setDraft(toDraft(data.site));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load site settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasChanges = !!draft && !!site && JSON.stringify(draft) !== JSON.stringify(toDraft(site));

  const save = async () => {
    if (!draft) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: SiteConfig = {
        id: draft.id,
        name: draft.name,
        domain: draft.domain,
        minStayNights: Number(draft.minStayNights || 1),
        inquiryEnabled: draft.inquiryEnabled,
        paymentMethods: draft.paymentMethods,
      };

      const response = await fetch(apiUrl("/api/owner-portal/sites"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to save site settings");
      setSite(data.site);
      setDraft(toDraft(data.site));
      setSuccess("Site settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save site settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Sites</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Per-property controls</h1>
        <p className="mt-4 text-base leading-7 text-[#5b554b]">
          Configure booking rules, inquiry behavior, and which payment methods are visible on the property site.
        </p>
        {saving ? <p className="mt-3 text-sm text-[#7b7468]">Saving changes…</p> : null}
        {success ? <p className="mt-3 text-sm text-[#1e4536]">{success}</p> : null}
        {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
      </div>

      {loading || !draft ? (
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          Loading site settings…
        </div>
      ) : (
        <article className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <input
                value={draft.name}
                onChange={(e) => setDraft((current) => (current ? { ...current, name: e.target.value } : current))}
                className="font-display text-3xl text-[#1b1a17] w-full rounded-xl border border-[#ddd4c7] px-4 py-3"
              />
              <input
                value={draft.domain}
                onChange={(e) => setDraft((current) => (current ? { ...current, domain: e.target.value } : current))}
                className="mt-2 w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm text-[#7b7468]"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-[#5b554b]">
              <input
                type="checkbox"
                checked={draft.inquiryEnabled}
                onChange={(e) => setDraft((current) => (current ? { ...current, inquiryEnabled: e.target.checked } : current))}
              />
              Inquiry enabled
            </label>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Minimum stay nights</label>
              <input
                type="number"
                min={1}
                value={draft.minStayNights}
                onChange={(e) => setDraft((current) => (current ? { ...current, minStayNights: e.target.value } : current))}
                className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
              />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#7b7468]">Payment methods shown on this site</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-[#5b554b]">
                {([
                  ["stripe", "Stripe"],
                  ["zelle", "Zelle"],
                  ["venmo", "Venmo"],
                  ["cashApp", "Cash App"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="inline-flex items-center gap-2 rounded-xl bg-[#f7f3eb] px-3 py-2">
                    <input
                      type="checkbox"
                      checked={draft.paymentMethods[key]}
                      onChange={(e) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                paymentMethods: { ...current.paymentMethods, [key]: e.target.checked },
                              }
                            : current
                        )
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving || !hasChanges}
              className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save site settings"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(site ? toDraft(site) : null)}
              disabled={saving || !hasChanges}
              className="inline-flex items-center justify-center rounded-full border border-[#ddd4c7] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b] transition hover:bg-[#f7f3eb] disabled:opacity-60"
            >
              Reset changes
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
