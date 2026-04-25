import { useState, useMemo } from "react";
import { getSavingsPercentage, getStayPricingComparison } from "@/lib/pricing";

interface Props {
  checkIn?: string | null;
  checkOut?: string | null;
}

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export default function DirectBookingCalculator({ checkIn = null, checkOut = null }: Props) {
  const [nights, setNights] = useState(7);

  const selectedRangeComparison = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return getStayPricingComparison(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const hasExactComparison = Boolean(
    selectedRangeComparison?.direct && (selectedRangeComparison.airbnb || selectedRangeComparison.vrbo)
  );

  const selectedComparisonNotes = hasExactComparison && selectedRangeComparison
    ? [selectedRangeComparison.direct, selectedRangeComparison.airbnb, selectedRangeComparison.vrbo]
        .filter(Boolean)
        .map((pricing) => pricing?.entry.notes)
        .filter((note, index, arr): note is string => Boolean(note) && arr.indexOf(note) === index)
    : [];

  const nightlyRate = 4200;
  const directTotal = nightlyRate * nights;
  const otaLow = Math.round(directTotal * 1.15);
  const otaHigh = Math.round(directTotal * 1.3);
  const savingsLow = otaLow - directTotal;
  const savingsHigh = otaHigh - directTotal;

  const comparisonCards = hasExactComparison
    ? [selectedRangeComparison?.direct, selectedRangeComparison?.airbnb, selectedRangeComparison?.vrbo].filter(Boolean)
    : [];

  return (
    <section className="py-20 md:py-24 bg-white" id="pricing-comparison">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            Book Direct Value
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            {hasExactComparison ? "Compare the Actual Totals for Your Dates" : "Direct Booking Usually Wins by a Wide Margin"}
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-2xl mx-auto">
            {hasExactComparison
              ? "For your selected stay, this section compares direct pricing against seeded Airbnb and VRBO totals, including nightly rates, fees, taxes, and savings."
              : "Our pricing is typically about 15–30% lower than the total guests often see on Airbnb or VRBO once platform fees, markups, and other extras are layered in."}
          </p>
        </div>

        {hasExactComparison && selectedRangeComparison ? (
          <>
            <div className="mb-10 text-center">
              <p className="text-sm text-[#6B6B6B]">
                Selected stay: <span className="font-medium text-[#2C2C2C]">{checkIn}</span> to <span className="font-medium text-[#2C2C2C]">{checkOut}</span>
                {" · "}
                <span className="font-medium text-[#2C2C2C]">{selectedRangeComparison.nights} nights</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonCards.map((pricing) => {
                if (!pricing) return null;
                const isDirect = pricing.platform === "direct";
                const direct = selectedRangeComparison.direct;
                const savings = direct && !isDirect ? pricing.total - direct.total : 0;
                const savingsPct = direct && !isDirect ? getSavingsPercentage(pricing.total, direct.total) : 0;

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

                    {!isDirect && direct && savings > 0 && (
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
                These totals are powered by the pricing table and will get more precise as we replace seeded baseline rows with exact date-range quotes captured from direct, Airbnb, and VRBO checkout screens.
              </p>
              {selectedComparisonNotes.length > 0 && (
                <div className="mt-4 space-y-2 text-left max-w-3xl mx-auto">
                  {selectedComparisonNotes.map((note) => (
                    <p key={note} className="text-xs text-[#6B6B6B] leading-relaxed">
                      • {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-14 px-2 md:px-8">
              <div className="flex justify-between text-xs text-[#6B6B6B] mb-3 uppercase tracking-wider font-medium">
                <span>3 nights</span>
                <span>14 nights</span>
              </div>
              <input
                type="range"
                min={3}
                max={14}
                value={nights}
                onChange={(e) => setNights(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8B7355 ${((nights - 3) / 11) * 100}%, #E8E4DF ${((nights - 3) / 11) * 100}%)`,
                }}
              />
              <div className="text-center mt-4 text-lg font-medium" style={{ color: "#2C2C2C" }}>
                {nights} {nights === 1 ? "night" : "nights"} × ${nightlyRate.toLocaleString()} / night
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-[#E8E4DF] bg-[#FAFAF8] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#E8E4DF] text-[#6B6B6B] uppercase tracking-wider font-medium">
                    Airbnb / VRBO total
                  </span>
                </div>
                <p className="text-sm text-[#6B6B6B] mb-8 leading-relaxed">
                  Typical all-in guest total after platform pricing, service fees, and other add-ons.
                </p>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-1">Likely range</p>
                    <p className="text-3xl md:text-4xl font-light" style={{ color: "#2C2C2C" }}>
                      ${otaLow.toLocaleString()}–${otaHigh.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-[#6B6B6B]">
                    <p>• Higher total once OTA fees and markups are added</p>
                    <p>• Less direct communication before arrival</p>
                    <p>• More layers between guest and property</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-[#8B7355] to-[#A89279] p-8 text-white shadow-lg relative overflow-hidden">
                <span className="absolute top-5 right-5 text-xs tracking-wider uppercase font-medium bg-white/20 px-3 py-1 rounded-full">
                  Best value
                </span>
                <p className="text-xs uppercase tracking-wider text-white/70 mb-3 font-medium">
                  Book direct
                </p>
                <p className="text-sm text-white/75 mb-8 leading-relaxed max-w-md">
                  Straightforward pricing with direct communication and no extra taxes or booking fees added here.
                </p>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Your total here</p>
                    <p className="text-3xl md:text-4xl font-light text-white">
                      ${directTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-white/85">
                    <p>• Direct communication throughout the stay</p>
                    <p>• No platform markup layered on top</p>
                    <p>• Cleaner, simpler booking experience</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#E8E4DF] bg-[#FAFAF8] p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#8B7355] mb-2">Typical savings</p>
              <p className="text-3xl md:text-4xl font-light" style={{ color: "#2C2C2C" }}>
                ${savingsLow.toLocaleString()}–${savingsHigh.toLocaleString()}
              </p>
              <p className="text-sm text-[#6B6B6B] mt-2 leading-relaxed max-w-2xl mx-auto">
                Depending on stay length, that difference can easily cover dinners out, a boat day, or a
                very respectable amount of rum punch. Civilization advances.
              </p>
              <p className="text-xs text-[#6B6B6B] mt-4 max-w-2xl mx-auto">
                We&apos;ve also now built the date-range pricing table underneath this section, so once we load exact
                Airbnb, VRBO, and direct pricing windows, this will automatically switch from estimates to real totals.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
