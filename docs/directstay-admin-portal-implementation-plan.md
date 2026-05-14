# DirectStay Admin Portal Implementation Plan

_Last updated: 2026-05-06_

This is the durable working plan for the DirectStay Admin Portal and PlatformLead implementation. If sessions reset or memory is lost, start here.

## Continuity Rules

- This file is the source of truth for admin portal implementation status.
- After completing each phase, update:
  - the phase status
  - completion date
  - commit hash / PR / deploy URL if available
  - agent test results
  - Jaimal acceptance test result, if known
  - notes / follow-ups discovered during implementation
- Do not move to the next phase until the current phase is deployable and production-safe.
- Each phase must end with a clean build and a functional production-safe state. No half-baked production surfaces.
- Admin portal functionality must be DB-backed. Do not use JSON fallback writes for admin operations.
- New owner-acquisition leads are called **PlatformLead** records, not guest inquiries or owner inquiries.
- Guest rental inquiries remain `Inquiry`; DirectStay business-development leads are `PlatformLead`.

## Current Status Ledger

| Phase | Name | Status | Completed | Commit/Deploy | Notes |
|---|---|---:|---|---|---|
| 0 | Safety Prep / Baseline | Agent complete | 2026-05-01 | `897933f` | Lint/build passed; Prisma schema/migrations inspected; no admin routes exposed. |
| 1 | Admin Foundation, Read-Only | Jaimal accepted | 2026-05-01 | `d4fd3e9`, `d50bcd5`, `a60e1f4` / pending deploy | Read-only `/admin` routes implemented with ADMIN guard; Jaimal verified ADMIN access and OWNER/MANAGER blocking. Mobile/admin nav polish completed. |
| 2 | Audit Log Foundation | Agent complete | 2026-05-02 | `4f2762a`, `3ee71cc` / production `directstay.app` | AuditLog model/migration, audit helper, admin read logging, denied-role logging, and `/admin/activity` deployed. Preview QA unblocked with Vercel automation bypass + Preview owner allowlist fix; production authenticated QA passed 6/6. |
| 3 | PlatformLead Public Intake | Agent complete | 2026-05-02 | `0b38935`, `9584edc`, `fd22f5c` / production `directstay.app` | PlatformLead model/migration, public owner funnel, form/API, thank-you redirect, validation/spam basics, and admin list/detail deployed. Preview and production owner-intake QA passed; production authenticated QA passed 6/6 and PlatformLead DB records verified. |
| 4 | PlatformLead Triage Tools | Agent complete | 2026-05-03 | `bcf22be`, `e10b8bc`, `55243f3`, `3b49965`, `a7249a0`, `f565d00` / production `directstay.app` | PlatformLead detail, status/ops/notes, assignment, follow-up/source fields, queue views/counts, list-level owner-ops/artifact/preview visibility, reverse-chronological timeline, durable jobs, AI artifacts, approvals, notes, preview builds, contract milestones, and audit events are deployed. Production QA passed, including PlatformLead AI ops, queue markers across all views, and authenticated DirectStay QA 6/6. |
| 5 | PlatformLead Proposal Automation | Agent complete | 2026-05-06 | `964739d`, `5fd07b3`, `26327bd`, `798835d`, `c306a91`, `19a1fdb`, `ce9ca4b`, `69c8c03`, `3ba1f82`, `bc84889` / production `directstay.app` | Proposal, launch-readiness, onboarding, contract-context, and launch-approval gates are live. All owner-facing sends remain draft/manual approval only. |
| 6 | Admin Owner Context, Read-Only Owner Workspace | In progress | — | `1c3250b`, `1c0dea1` / pending production QA | Owner-context start/exit, signed HTTP-only context cookie, owner detail workspace entry, scoped owner-portal banner, audit events, no-context admin scope guard, and admin owner-portal write blocking are implemented. Follow-up needed: authenticated QA for context switching/data isolation and write-block behavior. PlatformLead Emily simulation plan and artifact pack are ready for safe role-play rehearsal; document QA passed 2026-05-13 via `npm run qa:platform-lead-emily-plan`, `npm run qa:platform-lead-emily-pack`, and `npm run lint`. |
| 7 | Controlled Admin Writes | Not started | — | — | — |
| 8 | PlatformLead Conversion | Partially prepared | — | `26327bd`, `c306a91` / production `directstay.app` | Proposal/onboarding artifacts and launch readiness gate are live. Actual conversion into Owner/Property records remains intentionally not automated; final launch/tenant creation still requires explicit approval and later implementation. |
| 9 | Onboarding Invite / Approved Communications | Not started | — | — | — |
| 10 | Admin Settings, Split by Risk | Not started | — | — | — |
| 11 | Operational Polish | Not started | — | — | — |

Status values: `Not started`, `In progress`, `Agent complete`, `Jaimal accepted`, `Blocked`, `Needs revision`.

---

## Global Implementation Principles

1. **Deploy-safe phases only**
   - Every phase must leave the app buildable, deployable, and useful.
   - Avoid production placeholders unless admin-only, non-dangerous, and clearly marked.

2. **Explicit admin identity**
   - Admins do not become owners.
   - Admin actions always retain real admin identity.
   - Owner context is explicit and auditable.

3. **Existing model alignment**
   - Current `Owner` is the tenant/account object.
   - Do not introduce a redundant `owner_accounts` table unless a later migration proves it necessary.

