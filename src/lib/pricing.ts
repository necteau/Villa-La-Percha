import { pricingTable, type PricingChargeRule, type PricingEntry, type PricingPlatform } from "@/data/pricingTable";

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
  entry: PricingEntry;
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

export function findPricingEntry(platform: PricingPlatform, checkIn: string, checkOut: string): PricingEntry | null {
  const nights = getStayNights(checkIn, checkOut);

  const matches = pricingTable.entries.filter((entry) => {
    if (entry.platform !== platform) return false;
    if (entry.startDate > checkIn) return false;
    if (entry.endDate < checkOut) return false;
    if (entry.minimumStayNights && nights < entry.minimumStayNights) return false;
    return true;
  });

  if (matches.length === 0) return null;

  return matches.sort((a, b) => {
    const spanA = getStayNights(a.startDate, a.endDate);
    const spanB = getStayNights(b.startDate, b.endDate);
    return spanA - spanB;
  })[0];
}

export function calculateStayPricing(entry: PricingEntry, checkIn: string, checkOut: string): CalculatedStayPricing {
  const nights = getStayNights(checkIn, checkOut);
  const currency = entry.currency ?? "USD";
  const baseAmount = roundCurrency(entry.nightlyRate * nights);
  const charges: AppliedCharge[] = [];

  let feeTotal = 0;
  let taxTotal = 0;

  for (const rule of entry.charges ?? []) {
    const amount = applyCharge(rule, baseAmount, feeTotal, taxTotal, nights);
    charges.push({ label: rule.label, category: rule.category, amount });

    if (rule.category === "fee") {
      feeTotal = roundCurrency(feeTotal + amount);
    } else {
      taxTotal = roundCurrency(taxTotal + amount);
    }
  }

  return {
    platform: entry.platform,
    checkIn,
    checkOut,
    nights,
    nightlyRate: entry.nightlyRate,
    currency,
    baseAmount,
    charges,
    feeTotal,
    taxTotal,
    total: roundCurrency(baseAmount + feeTotal + taxTotal),
    entry,
  };
}

export function getStayPricing(platform: PricingPlatform, checkIn: string, checkOut: string): CalculatedStayPricing | null {
  const entry = findPricingEntry(platform, checkIn, checkOut);
  if (!entry) return null;
  return calculateStayPricing(entry, checkIn, checkOut);
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
