# PlatformLead Proposal-to-Contract Checklist

> Internal operator checklist. Draft-only; do not send owner-facing proposals, contracts, emails, signature requests, or launch approvals without explicit Jaimal approval.

Use this after a PlatformLead has enough context for a commercial proposal and before any owner/platform agreement is treated as executable.

## 1. Lead reality check

- [ ] Lead is plausible and not spam/suspicious.
- [ ] Property is an individual owner / small-owner fit, or exceptions are noted.
- [ ] Lead record has property name/location, current channel/site if known, owner goal, and launch timeline.
- [ ] Sources and assumptions are captured in a Lead Brief artifact or private note.

## 2. Proposal readiness

- [ ] Pricing fields are filled or intentionally marked TBD: setup fee, monthly fee, commission bps, payment-processing bps, pricing notes.
- [ ] Proposal Rationale artifact exists and explains why this package fits the lead.
- [ ] Proposal Draft artifact exists for Jaimal approval.
- [ ] Proposal language is framed as draft/manual approval, not automatically sent.
- [ ] No owner-facing promise implies DirectStay is a broker, property manager, merchant of record, tax advisor, insurer, or guest-service operator unless an approved addendum says so.

## 3. Human approval before external send

- [ ] Jaimal has approved the proposal terms and message.
- [ ] If legal/commercial risk is unusual, counsel or explicit Jaimal override is noted.
- [ ] External proposal send is performed manually outside Bishop automation.
- [ ] After manual send only: mark proposal artifact `SENT` and lead status `PROPOSAL_SENT`.

## 4. Owner acceptance evidence

- [ ] Owner acceptance evidence is recorded in a private note: date, channel, exact summary/quote, caveats, and operator who reviewed it.
- [ ] Any requested exceptions are either reflected in pricing notes/terms or explicitly parked for approval.
- [ ] `launchChecklist.ownerAcceptedProposal` is true only after human-reviewed evidence exists.

## 5. Agreement draft creation

- [ ] Create an `OWNER_PLATFORM_AGREEMENT` artifact from `directstay-owner-platform-agreement-draft.md` plus lead-specific terms.
- [ ] Artifact status remains `DRAFT` or `NEEDS_APPROVAL`; it is not owner-facing by default.
- [ ] Agreement draft includes: parties/entity placeholders, property scope, fees, term, payment/booking authority limits, launch gates, AI-assisted operations disclosure, data/privacy notes, liability/indemnity placeholders, governing law placeholder, and signature/version metadata.
- [ ] Set `contractStatus = DRAFTED` only after a draft artifact/storage reference exists.

## 6. Approval before agreement send

- [ ] Jaimal/counsel approval is captured for the exact agreement version.
- [ ] Artifact status is moved to `APPROVED` only after approval.
- [ ] Owner-facing send/signature remains manual; Bishop does not send contracts or signature requests.
- [ ] After manual send only: set `contractStatus = SENT`, `contractSentAt`, and `contractStorageUrl` if available.

## 7. Signature and execution

- [ ] Owner signature evidence is stored or linked; then `contractStatus = SIGNED`.
- [ ] Do **not** mark launch-ready from owner signature alone.
- [ ] DirectStay countersignature/execution evidence is stored or linked; then `contractStatus = COUNTERSIGNED`.
- [ ] `launchChecklist.contractExecuted = true` only when countersigned/executed, unless Jaimal gives an explicit exception.

## 8. Launch gate handoff

- [ ] Agreement execution is only one launch gate; also verify content approval, support contacts, inquiry/payment rules, guest agreement path, preview QA, and final Jaimal launch approval.
- [ ] Preview Builds remain non-functional until launch gates pass.
- [ ] Any void/supersede event clears reliance on the old agreement and records a replacement plan.

## Audit trail minimum

Every proposal/agreement transition should leave at least one durable record: artifact, private note, status change, storage URL, or audit event. If it would be hard to explain later why a status changed, stop and add a note before moving on.