4. **PlatformLead separation**
   - `PlatformLead` = property owner / business prospect wanting DirectStay.
   - `Inquiry` = guest rental inquiry for a property.

5. **DB-required admin operations**
   - Admin reads/writes should fail safely if DB is unavailable.
   - No admin mutation should silently fall back to local JSON files.

6. **Audit before risk**
   - Audit logging should exist before meaningful admin write actions.

7. **Draft-and-approve external communications**
   - Owner onboarding/invite emails must be previewed and explicitly sent.
   - No automatic external sends on lead conversion unless Jaimal explicitly approves that behavior later.

8. **Property URL strategy: subfolder by default, custom domain ready**
   - Default DirectStay-hosted property URL is `directstay.app/<property-slug>`.
   - Properties must also support optional custom domains such as `villalapercha.com` or `www.customer-property.com`.
   - Keep `property.slug` as the stable internal/public path key even when a custom domain is primary.
   - Store custom domains as property/site domain records with primary/alias/status fields; do not hardcode one domain per property.
   - Routing must eventually resolve both path-based requests and host-header custom-domain requests to the same property context.
   - Avoid SEO duplicate issues: each property needs one primary canonical URL, with aliases/subfolder behavior intentionally configured.
   - DirectStay will manage repo/Vercel/DNS guidance operationally; owners may own the registrar/domain but DirectStay handles setup instructions and Vercel configuration.

---

# Phase 0 — Safety Prep / Baseline

## Goal
Make sure implementation starts from a clean, deployable baseline.

## Deliverables
- Confirm current `main` builds.
- Confirm current owner portal still works.
- Confirm DB migration state.
- Create feature branch.
- Add/update this implementation plan.

## Production State After Phase
- No user-facing changes required.
- Existing app remains unchanged.

## Agent Testing Steps
- Run `git status --short` and identify unrelated changes.
- Run `npm run lint`.
- Run `npm run build`.
- Inspect current Prisma migration/schema state.
- Confirm owner portal protected routes still compile.
- Confirm no admin routes have been partially exposed.

## Jaimal Testing Steps
- Open `directstay.app` and confirm the public site loads.
- Log into the owner portal.
- Spot-check dashboard, inquiries, reservations, pricing, payments, sites, and customers.
- Confirm no visible admin UI appears publicly or in owner portal.

## Exit Criteria
- Clean build.
- No unrelated dirty files.
- Implementation branch ready.
- This plan exists and is committed.

## Completion Notes
Agent complete 2026-05-01. Baseline checks performed: `git status --short`, `npm run lint`, `npm run build`, Prisma schema/migration file inspection, and route manifest review from Next build. Existing owner portal routes compile. No `/admin` routes are present yet, so no partial admin UI is publicly exposed. `.DS_Store` artifact under `prisma/migrations/` was removed before commit.

---

# Phase 1 — Admin Foundation, Read-Only

## Goal
Create a real `/admin` portal without dangerous write operations.

## Deliverables
- `/admin` route group/layout.
- Admin auth/role guard using existing `User.role === ADMIN`.
- Admin nav:
  - Dashboard
  - Owners
  - Properties
  - Platform Leads placeholder
  - Settings placeholder
- Admin dashboard with read-only summary cards.
- `/admin/owners`.
- `/admin/owners/[ownerId]`.
- `/admin/properties`.
- `/admin/properties/[propertyId]`.
- Central admin data-access helper.
- DB-required behavior for admin pages.

## Production State After Phase
- Admin can log in and inspect owners/properties.
- No production data mutation from admin yet.
- Owner portal remains unchanged.

## Agent Testing Steps
- Run `npm run lint`.
- Run `npm run build`.
- Test unauthenticated `/admin` access redirects/blocks.
- Test non-admin authenticated user is blocked.
- Test admin user can access `/admin`.
- Test `/admin/owners` loads from DB.
- Test `/admin/owners/[ownerId]` shows correct owner-related data.
- Test `/admin/properties` loads from DB.
- Test `/admin/properties/[propertyId]` shows correct property-related data.
- Temporarily simulate missing DB config locally and confirm admin fails safely instead of using JSON fallback.
- Verify existing owner portal routes still build and load.

## Jaimal Testing Steps
- Visit `/admin` while logged out; confirm access is denied or redirected.
- Log in as a non-admin owner if available; confirm `/admin` is denied.
- Log in as admin; confirm `/admin` loads.
- Open Owners list; confirm records look accurate.
- Open an owner detail page; confirm linked properties/summary look accurate.
- Open Properties list; confirm records look accurate.
- Open a property detail page; confirm owner/property relationship is correct.
- Confirm no edit/save/delete buttons are available yet.
- Confirm owner portal still works normally.

## Exit Criteria
- Admin routes protected.
- Non-admin users blocked.
- Read-only owner/property views work.
- No admin writes exist.
- Preview deploy verified.
- Production deploy safe.

