"use client";

import { useEffect, useMemo, useState } from "react";
import type { CustomerRecord } from "@/lib/customers";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

type CustomerStatus = CustomerRecord["status"];

interface CustomerDraft {
  id: string;
  status: CustomerStatus;
  phone: string;
  locationLabel: string;
  timezone: string;
  preferredContactMethod: string;
  notes: string;
  preferencesSummary: string;
  householdSummary: string;
  specialOccasions: string;
  conciergeInterests: string;
}

const statusOptions: CustomerStatus[] = ["lead", "active", "booked", "repeat_guest", "inactive", "do_not_contact", "vip"];

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function badgeClass(value: string) {
  if (value === "vip" || value === "repeat_guest") return "bg-[#eef6f1] text-[#1e4536]";
  if (value === "booked" || value === "active") return "bg-[#f6f2ea] text-[#8b7355]";
  if (value === "inactive" || value === "do_not_contact") return "bg-[#fbefef] text-[#b42318]";
  return "bg-[#f7f3eb] text-[#5b554b]";
}

function composeDraft(customer: CustomerRecord | null): CustomerDraft | null {
  if (!customer) return null;
  return {
    id: customer.id,
    status: customer.status,
    phone: customer.phone || "",
    locationLabel: customer.locationLabel || "",
    timezone: customer.timezone || "",
    preferredContactMethod: customer.preferredContactMethod || "",
    notes: customer.notes || "",
    preferencesSummary: customer.preferencesSummary || "",
    householdSummary: customer.householdSummary || "",
    specialOccasions: customer.specialOccasions || "",
    conciergeInterests: customer.conciergeInterests || "",
  };
}

