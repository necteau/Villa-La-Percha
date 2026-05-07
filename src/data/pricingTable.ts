import pricingTableJson from "@/data/pricing-table.json";

export type PricingPlatform = "direct" | "airbnb" | "vrbo";
export type PricingChargeCategory = "fee" | "tax";
export type PricingChargeType = "fixed" | "percent";
export type PricingChargeBasis = "base" | "base_plus_fees" | "subtotal_before_tax";
export type TaxCollectionMode = "inclusive" | "separate" | "none";

export interface PricingTaxSettings {
  mode: TaxCollectionMode;
  rate: number;
  label: string;
}

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
  startDate: string;
  endDate: string;
  nightlyRate: number;
  currency?: string;
  minimumStayNights?: number;
  charges?: PricingChargeRule[];
  notes?: string;
}

export interface PricingTable {
  taxSettings?: PricingTaxSettings;
  entries: PricingEntry[];
}

export const pricingTable: PricingTable = pricingTableJson as PricingTable;