## Completion Notes
Agent complete 2026-05-01. Implemented `/admin`, `/admin/owners`, `/admin/owners/[ownerId]`, `/admin/properties`, and `/admin/properties/[propertyId]` as read-only DB-backed pages. Added ADMIN role guard via Supabase session + Prisma `User.role === ADMIN`; no admin mutation buttons/actions exist. Added responsive admin styling and dynamic rendering to avoid static auth leakage. Agent tests: `npm run lint`, `npm run build`, and local unauthenticated `/admin` redirect to `/owner-portal/login?next=/admin` passed. Jaimal acceptance 2026-05-01: `necteau@gmail.com` verified as ADMIN can access `/admin`; temporary MANAGER and OWNER role tests both allowed owner portal access while blocking `/admin`; account restored to ADMIN afterward. Follow-up polish commits fixed mobile overflow and clarified disabled Phase 1 nav placeholders (`Platform Leads · coming soon`, `Settings · coming soon`).

---

# Phase 2 — Audit Log Foundation

## Goal
Establish accountability before admin writes exist.

## Deliverables
- Add `AuditLog` Prisma model.
- Add audit helper capturing:
  - actor user ID/email
  - actor role
  - action
  - entity type
  - entity ID
  - owner ID if applicable
  - property ID if applicable
  - metadata JSON
  - createdAt
- Admin activity page: `/admin/activity`.
- Log key admin reads and denied access attempts where practical.

## Production State After Phase
- Admin portal remains mostly read-only.
- Audit trail starts collecting admin access/visibility events.
- Still no risky writes.

## Agent Testing Steps
- Create and apply Prisma migration locally.
- Run Prisma generate if needed.
- Run `npm run lint`.
- Run `npm run build`.
- Visit admin owner/property pages and confirm audit records are created.
- Attempt unauthorized admin access and confirm denied attempt is logged where feasible.
- Confirm `/admin/activity` displays audit records in reverse chronological order.
- Confirm audit log write failures do not crash read-only page loads unless the main DB operation itself fails.
- Verify owner portal behavior unchanged.

## Jaimal Testing Steps
- Log in as admin.
- Visit a few admin pages.
- Open `/admin/activity` and confirm your page visits/actions appear.
- Confirm activity entries are understandable: actor, action, record, time.
- Attempt a denied access scenario if a non-admin account is available; confirm access is denied.
- Confirm owner portal still works normally.

## Exit Criteria
- Migration applied cleanly.
- Audit records are created.
- Activity page works.
- Preview deploy verified.

## Completion Notes
Agent complete 2026-05-02. First slice added the AuditLog Prisma model and migration, a non-blocking audit helper, logging for admin dashboard/owner/property/activity reads, best-effort non-admin denied-role logging, and a reverse-chronological `/admin/activity` page. Agent gates passed locally: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, and `npm run build`. Supabase migration applied 2026-05-02 via the saved pooler connection after direct Prisma deploy could not resolve/reach the direct DB host. Verification passed: `_prisma_migrations` row exists, `AuditLog` columns exist, and a transaction-rolled-back audit write/readback succeeded. Preview deployed and protected-preview QA was unblocked via Vercel automation bypass. Production deployed to `directstay.app`; authenticated QA passed 6/6 across desktop/mobile admin/manager/owner, including `/admin/activity`, `/admin/owners`, and `/admin/properties` admin checks. DB verification showed recent audit events for `admin.read.dashboard`, `admin.read.activity`, `admin.read.owners`, `admin.read.properties`, and `admin.access_denied`.

Re-verified 2026-05-04 for Workstream 7 continuity: Phase 2 foundation is already present and buildable in this branch (`AuditLog` model/migration, `src/lib/admin/auditLog.ts`, denied-role logging in `adminAuth`, protected `/admin/activity`, and admin read-event logging). No additional schema or route changes were required for this phase before continuing to later PlatformLead workstreams.

---

# Phase 3 — PlatformLead Public Intake

## Goal
Launch the public DirectStay owner-acquisition funnel safely.

## Deliverables
- Add `PlatformLead` Prisma model.
- Public pages:
  - `/for-property-owners`
  - `/request-a-site`
  - `/thank-you`
- Public lead form fields:
  - name
  - email
  - phone optional
  - company/brand
  - property count
  - property location
  - current website/OTA links
  - desired custom domain, if they already own or want one
  - PMS/channel manager optional
  - launch timeline
  - goal
  - message
- API: `POST /api/platform-leads`.
- Validation with Zod/server-side checks.
- Basic spam/rate-limit protection.
- Store lead in DB.
- Admin notification email optional; failure must not block lead creation.
- Admin list: `/admin/platform-leads`.
- Admin detail: `/admin/platform-leads/[leadId]`.
- Lead statuses:
  - `NEW`
  - `CONTACTED`
  - `QUALIFIED`
  - `PROPOSAL_SENT`
  - `CONVERTED`
  - `UNQUALIFIED`
  - `ARCHIVED`

## Production State After Phase
- DirectStay can collect real PlatformLead records.
- Admin can view leads.
- No conversion automation yet.
- No half-built owner creation.

## Agent Testing Steps
- Create and apply Prisma migration locally.
- Run `npm run lint`.
- Run `npm run build`.
- Submit valid PlatformLead form and confirm DB record exists.
- Submit valid PlatformLead form with desired custom domain and confirm it is stored/displayed.
- Submit invalid email and confirm validation error.
- Submit missing required fields and confirm validation errors.
- Submit obvious spam/honeypot/rate-limit case and confirm rejection.
- Confirm lead appears in `/admin/platform-leads`.
- Confirm lead detail page displays all submitted fields.
- Confirm guest rental inquiry form still works and creates `Inquiry`, not `PlatformLead`.
- Confirm PlatformLead API does not use JSON fallback writes.

