export type PricingPlatform = "direct" | "airbnb" | "vrbo";
export type PricingChargeCategory = "fee" | "tax";
export type PricingChargeType = "fixed" | "percent";
export type PricingChargeBasis = "base" | "base_plus_fees" | "subtotal_before_tax";

export interface PricingChargeRule {
  label: string;
  category: PricingChargeCategory;
  type: PricingChargeType;
  value: number;
  basis?: PricingChargeBasis;
  perNight?: boolean;
}

export interface PricingEntry {
  id: string;
  platform: PricingPlatform;
  startDate: string; // inclusive, YYYY-MM-DD
  endDate: string;   // exclusive, YYYY-MM-DD
  nightlyRate: number;
  currency?: string;
  minimumStayNights?: number;
  charges?: PricingChargeRule[];
  notes?: string;
}

export interface PricingTable {
  entries: PricingEntry[];
}

// Pricing table for Villa La Percha.
// Each entry covers a platform (direct, airbnb, vrbo) across a date range.
// The calculation layer selects the widest matching entry for a given stay.
//
// Update strategy: add more specific date-range entries as exact quotes arrive.
// For now, the baseline covers all dates from today through 1 Jan 2028.
//
// Owner instruction (2026-04-25): roll VRBO fees into the nightly rate (like Airbnb
// does) so columns compare apples-to-apples. Show tax separately. Use VRBO
// $1,792.10/night and Airbnb $1,844/night for all dates.

export const pricingTable: PricingTable = {
  entries: [
    {
      id: "direct-baseline-2026-2028",
      platform: "direct",
      startDate: "2026-04-25",
      endDate: "2028-01-01",
      nightlyRate: 1500,
      currency: "USD",
      charges: [],
      notes: "Direct pricing. No fees, no platform markup, no surprise taxes.",
    },
    {
      id: "vrbo-baseline-2026-2028",
      platform: "vrbo",
      startDate: "2026-04-25",
      endDate: "2028-01-01",
      nightlyRate: 1792.10,
      currency: "USD",
      charges: [
        {
          label: "Occupancy taxes",
          category: "tax",
          type: "percent",
          value: 0.1038,
          basis: "base",
        },
      ],
      notes:
        "VRBO fees rolled into nightly rate per owner direction on 2026-04-25. " +
        "Exact checkout screenshot: $1,792.10/night all-in, tax 10.38% on base. " +
        "Total for May 16-23 (7 nights): $13,847 (vs direct $10,500 — saving $3,347).",
    },
    {
      id: "airbnb-baseline-2026-2028",
      platform: "airbnb",
      startDate: "2026-04-25",
      endDate: "2028-01-01",
      nightlyRate: 1844,
      currency: "USD",
      charges: [
        {
          label: "Occupancy taxes",
          category: "tax",
          type: "percent",
          value: 0.1177,
          basis: "base",
        },
      ],
      notes:
        "Airbnb nightly rate per owner-provided checkout screenshot 2026-04-25. " +
        "$1,844/night all-in, tax 11.77% on base. " +
        "Total for May 16-23 (7 nights): $14,427 (vs direct $10,500 — saving $3,927).",
    },
  ],
};
