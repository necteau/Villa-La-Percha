"use client";

import { useEffect, useMemo, useState } from "react";
import type { PricingEntry } from "@/data/pricingTable";

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export default function OwnerPricingPage() {
  const [entries, setEntries] = useState<PricingEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/owner-portal/pricing", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load pricing");
        if (!cancelled) {
          setEntries(data.entries);
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

  const updateSelected = async (patch: Partial<PricingEntry>) => {
    if (!selectedId) return;

    const previous = entries;
    setEntries((current) => current.map((e) => (e.id === selectedId ? { ...e, ...patch } : e)));
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/owner-portal/pricing/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to save pricing");
      setEntries((current) => current.map((e) => (e.id === selectedId ? data.entry : e)));
    } catch (err) {
      setEntries(previous);
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
          Pricing now runs through the owner portal API/data layer so changes can flow into guest pricing comparison.
        </p>
        {saving ? <p className="mt-3 text-sm text-[#7b7468]">Saving changes…</p> : null}
        {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          Loading pricing entries…
        </div>
      ) : (
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
            {!selected ? (
              <p className="text-sm text-[#5b554b]">Select a pricing entry to edit.</p>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Selected entry</p>
                    <h2 className="mt-2 font-display text-4xl text-[#181612]">{selected.platform.toUpperCase()}</h2>
                  </div>
                  <span className="rounded-full bg-[#f4efe6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b]">
                    {selected.startDate} → {selected.endDate}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Start date (YYYY-MM-DD)</label>
                    <input
                      value={selected.startDate}
                      onChange={(e) => updateSelected({ startDate: e.target.value })}
                      className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">End date (YYYY-MM-DD)</label>
                    <input
                      value={selected.endDate}
                      onChange={(e) => updateSelected({ endDate: e.target.value })}
                      className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Nightly rate</label>
                    <input
                      type="number"
                      value={selected.nightlyRate}
                      onChange={(e) => updateSelected({ nightlyRate: Number(e.target.value || 0) })}
                      className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Minimum stay nights (optional)</label>
                    <input
                      type="number"
                      value={selected.minimumStayNights || ""}
                      onChange={(e) =>
                        updateSelected({ minimumStayNights: e.target.value === "" ? undefined : Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Notes</p>
                  <textarea
                    value={selected.notes || ""}
                    onChange={(e) => updateSelected({ notes: e.target.value })}
                    rows={5}
                    className="mt-3 w-full rounded-xl border border-[#ddd4c7] bg-white px-4 py-3 text-sm leading-6"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
