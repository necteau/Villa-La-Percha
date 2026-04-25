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

// Populate this table over time with exact date-range pricing captured from
// direct booking, Airbnb, and VRBO. The calculation layer will use the most
// specific entry whose range fully contains the guest's requested stay.
//
// Example entry shape:
// {
//   id: "direct-2026-may-16",
//   platform: "direct",
//   startDate: "2026-05-16",
//   endDate: "2026-05-23",
//   nightlyRate: 4200,
//   charges: [],
// }
//
// Example Airbnb/VRBO charge rules:
// charges: [
//   { label: "Cleaning fee", category: "fee", type: "fixed", value: 650 },
//   { label: "Service fee", category: "fee", type: "percent", value: 0.14, basis: "base" },
//   { label: "Occupancy tax", category: "tax", type: "percent", value: 0.12, basis: "base_plus_fees" },
// ]
export const pricingTable: PricingTable = {
  entries: [
    {
      id: "direct-baseline-2026-2027",
      platform: "direct",
      startDate: "2026-04-24",
      endDate: "2028-01-01",
      nightlyRate: 1500,
      currency: "USD",
      charges: [],
      notes: "Baseline seeded direct-pricing row requested by owner on 2026-04-24. No fees or taxes.",
    },
    {
      id: "vrbo-baseline-2026-2027",
      platform: "vrbo",
      startDate: "2026-04-24",
      endDate: "2028-01-01",
      nightlyRate: 1800,
      currency: "USD",
      charges: [
        {
          label: "Cleaning fee",
          category: "fee",
          type: "fixed",
          value: 650,
        },
        {
          label: "Traveler service fee",
          category: "fee",
          type: "percent",
          value: 0.08,
          basis: "base_plus_fees",
        },
        {
          label: "Occupancy taxes",
          category: "tax",
          type: "percent",
          value: 0.12,
          basis: "base_plus_fees",
        },
      ],
      notes:
        "Baseline seeded row. VRBO help/search materials indicate traveler service fee is a percentage of reservation subtotal before taxes; 8% used here as a defensible midpoint assumption plus 12% occupancy tax and $650 cleaning fee until exact checkout quotes are captured.",
    },
    {
      id: "airbnb-baseline-2026-2027",
      platform: "airbnb",
      startDate: "2026-04-24",
      endDate: "2028-01-01",
      nightlyRate: 1850,
      currency: "USD",
      charges: [
        {
          label: "Cleaning fee",
          category: "fee",
          type: "fixed",
          value: 650,
        },
        {
          label: "Guest service fee",
          category: "fee",
          type: "percent",
          value: 0.15,
          basis: "base_plus_fees",
        },
        {
          label: "Occupancy taxes",
          category: "tax",
          type: "percent",
          value: 0.12,
          basis: "base_plus_fees",
        },
      ],
      notes:
        "Baseline seeded row. Airbnb Help Center says guest service fees typically range from 14.1% to 16.5% of booking subtotal; 15% used here with $650 cleaning fee and 12% occupancy tax until exact checkout quotes are captured.",
    },
  ],
};
