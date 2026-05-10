# DirectStay Preview Build Premortem — 2026-05-08

Premortem frame: it is 6 months from now and DirectStay Preview Builds failed to impress or created owner-trust risk. We are looking backward to understand why and prevent it.

## Confidence answer

Not 100% before this pass. The strategy was directionally strong, but it relied too much on operator discipline and docs. After the premortem, the target strategy is clearer:

**Property evidence → photo/geography audit → property-specific design brief → rendered section plan → owner-specific callouts → fact/assumption register → desktop/mobile QA → rubric/safety pass → owner-share approval.**

Until the app enforces that pipeline, confidence is high in the strategy but not yet 100% in execution.

## Most likely failure

The Preview Build record/admin route remains too thin, so a placeholder page gets treated like a polished Preview Build.

Current risk observed:

- `PreviewBuild` stores slug/property/location/source URLs/hero/positioning/generic callouts/optional sections.
- Current `/p/[slug]` renders a fixed beige/green placeholder with generic sections.
- No enforced photo/geography audit, design brief, fact register, assumption register, rubric, QA proof, or owner-share approval.

## Most dangerous failure

A high-value owner sees a polished but public-ish preview that contains inferred or copied claims and feels DirectStay published/represented their property without enough consent or control.

Examples:

- Public-obscure URL forwarded to counsel/friend and contains unsupported claims.
- OTA reviews/ratings/photos copied without permission.
- Safety/accessibility/licensing/best-rate/availability claims implied.
- Generic owner callouts overstate DirectStay’s market knowledge.

## Hidden assumption

The plan assumed Bishop/operator discipline would consistently execute the design process manually. That is fragile. The admin/data/status flow must make the high-quality process hard to skip.

## Required fixes now captured in docs

Patched DirectStay docs now require:

- Owner-trust sharing envelope.
- Required Preview Build packet.
- Stronger anti-fabrication/review/claims rules.
- Owner-share note and correction/removal path.
- Automatic rework blockers in rubric.
- Public-obscure is not confidential language.
- Preview media/source policy.
- Preview-to-production conversion packet.
- Current route canonicalization to `/p/{slug}` with `/preview` treated as legacy.

## Implementation gap still remaining

Docs are now stronger, but app implementation still needs a production slice:

1. Add preview packet artifacts or schema fields:
   - `PREVIEW_PHOTO_GEO_AUDIT`
   - `PREVIEW_DESIGN_BRIEF`
   - `PREVIEW_FACT_REGISTER`
   - `PREVIEW_ASSUMPTION_REGISTER`
   - `PREVIEW_RUBRIC_REVIEW`
   - `PREVIEW_SHARE_NOTE`
2. Gate status transitions:
   - `READY_FOR_REVIEW` requires packet exists.
   - `SHARED_WITH_LEAD` requires safety pass, average score >=4, owner-share note, and Jaimal/operator approval.
   - `PROMOTED_TO_SITE` requires conversion packet and launch checklist.
3. Upgrade `/p/[slug]` to render saved sections/design data or explicitly label current route as a stub until rich rendering lands.
4. Redirect/deprecate `/preview/[slug]` or ensure both routes are tested noindex/non-functional.
5. Add automated QA:
   - noindex on `/p` and `/preview` if retained,
   - owner callouts hidden with `?view=guest`,
   - no active inquiry/payment/booking/login,
   - unsafe status transitions blocked,
   - no nav/sitemap linkage.

## Revised confidence

- **Strategy confidence:** high.
- **Documentation/process confidence:** high after this patch.
- **Execution/system confidence:** not 100% until the implementation slice above is built and tested.

The path to Villa La Percha-level quality is achievable, but only if Preview Builds become data/design-packet-driven rather than a generic route plus good intentions. Good intentions are not a rendering engine, regrettably.