export default function OwnerCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomerDraft | null>(null);
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
        const response = await fetch(apiUrl("/api/owner-portal/customers"), { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load customers");
        if (!cancelled) {
          setCustomers(data.customers);
          setSelectedId((current) => current || data.customers[0]?.id || null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load customers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => (selectedId ? customers.find((customer) => customer.id === selectedId) || null : null),
    [customers, selectedId]
  );

  useEffect(() => {
    setDraft(composeDraft(selected));
  }, [selected]);

  const hasChanges = Boolean(
    selected && draft && JSON.stringify(draft) !== JSON.stringify(composeDraft(selected))
  );

  const saveDraft = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl("/api/owner-portal/customers"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...draft }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to save customer");
      setCustomers((current) => current.map((customer) => (customer.id === data.customer.id ? data.customer : customer)));
      setSuccess("Customer saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Customers</p>
        <h1 className="mt-2 font-display text-4xl text-[#181612]">Relationship layer</h1>
        <p className="mt-3 text-sm leading-6 text-[#5b554b]">
          One record per guest/lead across inquiries and reservations, scoped to the owner account rather than a single property.
        </p>

        <div className="mt-5 rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-[#5b554b]">
          {customers.length} customer{customers.length === 1 ? "" : "s"} loaded
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#ddd4c7] px-4 py-8 text-sm text-[#7b7468]">Loading customers…</div>
          ) : customers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ddd4c7] px-4 py-8 text-sm text-[#7b7468]">No customers yet. New inquiries will start building the CRM layer automatically.</div>
          ) : (
            customers.map((customer) => {
              const isSelected = customer.id === selectedId;
              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedId(customer.id)}
                  className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                    isSelected ? "border-[#1e4536] bg-[#f6fbf8]" : "border-[#e8e1d6] bg-white hover:bg-[#faf8f3]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#1b1a17]">{customer.fullName}</p>
                      <p className="mt-1 text-sm text-[#7b7468]">{customer.email}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(customer.status)}`}>
                      {customer.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-[0.16em] text-[#7b7468]">
                    <span>{customer.totalInquiries} inquiries</span>
                    <span>{customer.totalReservations} reservations</span>
                    <span>{customer.totalCompletedStays} stays</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-6">
        {error ? <div className="rounded-2xl border border-[#f0c7c7] bg-[#fff5f5] px-4 py-3 text-sm text-[#9a2f2f]">{error}</div> : null}
        {success ? <div className="rounded-2xl border border-[#cfe3d6] bg-[#f3fbf6] px-4 py-3 text-sm text-[#1e4536]">{success}</div> : null}

        {!selected || !draft ? (
          <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-8 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            Select a customer to see relationship history, linked inquiries, reservations, and editable notes.
          </div>
        ) : (
          <>
            <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Customer profile</p>
                  <h2 className="mt-2 font-display text-4xl text-[#181612]">{selected.fullName}</h2>
                  <p className="mt-2 text-sm text-[#5b554b]">{selected.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(selected.status)}`}>
                  {selected.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl bg-[#faf8f3] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">First contact</p>
                  <p className="mt-2 text-sm text-[#1b1a17]">{formatDate(selected.firstInquiryAt)}</p>
                </article>
                <article className="rounded-2xl bg-[#faf8f3] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Last contact</p>
                  <p className="mt-2 text-sm text-[#1b1a17]">{formatDate(selected.lastContactAt)}</p>
                </article>
                <article className="rounded-2xl bg-[#faf8f3] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Inquiries / stays</p>
                  <p className="mt-2 text-sm text-[#1b1a17]">{selected.totalInquiries} / {selected.totalCompletedStays}</p>
                </article>
                <article className="rounded-2xl bg-[#faf8f3] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Booked revenue</p>
                  <p className="mt-2 text-sm text-[#1b1a17]">${selected.totalRevenue.toLocaleString()}</p>
                </article>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Status</label>
                  <select
                    value={draft.status}
                    onChange={(e) => setDraft((current) => (current ? { ...current, status: e.target.value as CustomerStatus } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Preferred contact method</label>
                  <input
                    value={draft.preferredContactMethod}
                    onChange={(e) => setDraft((current) => (current ? { ...current, preferredContactMethod: e.target.value } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Phone</label>
                  <input
                    value={draft.phone}
                    onChange={(e) => setDraft((current) => (current ? { ...current, phone: e.target.value } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Location</label>
                  <input
                    value={draft.locationLabel}
                    onChange={(e) => setDraft((current) => (current ? { ...current, locationLabel: e.target.value } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Timezone</label>
                  <input
                    value={draft.timezone}
                    onChange={(e) => setDraft((current) => (current ? { ...current, timezone: e.target.value } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Primary property</label>
                  <input value={selected.primaryPropertyName || "—"} readOnly className="w-full rounded-xl border border-[#ddd4c7] bg-[#faf8f3] px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Preferences summary</label>
                  <textarea
                    value={draft.preferencesSummary}
                    onChange={(e) => setDraft((current) => (current ? { ...current, preferencesSummary: e.target.value } : current))}
                    className="min-h-[110px] w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Household / travel style</label>
                  <textarea
                    value={draft.householdSummary}
                    onChange={(e) => setDraft((current) => (current ? { ...current, householdSummary: e.target.value } : current))}
                    className="min-h-[110px] w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Special occasions</label>
                  <textarea
                    value={draft.specialOccasions}
                    onChange={(e) => setDraft((current) => (current ? { ...current, specialOccasions: e.target.value } : current))}
                    className="min-h-[110px] w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Concierge interests</label>
                  <textarea
                    value={draft.conciergeInterests}
                    onChange={(e) => setDraft((current) => (current ? { ...current, conciergeInterests: e.target.value } : current))}
                    className="min-h-[110px] w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Owner notes</label>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft((current) => (current ? { ...current, notes: e.target.value } : current))}
                  className="min-h-[140px] w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => void saveDraft()}
                  disabled={saving || !hasChanges}
                  className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save customer"}
                </button>
                <button
                  type="button"
                  disabled={saving || !hasChanges}
                  onClick={() => setDraft(composeDraft(selected))}
                  className="inline-flex items-center justify-center rounded-full border border-[#ddd4c7] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b] transition hover:bg-[#f7f3eb] disabled:opacity-60"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                <h3 className="font-display text-3xl text-[#181612]">Linked inquiries</h3>
                <div className="mt-4 space-y-3">
                  {selected.inquiries.length === 0 ? (
                    <p className="text-sm text-[#7b7468]">No inquiries linked yet.</p>
                  ) : selected.inquiries.map((inquiry) => (
                    <article key={inquiry.id} className="rounded-2xl bg-[#faf8f3] p-4 text-sm text-[#5b554b]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[#1b1a17]">{inquiry.propertyName}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="mt-2">{formatDate(inquiry.createdAt)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#7b7468]">
                        {inquiry.checkIn && inquiry.checkOut ? `${inquiry.checkIn} → ${inquiry.checkOut}` : "Dates not captured"}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                <h3 className="font-display text-3xl text-[#181612]">Reservation history</h3>
                <div className="mt-4 space-y-3">
                  {selected.reservations.length === 0 ? (
                    <p className="text-sm text-[#7b7468]">No reservations linked yet.</p>
                  ) : selected.reservations.map((reservation) => (
                    <article key={reservation.id} className="rounded-2xl bg-[#faf8f3] p-4 text-sm text-[#5b554b]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[#1b1a17]">{reservation.propertyName}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(reservation.status)}`}>
                          {reservation.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-2">{reservation.checkIn} → {reservation.checkOut}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#7b7468]">
                        {reservation.source} · {reservation.totalAmount ? `$${reservation.totalAmount.toLocaleString()} ${reservation.currency}` : reservation.currency}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
