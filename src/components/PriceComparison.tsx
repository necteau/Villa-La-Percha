import { useMemo } from "react";
import { getSavingsPercentage, getStayPricingComparison } from "@/lib/pricing";

interface Props {
  checkIn?: string | null;
  checkOut?: string | null;
}

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export default function DirectBookingCalculator({ checkIn = null, checkOut = null }: Props) {
  const comparison = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return getStayPricingComparison(checkIn, checkOut);
  }, [checkIn, checkOut]);

  if (!comparison?.direct) return null;

  const direct = comparison.direct;

  const platforms = [direct, comparison.airbnb, comparison.vrbo].filter(Boolean) as typeof direct[];

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

        {comparison.nights > 0 && (
          <div className="mb-10 text-center">
            <p className="text-sm text-[#6B6B6B]">
              <span className="font-medium text-[#2C2C2C]">{checkIn}</span> to{" "}
              <span className="font-medium text-[#2C2C2C]">{checkOut}</span>
              {" · "}
              <span className="font-medium text-[#2C2C2C]">{comparison.nights} nights</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((pricing) => {
            const isDirect = pricing.platform === "direct";
            const savings = pricing.total - direct.total;
            const savingsPct = getSavingsPercentage(direct.total, pricing.total);

            return (
              <div
                key={pricing.platform}
                className={`rounded-3xl p-8 shadow-sm border ${
                  isDirect
                    ? "bg-gradient-to-br from-[#8B7355] to-[#A89279] text-white border-transparent"
                    : "bg-[#FAFAF8] border-[#E8E4DF] text-[#2C2C2C]"
                }`}
              >
                <p className={`text-xs uppercase tracking-wider mb-3 font-medium ${isDirect ? "text-white/70" : "text-[#6B6B6B]"}`}>
                  {pricing.platform === "direct" ? "Direct" : pricing.platform === "airbnb" ? "Airbnb" : "VRBO"}
                </p>
                <p className={`text-sm mb-5 ${isDirect ? "text-white/80" : "text-[#6B6B6B]"}`}>
                  {formatMoney(pricing.nightlyRate)} / night
                </p>

                <div className="space-y-3 text-sm">
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
                  <div className={`pt-4 mt-4 border-t ${isDirect ? "border-white/20" : "border-[#E8E4DF]"}`}>
                    <div className="flex justify-between gap-4">
                      <span className={`text-xs uppercase tracking-wider ${isDirect ? "text-white/80" : "text-[#6B6B6B]"}`}>Total</span>
                      <span className="text-2xl font-light">{formatMoney(pricing.total)}</span>
                    </div>
                  </div>
                </div>

                {savings > 0 && (
                  <div className={`mt-6 rounded-2xl p-4 ${isDirect ? "bg-white/10" : "bg-white border border-[#E8E4DF]"}`}>
                    <p className={`text-xs uppercase tracking-wider mb-1 ${isDirect ? "text-white/70" : "text-[#8B7355]"}`}>
                      Savings booking direct
                    </p>
                    <p className="text-xl font-light">{formatMoney(savings)}</p>
                    <p className={`text-sm mt-1 ${isDirect ? "text-white/75" : "text-[#6B6B6B]"}`}>{savingsPct}% lower total</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-[#E8E4DF] bg-[#FAFAF8] p-6 text-center shadow-sm">
          <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-3xl mx-auto">
            Totals powered by the pricing table. Replaced seeded estimates with exact checkout screenshots
            captured from Airbnb and VRBO on 2026-04-25.
          </p>
        </div>
      </div>
    </section>
  );
}
