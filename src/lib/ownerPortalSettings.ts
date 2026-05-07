import { PaymentMethodType, PropertyStatus, TaxCollectionMode } from "@prisma/client";
import { getPrismaClient } from "@/lib/db";

const PROPERTY_SLUG = "villa-la-percha";

export interface SiteSettingsRecord {
  id: string;
  name: string;
  domain: string;
  minStayNights: number;
  externalMatchReviewDelayDays: number;
  inquiryEnabled: boolean;
  paymentMethods: { stripe: boolean; zelle: boolean; venmo: boolean; cashApp: boolean };
  taxSettings: { mode: "inclusive" | "separate" | "none"; rate: number; label: string };
  aiReplyInstructions: string;
  globalAiReplyInstructions: string;
}

export interface PaymentSettingsRecord {
  primaryMethod: "Stripe" | "Zelle" | "Venmo" | "Cash App";
  depositPercent: number;
  finalDueDays: number;
  allowFallbacks: boolean;
}

async function ensureDefaultProperty() {
  const prisma = await getPrismaClient();
  const existing = await prisma.property.findUnique({
    where: { slug: PROPERTY_SLUG },
    include: { paymentMethods: true, paymentSettings: true },
  });

  if (existing) return existing;

  const owner = await prisma.owner.create({
    data: {
      displayName: "DirectStay Demo Owner",
      properties: {
        create: {
          slug: PROPERTY_SLUG,
          name: "Villa La Percha",
          status: PropertyStatus.LIVE,
          currency: "USD",
          timezone: "America/New_York",
          inquiryEnabled: true,
          taxCollectionMode: TaxCollectionMode.INCLUSIVE,
          taxRate: 0.12,
          taxLabel: "Turks and Caicos accommodation/tourism tax",
          minimumStayNights: 5,
        },
      },
    },
    include: {
      properties: {
        include: { paymentMethods: true, paymentSettings: true },
      },
    },
  });

  return owner.properties[0];
}

function emptyPaymentMethods() {
  return { stripe: false, zelle: false, venmo: false, cashApp: false };
}

function taxModeToRecord(value: TaxCollectionMode | string | null | undefined): SiteSettingsRecord["taxSettings"]["mode"] {
  const normalized = String(value || "INCLUSIVE").toLowerCase();
  if (normalized === "separate") return "separate";
  if (normalized === "none") return "none";
  return "inclusive";
}

function recordToTaxMode(value: SiteSettingsRecord["taxSettings"]["mode"]): TaxCollectionMode {
  if (value === "separate") return TaxCollectionMode.SEPARATE;
  if (value === "none") return TaxCollectionMode.NONE;
  return TaxCollectionMode.INCLUSIVE;
}

export function getGlobalAiReplyInstructions(): string {
  return (process.env.DIRECTSTAY_GLOBAL_AI_REPLY_INSTRUCTIONS || "").trim().slice(0, 4000);
}

export async function getSiteSettings(): Promise<SiteSettingsRecord> {
  const property = await ensureDefaultProperty();
  const paymentMethods = emptyPaymentMethods();

  for (const method of property.paymentMethods) {
    if (method.method === PaymentMethodType.STRIPE) paymentMethods.stripe = method.enabled;
    if (method.method === PaymentMethodType.ZELLE) paymentMethods.zelle = method.enabled;
    if (method.method === PaymentMethodType.VENMO) paymentMethods.venmo = method.enabled;
    if (method.method === PaymentMethodType.CASH_APP) paymentMethods.cashApp = method.enabled;
  }

  return {
    id: property.slug,
    name: property.name,
    domain: property.publicDomain || `directstay.app/${property.slug}`,
    minStayNights: property.minimumStayNights || 1,
    externalMatchReviewDelayDays: property.externalMatchReviewDelayDays || 3,
    inquiryEnabled: property.inquiryEnabled,
    paymentMethods,
    taxSettings: {
      mode: taxModeToRecord(property.taxCollectionMode),
      rate: Number(property.taxRate || 0),
      label: property.taxLabel || "Tax",
    },
    aiReplyInstructions: property.aiReplyInstructions || "",
    globalAiReplyInstructions: getGlobalAiReplyInstructions(),
  };
}

