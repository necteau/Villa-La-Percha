import {
  pricingTable,
  type PricingChargeRule,
  type PricingEntry,
  type PricingPlatform,
  type PricingTaxSettings,
} from "@/data/pricingTable";

export interface AppliedCharge {
  label: string;
  category: "fee" | "tax";
  amount: number;
}

export interface CalculatedStayPricing {
  platform: PricingPlatform;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyRate: number;
  currency: string;
  baseAmount: number;
  charges: AppliedCharge[];
  feeTotal: number;
  taxTotal: number;
  total: number;
  taxSettings?: PricingTaxSettings;
  taxIncludedInNightlyRate: boolean;
  taxDisclosure: string | null;
  entry: PricingEntry;
  entries?: PricingEntry[];
}

const DAY_MS = 1000 * 60 * 60 * 24;

export function getStayNights(checkIn: string, checkOut: string): number {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / DAY_MS);
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function applyCharge(rule: PricingChargeRule, baseAmount: number, feeTotalSoFar: number, taxTotalSoFar: number, nights: number): number {
  if (rule.type === "fixed") {
    return roundCurrency(rule.perNight ? rule.value * nights : rule.value);
  }

  const basis = rule.basis ?? "base";
  const taxableSubtotal = baseAmount + feeTotalSoFar;
  const subtotalBeforeTax = taxableSubtotal + taxTotalSoFar;

  const sourceAmount = (() => {
    switch (basis) {
      case "base_plus_fees":
        return taxableSubtotal;
      case "subtotal_before_tax":
        return subtotalBeforeTax;
      case "base":
      default:
        return baseAmount;
    }
  })();

  return roundCurrency(sourceAmount * rule.value);
}

