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
}) {
  const prisma = await getPrismaClient();
  return prisma.platformLeadArtifact.create({
    data: {
      platformLeadId: input.leadId,
      type: input.type,
      status: input.status ?? "DRAFT",
      title: input.title.trim().slice(0, 180),
      body: input.body.trim().slice(0, 12000),
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

  const body = `DirectStay Owner / Platform Agreement Draft\n\nDraft only for Jaimal/counsel review. Not legal advice. Do not send, present as final, or enable signature flow until explicitly approved.\n\nLead / Owner\n- Owner contact: ${lead.fullName} <${lead.email}>${lead.phone ? ` / ${lead.phone}` : ""}\n- Property: ${property}${lead.propertyLocation ? ` in ${lead.propertyLocation}` : ""}\n- Source/listing: ${lead.currentWebsite || "Not provided"}\n- Preview Build: ${preview ? `https://directstay.app/p/${preview.slug} (${preview.status.replaceAll("_", " ")})` : "No Preview Build recorded"}\n- Proposal artifact: ${proposal ? `${proposal.title} (${proposal.status})` : "No approved/sent proposal draft found; review commercial acceptance before sending an agreement."}\n\nBusiness Terms To Confirm\n- Setup/build fee: ${setupFee}\n- Monthly platform/support fee: ${monthlyFee}\n- Direct booking commission: ${commission}\n- Payment processing pass-through: ${processing}\n${lead.pricingNotes ? `- Pricing notes: ${lead.pricingNotes}\n` : ""}\n\nOperating Sequence\n1. Capture owner acceptance evidence in a private note before relying on this draft.\n2. Review legal entity, address, governing law, venue, service scope, payment/tax responsibilities, and signature method.\n3. Jaimal/counsel must approve the owner-facing version before manual send.\n4. Mark contract status SENT only after manual send; SIGNED only after owner signature; COUNTERSIGNED only after DirectStay execution.\n5. Launch remains blocked until contractExecuted and all other launch checklist gates are true.\n\nAgreement Body Starter\nUse villa-la-percha/docs/directstay-owner-platform-agreement-draft.md as the canonical base text. Merge the confirmed business terms above into the final statement of work or commercial terms section.\n\nRecent Internal Notes\n${recentNotes}`;

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

export async function updatePreviewBuildStatus(previewBuildId: string, status: PreviewBuildStatus) {
  const prisma = await getPrismaClient();
  return prisma.previewBuild.update({
    where: { id: previewBuildId },
    data: { status, ...(status === "SHARED_WITH_LEAD" ? { sharedAt: new Date() } : {}) },
  });
}
