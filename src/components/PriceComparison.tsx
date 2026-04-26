"use client";

import { useEffect, useState } from "react";
import { getSavingsPercentage } from "@/lib/pricing";

interface Props {
  checkIn?: string | null;
  checkOut?: string | null;
  embedded?: boolean;
}

interface Charge {
  label: string;
  amount: number;
}

interface PlatformPricing {
  platform: "direct" | "airbnb" | "vrbo";
  nightlyRate: number;
  baseAmount: number;
  charges: Charge[];
  total: number;
}

interface Comparison {
  nights: number;
  direct: PlatformPricing | null;
  airbnb: PlatformPricing | null;
  vrbo: PlatformPricing | null;
}

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export default function DirectBookingCalculator({ checkIn = null, checkOut = null, embedded = false }: Props) {
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!checkIn || !checkOut) {
        setComparison(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/pricing-comparison?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          setComparison(data.comparison);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut]);

  const direct = comparison?.direct ?? null;

  if (!direct) {
    if (!embedded) return null;

    return (
      <div className="rounded-3xl border border-[#E8E4DF] bg-[#FAFAF8] p-6">
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          {loading
            ? "Loading totals…"
            : "Pick check-in and check-out dates to see exact direct, Airbnb, and VRBO totals."}
        </p>
      </div>
    );
  }

  const platforms = [direct, comparison?.airbnb, comparison?.vrbo].filter(Boolean) as PlatformPricing[];

  const content = (
    <>
      {(comparison?.nights ?? 0) > 0 && (
        <div className={embedded ? "mb-5 text-left" : "mb-10 text-center"}>
          <p className="text-sm text-[#6B6B6B]">
            <span className="font-medium text-[#2C2C2C]">{checkIn}</span> to <span className="font-medium text-[#2C2C2C]">{checkOut}</span>
            {" · "}
            <span className="font-medium text-[#2C2C2C]">{comparison?.nights} nights</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms.map((pricing) => {
          const isDirect = pricing.platform === "direct";
          const savings = pricing.total - direct.total;
          const savingsPct = getSavingsPercentage(pricing.total, direct.total);

          return (
            <div
              key={pricing.platform}
              className={`rounded-3xl p-5 shadow-sm border ${
                isDirect
                  ? "bg-gradient-to-br from-[#8B7355] to-[#A89279] text-white border-transparent"
                  : "bg-[#FAFAF8] border-[#E8E4DF] text-[#2C2C2C]"
              }`}
            >
              <p className={`text-xs uppercase tracking-wider mb-2 font-medium ${isDirect ? "text-white/70" : "text-[#6B6B6B]"}`}>
                {pricing.platform === "direct" ? "Direct" : pricing.platform === "airbnb" ? "Airbnb" : "VRBO"}
              </p>
              <p className={`text-sm mb-4 ${isDirect ? "text-white/80" : "text-[#6B6B6B]"}`}>
                {formatMoney(pricing.nightlyRate)} / night
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className={isDirect ? "text-white/75" : "text-[#6B6B6B]"}>Base stay</span>
                  <span>{formatMoney(pricing.baseAmount)}</span>
                </div>
                {pricing.charges.map((charge) => (
                  <div key={`${pricing.platform}-${charge.label}`} className="flex justify-between gap-4">
                    <span className={isDirect ? "text-white/75" : "text-[#6B6B6B]"}>{charge.label}</span>
                    <span>{formatMoney(charge.amount)}</span>
                  </div>
                ))}
                <div className={`pt-3 mt-3 border-t ${isDirect ? "border-white/20" : "border-[#E8E4DF]"}`}>
                  <div className="flex justify-between gap-4">
                    <span className={`text-xs uppercase tracking-wider ${isDirect ? "text-white/80" : "text-[#6B6B6B]"}`}>Total</span>
                    <span className="text-2xl font-light">{formatMoney(pricing.total)}</span>
                  </div>
                </div>
              </div>

              {savings > 0 && (
                <div className={`mt-4 rounded-2xl p-3 ${isDirect ? "bg-white/10" : "bg-white border border-[#E8E4DF]"}`}>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${isDirect ? "text-white/70" : "text-[#8B7355]"}`}>
                    Savings booking direct
                  </p>
                  <p className="text-lg font-light">{formatMoney(savings)}</p>
                  <p className={`text-xs mt-1 ${isDirect ? "text-white/75" : "text-[#6B6B6B]"}`}>{savingsPct}% lower total</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  if (embedded) return <div>{content}</div>;

  return (
    <section className="py-20 md:py-24 bg-white" id="pricing-comparison">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            Book Direct Value
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Compare the Actual Totals for Your Dates
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-2xl mx-auto">
            For your selected stay, this section compares direct pricing against Airbnb and VRBO totals,
            including nightly rates, fees, taxes, and savings.
          </p>
        </div>

        {content}

        <div className="mt-8 rounded-2xl border border-[#E8E4DF] bg-[#FAFAF8] p-6 text-center shadow-sm">
          <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-3xl mx-auto">
            Totals now come from the shared DirectStay pricing data layer so owner-side pricing updates can feed the guest flow.
          </p>
        </div>
      </div>
    </section>
  );
}