## Jaimal Testing Steps
- Open `/for-property-owners`; confirm page positioning/copy makes sense.
- Open `/request-a-site`; submit a realistic test lead.
- Confirm thank-you page appears and explains next steps.
- Log into `/admin`.
- Open Platform Leads list; confirm test lead appears.
- Open lead detail; confirm all submitted fields are present and readable, including desired custom domain if provided.
- Submit a bad/partial form and confirm helpful errors.
- Submit a normal Villa guest inquiry and confirm it still appears in the owner inquiry flow, not Platform Leads.

## Exit Criteria
- Public form creates DB record.
- Invalid/spam submissions rejected.
- Admin can view lead list/detail.
- Existing guest inquiry flow unaffected.
- Preview and production test lead submissions verified.

## Completion Notes
Agent complete 2026-05-02. Added `PlatformLead` Prisma model/status enum/migration, public `/for-property-owners`, `/request-a-site`, `/thank-you`, `POST /api/platform-leads`, form-post redirect support, server-side validation, honeypot/rate-limit basics, and admin `/admin/platform-leads` list/detail pages with audit logging. Supabase migration applied through the pooler SQL path. Local gates passed: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, and `npm run build`. Protected preview deployed and verified: public owner page, form page, URL-encoded form redirect to thank-you, invalid email rejection, missing-field rejection, honeypot handling, DB record with desired custom domain, and authenticated admin QA 6/6 including Platform Leads. Production deployed to `directstay.app`; production owner-intake QA passed, authenticated QA passed 6/6, and production DB verification showed recent `PlatformLead` records with desired custom domains. Jaimal then simplified the desired intake: the public form now asks for name, email, phone, property name, property location, current website/OTA listing, and an optional note; it no longer asks for company/brand, property count, PMS/channel manager, launch timeline, desired custom domain, or goal. Added nullable `propertyName` via migration and updated admin list/detail to foreground property name while preserving legacy fields for old records. Guest inquiry regression that sends notification email was not executed to avoid unnecessary outbound email; existing authenticated owner/inquiry surfaces still passed.
---

# Phase 4 — PlatformLead Triage Tools

## Goal
Make PlatformLead records operationally useful without creating tenants yet.

## Deliverables
- Update lead status.
- Assign lead to admin user.
- Add internal notes.
- Add next follow-up date.
- Add source tracking:
  - direct
  - referral
  - search
  - ad
  - manual
- Add activity timeline on lead detail.
- Audit every lead mutation.
- Optional email template draft only; no auto-send yet.

## Production State After Phase
- Admin can manage lead pipeline.
- Still no owner/account creation.
- No external communications sent without explicit approval.

## Agent Testing Steps
- Run `npm run lint`.
- Run `npm run build`.
- Update a lead status and confirm persistence.
- Assign lead to admin and confirm persistence.
- Add/edit internal note and confirm timeline/audit entries.
- Set next follow-up date and confirm display/sorting if implemented.
- Confirm queue views show useful counts for all latest, needs first read, needs approval, follow-up due, preview in progress, proposal-ready, and spam review.
- Confirm all mutations create audit records.
- Confirm non-admin cannot mutate leads.
- Confirm no email is sent automatically.
- Regression-test public PlatformLead form still works.

## Jaimal Testing Steps
- Open a test PlatformLead in admin.
- Change status from `NEW` to `CONTACTED` or `QUALIFIED`.
- Add an internal note.
- Set a follow-up date.
- Confirm the lead list reflects the new status/follow-up.
- Open activity/audit view and confirm changes are recorded.
- Confirm no email was sent unexpectedly.

## Exit Criteria
- Status changes persist.
- Notes and follow-ups persist.
- Audit log captures changes.
- Non-admin users blocked.
- Preview deploy verified.

