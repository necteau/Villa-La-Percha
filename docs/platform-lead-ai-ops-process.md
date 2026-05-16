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

A Preview Build is a fast, AI-created property website draft used to surprise high-potential leads early. It should feel like DirectStay studied the owner’s actual property, photos, decor, market, and geography — not like a generic vacation-rental template.

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

Use public-but-obscure shareable URLs. Current implemented route is:

`https://directstay.app/p/property-name-randomtoken`

Legacy/spec language may refer to `/preview/...`, but production Preview Build records and owner proposal artifacts use `/p/{slug}`. Keep `/p/{slug}` as the canonical current route unless the app routing changes.

Rules:

- Random token so URL is not guessable.
- Noindex.
- Not linked from nav/sitemap.
- Shareable without login.
- Treated internally as a draft/spec artifact.

Preview URLs are public-obscure, not confidential. They must not contain private owner data, sensitive operational details, unpublished contact details, or claims DirectStay would not be comfortable defending if the URL were forwarded.

Owner-share messages should explicitly say the preview is a draft, noindex, not linked publicly, non-functional, based on listed sources/assumptions, correctable by the owner, and removable on request.

Recommended Preview Build status sequence:

1. `INTERNAL_DRAFT` — can contain rough assumptions/placeholders.
2. `JAIMAL_REVIEW` — safe enough for internal review, not owner-shareable yet.
3. `OWNER_SHARE_APPROVED` — rubric passed, source/assumption/share note complete, Jaimal approved sharing.
4. `SHARED_WITH_LEAD` — only after manual owner send/link share.
5. `SUPERSEDED` / `REMOVED` — use if owner objects, content changes materially, or the preview should no longer be accessible.

Current implementation may use a smaller enum (`DRAFT`, `READY_FOR_REVIEW`, `SHARED_WITH_LEAD`, `PROMOTED_TO_SITE`, `ARCHIVED`), but the operational gate remains the same: do not mark or treat a Preview Build as shared until owner-share approval, safety pass, and recorded share note exist.

### Preview Build Design Process

Before building, Bishop must complete a property-specific design pass using DirectStay-level docs, not Villa La Percha docs:

- `/Users/agents/.openclaw/workspace/directstay/docs/platform-leads/preview-build-playbook.md`
- `/Users/agents/.openclaw/workspace/directstay/docs/platform-leads/design-inspiration-library.md`
- `/Users/agents/.openclaw/workspace/directstay/docs/platform-leads/templates/property-photo-geography-audit.md`
- `/Users/agents/.openclaw/workspace/directstay/docs/platform-leads/preview-build-evaluation-rubric.md`
- Seed DESIGN files under `/Users/agents/.openclaw/workspace/directstay/docs/platform-leads/design-seeds/`

Required sequence:

1. Explore the listing/source the owner sent, including owner/manager-written description prose — not only titles, amenity chips, and photos.
2. Audit property photos: exterior, views, interiors, materials, color temperature, decor, landscape, light, repeated motifs, and unusable assets.
3. Read the exact micro-location/geography, not just a broad category like “coastal” or “mountain.”
4. Build a Property Design Fingerprint: property type, guest archetype, emotional promise, location cues, owner/decor style, signature stay moments, assumptions, and missing inputs.
5. Choose a seed archetype only as a starting point. Actual photos, decor, materials, light, and exact geography override the seed.
6. Derive palette, typography, spacing, image rhythm, and copy tone from source evidence.
7. Create a property-specific DESIGN.md/design brief for material previews.
8. Create a preview content/section plan with the conversion trio: read-only calendar/date-window mock, structure-only price/trip-total clarity, and a micro-location area guide.
9. Run a **pre-render rubric preflight** against the audit, DESIGN brief, and content plan. This can approve an internal render, but it cannot approve Jaimal/owner sharing.
10. Render the internal preview only if the source package can support a safe page-order image plan. If credible property imagery cannot be found from owner-provided sources or public listings, stop and mark the property image-blocked. The allowed output is a research note, source gap, and owner photo request - not a real Preview Build with text-only substitutes.
11. Run a **post-render promotion gate** against the actual URL on desktop and mobile before `READY_FOR_REVIEW`, Jaimal review, or owner-share consideration.

Critical design rule: broad categories are not enough. Two coastal villas should not look alike unless their actual photos, interiors, owner style, and micro-location support the same direction. Chalk Sound, Cape Cod, Malibu, Greek islands, Lowcountry marsh, Lake Norman dock houses, and Sarasota/Phillippi River retreats should produce different palettes, typography, spacing, conversion modules, and emotional framing.

### Creative Review Loop

For benchmark/refinement work, and for any high-value PlatformLead where the first Preview Build feels generic, Bishop should run a combined creative review loop before treating the output as a design lesson:

