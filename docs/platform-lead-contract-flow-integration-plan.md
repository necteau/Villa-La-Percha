# PlatformLead Contract Flow Integration Plan

> Internal implementation plan. Contract language is draft-only and requires Jaimal/counsel approval before any owner-facing send, signature flow, or launch gate reliance.

## Current state

The PlatformLead admin flow already has the main primitives needed for an agreement gate:

- `PlatformLead.contractStatus`: `NOT_STARTED`, `DRAFTED`, `SENT`, `SIGNED`, `COUNTERSIGNED`, `VOIDED`
- `contractSentAt`, `contractSignedAt`, `contractStorageUrl`
- pricing fields: setup, monthly, commission bps, processing bps, notes
- `launchChecklist.contractExecuted` as a launch blocker
- admin detail timeline entries for contract sent/signed milestones
- admin audit events around operating-state updates
- AI artifacts for lead brief, first response, proposal rationale/draft, onboarding brief/email draft

The missing piece is not basic storage; it is a clear proposal-to-contract operating sequence and a durable agreement artifact that separates draft/legal review from external send/signature state.

## Proposed lifecycle

1. **Qualified lead**
   - Status: `QUALIFIED`
   - Required artifacts: approved Lead Brief and First Response Draft, or a manual note explaining why they are not needed.
   - Contract state stays `NOT_STARTED`.

2. **Proposal prepared**
   - Required artifacts: `PROPOSAL_RATIONALE` + `PROPOSAL_DRAFT` in `NEEDS_APPROVAL`.
   - Pricing fields may be filled, but do not imply owner acceptance.
   - No contract status change yet unless an agreement draft is actually generated.

3. **Proposal approved/sent manually**
   - Proposal artifacts may move to `APPROVED`, then `SENT` only as a manual marker after Jaimal’s external send.
   - Lead status may move to `PROPOSAL_SENT`.
   - Contract state remains `NOT_STARTED` or `DRAFTED` depending on whether an agreement has been prepared.

4. **Owner accepts commercial direction**
   - Add private note capturing acceptance evidence: date, channel, summary, and any caveats.
   - Set `launchChecklist.ownerAcceptedProposal = true` only after human-reviewed evidence exists.
   - Generate/store owner agreement draft from `directstay-owner-platform-agreement-draft.md` plus lead-specific business terms.
   - Set `contractStatus = DRAFTED`.

5. **Agreement reviewed and sent manually**
   - Jaimal/counsel approval required before any owner-facing agreement send.
   - After manual send, set `contractStatus = SENT`, `contractSentAt`, and `contractStorageUrl` if available.
   - Record audit metadata: reviewer, storage URL, version label, and send channel.

6. **Owner signed**
   - Set `contractStatus = SIGNED`, `contractSignedAt`, and storage URL.
   - Do not mark launch-ready yet; this only indicates owner signature is present.

7. **DirectStay countersigned / executed**
   - Set `contractStatus = COUNTERSIGNED`.
   - Set `launchChecklist.contractExecuted = true`.
   - Lead can move to `CONVERTED` only after onboarding/launch checks support it.

8. **Void / supersede**
   - Use `VOIDED` when an agreement version should not be relied on.
   - Add a private note with reason and replacement plan.
   - Clear `launchChecklist.contractExecuted` if the voided agreement was the only execution basis.

## Recommended data additions

The existing `PlatformLead` columns are enough for a first manual workflow. For a stronger audit trail, add a dedicated agreement artifact table or extend artifacts:

### Option A — minimal extension to artifacts

Add `OWNER_PLATFORM_AGREEMENT` to `PlatformLeadArtifactType`.

Use artifact statuses as follows:

- `DRAFT`: AI/internal draft exists, not reviewed
- `NEEDS_APPROVAL`: ready for Jaimal/counsel review
- `APPROVED`: approved for manual send
- `SENT`: manually sent outside DirectStay
- `SUPERSEDED` or `REJECTED`: retained for audit, not usable

Pros: small migration and UI reuse.  
Cons: signature metadata remains split between artifact and `PlatformLead` contract fields.

### Option B — dedicated contract records

Create `PlatformLeadContract` with:

- `id`, `platformLeadId`
- `versionLabel`
- `status`
- `draftBody` or `storageUrl`
- `approvedByEmail`, `approvedAt`
- `sentAt`, `signedAt`, `countersignedAt`, `voidedAt`
- `signatureProvider`, `externalEnvelopeId`
- `createdByEmail`, timestamps

Pros: cleaner long-term signature/audit model.  
Cons: bigger implementation slice.

Recommendation: implement Option A first unless a real e-signature provider is being added immediately.

## Admin UI changes

- Add an **Agreement** card near pricing/contract controls:
  - current `contractStatus`
  - storage URL
  - sent/signed timestamps
  - warning: “Draft/legal review required before owner send.”
  - button: “Create owner agreement draft artifact”
- Show launch gate dependency:
  - `contractStatus === COUNTERSIGNED` is required before allowing/checking `contractExecuted`.
  - If status is `VOIDED`, display a red warning and treat launch as blocked.
- Timeline should include:
  - agreement artifact created/approved/sent/superseded
  - contract status changes
  - contract URL changes
  - launch checklist contract changes

## Guardrails for implementation

Use `villa-la-percha/docs/platform-lead-proposal-to-contract-checklist.md` as the operator checklist for moving a lead from proposal terms to agreement draft, manual send markers, signature evidence, and launch-gate handoff.

- Never send the agreement from the app in this phase; only save artifacts and manual markers.
- Never auto-mark `contractExecuted` from `SIGNED`; require `COUNTERSIGNED` or explicit Jaimal approval.
- Keep all owner-facing language labeled draft until approved.
- Audit every agreement artifact creation/status change and every contract status/storage URL update.
- Keep Preview Builds non-functional until contract, content, inquiry, payment, and final launch approval gates are all true.

## Smallest safe build slice

1. Add `OWNER_PLATFORM_AGREEMENT` to `PlatformLeadArtifactType`.
2. Allow the artifact route/UI to create and display that type.
3. Add a server helper to create an owner agreement draft artifact from the current draft template plus lead/pricing fields.
4. Add an admin button: “Create owner agreement draft”.
5. Add warnings/gating copy around `CONTRACT_SIGNED` vs `COUNTERSIGNED`/executed.
6. Verify with local typecheck/build and a QA lead in local/dev only.

## Open approval questions

- Final DirectStay legal entity name and address.
- Governing law / venue.
- Whether DirectStay is purely software/operator support or ever acts as property manager/booking agent.
- Standard pricing defaults and how exceptions are represented.
- E-signature provider, if any, and where executed PDFs should live.
- Whether an owner can launch on a signed-but-not-countersigned agreement in any exceptional case. Default recommendation: no.
