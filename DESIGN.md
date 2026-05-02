# DirectStay Root Site Redesign — Dialog-Inspired Conversion Experience

## Scope

Redesign only the DirectStay root marketing site (`/`). Do **not** alter property subfolders such as `/villa-la-percha/*`, owner portal, or admin portal.

References:

- Refero Styles brief: https://styles.refero.design/style/c8c22958-ec50-47f1-aedc-a131d7aeb442
- Dialog inspiration: https://www.askdialog.com

Use these as inspiration only. DirectStay should not copy Dialog branding, copy, product claims, or commerce-specific semantics.

## Design Translation

Dialog pattern | DirectStay adaptation
--- | ---
AI shopping agent hero | Direct-booking operating layer for premium vacation rentals
Conversation-first product story | Guest inquiry + owner response workflow
Feature modules | Guest conversion, owner CRM, AI inquiry copilot, local guide, direct payments
Setup/guardrails panels | Owner-safe controls: availability, pricing, tone, payment terms, reply approval
Testimonials/social proof rhythm | Trust points and proof-led operational claims, not fake testimonials
Final CTA | List a property / view first DirectStay home

## Visual Language

- Modern SaaS conversion page with premium hospitality warmth.
- Cream/sand base, deep navy/ink text, blue and coral accents.
- Rounded modular cards, pill nav, large editorial hero, embedded “assistant” mock UI.
- More product-forward and AI-commerce-forward than the prior static hospitality landing page.
- Keep property imagery as proof, but the root site sells DirectStay as a platform/network.

## Information Architecture

1. Hero — direct-booking platform statement, owner/listing CTA, first property CTA.
2. Proof strip — direct relationship, fee clarity, AI-assisted operations, local expertise.
3. Experience modules — guest path and owner path.
4. AI operating layer — inquiry copilot, lead scoring, reply drafts, conversion workflow.
5. Setup/control panel — how an owner configures property rules and guest experience.
6. Featured property — Villa La Percha as first live example.
7. Network CTA — carefully curated expansion.

## Guardrails

- Root `/` only.
- Do not modify `/villa-la-percha/*` pages or property guide/map styling.
- Keep external communications draft-and-approve; contact links can still use the temporary inbox until final DirectStay inbox decision.
- Avoid unsupported claims like guaranteed revenue uplift.
- Preserve metadata and existing direct links to Villa La Percha.

## Completion Criteria

- Root page visually and structurally redesigned.
- Build passes.
- Smoke check confirms `/` and `/villa-la-percha` both return successfully.
- If deployed, verify root page and villa subfolder remain accessible.