function addDays(date: string, days: number): string {
  return new Date(new Date(date).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

function getEntryForNight(entries: PricingEntry[], platform: PricingPlatform, night: string, stayNights: number): PricingEntry | null {
  const matches = entries.filter((entry) => {
    if (entry.platform !== platform) return false;
    if (entry.startDate > night) return false;
    if (entry.endDate <= night) return false;
    if (entry.minimumStayNights && stayNights < entry.minimumStayNights) return false;
    return true;
  });

  if (matches.length === 0) return null;

  return matches.sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
}

export function findPricingEntries(
  platform: PricingPlatform,
  checkIn: string,
  checkOut: string,
  entries: PricingEntry[] = pricingTable.entries
): PricingEntry[] {
  const stayNights = getStayNights(checkIn, checkOut);
  if (stayNights <= 0) return [];

  const segments: PricingEntry[] = [];

  for (let date = checkIn; date < checkOut; date = addDays(date, 1)) {
    const entry = getEntryForNight(entries, platform, date, stayNights);
    if (!entry) return [];
    if (segments[segments.length - 1]?.id !== entry.id) segments.push(entry);
  }

  return segments;
}

export function findPricingEntry(platform: PricingPlatform, checkIn: string, checkOut: string): PricingEntry | null {
  return findPricingEntries(platform, checkIn, checkOut)[0] ?? null;
}

export function calculateStayPricing(
  entry: PricingEntry,
  checkIn: string,
  checkOut: string,
  taxSettings: PricingTaxSettings | null = pricingTable.taxSettings ?? null
): CalculatedStayPricing {
  return calculateStayPricingFromEntries([entry], checkIn, checkOut, taxSettings);
}

export function calculateStayPricingFromEntries(
  entries: PricingEntry[],
  checkIn: string,
  checkOut: string,
  taxSettings: PricingTaxSettings | null = pricingTable.taxSettings ?? null
): CalculatedStayPricing {
  const nights = getStayNights(checkIn, checkOut);
  const entry = entries[0];
  const currency = entry.currency ?? "USD";
  const charges: AppliedCharge[] = [];
  let baseAmount = 0;
  let feeTotal = 0;
  let taxTotal = 0;

  let segmentStart = checkIn;
  for (let i = 0; i < entries.length; i++) {
    const current = entries[i];
    const next = entries[i + 1];
    const segmentEnd = next ? next.startDate : checkOut;
    const segmentNights = getStayNights(segmentStart, segmentEnd);
    const segmentBase = roundCurrency(current.nightlyRate * segmentNights);
    baseAmount = roundCurrency(baseAmount + segmentBase);

    let segmentFeeTotal = 0;
    let segmentTaxTotal = 0;
    const appliesDirectTaxSetting = current.platform === "direct" && taxSettings?.mode === "separate" && taxSettings.rate > 0;
    const explicitTaxRuleExists = (current.charges ?? []).some((rule) => rule.category === "tax");
    const chargeRules = [
      ...(current.charges ?? []),
      ...(appliesDirectTaxSetting && !explicitTaxRuleExists
        ? [{ label: taxSettings.label, category: "tax" as const, type: "percent" as const, value: taxSettings.rate, basis: "base" as const }]
        : []),
    ];

    for (const rule of chargeRules) {
      const amount = applyCharge(rule, segmentBase, segmentFeeTotal, segmentTaxTotal, segmentNights);
      charges.push({ label: rule.label, category: rule.category, amount });
      if (rule.category === "fee") {
        segmentFeeTotal = roundCurrency(segmentFeeTotal + amount);
        feeTotal = roundCurrency(feeTotal + amount);
      } else {
        segmentTaxTotal = roundCurrency(segmentTaxTotal + amount);
        taxTotal = roundCurrency(taxTotal + amount);
      }
    }

    segmentStart = segmentEnd;
  }

  const taxIncludedInNightlyRate = entry.platform === "direct" && taxSettings?.mode === "inclusive" && taxSettings.rate > 0;
  const taxDisclosure = (() => {
    if (entry.platform !== "direct" || !taxSettings || taxSettings.mode === "none" || taxSettings.rate <= 0) return null;
    const percent = `${Math.round(taxSettings.rate * 10000) / 100}%`;
    if (taxSettings.mode === "inclusive") return `Direct nightly pricing includes ${percent} ${taxSettings.label}; no separate tax line is added.`;
    return `${percent} ${taxSettings.label} is collected separately on direct bookings.`;
  })();

  return {
    platform: entry.platform,
    checkIn,
    checkOut,
    nights,
    nightlyRate: entries.length === 1 ? entry.nightlyRate : roundCurrency(baseAmount / nights),
    currency,
    baseAmount,
    charges,
    feeTotal,
    taxTotal,
    total: roundCurrency(baseAmount + feeTotal + taxTotal),
    taxSettings: entry.platform === "direct" ? taxSettings ?? undefined : undefined,
    taxIncludedInNightlyRate,
    taxDisclosure,
    entry,
    entries,
  };
}

export function getStayPricing(
  platform: PricingPlatform,
  checkIn: string,
  checkOut: string,
  taxSettings: PricingTaxSettings | null = pricingTable.taxSettings ?? null
): CalculatedStayPricing | null {
  const entries = findPricingEntries(platform, checkIn, checkOut);
  if (entries.length === 0) return null;
  return calculateStayPricingFromEntries(entries, checkIn, checkOut, taxSettings);
}

export function getStayPricingComparison(checkIn: string, checkOut: string) {
  const direct = getStayPricing("direct", checkIn, checkOut);
  const airbnb = getStayPricing("airbnb", checkIn, checkOut);
  const vrbo = getStayPricing("vrbo", checkIn, checkOut);

  return {
    nights: getStayNights(checkIn, checkOut),
    direct,
    airbnb,
    vrbo,
  };
}

export function getSavingsPercentage(referenceTotal: number, directTotal: number): number {
  if (referenceTotal <= 0) return 0;
  return Math.round(((referenceTotal - directTotal) / referenceTotal) * 1000) / 10;
}
