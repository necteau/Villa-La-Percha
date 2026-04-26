"use client";

import { useState } from "react";

export default function OwnerPaymentsPage() {
  const [primaryMethod, setPrimaryMethod] = useState("Stripe");
  const [depositPercent, setDepositPercent] = useState(30);
  const [finalDueDays, setFinalDueDays] = useState(30);
  const [allowFallbacks, setAllowFallbacks] = useState(true);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Payments</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Payment strategy by property</h1>
        <p className="mt-4 text-base leading-7 text-[#5b554b]">
          Configure how guests pay: primary rail, fallback options, deposit policy, and final payment timing.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <article className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
          <h2 className="font-display text-3xl text-[#1b1a17]">Default payment flow</h2>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Primary method</label>
              <select
                value={primaryMethod}
                onChange={(e) => setPrimaryMethod(e.target.value)}
                className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
              >
                <option>Stripe</option>
                <option>Zelle</option>
                <option>Venmo</option>
                <option>Cash App</option>
              </select>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-[#5b554b]">
              <input type="checkbox" checked={allowFallbacks} onChange={(e) => setAllowFallbacks(e.target.checked)} />
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
                value={depositPercent}
                onChange={(e) => setDepositPercent(Number(e.target.value || 0))}
                className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Final payment due (days before check-in)</label>
              <input
                type="number"
                min={0}
                value={finalDueDays}
                onChange={(e) => setFinalDueDays(Number(e.target.value || 0))}
                className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
