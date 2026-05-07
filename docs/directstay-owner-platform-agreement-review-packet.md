# DirectStay Owner / Platform Agreement — Jaimal/Counsel Review Packet

> Internal review packet. Draft only; not legal advice. Do not send to owners, activate signature workflows, or rely on this for launch until Jaimal/counsel approval is captured.

## Review goal

Move the PlatformLead owner/platform agreement from implementation-ready draft to approved business/legal template for owner-facing use.

Current implementation already supports the safe internal path: agreement draft artifacts, admin approval/send markers, contract-status gating, and launch readiness warnings. The remaining blocker is business/legal approval of the template and a few entity/payment/authority decisions.

## Source documents to review

- `villa-la-percha/docs/directstay-owner-platform-agreement-draft.md`
- `villa-la-percha/docs/platform-lead-contract-flow-integration-plan.md`

## Decisions needed before owner-facing use

1. **Legal entity and notices**
   - Final DirectStay legal entity/operator name.
   - Legal notice address and operational notice email.
   - Owner/entity fields required in the signature record.

2. **DirectStay role boundary**
   - Confirm DirectStay is software/website/marketing/operator-support by default.
   - Confirm DirectStay is not a property manager, broker, agent, merchant of record, tax advisor, insurer, or hospitality operator unless a signed addendum says otherwise.
   - Decide if any owner-facing copy should use “operator,” “platform,” “marketing support,” or another safer label.

3. **Commercial model**
   - Default setup fee/monthly fee/commission or hybrid structure.
   - Whether fees are due on inquiry, booked revenue, stayed revenue, collected revenue, or another basis.
   - How exceptions, waived fees, and bespoke launch packages are represented.

4. **Payments, refunds, taxes, and chargebacks**
   - Whether DirectStay ever collects guest payments for owners in the initial phase.
   - If yes later: merchant of record, payout timing, refund authority, chargeback liability, processing fee pass-through, and tax responsibility.
   - If no initially: confirm the agreement says payment-enabled launch requires separate addendum/SOW approval.

5. **Reservation and guest-communication authority**
   - What DirectStay may draft only vs. send/approve.
   - Whether DirectStay can ever confirm bookings, approve exceptions, quote rates, or agree to refunds without owner-specific authorization.
   - Required audit evidence for owner approval.

6. **Launch gates**
   - Confirm no live booking/payment launch without executed owner/platform agreement, approved property content, support contacts, guest agreement path, and final Jaimal launch approval.
   - Confirm whether “owner signed but DirectStay not countersigned” can ever count as executed. Current recommendation: no.

7. **Content, reviews, and OTA compliance**
   - Confirm owner grants sufficient rights for property photos/copy/local guide material.
   - Decide how strict to be about copied OTA reviews, OTA-origin guest data, and platform anti-circumvention language.

8. **Privacy and AI-assisted operations**
   - Confirm disclosure that DirectStay uses AI/operator tooling for drafting, summaries, QA, and recommendations.
   - Confirm what guest/owner data may be stored in admin systems, audit logs, analytics, communications providers, and AI/operator tooling.

9. **Liability, indemnity, and insurance**
   - Liability cap amount/lookback period and exclusions.
   - Owner indemnity for property condition, legal compliance, guest incidents, taxes/permits, owner-provided content, and OTA rule violations.
   - DirectStay indemnity scope for gross negligence/willful misconduct/unauthorized content use.
   - Any minimum owner insurance expectations.

10. **Term, termination, and transition**
    - Default term: month-to-month vs fixed initial term.
    - Termination notice/cure periods.
    - What happens to DirectStay-hosted site, custom domain, approved copy, guest/reservation records, and unpaid fees after termination.

11. **Governing law and disputes**
    - Governing law and venue.
    - Mediation/arbitration, jury waiver, class waiver, attorney-fee provisions, if any.

12. **Signature/acceptance method**
    - E-signature provider vs typed signature vs authenticated owner portal approval vs email acceptance.
    - Required signature record metadata: signer identity, timestamp, version/hash, property/lead context, storage URL, and audit event.

## Recommended approval sequence

1. Jaimal chooses/answers the business decisions above.
2. Counsel reviews the agreement draft with those decisions filled in.
3. Bishop updates the template and PlatformLead review checklist as an internal draft.
4. Jaimal explicitly approves a version for owner-facing manual send/signature.
5. Only then: enable any owner-facing send/signature provider work.

## Current safe system behavior

- Agreement artifacts can be drafted internally.
- Owner-facing sends remain manual markers only.
- Owner/platform agreement artifacts must be approved before they can be marked sent.
- Final launch approval is gated behind prior launch-readiness checks.
- Preview Builds remain non-functional until operational and legal gates are satisfied.
