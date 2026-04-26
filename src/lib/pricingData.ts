import path from "path";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync, readJsonFallback, writeJsonFallback } from "@/lib/fallbackOrchestrator";
import type { PricingChargeBasis, PricingEntry, PricingTable } from "@/data/pricingTable";

const FALLBACK_PATH = path.join(process.cwd(), "src/data/pricing-table.json");
const PROPERTY_SLUG = "villa-la-percha";

function canUseDatabase(): boolean {
  return canUseDatabaseSync();
}

const DEFAULT_PRICING_TABLE: PricingTable = { entries: [] };

async function readFallbackPricing(): Promise<PricingTable> {
  return readJsonFallback(FALLBACK_PATH, DEFAULT_PRICING_TABLE);
}

async function writeFallbackPricing(table: PricingTable) {
  await writeJsonFallback(FALLBACK_PATH, table);
}

function mapCharge(charge: {
  label: string;
  category: { toLowerCase(): string };
  chargeType: { toLowerCase(): string };
  value: { toString(): string } | number;
  basis: { toLowerCase(): string };
  perNight: boolean;
}) {
  return {
    label: charge.label,
    category: charge.category.toLowerCase() as "fee" | "tax",
    type: charge.chargeType.toLowerCase() as "fixed" | "percent",
    value: Number(charge.value),
    basis: charge.basis.toLowerCase() as PricingChargeBasis,
    perNight: charge.perNight,
  };
}

export async function listPricingEntries(): Promise<PricingEntry[]> {
  if (!canUseDatabase()) {
    return (await readFallbackPricing()).entries;
  }

  try {
    const prisma = await getPrismaClient();
    const property = await prisma.property.findUnique({ where: { slug: PROPERTY_SLUG } });
    if (!property) return (await readFallbackPricing()).entries;

    const rules = await prisma.pricingRule.findMany({
      where: { propertyId: property.id },
      include: { charges: true },
      orderBy: [{ platform: "asc" }, { startDate: "asc" }],
    });

    if (rules.length === 0) return (await readFallbackPricing()).entries;

    return rules.map((rule) => ({
      id: rule.id,
      platform: rule.platform.toLowerCase() as PricingEntry["platform"],
      startDate: rule.startDate.toISOString().slice(0, 10),
      endDate: rule.endDate.toISOString().slice(0, 10),
      nightlyRate: Number(rule.nightlyRate),
      currency: property.currency,
      minimumStayNights: rule.minimumStayNights ?? undefined,
      charges: rule.charges.map(mapCharge),
      notes: rule.notes ?? undefined,
    }));
  } catch {
    return (await readFallbackPricing()).entries;
  }
}

export async function updatePricingEntry(id: string, patch: Partial<PricingEntry>): Promise<PricingEntry | null> {
  if (!canUseDatabase()) {
    const table = await readFallbackPricing();
    const existing = table.entries.find((entry) => entry.id === id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    table.entries = table.entries.map((entry) => (entry.id === id ? updated : entry));
    await writeFallbackPricing(table);
    return updated;
  }

  try {
    const prisma = await getPrismaClient();
    const existing = await prisma.pricingRule.findUnique({ where: { id }, include: { property: true } });
    if (!existing) return null;

    const updated = await prisma.pricingRule.update({
      where: { id },
      data: {
        startDate: patch.startDate ? new Date(patch.startDate) : undefined,
        endDate: patch.endDate ? new Date(patch.endDate) : undefined,
        nightlyRate: patch.nightlyRate,
        minimumStayNights: patch.minimumStayNights,
        notes: patch.notes,
      },
      include: { property: true, charges: true },
    });

    return {
      id: updated.id,
      platform: updated.platform.toLowerCase() as PricingEntry["platform"],
      startDate: updated.startDate.toISOString().slice(0, 10),
      endDate: updated.endDate.toISOString().slice(0, 10),
      nightlyRate: Number(updated.nightlyRate),
      currency: updated.property.currency,
      minimumStayNights: updated.minimumStayNights ?? undefined,
      charges: updated.charges.map(mapCharge),
      notes: updated.notes ?? undefined,
    };
  } catch {
    const table = await readFallbackPricing();
    const existing = table.entries.find((entry) => entry.id === id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    table.entries = table.entries.map((entry) => (entry.id === id ? updated : entry));
    await writeFallbackPricing(table);
    return updated;
  }
}
