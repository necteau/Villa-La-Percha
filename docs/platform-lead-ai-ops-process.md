# DirectStay Platform Lead AI Ops Process

Status: Draft operating spec from Jaimal/Bishop process design on 2026-05-02.

## Core Principle

Bishop/AI is the operating layer. The admin portal is the durable memory, control surface, and audit trail. Avoid building a rigid old-school CRM that forces deterministic status gates; use lightweight tracking around an AI-led process.

Initial target customer: individual owners with a single property. Future customer types may include small operators and property managers, but Phase 1 should optimize for one-owner/one-property onboarding.

## Internal Communication

PlatformLead operations should happen in the dedicated Telegram group:

- Name: DirectStay Platform Leads
- Chat ID: `telegram:-5283121585`

This group is the internal operating room for lead briefs, draft approvals, research, proposal review, onboarding decisions, and team collaboration. Owners should not directly communicate with Bishop/AI at this stage.

## Lead Intake Flow

1. Lead arrives through `/request-a-site` or future manual/referral sources.
2. Bishop filters/classifies before interrupting Jaimal:
   - Clearly/plausibly real leads: research and brief.
   - Unclear leads: mark suspicious/needs review without unnecessary interruption.
   - Obvious junk/spam: move to recoverable spam folder/queue, not immediate hard delete at first.
3. For real leads, Bishop prepares a concise Lead Brief in the Platform Leads Telegram group.

### Lead Brief Format

- Owner/contact
- Property name/location
- First read: natural-language fit assessment, not rigid score
- Why: 2–3 bullets
- Missing/unknown
- Recommended next step
- Draft first response for Jaimal approval

## First Outreach

After a Lead Brief, Bishop should usually draft a warm discovery response for approval.

First response should:

- Thank them for reaching out.
- Mention property/location specifically.
- Ask a few useful discovery questions.
- Invite email replies and optionally a call/meeting.
- Avoid sounding like generic SaaS sales automation.

No external outreach is sent without Jaimal approval.

## Preview Build

A Preview Build is a fast, AI-created property website draft used to surprise high-potential leads early.

### When to Create

Default: after first reply/validated interest, likely included in the second response.

Exception: if the initial lead is extremely promising or includes a hot note, Bishop may recommend creating a Preview Build before first response.

### Minimum Requirements

- Property name
- Location
- At least one usable public source: existing website, Airbnb/VRBO listing, Google/business listing, real estate page, or public photo set
- Enough usable images to be visually credible
- No private/sensitive owner data required

### URL Strategy

Use public-but-obscure shareable URLs:

`https://directstay.app/p/property-name-randomtoken`

Rules:

- Random token so URL is not guessable.
- Noindex.
- Not linked from nav/sitemap.
- Shareable without login.
- Treated internally as a draft/spec artifact.

### Preview Build Scope

- Guest-facing draft site.
- Owner-view callouts visible by default.
- Optional clean guest view later.
- Hero/property positioning.
- Strong visual image selection.
- Why-stay-here section.
- Discoverable bedrooms/amenities/highlights.
- Location/local guide context.
- Visual inquiry section only.

Preview Builds must be non-functional by design:

- No working booking engine.
- No payment.
- No live inquiry submission.
- No owner login.
- Inquiry button/form disabled or clearly preview-only.

### Owner-View Callouts

Owner-view callouts should explain DirectStay benefits while preserving the feel of a real guest-facing site.

Include callouts such as:

- How the hero positions the property as a standalone hospitality brand.
- How image ordering differs from OTA constraints.
- How local guide content builds guest confidence/search value.
- How direct inquiries preserve the owner/guest relationship.
- During onboarding, DirectStay gathers property-specific and location-specific owner knowledge to tailor the real site.

Do not include Villa La Percha references in Preview Builds by default. Keep the emotional focus on the lead's property. Villa La Percha can be used later as proof/example if useful.

## Follow-Up After Replies

When a lead replies, Bishop should:

- Summarize the reply.
- Update the lead record/history.
- Suggest the next move.
- Only interrupt Jaimal when a real decision/action is needed.

## Proposal Flow

Rigid CRM gates should not control proposals. Bishop may recommend a proposal whenever the conversation supports it.

Before drafting a proposal, Bishop should provide a short Proposal Rationale:

- Why now
- Suggested commercial structure
- Risks/unknowns

Proposal format: email-style offer, not formal PDF/page initially.

Proposal should include:

- Personal opening.
- What DirectStay will build/do.
- What ongoing support includes.
- Proposed commercial terms.
- Payment processing note if relevant.
- What is needed from the owner to start.
- Suggested next step / optional call.

No pricing/proposal terms are sent externally without Jaimal approval.

## Pricing / Commercial Model

Use flexible hybrid pricing internally:

- Setup fee: optional.
- Monthly fee: optional.
- DirectStay commission: flexible; 5% is an initial instinct, may be lower for competitiveness/early partners.
- Payment-processing fee: separate/pass-through component if DirectStay handles payments later.
- Custom notes/terms.

System should support:

- Default DirectStay terms.
- Proposal-level overrides.
- Owner-level overrides.
- Property-level overrides.

External posture:

DirectStay is designed to be significantly cheaper than Airbnb/VRBO-style marketplace economics while helping owners build direct guest relationships. Keep pricing language simple and human.

