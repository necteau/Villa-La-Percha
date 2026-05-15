# PlatformLead Emily Simulation Plan

_Last updated: 2026-05-11_

Purpose: run a safe end-to-end DirectStay PlatformLead rehearsal with Emily acting as a VRBO villa owner, without external owner communication, production launch, signature-provider activation, or real owner/property creation.

Companion artifact pack: `platform-lead-emily-simulation-artifact-pack.md` provides the QA fixture, draft replies, preview rationale, proposal draft, agreement-gate check, and onboarding-prep copy to use during the rehearsal.

## Boundaries

- Use a clearly marked QA/test PlatformLead only.
- Keep all artifacts draft/internal unless Jaimal explicitly approves a send.
- Do not send emails, DMs, proposal terms, contracts, or onboarding invites externally.
- Do not create production Owner/Property records from the simulation.
- Do not mark contract/signature/launch gates complete unless the UI/action is explicitly a QA-only rehearsal state.
- Owner/platform agreement remains legal-review-blocked before owner-facing use.

## Persona

Emily acts as a plausible single-property VRBO owner:

- Owner name: Emily QA Owner
- Property: lake/mountain/beach villa with 3–5 bedrooms
- Current channel: VRBO-heavy, some direct repeat guests
- Pain points: platform fees, weak brand control, scattered guest questions, calendar/pricing confidence
- Goal: understand whether DirectStay can create a direct-booking presence and reduce OTA dependency without losing operational control

## Rehearsal Script

### 1. Intake

Create or identify a QA PlatformLead that includes:

- Owner contact fields marked as QA/test
- Property name and location
- Current listing/source URL placeholder or internal QA source note
- Free-text owner note with enough detail for Bishop to brief

Expected evidence:

- Lead appears in admin PlatformLead queue.
- Spam/suspicious handling is not triggered for a clearly plausible QA lead.
- Audit/timeline records the intake/source.

### 2. Lead Brief

Generate or draft the internal Lead Brief:

- Owner/contact
- Property/location
- Fit assessment in natural language
- 2–3 reasons why
- Missing/unknowns
- Recommended next step
- Draft first response for Jaimal approval

Expected evidence:

- Brief is stored as an internal artifact/note.
- First response stays draft/approval-only.
- No external send occurs.

### 3. Discovery Reply

Have Emily provide a mock reply with:

- Confirmation she is interested
- A few property strengths
- A concern about fees/control
- A question about what DirectStay needs from her

Expected evidence:

- Reply summary/note updates the lead history.
- Next move is specific and not a generic CRM status change.
- Draft response asks for lightweight discovery/onboarding details.

### 4. Preview Build Recommendation

Draft the Preview Build rationale and artifact:

- Why a preview is useful now
- Public-but-obscure/noindex requirement
- Owner-view callout checklist
- Explicit non-functional preview-only limits

Expected evidence:

- Preview artifact/callouts are internally reviewable.
- Inquiry/booking/payment behavior is disabled or clearly preview-only.
- No Villa La Percha-specific copy leaks into the simulated property by default.

### 5. Proposal Draft

Create an internal Proposal Rationale and email-style proposal draft:

- Why now
- Suggested commercial structure
- Risks/unknowns
- Setup/monthly/commission assumptions, if any, clearly marked draft
- Payment-processing note if relevant
- Needed owner materials and suggested next step

Expected evidence:

- Proposal remains draft/pending approval.
- Pricing is editable/overrideable and not auto-sent.
- Audit/timeline makes approval state visible.

### 6. Agreement / Contract Gate

Exercise the owner-platform agreement gate without activating owner-facing send/signature:

- Confirm agreement artifact exists or can be drafted internally.
- Confirm draft cannot be treated as final owner-facing agreement without approval/legal review.
- Confirm contract executed gate blocks launch reliance.

Expected evidence:

- Guard/warning is visible before send/signature/launch actions.
- Blocker language references Jaimal/counsel review.
- No signature provider or owner-facing send is triggered.

### 7. Onboarding Prep

After mock acceptance, rehearse onboarding prep only:

- Ask for casual brain dump/photos/listing notes rather than a formal questionnaire.
- Capture material-request checklist.
- Keep conversion to real Owner/Property manual and approval-gated.

Expected evidence:

- Onboarding artifact/checklist is stored internally.
- Launch readiness remains incomplete until contract, materials, content review, payment/inquiry choices, and Jaimal launch approval are complete.

### 8. Internal Lead-Room Handoff

Summarize the QA-only rehearsal in the internal DirectStay Platform Leads room (`telegram:-5283121585`) or an equivalent internal note if Telegram routing is unavailable:

- Lead identifier and QA/test label.
- Current status, next recommended operator action, and approval gates.
- Artifact titles/IDs generated during the rehearsal.
- Explicit reminder that no owner-facing send, signature, launch, or production Owner/Property conversion is approved.

Expected evidence:

- Internal handoff exists and is brief enough for Jaimal/Bishop to resume.
- Owner-facing action remains blocked until Jaimal approves a specific external send or legal/business gate.

## Pass/Fail Checklist

Pass if:

- Every stage is visible in the admin timeline/artifacts.
- Drafts are useful enough for Jaimal to review.
- External communication, agreement send/signature, production tenant creation, and launch remain gated.
- The flow feels AI-led and conversational, not rigid CRM ceremony.

Fail if:

- Any simulated artifact can be mistaken for an approved external send.
- Preview includes working booking/payment/inquiry behavior.
- Contract/launch gates can be bypassed by status wording alone.
- The admin record lacks enough evidence to resume after a session reset.

## Exit Evidence To Capture

- QA PlatformLead identifier or screenshot path.
- Artifact IDs/titles for brief, response draft, preview rationale, proposal draft, agreement draft/check, and onboarding prep.
- Any defects found with route/action names and reproduction notes.
- Final recommendation: ready for Jaimal role-play, needs app fix, or blocked on legal/business decision.
