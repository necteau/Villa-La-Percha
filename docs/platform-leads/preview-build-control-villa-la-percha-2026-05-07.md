# Preview Build Control — Villa La Percha

Date: 2026-05-07 / 2026-05-08 ET  
Control lead: `cmow868r70000ytq5kt5zauu5`  
Preview build: `cmow868sf0001ytq50zpqn0du`  
Slug: `villa-la-percha-iatah9`  
Local QA URL: `http://127.0.0.1:3017/p/villa-la-percha-iatah9`  
Production URL after deploy: `https://directstay.app/p/villa-la-percha-iatah9`

## Purpose

Use Villa La Percha as the control property because the live DirectStay site is already the quality benchmark: Chalk Sound specificity, direct-booking clarity, island planning content, careful FAQ/review handling, and contract/trust workflows.

## What was exercised

- Created an internal PlatformLead control record for Villa La Percha.
- Created a Preview Build for the control record.
- Ran the starter packet generator.
- Replaced generic starter sections with Villa-specific control sections.
- Added internal owner callouts.
- Added approved control rubric/conversion artifacts.
- Rendered the preview locally using the latest build.
- Verified internal vs guest view separation.

## Rendered sections

1. Image story — Chalk Sound control preview.
2. Signature moments — morning/afternoon/planning confidence.
3. Micro-geography — Chalk Sound differentiation.
4. Practical confidence — direct rates, planning, trust.
5. DirectStay value — property brand rather than listing clone.
6. Missing inputs — photo rights, owner truth, design parity.

## QA observations

Local render checks passed:

- Preview route returned HTTP 200 on latest build.
- Hero title rendered.
- Chalk Sound-specific section copy rendered.
- Inquiry controls remained disabled.
- Internal owner callouts appeared in normal/internal preview view.
- Guest view hid owner callouts.

Static/DB verification from implementation slice also passed:

- DB-backed gate QA: passed with temporary records.
- Static Preview Build QA: 35/35.
- Lint: passed.
- Build: passed.

## Rubric score

| Category | Score | Notes |
| --- | ---: | --- |
| Property specificity | 5/5 | Chalk Sound, private villa rhythm, direct-booking confidence are specific enough for a control preview. |
| Safety/legal hygiene | 5/5 | No OTA endorsement, no fake reviews, no live inquiry, no unsupported availability/licensing claims. |
| Owner trust framing | 4/5 | Draft/control status is clear internally; production owner-share note still needs final wording before external use. |
| Design effectiveness | 3.5/5 | Structurally solid, but still visually simpler than the live Villa site. Needs image/screenshot QA for external sales use. |
| Operational usability | 4.5/5 | Generator + section controls + packet review removes the raw-JSON dependency for most edits. |

Average: **4.4/5**

## Conclusion

The strategy is validated for process safety and internal operator workflow. The Preview Build system can now create a property-specific, gated, non-functional control preview without falling back to a generic placeholder.

Remaining confidence gap is visual/sales polish, not safety: before sending a real PlatformLead preview externally, run screenshot QA and ensure approved property imagery/design treatment makes the preview feel as bespoke as the copy.