## Completion Notes
In progress 2026-05-02. First vertical triage slice shipped to production: admin PlatformLead list links to a stable `/admin/platform-leads/detail?leadId=...` detail view; detail includes a status selector; status updates post to `/admin/platform-leads/status`, require an ADMIN session, persist the new `PlatformLead.status`, revalidate admin pages, redirect back to detail, and record `admin.platform_lead.status_updated` in `AuditLog` with from/to metadata. Local gates passed: `npm run lint` and `npm run build`. Protected preview QA created a lead, changed status from `NEW` to `CONTACTED`, and verified the audit event appeared in `/admin/activity`. Production QA repeated the status update successfully and authenticated DirectStay QA passed 6/6. During implementation, the original dynamic detail route `/admin/platform-leads/[leadId]` behaved like a not-found route in preview for newly-created leads despite list visibility, so the stable query-param detail route was added and list links now use it. Second slice 2026-05-02 added internal notes: `PlatformLeadNote` model/migration, ADMIN-guarded `/admin/platform-leads/notes` POST route, note form on lead detail, timeline rendering for lead creation + notes, and `admin.platform_lead.note_added` audit events. Migration applied via pooler SQL path. Local gates passed: Prisma validate/generate, lint, build. Preview and production QA created a lead, added a note, verified note visibility on detail timeline, and verified audit event in `/admin/activity`; production authenticated QA passed 6/6. Third slice adds list-level owner ops visibility (assignment, follow-up/next action, latest AI artifact) and upgrades the detail timeline into a reverse-chronological operating history that includes intake jobs, first read, assignment, follow-ups, spam review, artifacts/approvals/sent markers, preview builds, contract milestones, and notes. Local gates passed: `npm run lint` and `npm run build`. Pushed branch `feature/platform-lead-public-intake` and deployed to production `directstay.app` via Vercel deployment `https://villa-la-percha-e5dkzp4ta-necteau-7189s-projects.vercel.app`. QA passed: `DIRECTSTAY_PROCESS_PLATFORM_LEAD_JOBS_FOR_QA=1 node qa/browser-sweeps/test-platform-lead-ai-ops.mjs`, `node tools/browser-operator/tests/directstay-authenticated.mjs` with 6/6 authenticated checks, and direct marker check for `Owner ops`, `Latest AI artifact`, and `Reverse-chronological operating history`. Fourth slice adds queue views/counts for `All latest`, `Needs first read`, `Needs approval`, `Follow-up due`, `Preview in progress`, `Proposal-ready`, and `Spam review`, with preview status/slugs visible in the list and empty-state handling. Local gates passed: `npm run lint` and `npm run build`. Deployed to production `directstay.app`; QA passed for queue markers across all 7 views and authenticated DirectStay QA passed 6/6. Phase 4 is functionally complete unless live use reveals another triage blocker; next workstream is proposal automation.
---

# Phase 5 — PlatformLead Proposal Automation

## Goal
Turn qualified PlatformLeads into proposal-ready artifacts while preserving Jaimal approval before any external send.

## Deliverables
- Generate proposal rationale artifact from lead context, pricing fields, Preview Build, Lead Brief, and notes.
- Generate proposal email draft artifact with explicit draft-only/approval warning.
- Store both as `NEEDS_APPROVAL` artifacts in the PlatformLead timeline.
- Prevent duplicate active proposal drafts unless previous draft is rejected/superseded.
- Audit proposal generation requests and generated artifacts.
- Keep external sends manual; `SENT` remains a marker, not an email action.
- Provide safe artifact review controls: approve, reject, supersede, and mark sent manually.
- Add a conservative launch readiness gate before a PlatformLead can be treated as launch-ready.
- Generate onboarding brief and owner brain-dump email draft artifacts after proposal acceptance.

## Production State After Phase
- Admin can create a reviewable proposal package for a lead.
- Jaimal can approve/edit/reject proposal artifacts before any owner-facing outreach.
- No owner email is sent automatically.
- Launch remains blocked until contract, onboarding, content, preview assumptions, inquiry/payment flows, and final Jaimal approval are checked.
- Admin can produce onboarding prep artifacts without sending anything externally.

## Agent Testing Steps
- Run `npm run lint`.
- Run `npm run build`.
- Create/provision a test PlatformLead.
- Generate proposal rationale + draft.
- Confirm both artifacts appear as `NEEDS_APPROVAL`.
- Confirm artifact/timeline text contains draft-only approval language.
- Confirm review controls are visible and approval transition persists.
- Confirm launch readiness checklist persists and flips from blocked to complete only when all launch checks are saved.
- Confirm authenticated DirectStay QA still passes.

## Completion Notes
In progress 2026-05-03. First proposal slice shipped locally and to production: detail page has a `Generate proposal rationale + draft` control; `/admin/platform-leads/artifacts` supports `generate-proposal`; `createPlatformLeadProposalArtifacts` derives a proposal rationale and email draft from lead context, pricing fields, Preview Build, and latest Lead Brief; both artifacts are stored as `NEEDS_APPROVAL`, duplicate active proposal drafts are avoided, proposal generation is audited, and no external send occurs. Local gates passed: `npm run lint` and `npm run build`. Deployed to production `directstay.app`; QA passed for generating proposal artifacts on a test PlatformLead with markers `Proposal Rationale`, `Proposal Draft`, `Draft only`, `requires Jaimal approval before sending`, and `NEEDS APPROVAL`; authenticated DirectStay QA passed 6/6. Second proposal slice added explicit review guidance plus one-click `Approve`, `Reject`, `Supersede`, and `Mark sent manually` controls on each artifact, with advanced status override tucked behind a details disclosure. Local gates passed: `npm run lint` and `npm run build`. Deployed to production `directstay.app`; QA passed for review-control markers and approval transition persistence; authenticated DirectStay QA passed 6/6. Third proposal/launch slice added a conservative launch readiness gate to PlatformLead operating controls, persisted in `launchChecklist`: owner accepted proposal, contract executed, onboarding brief approved, owner content/photos received, preview assumptions resolved, inquiry flow approved, payment flow approved, final Jaimal launch approval, and launch/onboarding notes. Local gates passed: `npm run lint` and `npm run build`. Deployed to production `directstay.app`; QA passed for launch-gate persistence and blocked/complete markers; authenticated DirectStay QA passed 6/6. Fourth onboarding slice added `Generate onboarding brief + email draft`, creating `ONBOARDING_BRIEF` and `ONBOARDING_EMAIL_DRAFT` artifacts as `NEEDS_APPROVAL`, preventing duplicate active onboarding drafts, auditing generation, and preserving manual-only external send. Local gates passed: `npm run lint` and `npm run build`. Deployed to production `directstay.app`; QA passed for onboarding artifact markers (`Onboarding Brief`, `Owner Brain Dump Request`, `Draft only`, `NEEDS APPROVAL`) and authenticated DirectStay QA passed 6/6.

