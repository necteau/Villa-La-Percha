"use client";

import { useState } from "react";

interface SiteConfig {
  id: string;
  name: string;
  domain: string;
  minStayNights: number;
  inquiryEnabled: boolean;
  paymentMethods: { stripe: boolean; zelle: boolean; venmo: boolean; cashApp: boolean };
}

const initialSites: SiteConfig[] = [
  {
    id: "villa-la-percha",
    name: "Villa La Percha",
    domain: "directstay.app/villa-la-percha",
    minStayNights: 5,
    inquiryEnabled: true,
    paymentMethods: { stripe: false, zelle: true, venmo: true, cashApp: false },
  },
  {
    id: "example-property",
    name: "Future Example Property",
    domain: "directstay.app/example-property",
    minStayNights: 4,
    inquiryEnabled: true,
    paymentMethods: { stripe: true, zelle: true, venmo: false, cashApp: true },
  },
];

export default function OwnerSitesPage() {
  const [sites, setSites] = useState(initialSites);

  const updateSite = (id: string, updater: (site: SiteConfig) => SiteConfig) => {
    setSites((current) => current.map((site) => (site.id === id ? updater(site) : site)));
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Sites</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Per-property controls</h1>
        <p className="mt-4 text-base leading-7 text-[#5b554b]">
          Configure each property independently: booking rules, inquiry behavior, and which payment methods are visible.
        </p>
      </div>

      <div className="space-y-5">
        {sites.map((site) => (
          <article key={site.id} className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl text-[#1b1a17]">{site.name}</h2>
                <p className="text-sm text-[#7b7468]">{site.domain}</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-[#5b554b]">
                <input
                  type="checkbox"
                  checked={site.inquiryEnabled}
                  onChange={(e) => updateSite(site.id, (s) => ({ ...s, inquiryEnabled: e.target.checked }))}
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
                  value={site.minStayNights}
                  onChange={(e) => updateSite(site.id, (s) => ({ ...s, minStayNights: Number(e.target.value || 1) }))}
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
                        checked={site.paymentMethods[key]}
                        onChange={(e) =>
                          updateSite(site.id, (s) => ({
                            ...s,
                            paymentMethods: { ...s.paymentMethods, [key]: e.target.checked },
                          }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