Marketplace reference points discussed:

- Airbnb split-fee: often about 3% host fee plus guest fee around 14–16%.
- Airbnb host-only/PMS/professional model: often around 15.5% host-side.
- Vrbo pay-per-booking: roughly 5% commission plus 3% payment processing host-side, plus variable traveler fees.

## Acceptance

Proposal acceptance requires clear human confirmation, such as:

- “Yes, let’s move forward.”
- “We agree to those terms.”
- “Send over whatever you need to start.”

Acceptance triggers Onboarding Prep, not automatic production owner/property creation.

## Onboarding

Onboarding should be flexible, casual, and easy. Avoid formal questionnaires as the default.

Offer owners multiple ways to provide material:

- Voice memo / audio brain dump.
- Voice-to-text notes.
- Bullet-point email.
- Photo dump first, details later.
- Shared document.
- Phone call.

Encourage brain dump as the easiest path, while reassuring older/less technical owners that phone/email are equally fine.

Suggested tone:

“Send us a rough brain dump about the property — what guests love, favorite local spots, quirks, tips, what makes it special. Don’t worry about making it polished. We’ll shape it into site copy and follow up only where we need more detail.”

Bishop should extract:

- Property story.
- Guest experience highlights.
- Amenities.
- Local recommendations.
- House rules/practical notes.
- Emotional positioning.
- Missing questions.
- Site copy draft.

## Building the Real Site

The Preview Build becomes the starting point for the real owner site, not a disposable artifact.

Bishop should refine it using owner-provided truth:

- Replace assumptions.
- Improve copy.
- Add better property/local details.
- Remove owner-view callouts.
- Keep inquiry/booking flows disabled until launch readiness is approved.

Only surface onboarding synthesis to Jaimal if something is unclear, risky, or needs a decision.

## Launch Readiness

Design readiness is not launch readiness.

No functional inquiry/payment/booking behavior goes live until the official launch checklist is complete.

Required launch gates include:

- Final owner-approved content.
- Inquiry/contact routing confirmed.
- Rates/availability approach confirmed.
- Payment/processing approach confirmed if applicable.
- Domain setup confirmed.
- House rules/cancellation/legal terms confirmed.
- Official DirectStay agreement/contract sent.
- Agreement signed/executed.
- Contract version/status/storage tracked.
- Launch QA passed.
- Explicit go-live approval.

Contract content can be designed later, but sending and tracking execution is a required process step.

## Post-Launch Owner Success

Post-launch DirectStay may support site maintenance, inquiry copilot, and direct-booking growth, but owners should interact through the Owner Portal — not direct Bishop/AI chat.

Future portal workflows should support:

- Website-change requests.
- Owner feedback.
- Bishop/DirectStay improvement suggestions.
- Inquiry assistance through existing owner-portal functionality.
- Performance/direct-booking insights.

## Build Implications

Prioritize lightweight surfaces that support Bishop-led operations:

1. Spam/suspicious handling for PlatformLeads.
2. Lead Brief storage and Telegram notification routing.
3. Draft first-response/proposal artifacts with approval status.
4. Preview Build model and public-obscure preview route.
5. Owner-view callout system for Preview Builds.
6. Flexible pricing/proposal terms model.
7. Casual onboarding artifact/missing-info tracking.
8. Contract sent/executed tracking.
9. Launch checklist gates.
10. Later Owner Portal post-launch feedback/change-request workflows.

## 2026-05-02 Update — Durable intake jobs + best-effort wake

PlatformLead intake processing no longer depends on a five-minute polling cron for the first operational pass, and it no longer relies only on app-level post-submit work. `/api/platform-leads` now writes the lead and a `PlatformLeadProcessingJob` in one database transaction. The job row is the durable source of truth; OpenClaw/Bishop wake calls are only the doorbell.

Current behavior:

- public form submission stores the lead plus durable `INTAKE` job before returning success;
- the app attempts a short-timeout wake webhook when `DIRECTSTAY_OPENCLAW_WAKE_URL` is configured;
- if the wake fails or is not configured, the `PENDING` job remains recoverable by worker/heartbeat/manual fallback;
- worker processing marks attempts, records `COMPLETED` or `FAILED`, and stores `lastError` on failure;
- plausible leads receive `LEAD_BRIEF` and `FIRST_RESPONSE_DRAFT` artifacts with `NEEDS_APPROVAL` status;
- obvious spam filtering still stays recoverable through lead status/spam metadata;
- generated drafts are internal artifacts only; external lead email remains Jaimal-approval-gated.

The prior OpenClaw polling cron (`cd55f83b-8434-450b-87c9-df91dc425a94`) remains disabled. The fallback helper is `tools/directstay/platform-lead-ops.mjs process-pending` or `process-job --job=<id>`.

Mac Studio fallback worker files:

- `scripts/directstay-platform-lead-worker.mjs`
- `scripts/run-directstay-platform-lead-worker.sh`
- `scripts/com.directstay.platform-lead-worker.plist`

This launchd worker is the safety net for the exact failure mode where the DirectStay site cannot reach the Mac Studio/OpenClaw gateway from the internet. The public site writes the durable DB job; the local Mac worker later drains pending jobs through database access.