---

# Phase 6 — Admin Owner Context, Read-Only Owner Workspace

## Goal
Let admin view the owner portal in a scoped owner context safely.

## Deliverables
- Admin owner-context model or signed HTTP-only context cookie.
- “View owner workspace” button from owner detail.
- Owner portal banner:
  - “Admin mode: viewing [Owner Name]”
  - exit button
- Refactor owner portal scope helper:
  - real owner user → own owner IDs
  - admin with selected context → selected owner ID
  - admin without context → no accidental default owner
- Read-only owner-context mode first:
  - dashboard
  - inquiries
  - reservations
  - customers
  - pricing
  - payments
  - sites
- Prevent owner-context writes initially.
- Audit context start/end and page access.

## Production State After Phase
- Admin can inspect exactly what an owner sees.
- Admin cannot accidentally mutate owner data from owner portal.
- Safer than full impersonation.

## Agent Testing Steps
- Run `npm run lint`.
- Run `npm run build`.
- Start owner context from admin owner detail.
- Confirm banner appears on owner portal pages.
- Confirm exit clears context.
- Confirm context cannot be set by non-admin.
- Confirm admin without selected context cannot accidentally default into Villa La Percha or any other owner.
- Confirm read pages show only selected owner data.
- Confirm switching Owner A → Owner B does not leak Owner A data.
- Confirm owner-context write endpoints are blocked/read-only.
- Confirm real owner users still see their own portal normally.
- Confirm audit logs record context start/end/page access.

## Jaimal Testing Steps
- As admin, open an owner detail page.
- Click “View owner workspace.”
- Confirm owner portal loads with obvious admin banner.
- Navigate dashboard/inquiries/reservations/customers/pricing/payments/sites.
- Confirm data belongs to the selected owner.
- Try to perform an edit/save action; confirm it is blocked or unavailable in this phase.
- Exit owner view; confirm banner disappears and admin context clears.
- Repeat with a second owner if available; confirm no data leakage.

## Exit Criteria
- Admin context cannot leak between owners.
- Exit clears context.
- Non-admin cannot set context.
- Owner users unaffected.
- Preview deploy verified.

## Completion Notes
In progress 2026-05-04. First safe slice adds admin owner-context start and exit routes, a signed HTTP-only owner-context cookie, a `View owner workspace` form on admin owner detail, an owner portal admin-mode banner with exit button, audit events for context start/end, and a safer admin scope rule so admin users without selected owner context do not accidentally default into all-owner portal data. Local gates passed: `npm run lint` and `npm run build`. Follow-up slice added owner-portal API write blocking for ADMIN users so owner-context mode stays read-only across customer updates, inquiry actions, payment settings, reservations, pricing, and sites; read endpoints remain available. Local gates passed: `npm run lint` and `npm run build`. Follow-up needed: authenticated QA for context switching/data isolation and admin write-block behavior.

---

# Phase 7 — Controlled Admin Writes

## Goal
Add safe write operations one category at a time.

## Deliverables
- Allow limited admin edits in admin portal, not owner-context mode initially:
  - owner display name/support contact
  - property status
  - property inquiry settings
  - property default subfolder slug, with duplicate/conflict protection
  - property public/canonical URL metadata, without automatically changing DNS/Vercel yet
  - internal admin fields
- Confirmation/reason required for higher-risk writes.
- Audit before/after diffs.
- Permission helper:
  - `canAdminRead`
  - `canAdminWrite`
  - `canAdminPerformSensitiveAction`

## Production State After Phase
- Admin can make limited support edits.
- Every mutation attributable.
- Risky things remain blocked.

## Agent Testing Steps
- Run `npm run lint`.
- Run `npm run build`.
- Edit allowed owner field and confirm persistence.
- Edit allowed property field and confirm persistence.
- Confirm before/after diffs appear in audit log.
- Confirm duplicate/conflicting property slug changes are rejected.
- Confirm reason prompt appears for configured sensitive fields.
- Confirm disallowed fields cannot be changed by normal admin.
- Confirm non-admin cannot call mutation APIs.
- Confirm owner-context mode remains read-only unless explicitly changed later.
- Regression-test owner portal owner-led edits still work where intended.

## Jaimal Testing Steps
- As admin, edit a safe owner field.
- Confirm the update appears on owner detail.
- Edit a safe property/admin field.
- If exposed, edit a test property slug/public URL field and confirm duplicate conflicts are blocked.
- Confirm update appears correctly.
- Open audit/activity and confirm before/after is understandable.
- Try a risky/disallowed action if exposed; confirm it is blocked or requires confirmation/reason.
- Confirm owner portal still behaves normally.

## Exit Criteria
- Write actions audited.
- Failed permission attempts audited.
- Owner portal still works.
- Preview deploy verified.

## Completion Notes
_Not started._

---

# Phase 8 — PlatformLead Conversion

## Goal
Convert a qualified PlatformLead into real owner/property setup.

## Deliverables
- Conversion preflight screen detecting:
  - existing user by email
  - existing owner by email/company
  - existing property/domain/slug
  - desired custom domain availability/conflict state
  - conflicts before creating anything
