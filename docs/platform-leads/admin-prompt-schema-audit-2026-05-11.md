# DirectStay Preview Build Admin Prompt/Schema Audit — 2026-05-11

Purpose: verify the PlatformLead admin generation surfaces reflect the latest Preview Build refinement lessons before more benchmark renders are produced.

Scope reviewed:

- `directstay/src/lib/platformLeads.ts` — `generatePreviewBuildStarterPacket`
- `directstay/scripts/qa-preview-build-gates.mjs`
- `directstay/docs/platform-leads/preview-build-playbook.md`
- `directstay/docs/platform-leads/preview-build-evaluation-rubric.md`
- `directstay/docs/platform-leads/preview-build-benchmark-status-2026-05-11.md`

## Findings

| Gate / lesson | Current admin/generator coverage | Status |
| --- | --- | --- |
| Page-order image inventory before hero/early section art | Starter packet photo/geography audit requires page-order inventory, hero candidate, first two section-image candidates, and rejected assets. Rendered rubric asks for page-order image inventory before post-render gate. | Covered |
| Reject unsafe/non-property assets | Starter sections and photo audit explicitly reject OTA cards, text overlays, collages, review/rating graphics, logos, banners, and unknown filler. | Covered |
| Text-only beats unsafe imagery | Photo/geography audit says to choose intentional text-only sections and record the owner photo request when safe imagery is thin. | Covered |
| Conversion trio as guest planning | Starter direct-booking section and design brief require calendar, price, and area-guide modules to answer property-specific guest-planning questions first, while remaining read-only/mock until approval. | Covered |
| Copy Review Stack | Design brief and rubric review require Source-truth, VRBO-owner relevance, Guest usefulness, Anti-AI voice, and Section-fit passes. Static QA checks for these prompts. | Covered |
| Rendered bad-copy scan | Rubric review draft lists internal/process phrases to remove from guest-facing sections after render. | Covered |
| Owner-share blockers separate from benchmark score | Rubric review requires blockers to be listed separately from score, including rights, policies, rates, availability, taxes, owner review, QA, and noindex/non-functional confirmation. | Covered |
| Public/non-functional preview boundary | Owner-share note and conversion packet state public-obscure/noindex/non-functional/not bookable; promotion requires launch gates and Jaimal approval. | Covered |

## Gaps / next hardening opportunities

1. The starter packet is deterministic and template-heavy by design. It is safe, but it can still produce generic first-pass copy if an operator skips the source audit. The current mitigation is the gate wording plus approval requirements; a future hardening slice could add structured required fields for image inventory before allowing `READY_FOR_REVIEW`.
2. The admin UI appears to surface packet gates and generator controls, but this audit did not run authenticated browser QA. Browser QA should be saved for the next time admin visibility or route behavior changes.
3. Sarasota River Retreat remains intake-only. Do not render it until actual image-source/page-order review is complete.

## Recommendation

No immediate code change is required before the next benchmark. The safe next Preview Build refinement chunk remains **Sarasota image-source review**; if browser/page inspection is unavailable, the next code hardening slice should add structured image-inventory fields or validation so `READY_FOR_REVIEW` cannot depend only on freeform artifact text.