1. **Pick 3 design archetypes.** Choose distinct directions that could plausibly fit the property, such as editorial luxury travel, boutique hotel conversion, quiet owner-direct trust, location-first adventure guide, architectural/interior showcase, family lake-house utility, or neighborhood/townhouse local-living. Record why each archetype does or does not fit the actual source material.
2. **Build a small reference board.** Pull 3-5 strong hospitality/design references or prior DirectStay seeds before judging the build. For each reference, record the specific move to borrow: typography tension, hero treatment, image rhythm, section pacing, palette, conversion module, or copy posture. Do not copy whole designs.
3. **Generate or compare variants.** Prefer a 3-variant tournament for benchmark work: one variant per archetype, with different layout/copy strategies. If only one preview exists, critique it against the unused archetypes and state what a competing variant would have done differently.
4. **Capture screenshot-based critique.** Review desktop and mobile screenshots and label failure modes concretely: hero has no point of view, sections repeat the same rhythm, copy sounds replaceable, image hierarchy is weak, CTAs lack booking psychology, mobile stack loses drama, card-grid sameness, unsafe/unsupported claim, or owner-strategy language leaking into guest view.
5. **Run the specificity audit.** Any headline, section intro, CTA, or owner-facing claim that could fit another luxury rental must be rewritten or marked as a blocker. Use exact property evidence: micro-location, visible rooms/views/materials, arrival experience, guest use case, owner-local knowledge, planning friction, or trust signal.
6. **Score by contrast.** Rank variants or critique directions by first impression, property-specificity, owner-direct trust, booking intent, memorable visual idea, mobile composition, source safety, and least generic copy.
7. **Promote lessons back into the system.** Update the Preview Build playbook, design seeds, admin generation prompts, or starter packet templates with recurring failures and winning patterns. A benchmark review is incomplete if its lessons stay in the review artifact only.

This loop is mandatory for the Preview Build Refinement Lab. It is optional but recommended for one-off owner previews unless Jaimal explicitly wants speed over variety.

### Required Preview Build Packet

A Preview Build record is not a shareable Preview Build. Treat preview quality as two separate gates: **pre-render planning quality** and **post-render owner-share readiness**. Before owner-share review, create or attach:

- Property Photo + Geography Audit.
- Property-specific DESIGN.md/design brief.
- Preview content/section plan.
- Calendar/date-window mock plan near inquiry.
- Price/trip-total comparison mock plan with owner-only assumptions; no unsupported savings/best-rate claims.
- Micro-location area guide plan with confirmation gaps for restaurants, distances, access, safety, and recommendations.
- Fact register with source URLs and observed claims.
- Assumption register with inferred claims and missing owner inputs.
- Owner-specific callouts, including an assumptions/correction callout.
- Pre-render rubric preflight, when the rendered page does not yet exist.
- Page-order rendered-image inventory after render: hero, first two visible sections, all later section art, text-only sections, rejected assets, and thin-gallery exceptions.
- Guest-copy QA pass against the rendered guest view, including a bad-copy scan for `benchmark`, `source description`, `source material`, `final live copy`, `preview uses mock`, `strategy`, cross-property badge bleed, and other internal/process language.
- Desktop and mobile QA evidence.
- Post-render rubric score with safety pass/fail and owner-share blockers separated from the score.
- Owner-share note explaining source basis, draft status, public-obscure/noindex/non-functional status, correction path, and removal path.

If these are missing, the artifact is only a placeholder/internal draft, not something to send to an owner. Planning packets and pre-render scores must never be treated as owner-share readiness.

### Preview Media / Source Policy

- Prefer owner-provided images or sources the owner explicitly supplied.
- For public listings, record source URL and use only as draft/source material until owner confirms rights and replacements.
- A real Preview Build requires credible property imagery before rendering. Public OTA/listing photos may be used as draft visual source material when owner-provided photos are not yet available, but the source URL, rights gap, and owner-confirmation requirement must be recorded.
- If no credible property photos can be found, do not build the property site. Mark it `image-blocked`, create the owner photo/source request, and leave Creative Review unstarted until photos exist.
- Do not copy OTA reviews, ratings, guest names, guest photos, or testimonial language without recorded permission/source rights and owner approval.
- Do not expose private owner contact details, unpublished operational details, access codes, calendars, or sensitive notes.
- Store screenshots/QA artifacts privately unless explicitly intended for owner sharing.
- Optimize and rehost images only when rights/permission are clear; otherwise treat images as reference material for internal design direction.

### Preview-to-Production Conversion

The Preview Build can become the starting point for the real site, but `PROMOTED_TO_SITE` requires a conversion packet:

- Owner truth reconciliation complete: assumptions replaced or removed.
- Owner/property production records linked.
- Owner callouts removed from guest-facing production view.
- Final property content/photos approved.
- Inquiry/payment/booking behavior still disabled unless launch gates approve it.
- Contract and launch readiness checklist complete.
- Final Jaimal go-live approval recorded.

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
- How the palette/layout came from the owner’s photos, decor, and location rather than a generic template.
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