- Convert action creates transactionally:
  - `Owner`
  - `User` if needed
  - `OwnerMember`
  - optional draft `Property` with stable `slug`
  - optional property domain record for desired custom domain, marked unverified/pending setup
  - onboarding status/checklist if implemented
- Mark `PlatformLead` as `CONVERTED`.
- Link lead to converted owner/property.
- No automatic external invite yet unless explicitly approved later.
- Audit conversion.

## Production State After Phase
- Admin can turn a lead into an owner tenant.
- Duplicate protection exists.
- No accidental email blast.

## Agent Testing Steps
- Run `npm run lint`.
- Run `npm run build`.
- Convert a clean test lead and confirm owner/user/member/property records are created.
- Confirm converted lead links to new owner/property.
- Confirm conversion is transactional: induced failure rolls back partial records.
- Test duplicate email detection.
- Test duplicate company/owner detection.
- Test duplicate property slug/domain detection.
- Test desired custom domain conflict/pending-domain handling.
- Confirm no onboarding email is sent automatically.
- Confirm converted owner appears in admin owners list.
- Confirm owner-context view can load the converted owner.
- Confirm audit log records conversion metadata.

## Jaimal Testing Steps
- Create or choose a test PlatformLead.
- Open conversion preflight.
- Confirm proposed owner/property/user details look right.
- Convert the lead.
- Confirm new owner appears in Owners.
- Confirm optional draft property appears under that owner if created.
- Confirm any desired custom domain appears as pending/unverified, not falsely live.
- Confirm lead status becomes `CONVERTED`.
- Confirm no external invite email was sent unless explicitly clicked.
- Try converting a duplicate-style lead and confirm the UI warns before action.

## Exit Criteria
- Conversion transaction rolls back cleanly on error.
- Duplicate detection works.
- Converted owner appears in admin owner list.
- Owner portal can load converted owner context.
- Preview deploy verified.

## Completion Notes
_Not started._

---

# Phase 9 — Onboarding Invite / Approved Communications

## Goal
Add controlled external communication.

## Deliverables
- Draft onboarding invite email.
- Admin preview/edit screen.
- Explicit “Send invite” action.
- Resend integration.
- Email send logged.
- PlatformLead/Owner timeline records invite sent.
- Failure state visible and retryable.
- Never auto-send on conversion by default.

## Production State After Phase
- Admin can onboard new owner safely.
- External communication follows draft-and-approve.

## Agent Testing Steps
- Run `npm run lint`.
- Run `npm run build`.
- Generate invite draft and confirm content includes correct owner/property context.
- Edit draft and confirm changes persist before send.
- Send test invite to controlled/test email.
- Confirm Resend success recorded.
- Simulate Resend failure and confirm retryable failure state.
- Confirm send action requires explicit click.
- Confirm no invite sends automatically on conversion.
- Confirm timeline and audit log include send event.

## Jaimal Testing Steps
- Open a converted owner/lead.
- Generate onboarding invite draft.
- Review/edit the draft.
- Send to a test-controlled inbox first.
- Confirm email arrives and links/content are correct.
- Confirm admin timeline shows invite sent.
- Confirm retry/failure UI is understandable if a send fails.

## Exit Criteria
- Test email sends in preview/sandbox or controlled production test.
- Production send requires explicit click.
- Failures do not corrupt owner state.
- Preview deploy verified.

## Completion Notes
_Not started._

---

# Phase 10 — Admin Settings, Split by Risk

## Goal
Add settings without creating a chaos drawer.

## Deliverables
- `PlatformSetting` model.
- Settings sections:
  - General
  - Inquiry routing
  - Email templates
  - Site defaults
  - Domain/custom-domain setup defaults and DNS instruction templates
  - Feature flags
- Keep secrets/integrations mostly read-only or environment-backed at first.
- Audit every setting change.
- Sensitive changes require confirmation/reason.

## Production State After Phase
- Admin can manage operational settings safely.
- No raw secret exposure.

## Agent Testing Steps
- Create/apply migration.
- Run `npm run lint`.
- Run `npm run build`.
- Update a safe general setting and confirm persistence.
- Update inquiry routing and confirm it affects new lead behavior if implemented.
- Update email template draft and confirm persistence/rendering.
- Toggle feature flag and confirm gated behavior changes as expected.
- Update/test a DNS instruction template or custom-domain setup default if implemented.
- Confirm secret/integration values are masked or read-only.
- Confirm invalid setting values are rejected.
- Confirm audit log records all setting changes.
- Confirm non-admin cannot read/write settings.

## Jaimal Testing Steps
- Open Admin Settings.
- Update a harmless general setting.
- Confirm it saves and displays correctly.
- Update an email template draft and preview it.
- Toggle a safe feature flag if available and confirm expected behavior.
- Review custom-domain/DNS setup copy and confirm it is clear for future owner domains.
- Confirm no raw secrets are visible.
- Open activity/audit and confirm setting changes are recorded.

## Exit Criteria
- Settings persist.
- Invalid settings rejected.
- Audit log captures changes.
- No raw secret exposure.
- Preview deploy verified.

## Completion Notes
_Not started._

---

# Phase 11 — Operational Polish

## Goal
Make the admin portal feel like a real operating system.

