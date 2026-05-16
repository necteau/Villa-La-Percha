import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getPrismaClient } from "@/lib/db";
import { triggerInternalOpsWake } from "@/lib/internalWake";
import type { ContractExecutionStatus, PlatformLead, PlatformLeadArtifactStatus, PlatformLeadArtifactType, PlatformLeadStatus, PreviewBuildStatus, Prisma } from "@prisma/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+\..+/i;

export type PlatformLeadInput = {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  propertyName?: string;
  propertyCount?: number;
  propertyLocation?: string;
  currentWebsite?: string;
  desiredCustomDomain?: string;
  pms?: string;
  launchTimeline?: string;
  goal?: string;
  message?: string;
  source?: string;
};

export type PlatformLeadValidation =
  | { ok: true; data: PlatformLeadInput }
  | { ok: false; error: string };

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

export function validatePlatformLeadInput(body: Record<string, unknown>): PlatformLeadValidation {
  const fullName = cleanString(body.fullName, 140);
  const email = cleanString(body.email, 180)?.toLowerCase();
  const company = cleanString(body.company, 180);
  const propertyName = cleanString(body.propertyName, 180);
  const propertyLocation = cleanString(body.propertyLocation, 180);
  const goal = cleanString(body.goal, 220);

  const phone = cleanString(body.phone, 80);

  if (!fullName || !email || !phone || !propertyName || !propertyLocation) {
    return { ok: false, error: "Please include your name, email, phone number, property name, and property location." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const propertyCountRaw = body.propertyCount;
  const propertyCount = propertyCountRaw === undefined || propertyCountRaw === "" ? undefined : Number(propertyCountRaw);
  if (propertyCount !== undefined && (!Number.isInteger(propertyCount) || propertyCount < 1 || propertyCount > 1000)) {
    return { ok: false, error: "Please enter a valid property count." };
  }

  const currentWebsite = cleanString(body.currentWebsite, 500);
  if (currentWebsite && !URL_REGEX.test(currentWebsite)) {
    return { ok: false, error: "Please include a full website or listing URL starting with http:// or https://." };
  }

  return {
    ok: true,
    data: {
      fullName,
      email,
      phone,
      company,
      propertyName,
      propertyCount,
      propertyLocation,
      currentWebsite,
      desiredCustomDomain: cleanString(body.desiredCustomDomain, 180),
      pms: cleanString(body.pms, 160),
      launchTimeline: cleanString(body.launchTimeline, 160),
      goal,
      message: cleanString(body.message, 4000),
      source: cleanString(body.source, 80) || "direct",
    },
  };
}

export async function createPlatformLead(input: PlatformLeadInput) {
  const prisma = await getPrismaClient();
  return prisma.platformLead.create({ data: input });
}

export async function createPlatformLeadWithIntakeJob(input: PlatformLeadInput) {
  const prisma = await getPrismaClient();
  const { lead, job } = await prisma.$transaction(async (tx) => {
    const lead = await tx.platformLead.create({ data: input });
    const job = await tx.platformLeadProcessingJob.create({ data: { platformLeadId: lead.id, kind: "INTAKE" } });
    return { lead, job };
  });
  await triggerInternalOpsWake({ kind: "platform_lead_intake", id: job.id, label: lead.id });
  return { lead, job };
}

export async function enqueuePlatformLeadIntakeJob(leadId: string) {
  const prisma = await getPrismaClient();
  const existing = await prisma.platformLeadProcessingJob.findFirst({
    where: { platformLeadId: leadId, kind: "INTAKE", status: { in: ["PENDING", "PROCESSING", "COMPLETED"] } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;
  const job = await prisma.platformLeadProcessingJob.create({ data: { platformLeadId: leadId, kind: "INTAKE" } });
  await triggerInternalOpsWake({ kind: "platform_lead_intake", id: job.id, label: leadId });
  return job;
}

export async function processPlatformLeadIntakeJob(jobId: string) {
  const prisma = await getPrismaClient();
  const job = await prisma.platformLeadProcessingJob.findUnique({ where: { id: jobId } });
  if (!job || job.status === "COMPLETED") return null;
  await prisma.platformLeadProcessingJob.update({ where: { id: jobId }, data: { status: "PROCESSING", attempts: { increment: 1 }, lastError: null } });
  try {
    const result = await processPlatformLeadIntakeEvent(job.platformLeadId);
    const completed = await prisma.platformLeadProcessingJob.update({ where: { id: jobId }, data: { status: "COMPLETED", processedAt: new Date(), lastError: null } });
    return { job: completed, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.platformLeadProcessingJob.update({ where: { id: jobId }, data: { status: "FAILED", lastError: message.slice(0, 2000) } });
    throw error;
  }
}

function summarizePlatformLead(lead: PlatformLead) {
  const source = lead.currentWebsite ? `Source/listing: ${lead.currentWebsite}` : "Source/listing: not provided yet";
  const note = lead.message ? `Owner note: ${lead.message}` : "Owner note: none yet";
  return [
    `Lead: ${lead.fullName} <${lead.email}>${lead.phone ? ` / ${lead.phone}` : ""}`,
    `Property: ${lead.propertyName || "Unnamed property"} in ${lead.propertyLocation || "location not provided"}`,
    source,
    note,
  ].join("\n");
}

function isObviousSpam(lead: PlatformLead) {
  const haystack = [lead.fullName, lead.email, lead.phone, lead.propertyName, lead.propertyLocation, lead.currentWebsite, lead.message]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const spamSignals = ["casino", "crypto", "seo backlink", "guest post", "loan offer", "forex", "viagra"];
  const matched = spamSignals.find((signal) => haystack.includes(signal));
  return matched ? `Matched spam signal: ${matched}` : null;
}

export async function processPlatformLeadIntakeEvent(leadId: string) {
  const prisma = await getPrismaClient();
  const lead = await prisma.platformLead.findUnique({
    where: { id: leadId },
    include: { artifacts: { where: { type: "LEAD_BRIEF" }, take: 1 } },
  });
  if (!lead || lead.artifacts.length > 0 || lead.email.endsWith("@example.com") || lead.source.startsWith("qa")) return null;

  const spamReason = isObviousSpam(lead);
  if (spamReason) {
    const updated = await updatePlatformLeadOps({
      leadId,
      status: "SPAM",
      spamReason,
      firstRead: `Obvious spam. ${spamReason}`,
      nextAction: "No owner notification. Leave recoverable in spam queue.",
    });
    await recordAdminAuditEvent({
      actorEmail: "bishop@directstay.internal",
      actorRole: "ADMIN",
      action: "admin.platform_lead.event_spam_filtered",
      entityType: "PlatformLead",
      entityId: leadId,
      metadata: { spamReason },
    });
    return { lead: updated, spam: true };
  }

  const summary = summarizePlatformLead(lead);
  const firstRead = `Plausible single-property owner lead. ${lead.propertyName || "The property"} is in ${lead.propertyLocation || "an unspecified market"}. ${lead.currentWebsite ? "There is a public listing/source to review before responding." : "Ask for a current listing or photos before any Preview Build."}`;
  const nextAction = "Review Lead Brief and approve/edit the first-response draft before any external email is sent.";
  const leadBrief = `Lead Brief\n\n${summary}\n\nFirst read:\n${firstRead}\n\nRecommended next step:\n${nextAction}`;
  const responseDraft = `Subject: Re: DirectStay site request for ${lead.propertyName || "your property"}\n\nHi ${lead.fullName.split(" ")[0] || lead.fullName},\n\nThanks for reaching out — ${lead.propertyName ? `${lead.propertyName} looks like exactly the kind of property` : "your property sounds like the kind of rental"} DirectStay is built for: a dedicated direct-booking presence that helps owners keep more of the guest relationship instead of handing it all to the big marketplaces.\n\nI’d love to take a closer look and put together a thoughtful next step. If you have a current Airbnb/VRBO/direct listing, a photo folder, or even a rough brain dump about what makes the place special, send that over and I’ll use it to shape the initial direction.\n\nBest,\nJaimal\n\n[Draft only — requires Jaimal approval before sending.]`;

  const [briefArtifact, draftArtifact, updatedLead] = await prisma.$transaction([
    prisma.platformLeadArtifact.create({
      data: { platformLeadId: leadId, type: "LEAD_BRIEF", status: "NEEDS_APPROVAL", title: `Lead Brief — ${lead.propertyName || lead.fullName}`, body: leadBrief, createdByEmail: "bishop@directstay.internal" },
    }),
    prisma.platformLeadArtifact.create({
      data: { platformLeadId: leadId, type: "FIRST_RESPONSE_DRAFT", status: "NEEDS_APPROVAL", title: `First response draft — ${lead.propertyName || lead.fullName}`, body: responseDraft, createdByEmail: "bishop@directstay.internal" },
    }),
    prisma.platformLead.update({ where: { id: leadId }, data: { firstRead, nextAction, updatedAt: new Date() } }),
  ]);
  await recordAdminAuditEvent({
    actorEmail: "bishop@directstay.internal",
    actorRole: "ADMIN",
    action: "admin.platform_lead.event_processed",
    entityType: "PlatformLead",
    entityId: leadId,
    metadata: { briefArtifactId: briefArtifact.id, draftArtifactId: draftArtifact.id },
  });
  return { lead: updatedLead, briefArtifact, draftArtifact, spam: false };
}

export async function getAdminPlatformLeads() {
  const prisma = await getPrismaClient();
  return prisma.platformLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      artifacts: { orderBy: { createdAt: "desc" }, take: 2 },
      previewBuilds: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function getAdminPreviewBuilds() {
  const prisma = await getPrismaClient();
  const previews = await prisma.previewBuild.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      platformLead: {
        select: {
          id: true,
          fullName: true,
          email: true,
          propertyName: true,
          propertyLocation: true,
          status: true,
        },
      },
    },
  });
  const grouped = new Map<string, (typeof previews)[number] & { duplicatePreviewCount: number }>();
  for (const preview of previews) {
    const propertyName = preview.platformLead.propertyName || preview.propertyName || "";
    const location = preview.platformLead.propertyLocation || preview.location || "";
    const key = `${propertyName.trim().toLowerCase()}|${location.trim().toLowerCase()}` || preview.platformLeadId;
    const existing = grouped.get(key);
    if (existing) {
      existing.duplicatePreviewCount += 1;
    } else {
      grouped.set(key, { ...preview, duplicatePreviewCount: 1 });
    }
  }
  return Array.from(grouped.values());
}

export async function getAdminPlatformLead(leadId: string) {
  const prisma = await getPrismaClient();
  return prisma.platformLead.findFirst({
    where: { id: leadId },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      artifacts: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      previewBuilds: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      processingJobs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function updatePlatformLeadStatus(leadId: string, status: PlatformLeadStatus) {
  const prisma = await getPrismaClient();
  return prisma.platformLead.update({
    where: { id: leadId },
    data: { status },
  });
}

export async function addPlatformLeadNote(input: {
  leadId: string;
  body: string;
  authorUserId?: string | null;
  authorEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  return prisma.platformLeadNote.create({
    data: {
      platformLeadId: input.leadId,
      body: input.body.trim().slice(0, 4000),
      authorUserId: input.authorUserId ?? undefined,
      authorEmail: input.authorEmail ?? undefined,
    },
  });
}


export async function updatePlatformLeadOps(input: {
  leadId: string;
  status?: PlatformLeadStatus;
  firstRead?: string | null;
  nextAction?: string | null;
  nextFollowUpAt?: Date | null;
  assignedToUserId?: string | null;
  source?: string | null;
  spamReason?: string | null;
  pricingSetupFeeCents?: number | null;
  pricingMonthlyFeeCents?: number | null;
  pricingCommissionBps?: number | null;
  pricingPaymentProcessingBps?: number | null;
  pricingNotes?: string | null;
  contractStatus?: ContractExecutionStatus;
  contractStorageUrl?: string | null;
  launchChecklist?: Prisma.InputJsonValue;
}) {
  const prisma = await getPrismaClient();
  const data = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.firstRead !== undefined ? { firstRead: input.firstRead?.trim().slice(0, 2000) || null } : {}),
    ...(input.nextAction !== undefined ? { nextAction: input.nextAction?.trim().slice(0, 2000) || null } : {}),
    ...(input.nextFollowUpAt !== undefined ? { nextFollowUpAt: input.nextFollowUpAt } : {}),
    ...(input.assignedToUserId !== undefined ? { assignedToUserId: input.assignedToUserId?.trim() || null } : {}),
    ...(input.source !== undefined ? { source: input.source?.trim().slice(0, 80) || "direct" } : {}),
    ...(input.spamReason !== undefined ? { spamReason: input.spamReason?.trim().slice(0, 1000) || null, spamReviewedAt: new Date() } : {}),
    ...(input.pricingSetupFeeCents !== undefined ? { pricingSetupFeeCents: input.pricingSetupFeeCents } : {}),
    ...(input.pricingMonthlyFeeCents !== undefined ? { pricingMonthlyFeeCents: input.pricingMonthlyFeeCents } : {}),
    ...(input.pricingCommissionBps !== undefined ? { pricingCommissionBps: input.pricingCommissionBps } : {}),
    ...(input.pricingPaymentProcessingBps !== undefined ? { pricingPaymentProcessingBps: input.pricingPaymentProcessingBps } : {}),
    ...(input.pricingNotes !== undefined ? { pricingNotes: input.pricingNotes?.trim().slice(0, 2000) || null } : {}),
    ...(input.contractStatus ? {
      contractStatus: input.contractStatus,
      ...(input.contractStatus === "SENT" ? { contractSentAt: new Date() } : {}),
      ...(input.contractStatus === "SIGNED" || input.contractStatus === "COUNTERSIGNED" ? { contractSignedAt: new Date() } : {}),
    } : {}),
    ...(input.contractStorageUrl !== undefined ? { contractStorageUrl: input.contractStorageUrl?.trim().slice(0, 500) || null } : {}),
    ...(input.launchChecklist !== undefined ? { launchChecklist: input.launchChecklist } : {}),
  };
  return prisma.platformLead.update({ where: { id: input.leadId }, data });
}

export async function createPlatformLeadArtifact(input: {
  leadId: string;
  type: PlatformLeadArtifactType;
  status?: PlatformLeadArtifactStatus;
  title: string;
  body: string;
  createdByEmail?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  const prisma = await getPrismaClient();
  return prisma.platformLeadArtifact.create({
    data: {
      platformLeadId: input.leadId,
      type: input.type,
      status: input.status ?? "DRAFT",
      title: input.title.trim().slice(0, 180),
      body: input.body.trim().slice(0, 12000),
      metadata: input.metadata ?? undefined,
      createdByEmail: input.createdByEmail ?? undefined,
    },
  });
}

function formatPricingDollars(cents: number | null) {
  if (cents == null) return "TBD";
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatBps(bps: number | null) {
  if (bps == null) return "TBD";
  return `${(bps / 100).toFixed(2).replace(/\.00$/, "")}%`;
}

export async function createPlatformLeadProposalArtifacts(input: {
  leadId: string;
  createdByEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  const lead = await prisma.platformLead.findUnique({
    where: { id: input.leadId },
    include: {
      artifacts: { orderBy: { createdAt: "desc" }, take: 20 },
      previewBuilds: { orderBy: { updatedAt: "desc" }, take: 3 },
      notes: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!lead) throw new Error("PlatformLead not found");

  const activeProposal = lead.artifacts.find((artifact) => artifact.type === "PROPOSAL_DRAFT" && !["REJECTED", "SUPERSEDED"].includes(artifact.status));
  if (activeProposal) return { created: false, artifacts: [], existingProposalId: activeProposal.id };

  const property = lead.propertyName || lead.company || "the property";
  const firstName = lead.fullName.split(" ")[0] || lead.fullName;
  const preview = lead.previewBuilds[0];
  const latestBrief = lead.artifacts.find((artifact) => artifact.type === "LEAD_BRIEF");
  const setupFee = formatPricingDollars(lead.pricingSetupFeeCents);
  const monthlyFee = formatPricingDollars(lead.pricingMonthlyFeeCents);
  const commission = formatBps(lead.pricingCommissionBps);
  const processing = formatBps(lead.pricingPaymentProcessingBps);

  const rationale = `Proposal Rationale\n\nLead: ${lead.fullName} <${lead.email}>\nProperty: ${property}${lead.propertyLocation ? ` in ${lead.propertyLocation}` : ""}\nStatus: ${lead.status}\n\nWhy this is proposal-ready:\n- First read: ${lead.firstRead || "No first read saved yet; review before sending."}\n- Next action: ${lead.nextAction || "No next action saved."}\n- Preview Build: ${preview ? `/p/${preview.slug} (${preview.status.replaceAll("_", " ")})` : "No Preview Build yet; consider creating one before sending."}\n- Current source/listing: ${lead.currentWebsite || "Not provided."}\n\nRecommended commercial terms:\n- Setup fee: ${setupFee}\n- Monthly fee: ${monthlyFee}\n- Direct booking commission: ${commission}\n- Payment processing pass-through: ${processing}\n${lead.pricingNotes ? `\nPricing notes:\n${lead.pricingNotes}\n` : ""}\nRisk / review notes:\n- Confirm Jaimal is comfortable with terms before sending.\n- Confirm preview assumptions against owner-provided truth before launch.\n- No external email is sent by this artifact; approval is required before any outreach.`;

  const proposalDraft = `Subject: DirectStay proposal for ${property}\n\nHi ${firstName},\n\nThanks again for sharing the details on ${property}. Based on what you sent over, I think DirectStay could be a strong fit: a dedicated direct-booking presence that positions the property as its own hospitality brand, gives you a cleaner place to send repeat guests, and reduces dependence on marketplace fees over time.\n\nHere’s the proposed starting structure:\n\n- Setup/build fee: ${setupFee}\n- Monthly platform/support fee: ${monthlyFee}\n- Direct booking commission: ${commission}\n- Payment processing: ${processing} pass-through where applicable\n\n${preview ? `I also put together a working Preview Build here for review:\n${preview.slug.startsWith("http") ? preview.slug : `https://directstay.app/p/${preview.slug}`}\n\n` : "The next step would be a Preview Build so you can see the direction before anything is launched.\n\n"}The preview is intentionally not a live booking site yet. Before launch, we would confirm the final property details, remove any owner-facing callouts, execute the agreement, and complete the launch checklist.\n\nIf this direction feels right, the next step is a quick approval on the proposed terms and then we can move into onboarding/refinement.\n\nBest,\nJaimal\n\n[Draft only — requires Jaimal approval before sending.]`;

  const artifacts = await prisma.$transaction([
    prisma.platformLeadArtifact.create({
      data: { platformLeadId: lead.id, type: "PROPOSAL_RATIONALE", status: "NEEDS_APPROVAL", title: `Proposal Rationale — ${property}`, body: rationale, createdByEmail: input.createdByEmail ?? "bishop@directstay.internal" },
    }),
    prisma.platformLeadArtifact.create({
      data: { platformLeadId: lead.id, type: "PROPOSAL_DRAFT", status: "NEEDS_APPROVAL", title: `Proposal Draft — ${property}`, body: proposalDraft, createdByEmail: input.createdByEmail ?? "bishop@directstay.internal" },
    }),
    prisma.platformLead.update({ where: { id: lead.id }, data: { status: lead.status === "NEW" ? "QUALIFIED" : lead.status, nextAction: "Review proposal rationale and approve/edit proposal draft before sending.", updatedAt: new Date() } }),
  ]);

  await recordAdminAuditEvent({
    actorEmail: input.createdByEmail ?? "bishop@directstay.internal",
    actorRole: "ADMIN",
    action: "admin.platform_lead.proposal_artifacts_generated",
    entityType: "PlatformLead",
    entityId: lead.id,
    metadata: { rationaleArtifactId: artifacts[0].id, proposalArtifactId: artifacts[1].id, sourceBriefId: latestBrief?.id ?? null },
  });
  return { created: true, artifacts: artifacts.slice(0, 2) };
}

export async function createPlatformLeadOnboardingArtifacts(input: {
  leadId: string;
  createdByEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  const lead = await prisma.platformLead.findUnique({
    where: { id: input.leadId },
    include: {
      artifacts: { orderBy: { createdAt: "desc" }, take: 30 },
      previewBuilds: { orderBy: { updatedAt: "desc" }, take: 3 },
      notes: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  if (!lead) throw new Error("PlatformLead not found");

  const activeOnboarding = lead.artifacts.find((artifact) => artifact.type === "ONBOARDING_EMAIL_DRAFT" && !["REJECTED", "SUPERSEDED"].includes(artifact.status));
  if (activeOnboarding) return { created: false, artifacts: [], existingOnboardingId: activeOnboarding.id };

  const property = lead.propertyName || lead.company || "the property";
  const firstName = lead.fullName.split(" ")[0] || lead.fullName;
  const preview = lead.previewBuilds[0];
  const proposal = lead.artifacts.find((artifact) => artifact.type === "PROPOSAL_DRAFT" && ["APPROVED", "SENT"].includes(artifact.status));
  const recentNotes = lead.notes.map((note) => `- ${note.createdAt.toISOString().slice(0, 10)} ${note.authorEmail || "Admin"}: ${note.body}`).join("\n") || "- No internal notes yet.";

  const onboardingBrief = `Onboarding Brief\n\nLead: ${lead.fullName} <${lead.email}>${lead.phone ? ` / ${lead.phone}` : ""}\nProperty: ${property}${lead.propertyLocation ? ` in ${lead.propertyLocation}` : ""}\nContract status: ${lead.contractStatus.replaceAll("_", " ")}\nPreview Build: ${preview ? `https://directstay.app/p/${preview.slug} (${preview.status.replaceAll("_", " ")})` : "No Preview Build yet."}\nApproved proposal: ${proposal ? `${proposal.title} (${proposal.status})` : "No approved/sent proposal draft found; confirm before onboarding."}\n\nKnown source/listing:\n${lead.currentWebsite || "Not provided."}\n\nOwner-provided notes/message:\n${lead.message || "None yet."}\n\nRecent internal notes:\n${recentNotes}\n\nOnboarding collection priorities:\n- Casual owner brain dump: what makes the home special, guest profile, favorite details, house quirks, local recommendations.\n- Photos/video: best existing galleries, Dropbox/Google Drive/iCloud links, any owner-shot photos that feel authentic.\n- Operational truth: bedroom/bath layout, occupancy, amenities, rules, parking/access, check-in flow, pool/beach/HOA details.\n- Commercial truth: seasonality, minimum stays, taxes/fees, payment preferences, refund/cancellation policy, direct-booking constraints.\n- Launch blockers: missing contract details, unavailable dates, compliance/tax questions, domain/email ownership.\n\nLaunch gate reminder:\nDo not convert this into a live bookable site until the launch readiness checklist is complete and Jaimal gives final launch approval.`;

  const onboardingEmailDraft = `Subject: Next step for ${property}: a quick owner brain dump\n\nHi ${firstName},\n\nGreat — the next step is to turn the preview/proposal direction into something that feels genuinely true to ${property}. No formal questionnaire needed. A casual brain dump is perfect.\n\nWhen you have a moment, send over whatever is easiest:\n\n- A link to your best current photo folder or listing gallery\n- What guests usually love most about the property\n- Any details that make the stay special, quirky, or memorable\n- Bedroom/bath layout, occupancy, house rules, and must-know amenities\n- Local recommendations you personally stand behind\n- Any operational details we should avoid guessing about\n\nMessy is fine. Bullet points, voice-note style notes, links, screenshots — all useful. I’ll turn it into a cleaner onboarding brief and we’ll refine from there before anything goes live.\n\nBest,\nJaimal\n\n[Draft only — requires Jaimal approval before sending.]`;

  const artifacts = await prisma.$transaction([
    prisma.platformLeadArtifact.create({
      data: { platformLeadId: lead.id, type: "ONBOARDING_BRIEF", status: "NEEDS_APPROVAL", title: `Onboarding Brief — ${property}`, body: onboardingBrief, createdByEmail: input.createdByEmail ?? "bishop@directstay.internal" },
    }),
    prisma.platformLeadArtifact.create({
      data: { platformLeadId: lead.id, type: "ONBOARDING_EMAIL_DRAFT", status: "NEEDS_APPROVAL", title: `Owner Brain Dump Request — ${property}`, body: onboardingEmailDraft, createdByEmail: input.createdByEmail ?? "bishop@directstay.internal" },
    }),
    prisma.platformLead.update({ where: { id: lead.id }, data: { nextAction: "Review onboarding brief and approve/edit owner brain-dump request before sending.", updatedAt: new Date() } }),
  ]);

  await recordAdminAuditEvent({
    actorEmail: input.createdByEmail ?? "bishop@directstay.internal",
    actorRole: "ADMIN",
    action: "admin.platform_lead.onboarding_artifacts_generated",
    entityType: "PlatformLead",
    entityId: lead.id,
    metadata: { onboardingBriefId: artifacts[0].id, onboardingEmailDraftId: artifacts[1].id, sourceProposalId: proposal?.id ?? null },
  });
  return { created: true, artifacts: artifacts.slice(0, 2) };
}

export async function createPlatformLeadOwnerAgreementArtifact(input: {
  leadId: string;
  createdByEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  const lead = await prisma.platformLead.findUnique({
    where: { id: input.leadId },
    include: {
      artifacts: { orderBy: { createdAt: "desc" }, take: 30 },
      previewBuilds: { orderBy: { updatedAt: "desc" }, take: 3 },
      notes: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  if (!lead) throw new Error("PlatformLead not found");

  const activeAgreement = lead.artifacts.find((artifact) => artifact.type === "OWNER_PLATFORM_AGREEMENT" && !["REJECTED", "SUPERSEDED"].includes(artifact.status));
  if (activeAgreement) return { created: false, artifacts: [], existingAgreementId: activeAgreement.id };

  const property = lead.propertyName || lead.company || "the property";
  const preview = lead.previewBuilds[0];
  const proposal = lead.artifacts.find((artifact) => artifact.type === "PROPOSAL_DRAFT" && ["APPROVED", "SENT"].includes(artifact.status));
  const setupFee = formatPricingDollars(lead.pricingSetupFeeCents);
  const monthlyFee = formatPricingDollars(lead.pricingMonthlyFeeCents);
  const commission = formatBps(lead.pricingCommissionBps);
  const processing = formatBps(lead.pricingPaymentProcessingBps);
  const recentNotes = lead.notes.map((note) => `- ${note.createdAt.toISOString().slice(0, 10)} ${note.authorEmail || "Admin"}: ${note.body}`).join("\n") || "- No internal notes yet.";

  const body = `DirectStay Owner / Platform Agreement Draft\n\nDraft only for Jaimal/counsel review. Not legal advice. Do not send, present as final, or enable signature flow until explicitly approved.\n\nLead / Owner\n- Owner contact: ${lead.fullName} <${lead.email}>${lead.phone ? ` / ${lead.phone}` : ""}\n- Property: ${property}${lead.propertyLocation ? ` in ${lead.propertyLocation}` : ""}\n- Source/listing: ${lead.currentWebsite || "Not provided"}\n- Preview Build: ${preview ? `https://directstay.app/p/${preview.slug} (${preview.status.replaceAll("_", " ")})` : "No Preview Build recorded"}\n- Proposal artifact: ${proposal ? `${proposal.title} (${proposal.status})` : "No approved/sent proposal draft found; review commercial acceptance before sending an agreement."}\n\nBusiness Terms To Confirm\n- Setup/build fee: ${setupFee}\n- Monthly platform/support fee: ${monthlyFee}\n- Direct booking commission: ${commission}\n- Payment processing pass-through: ${processing}\n${lead.pricingNotes ? `- Pricing notes: ${lead.pricingNotes}\n` : ""}\n\nOperating Sequence\n1. Capture owner acceptance evidence in a private note before relying on this draft.\n2. Review legal entity, address, governing law, venue, service scope, payment/tax responsibilities, and signature method.\n3. Jaimal/counsel must approve the owner-facing version before manual send.\n4. Mark contract status SENT only after manual send; SIGNED only after owner signature; COUNTERSIGNED only after DirectStay execution.\n5. Launch remains blocked until contractExecuted and all other launch checklist gates are true.\n\nAgreement Body Starter\nUse directstay/docs/directstay-owner-platform-agreement-draft.md as the canonical base text. Merge the confirmed business terms above into the final statement of work or commercial terms section.\n\nRecent Internal Notes\n${recentNotes}`;

  const artifacts = await prisma.$transaction([
    prisma.platformLeadArtifact.create({
      data: { platformLeadId: lead.id, type: "OWNER_PLATFORM_AGREEMENT", status: "NEEDS_APPROVAL", title: `Owner Platform Agreement Draft — ${property}`, body, createdByEmail: input.createdByEmail ?? "bishop@directstay.internal" },
    }),
    prisma.platformLead.update({ where: { id: lead.id }, data: { contractStatus: lead.contractStatus === "NOT_STARTED" ? "DRAFTED" : lead.contractStatus, nextAction: "Review owner/platform agreement draft with Jaimal/counsel before any manual send or signature flow.", updatedAt: new Date() } }),
  ]);

  await recordAdminAuditEvent({
    actorEmail: input.createdByEmail ?? "bishop@directstay.internal",
    actorRole: "ADMIN",
    action: "admin.platform_lead.owner_agreement_artifact_generated",
    entityType: "PlatformLead",
    entityId: lead.id,
    metadata: { agreementArtifactId: artifacts[0].id, sourceProposalId: proposal?.id ?? null },
  });
  return { created: true, artifacts: artifacts.slice(0, 1) };
}

export async function updatePlatformLeadArtifactStatus(input: {
  artifactId: string;
  status: PlatformLeadArtifactStatus;
  approvedByEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  const artifact = await prisma.platformLeadArtifact.findUnique({
    where: { id: input.artifactId },
    select: { id: true, status: true, type: true },
  });
  if (!artifact) throw new Error("PlatformLeadArtifact not found");
  if (artifact.type === "OWNER_PLATFORM_AGREEMENT" && input.status === "SENT" && artifact.status !== "APPROVED") {
    throw new Error("Owner platform agreement drafts must be approved before they can be marked sent manually.");
  }

  return prisma.platformLeadArtifact.update({
    where: { id: input.artifactId },
    data: {
      status: input.status,
      ...(input.status === "APPROVED" ? { approvedAt: new Date(), approvedByEmail: input.approvedByEmail ?? undefined } : {}),
      ...(input.status === "SENT" ? { sentAt: new Date() } : {}),
    },
  });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "property";
}

export async function createPreviewBuild(input: {
  leadId: string;
  propertyName: string;
  location: string;
  sourceUrls: string[];
  heroTitle?: string | null;
  positioning?: string | null;
}) {
  const prisma = await getPrismaClient();
  const token = Math.random().toString(36).slice(2, 8);
  return prisma.previewBuild.create({
    data: {
      platformLeadId: input.leadId,
      slug: `${slugify(input.propertyName)}-${token}`,
      propertyName: input.propertyName.trim().slice(0, 180),
      location: input.location.trim().slice(0, 180),
      sourceUrls: input.sourceUrls.map((url) => url.trim()).filter(Boolean).slice(0, 8),
      heroTitle: input.heroTitle?.trim().slice(0, 180) || null,
      positioning: input.positioning?.trim().slice(0, 500) || null,
      ownerCallouts: [
        { label: "Brand positioning", body: "This preview frames the property as its own hospitality brand rather than another OTA listing." },
        { label: "Owner-specific onboarding", body: "During onboarding, DirectStay gathers your property and location knowledge so the final site feels genuinely tailored." },
        { label: "Direct relationship", body: "The inquiry section is disabled in preview, but the live version is designed to keep guest relationships direct." }
      ],
    },
  });
}

const requiredPreviewReadyArtifacts: PlatformLeadArtifactType[] = [
  "PREVIEW_PHOTO_GEO_AUDIT",
  "PREVIEW_DESIGN_BRIEF",
  "PREVIEW_FACT_REGISTER",
  "PREVIEW_ASSUMPTION_REGISTER",
];

function activeArtifact(artifact: { status: PlatformLeadArtifactStatus }) {
  return artifact.status !== "REJECTED" && artifact.status !== "SUPERSEDED";
}

function approvedArtifact(artifact: { status: PlatformLeadArtifactStatus }) {
  return artifact.status === "APPROVED" || artifact.status === "SENT";
}

export async function getPreviewBuildGateReport(previewBuildId: string) {
  const prisma = await getPrismaClient();
  const preview = await prisma.previewBuild.findUnique({
    where: { id: previewBuildId },
    include: { platformLead: { include: { artifacts: { orderBy: { createdAt: "desc" } } } } },
  });
  if (!preview) throw new Error("PreviewBuild not found");

  const artifacts = preview.platformLead.artifacts;
  const activeTypes = new Set(artifacts.filter(activeArtifact).map((artifact) => artifact.type));
  const approvedTypes = new Set(artifacts.filter(approvedArtifact).map((artifact) => artifact.type));
  const missingReadyArtifacts = requiredPreviewReadyArtifacts.filter((type) => !activeTypes.has(type));
  const approvedPhotoGeoAudit = artifacts.find((artifact) => artifact.type === "PREVIEW_PHOTO_GEO_AUDIT" && approvedArtifact(artifact));
  const imageInventoryTerms = ["Page-order image inventory", "Hero candidate", "First two section-image candidates", "Rejected assets"];
  const approvedPhotoGeoAuditHasImageInventory = Boolean(
    approvedPhotoGeoAudit
    && imageInventoryTerms.every((term) => approvedPhotoGeoAudit.body.toLowerCase().includes(term.toLowerCase()))
    && !approvedPhotoGeoAudit.body.includes("TODO:")
  );
  const approvedRubricReview = artifacts.find((artifact) => artifact.type === "PREVIEW_RUBRIC_REVIEW" && approvedArtifact(artifact));
  const copyReviewTerms = ["Source-truth pass", "VRBO-owner relevance pass", "Guest usefulness pass", "Anti-AI voice pass", "Section-fit pass"];
  const approvedRubricHasCopyReviewStack = Boolean(approvedRubricReview && copyReviewTerms.every((term) => approvedRubricReview.body.includes(term)));
  const hasSectionPlan = Array.isArray(preview.sections) ? preview.sections.length > 0 : Boolean(preview.sections);
  const ownerCallouts = Array.isArray(preview.ownerCallouts) ? preview.ownerCallouts : [];
  const hasSpecificCallouts = ownerCallouts.some((callout) => {
    if (!callout || typeof callout !== "object") return false;
    const body = "body" in callout ? String(callout.body || "") : "";
    return body.length > 80 && !body.includes("During onboarding, DirectStay gathers your property");
  });

  const readyBlockers = [
    ...missingReadyArtifacts.map((type) => `Missing preview packet artifact: ${type.replaceAll("_", " ").toLowerCase()}.`),
    ...(!hasSectionPlan ? ["Missing preview section plan / rendered sections."] : []),
    ...(!approvedPhotoGeoAuditHasImageInventory ? ["Approved photo/geography audit must replace starter TODOs with a page-order image inventory, hero candidate, first two section-image candidates, and rejected assets before READY FOR REVIEW."] : []),
    ...(!hasSpecificCallouts ? ["Owner callouts are still generic; add property-specific strategy and assumptions/corrections callouts."] : []),
  ];

  const sharedBlockers = [
    ...readyBlockers,
    ...(!approvedTypes.has("PREVIEW_RUBRIC_REVIEW") ? ["Preview rubric review must be approved before owner sharing."] : []),
    ...(approvedTypes.has("PREVIEW_RUBRIC_REVIEW") && !approvedRubricHasCopyReviewStack ? ["Approved preview rubric review must document the Copy Review Stack: source-truth, VRBO-owner relevance, guest usefulness, anti-AI voice, and section-fit passes."] : []),
    ...(!approvedTypes.has("PREVIEW_SHARE_NOTE") ? ["Owner-share note must be approved before sharing with lead."] : []),
  ];

  const promotedBlockers = [
    ...sharedBlockers,
    ...(!approvedTypes.has("PREVIEW_CONVERSION_PACKET") ? ["Preview-to-production conversion packet must be approved before promotion."] : []),
  ];

  return { preview, readyBlockers, sharedBlockers, promotedBlockers };
}

export async function updatePreviewBuildStatus(previewBuildId: string, status: PreviewBuildStatus) {
  const prisma = await getPrismaClient();
  const report = await getPreviewBuildGateReport(previewBuildId);
  const blockers = status === "READY_FOR_REVIEW" ? report.readyBlockers : status === "SHARED_WITH_LEAD" ? report.sharedBlockers : status === "PROMOTED_TO_SITE" ? report.promotedBlockers : [];
  if (blockers.length > 0) throw new Error(`Preview Build cannot move to ${status.replaceAll("_", " ")}: ${blockers.join(" ")}`);
  return prisma.previewBuild.update({
    where: { id: previewBuildId },
    data: { status, ...(status === "SHARED_WITH_LEAD" ? { sharedAt: new Date() } : {}) },
  });
}

export async function updatePreviewBuildContent(input: {
  previewBuildId: string;
  heroTitle?: string | null;
  positioning?: string | null;
  sections?: Prisma.InputJsonValue | null;
  ownerCallouts?: Prisma.InputJsonValue | null;
}) {
  const prisma = await getPrismaClient();
  return prisma.previewBuild.update({
    where: { id: input.previewBuildId },
    data: {
      ...(input.heroTitle !== undefined ? { heroTitle: input.heroTitle?.trim().slice(0, 180) || null } : {}),
      ...(input.positioning !== undefined ? { positioning: input.positioning?.trim().slice(0, 500) || null } : {}),
      ...(input.sections !== undefined ? { sections: input.sections ?? undefined } : {}),
      ...(input.ownerCallouts !== undefined ? { ownerCallouts: input.ownerCallouts ?? undefined } : {}),
    },
  });
}

function previewSectionsArray(value: unknown): Prisma.JsonArray {
  return Array.isArray(value) ? value as Prisma.JsonArray : [];
}

function cleanPreviewSection(input: {
  kind: string;
  eyebrow?: string | null;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}) {
  const section = {
    kind: input.kind.trim().slice(0, 60) || "custom",
    eyebrow: input.eyebrow?.trim().slice(0, 120) || undefined,
    title: input.title.trim().slice(0, 180),
    body: input.body?.trim().slice(0, 1200) || undefined,
    imageUrl: input.imageUrl?.trim().slice(0, 800) || undefined,
    imageAlt: input.imageAlt?.trim().slice(0, 180) || undefined,
  };
  if (!section.title) throw new Error("Section title is required.");
  return section;
}

export async function appendPreviewBuildSection(input: {
  previewBuildId: string;
  kind: string;
  eyebrow?: string | null;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}) {
  const prisma = await getPrismaClient();
  const preview = await prisma.previewBuild.findUnique({ where: { id: input.previewBuildId } });
  if (!preview) throw new Error("PreviewBuild not found");
  return prisma.previewBuild.update({ where: { id: input.previewBuildId }, data: { sections: [...previewSectionsArray(preview.sections), cleanPreviewSection(input)] } });
}

export async function updatePreviewBuildSection(input: {
  previewBuildId: string;
  index: number;
  kind: string;
  eyebrow?: string | null;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}) {
  const prisma = await getPrismaClient();
  const preview = await prisma.previewBuild.findUnique({ where: { id: input.previewBuildId } });
  if (!preview) throw new Error("PreviewBuild not found");
  const sections = previewSectionsArray(preview.sections);
  if (input.index < 0 || input.index >= sections.length) throw new Error("Section index is out of range.");
  sections[input.index] = cleanPreviewSection(input);
  return prisma.previewBuild.update({ where: { id: input.previewBuildId }, data: { sections } });
}

export async function movePreviewBuildSection(input: { previewBuildId: string; index: number; direction: "up" | "down" }) {
  const prisma = await getPrismaClient();
  const preview = await prisma.previewBuild.findUnique({ where: { id: input.previewBuildId } });
  if (!preview) throw new Error("PreviewBuild not found");
  const sections = previewSectionsArray(preview.sections);
  const target = input.direction === "up" ? input.index - 1 : input.index + 1;
  if (input.index < 0 || input.index >= sections.length || target < 0 || target >= sections.length) return preview;
  [sections[input.index], sections[target]] = [sections[target], sections[input.index]];
  return prisma.previewBuild.update({ where: { id: input.previewBuildId }, data: { sections } });
}

export async function deletePreviewBuildSection(input: { previewBuildId: string; index: number }) {
  const prisma = await getPrismaClient();
  const preview = await prisma.previewBuild.findUnique({ where: { id: input.previewBuildId } });
  if (!preview) throw new Error("PreviewBuild not found");
  const sections = previewSectionsArray(preview.sections);
  if (input.index < 0 || input.index >= sections.length) throw new Error("Section index is out of range.");
  sections.splice(input.index, 1);
  return prisma.previewBuild.update({ where: { id: input.previewBuildId }, data: { sections } });
}

export async function generatePreviewBuildStarterPacket(input: {
  previewBuildId: string;
  createdByEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  const preview = await prisma.previewBuild.findUnique({
    where: { id: input.previewBuildId },
    include: { platformLead: { include: { artifacts: { orderBy: { createdAt: "desc" } } } } },
  });
  if (!preview) throw new Error("PreviewBuild not found");

  const lead = preview.platformLead;
  const property = preview.propertyName || lead.propertyName || lead.company || "the property";
  const location = preview.location || lead.propertyLocation || "the market";
  const sourceList = preview.sourceUrls.length ? preview.sourceUrls : [lead.currentWebsite].filter((value): value is string => Boolean(value));
  const sources = sourceList.map((url) => `- ${url}`).join("\n") || "- No source URL recorded yet; add owner/public source before review.";
  const existingActiveTypes = new Set(lead.artifacts.filter(activeArtifact).map((artifact) => artifact.type));

  const sections: Prisma.InputJsonValue = [
    { kind: "imageStory", eyebrow: "Property story", title: `What guests should notice first about ${property}`, body: `Replace this starter copy with concrete source-backed details from ${property}: the view, room, porch, dock, street, material, color, or arrival moment a guest would actually care about. Keep internal DirectStay strategy out of this public section.`, items: [{ label: "Source-backed hook", body: "Name the exact inspected photo, room, view, material, or location detail that earns the hero treatment." }, { label: "Image integrity", body: "Use the page-order image inventory before choosing hero or early-section art. Reject OTA cards, text overlays, collages, review/rating graphics, logos, banners, and unknown filler." }, { label: "Avoid generic", body: "Do not use broad labels like coastal, mountain, luxury, or family-friendly unless the property evidence makes them specific." }] },
    { kind: "signatureMoments", eyebrow: "Stay moments", title: "The moments guests should be able to picture", items: [{ label: "Arrival", body: "Describe the driveway, entry, street, lobby, dock, porch, parking, or first-view context only if visible or source-backed." }, { label: "Best hour", body: "Identify the time of day, light, water, town, trail, deck, kitchen, or gathering moment visible in the source material." }, { label: "Why guests would return", body: "State a plain, guest-relevant reason this stay works, then verify it with owner truth." }] },
    { kind: "locationGuide", eyebrow: "Micro-location", title: `How guests would use the ${location} location`, body: "Replace with source-backed micro-geography: nearby water/streets/views/beach/trails/restaurants/transit, what guests can actually do, and what must remain an owner-confirmation item." },
    { kind: "directBookingValue", eyebrow: "Direct booking", title: "What booking direct would make easier", body: "Explain guest-useful value in plain language: date confidence, fee clarity, owner answers, local guidance, and fewer marketplace unknowns. Treat calendar, price, and area-guide modules as guest-planning tools first. Do not imply live availability, best rate, licensing, or booking capability." },
    { kind: "missingInputs", eyebrow: "Owner confirmation needed", title: "Draft assumptions to confirm", items: [{ label: "Photos/materials", body: "Confirm which photos DirectStay may use and which should be replaced; text-only beats unsafe imagery." }, { label: "Operational truth", body: "Confirm occupancy, bedroom/bath details, rules, parking/access, fees/taxes, and booking constraints." }, { label: "Local claims", body: "Confirm distances, recommendations, safety/accessibility details, and any regulated/compliance claims." }, { label: "Copy fit", body: "Remove any sentence that sounds like AI filler, internal strategy, source/process commentary, or copy that would feel odd on a VRBO/Airbnb owner’s direct site." }] },
  ];

  const ownerCallouts: Prisma.InputJsonValue = [
    { label: "Property-specific strategy", body: `This starter packet frames ${property} around source-backed visual/location evidence in ${location}. Replace this with the strongest property-specific design decision after the photo/geography audit.` },
    { label: "Assumptions to correct", body: "Before owner sharing, review every draft claim below and either mark it source-observed, owner-confirmed, or remove it. The owner can correct, replace, or remove anything before launch." },
  ];

  const artifacts = [
    { type: "PREVIEW_PHOTO_GEO_AUDIT" as const, title: `Photo + Geography Audit — ${property}`, body: `Photo + Geography Audit\n\nProperty: ${property}\nLocation: ${location}\n\nSources used:\n${sources}\n\nObserved photo evidence:\n- TODO: record page-order image inventory with hero candidate, first two section-image candidates, and rejected assets.\n- Reject promotional cards, text overlays, collages, review/rating graphics, OTA banners/logos, and unknown filler.\n- TODO: record visible exterior/interior/material/light/view/details.\n\nMicro-geography:\n- TODO: record exact location context that affects guest decisions.\n- Do not invent distances, beach/water access, wildlife, restaurant, safety, or compliance claims.\n\nDesign implications:\n- TODO: palette, typography, rhythm, hero/image sequence.\n- If safe imagery is thin, choose intentional text-only sections and record the owner photo request.\n\nMissing owner inputs:\n- Photo rights/replacements.\n- Operational truth.\n- Local recommendations/distances.` },
    { type: "PREVIEW_DESIGN_BRIEF" as const, title: `Preview Design Brief — ${property}`, body: `Preview Design Brief\n\nProperty fingerprint:\n- Property: ${property}\n- Location: ${location}\n- Seed/archetype: TODO; evidence must override seed.\n\nDesign decisions only this property justifies:\n1. TODO\n2. TODO\n3. TODO\n\nChoice intentionally avoided because it would feel generic:\n- TODO\n\nPalette evidence:\n- TODO\n\nTypography / layout rhythm:\n- TODO\n\nCopy Review Stack:\n- Source-truth pass: TODO\n- VRBO-owner relevance pass: TODO\n- Guest usefulness pass: TODO\n- Anti-AI voice pass: TODO\n- Section-fit pass: TODO\n\nPublic guest copy rule:\nMove internal DirectStay strategy, process commentary, and owner-facing sales logic into owner callouts/artifacts. Guest sections should sound like a useful direct-booking vacation-rental site.\n\nConversion trio rule:\nCalendar, price, and area-guide modules should answer property-specific guest-planning questions before explaining DirectStay strategy. Keep them read-only/mock until launch approval.` },
    { type: "PREVIEW_FACT_REGISTER" as const, title: `Preview Fact Register — ${property}`, body: `Preview Fact Register\n\nObserved/source-backed facts:\n${sources}\n\nOwner-confirmed facts:\n- TODO\n\nDo not assert yet:\n- Availability\n- Pricing/taxes/fees\n- Licensing/insurance/compliance\n- Safety/accessibility\n- Reviews/ratings/testimonials\n- Distances not source-verified` },
    { type: "PREVIEW_ASSUMPTION_REGISTER" as const, title: `Preview Assumption Register — ${property}`, body: `Preview Assumption Register\n\nDraft assumptions requiring owner correction or confirmation:\n- TODO: strongest guest profile.\n- TODO: best arrival/hero moment.\n- TODO: operating details and policies.\n- TODO: local recommendations and distances.\n\nOwner correction path:\nOwner may correct, remove, or replace any content before launch.` },
    { type: "PREVIEW_RUBRIC_REVIEW" as const, title: `Preview Rubric Review Draft — ${property}`, body: `Preview Rubric Review Draft\n\nGate status:\n- Pre-render rubric preflight: TODO after source audit, design brief, and content plan are complete.\n- Post-render promotion gate: TODO after a real preview URL has desktop/mobile QA and a page-order image inventory.\n\nScoring table:\n- Property understanding: TODO / 5\n- Visual fit to photos/location: TODO / 5\n- Owner/decor style interpretation: TODO / 5\n- Guest desire and trust: TODO / 5\n- DirectStay sales value: TODO / 5\n- Copy quality: TODO / 5\n- Mobile composition: TODO / 5 or N/A before render\n- Safety / preview constraints: PASS/FAIL\n- Technical polish: TODO / 5 or N/A before render\n\nCopy Review Stack:\n- Source-truth pass: TODO\n- VRBO-owner relevance pass: TODO\n- Guest usefulness pass: TODO\n- Anti-AI voice pass: TODO\n- Section-fit pass: TODO\n\nOwner-share blockers:\n- TODO: list every missing approved artifact, unsupported claim, image-rights gap, mobile/desktop QA gap, and non-functional/noindex confirmation gap.\n- Keep owner-share blockers separate from benchmark score: a strong internal benchmark can still be blocked by rights, policies, rates, availability, taxes, and owner review.\n\nRendered bad-copy scan:\n- Remove internal words/phrases such as benchmark, source description, source material, final live copy, preview uses mock, strategy, cross-property badges, and owner/process commentary from guest-facing sections.\n\nDecision:\n- Owner-shareable: no until this artifact is approved after rendered QA and Jaimal/operator review.` },
    { type: "PREVIEW_SHARE_NOTE" as const, title: `Owner Share Note — ${property}`, body: `Draft owner-share note\n\nThis Preview Build is a draft concept based on the sources listed below. It is public-obscure, noindex, not linked from public navigation, not bookable, and non-functional. Some details are assumptions for you to correct. Anything can be removed or replaced before launch, and we can take the preview down on request.\n\nSources:\n${sources}\n\n[Requires Jaimal approval before sending externally.]` },
    { type: "PREVIEW_CONVERSION_PACKET" as const, title: `Preview Conversion Packet Draft — ${property}`, body: `Preview Conversion Packet Draft\n\nConversion status: not ready for live site. This Preview Build remains a non-functional sales/onboarding artifact until every launch gate is complete.\n\nRequired before promotion or launch:\n- Owner-approved facts, photos, rates, fees, taxes, deposits, availability, rules, policies, local recommendations, and image rights.\n- Approved final copy after source-truth, guest-usefulness, and anti-AI review.\n- Calendar/date, inquiry, price comparison, payment, and booking behavior either remain read-only/mock or are replaced with approved production controls/data.\n- Contract/commercial approval and launch checklist complete.\n- Desktop/mobile QA, page-order image inventory, noindex/public-obscure verification, and final Jaimal launch approval.\n\nDo not use this packet to enable production booking, payment, inquiry submission, or external owner communication without explicit approval.` },
  ].filter((artifact) => !existingActiveTypes.has(artifact.type));

  const created = await prisma.$transaction(async (tx) => {
    const artifactRecords = [];
    for (const artifact of artifacts) {
      artifactRecords.push(await tx.platformLeadArtifact.create({ data: { platformLeadId: lead.id, type: artifact.type, status: "DRAFT", title: artifact.title, body: artifact.body, createdByEmail: input.createdByEmail ?? "bishop@directstay.internal", metadata: { previewBuildId: preview.id, generatedBy: "generatePreviewBuildStarterPacket" } } }));
    }
    const updatedPreview = await tx.previewBuild.update({ where: { id: preview.id }, data: { heroTitle: preview.heroTitle || `${property} direct-booking preview`, positioning: preview.positioning || `A source-backed Preview Build concept for ${property} in ${location}. Draft only until owner truth is confirmed.`, sections, ownerCallouts } });
    return { artifactRecords, updatedPreview };
  });

  return { preview: created.updatedPreview, artifacts: created.artifactRecords, skippedExistingTypes: Array.from(existingActiveTypes).filter((type) => String(type).startsWith("PREVIEW_")) };
}
