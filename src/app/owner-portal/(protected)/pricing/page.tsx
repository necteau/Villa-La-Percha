"use client";

import { useEffect, useMemo, useState } from "react";
import type { PricingEntry, PricingTaxSettings } from "@/data/pricingTable";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export default function OwnerPricingPage() {
  const [entries, setEntries] = useState<PricingEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<PricingEntry | null>(null);
  const [taxSettings, setTaxSettings] = useState<PricingTaxSettings | null>(null);
  const [taxDraft, setTaxDraft] = useState<PricingTaxSettings | null>(null);
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
        const res = await fetch(apiUrl("/api/owner-portal/pricing"), { cache: "no-store", credentials: "same-origin" });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load pricing");
        if (!cancelled) {
          setEntries(data.entries);
          setTaxSettings(data.taxSettings);
          setTaxDraft(data.taxSettings);
          setSelectedId((current) => current || data.entries[0]?.id || "");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load pricing");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(() => entries.find((e) => e.id === selectedId) || null, [entries, selectedId]);

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
    setSuccess("");
    setError("");
  }, [selectedId, selected]);

  const hasChanges = !!draft && !!selected && JSON.stringify(draft) !== JSON.stringify(selected);
  const hasTaxChanges = !!taxDraft && !!taxSettings && JSON.stringify(taxDraft) !== JSON.stringify(taxSettings);

  const saveTaxSettings = async () => {
    if (!taxDraft) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(apiUrl("/api/owner-portal/pricing"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-tax-settings", taxSettings: taxDraft }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to save tax settings");
      setTaxSettings(data.taxSettings);
      setTaxDraft(data.taxSettings);
      setSuccess("Tax settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tax settings");
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => {
    if (!selectedId || !draft) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(apiUrl("/api/owner-portal/pricing"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          startDate: draft.startDate,
          endDate: draft.endDate,
          nightlyRate: draft.nightlyRate,
          minimumStayNights: draft.minimumStayNights,
          notes: draft.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to save pricing");
      setEntries((current) => current.map((e) => (e.id === selectedId ? data.entry : e)));
      setDraft(data.entry);
      setSuccess("Pricing saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Pricing</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Edit pricing windows</h1>
        <p className="mt-4 text-base leading-7 text-[#5b554b]">
          Pricing now runs through the owner portal API/data layer so changes can flow into guest pricing comparison. Use tax settings to decide whether direct nightly rates are tax-inclusive or whether tax is collected as a separate line item.
        </p>
        {saving ? <p className="mt-3 text-sm text-[#7b7468]">Saving changes…</p> : null}
        {success ? <p className="mt-3 text-sm text-[#1e4536]">{success}</p> : null}
        {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          Loading pricing entries…
        </div>
      ) : (
        <div className="space-y-6">
          {taxDraft ? (
            <article className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Direct-booking tax display</p>
                  <h2 className="mt-2 font-display text-3xl text-[#181612]">Tax collection settings</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b554b]">
                    Inclusive means the nightly direct price already includes tax. Separate means DirectStay adds a tax line everywhere totals are shown.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveTaxSettings}
                  disabled={saving || !hasTaxChanges}
                  className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b] disabled:opacity-60"
                >
                  Save tax settings
                </button>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Mode</label>
                  <select
                    value={taxDraft.mode}
                    onChange={(e) => setTaxDraft((current) => current ? { ...current, mode: e.target.value as PricingTaxSettings["mode"] } : current)}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  >
                    <option value="inclusive">Nightly rate includes tax</option>
                    <option value="separate">Collect tax separately</option>
                    <option value="none">No tax shown</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Tax rate</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={Math.round(taxDraft.rate * 10000) / 100}
                    onChange={(e) => setTaxDraft((current) => current ? { ...current, rate: Number(e.target.value || 0) / 100 } : current)}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Tax label</label>
                  <input
                    value={taxDraft.label}
                    onChange={(e) => setTaxDraft((current) => current ? { ...current, label: e.target.value } : current)}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
              </div>
            </article>
          ) : null}

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Entries</p>
            <div className="mt-4 space-y-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedId(entry.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    entry.id === selectedId ? "border-[#1e4536] bg-[#eef6f1]" : "border-[#e8e1d6] hover:bg-[#f4efe6]"
                  }`}
                >
                  <p className="font-medium text-[#1b1a17]">
                    {entry.platform.toUpperCase()} · {formatMoney(entry.nightlyRate)}/night
                  </p>
                  <p className="text-xs text-[#7b7468]">
                    {entry.startDate} → {entry.endDate}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
            {!draft ? (
              <p className="text-sm text-[#5b554b]">Select a pricing entry to edit.</p>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Selected entry</p>
                    <h2 className="mt-2 font-display text-4xl text-[#181612]">{draft.platform.toUpperCase()}</h2>
                  </div>
                  <span className="rounded-full bg-[#f4efe6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b]">
                    {draft.startDate} → {draft.endDate}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Start date (YYYY-MM-DD)</label>
                    <input
                      value={draft.startDate}
                      onChange={(e) => setDraft((current) => (current ? { ...current, startDate: e.target.value } : current))}
                      className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">End date (YYYY-MM-DD)</label>
                    <input
                      value={draft.endDate}
                      onChange={(e) => setDraft((current) => (current ? { ...current, endDate: e.target.value } : current))}
                      className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Nightly rate</label>
                    <input
                      type="number"
                      value={draft.nightlyRate}
                      onChange={(e) => setDraft((current) => (current ? { ...current, nightlyRate: Number(e.target.value || 0) } : current))}
                      className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Minimum stay nights (optional)</label>
                    <input
                      type="number"
                      value={draft.minimumStayNights || ""}
                      onChange={(e) =>
                        setDraft((current) =>
                          current
                            ? { ...current, minimumStayNights: e.target.value === "" ? undefined : Number(e.target.value) }
                            : current
                        )
                      }
                      className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Notes</p>
                  <textarea
                    value={draft.notes || ""}
                    onChange={(e) => setDraft((current) => (current ? { ...current, notes: e.target.value } : current))}
                    rows={5}
                    className="mt-3 w-full rounded-xl border border-[#ddd4c7] bg-white px-4 py-3 text-sm leading-6"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={saving || !hasChanges}
                    className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b] disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save pricing"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(selected ? { ...selected } : null)}
                    disabled={saving || !hasChanges}
                    className="inline-flex items-center justify-center rounded-full border border-[#ddd4c7] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b] transition hover:bg-[#f7f3eb] disabled:opacity-60"
                  >
                    Reset changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </section>
  );
}