## Deliverables
- Better dashboard widgets.
- Global search.
- Filters/saved views.
- Domain/site health cards.
- Custom domain readiness/status cards: primary domain, aliases, DNS target, Vercel status, SSL status, canonical URL.
- Host-header property resolution for custom domains, if not completed earlier.
- PlatformLead pipeline board.
- Owner health indicators.
- Task/reminder system if still needed.

## Production State After Phase
- Fully functional DirectStay command center.
- No dead scaffolding or fake widgets.

## Agent Testing Steps
- Run `npm run lint`.
- Run `npm run build`.
- Test dashboard widgets against known DB records.
- Test global search for owner, property, email, domain, and lead.
- Test filters/saved views if implemented.
- Test pipeline board drag/status updates if implemented.
- Test domain/site health cards display real or intentionally unavailable states.
- Test custom-domain host routing with a controlled domain/subdomain or local host-header simulation.
- Confirm canonical URL behavior avoids duplicate SEO confusion between `directstay.app/<slug>` and custom domain.
- Confirm no placeholder buttons or dead links remain.
- Run a full regression pass:
  - public site
  - guest inquiry
  - owner portal
  - admin portal
  - PlatformLead flow
  - conversion/invite/settings as applicable

## Jaimal Testing Steps
- Use admin portal as if running the business for 10–15 minutes.
- Search for an owner/property/lead.
- Review dashboard widgets and confirm numbers feel accurate.
- Move or update a PlatformLead if pipeline board exists.
- Check an owner health/status area.
- Check domain/site health display.
- If a controlled test domain/subdomain is available, verify it loads the correct property site and owner inquiry flow.
- Confirm there are no confusing placeholders, dead buttons, or misleading widgets.
- Confirm owner portal and public site still feel normal.

## Exit Criteria
- No placeholder nav or dead buttons.
- Widgets backed by real data or intentionally hidden.
- Full production deploy verified.

## Completion Notes
_Not started._

---

# Per-Phase Update Template

When a phase is completed, update the ledger and add a note here using this template.

```markdown
## Phase X Completion Note — YYYY-MM-DD

Status: Agent complete / Jaimal accepted / Needs revision / Blocked
Commit: `<hash>`
Preview deploy: <url>
Production deploy: <url or N/A>

Agent tests performed:
- [ ] npm run lint
- [ ] npm run build
- [ ] route/API-specific tests
- [ ] regression checks

Jaimal tests performed:
- [ ] listed user acceptance checks
- [ ] accepted / requested changes

Notes:
- ...

Follow-ups:
- ...
```

### AI-led PlatformLead ops foundation — 2026-05-02

Agent complete. Added the first AI-led operating foundation from `docs/platform-lead-ai-ops-process.md`: PlatformLead spam/suspicious statuses, first-read/next-action/follow-up/source fields, flexible pricing fields including separate payment-processing bps, contract execution tracking, artifact records for Lead Briefs/first responses/proposal rationale/proposal drafts/onboarding drafts, Preview Build records, admin routes for artifacts/ops/previews, and public noindex Preview Build pages at `/p/{slug}`. Removed the stale Vercel catch-all rewrite because it forced new public dynamic routes to match `/`. Migration `20260502164000_add_platform_lead_ai_ops` was applied to Supabase through the pooler SQL path after direct Prisma deploy hit the known `HOST:5432` connectivity placeholder failure. Local gates passed: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, and `npm run build`. Production deployed to `directstay.app`; QA passed for creating a PlatformLead, saving operating state, saving a Lead Brief artifact, creating a Preview Build, verifying owner-view callouts and disabled inquiry on `/p/{slug}`, plus full authenticated DirectStay QA 6/6.

### Contract flows completion — 2026-05-06

Agent complete. Finished and deployed both contract operating tracks while keeping all external send/signature activation behind Jaimal/legal approval. Guest rental contract work now includes the Villa La Percha owner-review draft, source notes, contract-template/execution schema foundation, inquiry/reservation contract linkage, owner-portal booking warning/override language, and inquiry copilot contract context. PlatformLead owner/platform agreement work now includes owner-review draft PDF, agreement research notes, integration plan, OWNER_PLATFORM_AGREEMENT artifact generation, contract status controls, launch-readiness contract gate, backend guard requiring COUNTERSIGNED before `contractExecuted`, and audit-safe internal-only owner agreement draft creation. Supabase migrations `20260505170000_add_owner_platform_agreement_artifact` and `20260506011500_add_contract_tracking` were applied through the pooler SQL path and recorded in `_prisma_migrations` after direct Prisma deploy again attempted the unreachable direct `HOST:5432` path. Production deployed to `directstay.app` via Vercel deployment `https://villa-la-percha-kwq0dxi4h-necteau-7189s-projects.vercel.app`.

QA passed: local `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`; Vercel production build; production authenticated DirectStay QA 6/6; production PlatformLead AI ops QA; production PlatformLead contract smoke covering owner agreement artifact creation, backend COUNTERSIGNED contract-executed gate, and counter-signature save path; production DB rollback smoke covering ContractTemplate/ContractExecution inserts, relation readback, migration records, and clean rollback.

Still intentionally not complete: legal/business approval and owner/guest-facing send/signature activation. Drafts are operational/legal-review artifacts only until Jaimal and/or counsel approves final terms.