export async function updateSiteSettings(input: SiteSettingsRecord): Promise<SiteSettingsRecord> {
  const prisma = await getPrismaClient();
  const property = await ensureDefaultProperty();

  await prisma.property.update({
    where: { id: property.id },
    data: {
      name: input.name,
      publicDomain: input.domain,
      minimumStayNights: input.minStayNights,
      taxCollectionMode: recordToTaxMode(input.taxSettings?.mode || "inclusive"),
      taxRate: Math.max(0, Math.min(1, Number(input.taxSettings?.rate || 0))),
      taxLabel: String(input.taxSettings?.label || "Tax").trim().slice(0, 120),
      externalMatchReviewDelayDays: Math.max(1, Math.min(30, Number(input.externalMatchReviewDelayDays || 3))),
      inquiryEnabled: input.inquiryEnabled,
      aiReplyInstructions: String(input.aiReplyInstructions || "").trim().slice(0, 4000),
    },
  });

  const paymentMethodMap: Array<[PaymentMethodType, boolean]> = [
    [PaymentMethodType.STRIPE, input.paymentMethods.stripe],
    [PaymentMethodType.ZELLE, input.paymentMethods.zelle],
    [PaymentMethodType.VENMO, input.paymentMethods.venmo],
    [PaymentMethodType.CASH_APP, input.paymentMethods.cashApp],
  ];

  for (const [method, enabled] of paymentMethodMap) {
    await prisma.paymentMethod.upsert({
      where: { propertyId_method: { propertyId: property.id, method } },
      update: { enabled },
      create: {
        propertyId: property.id,
        method,
        enabled,
        isPrimary: false,
      },
    });
  }

  return getSiteSettings();
}

function labelToMethod(value: string): PaymentMethodType {
  switch (value) {
    case "Zelle":
      return PaymentMethodType.ZELLE;
    case "Venmo":
      return PaymentMethodType.VENMO;
    case "Cash App":
      return PaymentMethodType.CASH_APP;
    case "Stripe":
    default:
      return PaymentMethodType.STRIPE;
  }
}

function methodToLabel(value: PaymentMethodType): PaymentSettingsRecord["primaryMethod"] {
  switch (value) {
    case PaymentMethodType.ZELLE:
      return "Zelle";
    case PaymentMethodType.VENMO:
      return "Venmo";
    case PaymentMethodType.CASH_APP:
      return "Cash App";
    case PaymentMethodType.STRIPE:
    default:
      return "Stripe";
  }
}

export async function getPaymentSettings(): Promise<PaymentSettingsRecord> {
  const property = await ensureDefaultProperty();
  const primary = property.paymentMethods.find((method) => method.isPrimary)?.method || PaymentMethodType.STRIPE;

  return {
    primaryMethod: methodToLabel(primary),
    depositPercent: property.paymentSettings?.depositPercentage ?? 30,
    finalDueDays: property.paymentSettings?.finalPaymentDueDays ?? 30,
    allowFallbacks: property.paymentSettings?.allowManualFallbacks ?? true,
  };
}

export async function updatePaymentSettings(input: PaymentSettingsRecord): Promise<PaymentSettingsRecord> {
  const prisma = await getPrismaClient();
  const property = await ensureDefaultProperty();
  const primaryMethod = labelToMethod(input.primaryMethod);

  await prisma.paymentSetting.upsert({
    where: { propertyId: property.id },
    update: {
      depositPercentage: input.depositPercent,
      finalPaymentDueDays: input.finalDueDays,
      allowManualFallbacks: input.allowFallbacks,
    },
    create: {
      propertyId: property.id,
      depositPercentage: input.depositPercent,
      finalPaymentDueDays: input.finalDueDays,
      allowManualFallbacks: input.allowFallbacks,
      requireOwnerApprovalBeforePayment: true,
    },
  });

  const existingMethods = await prisma.paymentMethod.findMany({ where: { propertyId: property.id } });
  const allMethods = [PaymentMethodType.STRIPE, PaymentMethodType.ZELLE, PaymentMethodType.VENMO, PaymentMethodType.CASH_APP];

  for (const method of allMethods) {
    const existing = existingMethods.find((item) => item.method === method);
    if (existing) {
      await prisma.paymentMethod.update({ where: { id: existing.id }, data: { isPrimary: method === primaryMethod } });
    } else if (method === primaryMethod) {
      await prisma.paymentMethod.create({
        data: { propertyId: property.id, method, enabled: true, isPrimary: true },
      });
    }
  }

  return getPaymentSettings();
}
