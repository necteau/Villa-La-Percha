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
  entries: [],
};
