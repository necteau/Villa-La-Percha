import fs from 'fs';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, PricingPlatform, ChargeCategory, ChargeType, ChargeBasis } from '@prisma/client';

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), quiet: true });
dotenvConfig({ path: path.join(process.cwd(), '.env'), quiet: true });

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const pricingPath = path.join(process.cwd(), 'src/data/pricing-table.json');
const backupDir = path.join(process.cwd(), 'marketing', 'pricing-intel');
const backupPath = path.join(backupDir, `vrbo-pricing-db-backup-before-import-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

const enumPlatform = (platform) => PricingPlatform[String(platform).toUpperCase()];
const enumCategory = (category) => ChargeCategory[String(category).toUpperCase()];
const enumType = (type) => ChargeType[String(type).toUpperCase()];
const enumBasis = (basis) => ChargeBasis[String(basis || 'base').toUpperCase()];

try {
  const table = JSON.parse(fs.readFileSync(pricingPath, 'utf8'));
  const entries = table.entries.filter((entry) => entry.platform === 'vrbo');
  if (entries.length !== 13) throw new Error(`Expected 13 VRBO entries in pricing-table.json, found ${entries.length}`);

  const property = await prisma.property.findUnique({ where: { slug: 'villa-la-percha' } });
  if (!property) throw new Error('Property villa-la-percha not found');

  const existing = await prisma.pricingRule.findMany({
    where: { propertyId: property.id, platform: PricingPlatform.VRBO },
    include: { charges: true },
    orderBy: { startDate: 'asc' },
  });
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2) + '\n');

  await prisma.$transaction(async (tx) => {
    await tx.pricingCharge.deleteMany({ where: { pricingRule: { propertyId: property.id, platform: PricingPlatform.VRBO } } });
    await tx.pricingRule.deleteMany({ where: { propertyId: property.id, platform: PricingPlatform.VRBO } });

    for (const entry of entries) {
      await tx.pricingRule.create({
        data: {
          id: entry.id,
          propertyId: property.id,
          platform: enumPlatform(entry.platform),
          startDate: new Date(`${entry.startDate}T00:00:00.000Z`),
          endDate: new Date(`${entry.endDate}T00:00:00.000Z`),
          nightlyRate: entry.nightlyRate,
          minimumStayNights: entry.minimumStayNights ?? null,
          notes: entry.notes ?? null,
          charges: {
            create: (entry.charges || []).map((charge) => ({
              label: charge.label,
              category: enumCategory(charge.category),
              chargeType: enumType(charge.type),
              value: charge.value,
              basis: enumBasis(charge.basis),
              perNight: Boolean(charge.perNight),
            })),
          },
        },
      });
    }
  });

  const updated = await prisma.pricingRule.findMany({
    where: { propertyId: property.id, platform: PricingPlatform.VRBO },
    include: { charges: true },
    orderBy: { startDate: 'asc' },
  });
  console.log(JSON.stringify({
    property: property.slug,
    backupPath,
    deletedVrboRules: existing.length,
    importedVrboRules: updated.length,
    rules: updated.map((rule) => ({
      id: rule.id,
      startDate: rule.startDate.toISOString().slice(0, 10),
      endDate: rule.endDate.toISOString().slice(0, 10),
      nightlyRate: Number(rule.nightlyRate),
      charges: rule.charges.length,
    })),
  }, null, 2));
} finally {
  await prisma.$disconnect();
  await pool.end();
}
