# DirectStay Preview Build Implementation Slice

Goal: make DirectStay Preview Builds enforce the same quality/safety process documented in the playbook, instead of relying on operator memory.

## Slice 1 — Preview packet artifacts and gated statuses

### Data/model options

Preferred lightweight approach: use `PlatformLeadArtifact` for preview packet components before expanding `PreviewBuild` schema.

Add artifact types:

- `PREVIEW_PHOTO_GEO_AUDIT`
- `PREVIEW_DESIGN_BRIEF`
- `PREVIEW_FACT_REGISTER`
- `PREVIEW_ASSUMPTION_REGISTER`
- `PREVIEW_RUBRIC_REVIEW`
- `PREVIEW_SHARE_NOTE`
- `PREVIEW_CONVERSION_PACKET`

Alternative: add JSON/Markdown fields directly to `PreviewBuild`, but artifacts preserve history and approvals better.

### Status gates

Current enum may remain initially, but enforce transitions:

- `DRAFT` → `READY_FOR_REVIEW` requires:
  - photo/geography audit artifact,
  - design brief artifact,
  - fact/assumption register,
  - section plan or populated `sections`,
  - non-generic owner callouts.
- `READY_FOR_REVIEW` → `SHARED_WITH_LEAD` requires:
  - rubric review average >= 4,
  - safety pass,
  - owner-share note,
  - Jaimal/operator approval recorded,
  - exact URL reviewed.
- `SHARED_WITH_LEAD` → `PROMOTED_TO_SITE` requires:
  - conversion packet,
  - assumptions resolved/replaced,
  - owner callouts removed from production guest view,
  - launch checklist complete,
  - final Jaimal go-live approval.

### Admin UI

On PlatformLead detail / Preview Builds card:

- Show packet completeness checklist.
- Show current gate blockers.
- Disable/guard status changes that skip requirements.
- Link artifacts.
- Show canonical `/p/{slug}` URL and guest view URL.
- Show warning: public-obscure is not confidential.

### Preview rendering

Short-term:

- Keep `/p/[slug]`, but render `sections` JSON if present.
- Add visible owner-share note/assumptions block in owner view.
- Ensure `?view=guest` hides owner callouts and internal assumptions.
- Improve default placeholder labeling so it cannot masquerade as polished Preview Build.

Medium-term:

- Add rich section schema:
  - hero
  - imageStory
  - signatureMoments
  - amenitiesConfidence
  - locationGuide
  - directBookingValue
  - previewInquiry
  - missingInputs
  - ownerCallout
- Add design tokens/palette metadata per preview.

### Route hygiene

- Canonical route: `/p/{slug}`.
- Redirect `/preview/{slug}` to `/p/{slug}` or keep only as legacy route with identical noindex/non-functional QA.

## QA gates

Add script/browser tests for:

- `/p/{slug}` has noindex metadata.
- `/preview/{slug}` redirects or has noindex if retained.
- Inquiry form/button disabled and no form action/API submission exists.
- No payment/booking/login widgets visible.
- `?view=guest` hides owner callouts and internal notes.
- Status transition to shared is blocked without packet/safety approval.
- Status transition to promoted is blocked without launch/conversion packet.

## Acceptance criteria

- A thin Preview Build record cannot be marked/shared as owner-ready.
- Admin clearly shows missing packet pieces.
- The preview route cannot accidentally imply live booking/payment/inquiry.
- Owner-share requires an explicit note explaining draft/source/assumption/removal status.
- Preview can become a real site only through a documented conversion packet and launch gate.
