# DirectStay Preview Build Design Inspiration Library

Status: starter library from initial research on 2026-05-08. Use this with `directstay/platform-leads/preview-build-playbook.md`.

## Why this exists

DirectStay PlatformLead Preview Builds need to feel custom, beautiful, and property-specific. This library gives Bishop reusable design references and DESIGN.md patterns without turning every property into the same template.

The workflow is: property evidence first, specific geography second, reference inspiration third, implementation fourth. Broad categories like “coastal villa” are never enough by themselves.

## Useful DESIGN.md sources

### Google DESIGN.md spec

Source: `https://github.com/google-labs-code/design.md`

Useful takeaways:

- A strong DESIGN.md should include machine-readable tokens plus human-readable rationale.
- Tokens should cover colors, typography, spacing, radius, and components.
- Prose should explain why those choices exist and how to apply them.
- Canonical sections include Overview, Colors, Typography, Layout, Elevation/Depth, Shapes, Components, and Do/Don'ts.
- Component-level tokens are useful for buttons, cards, callouts, and preview-only CTAs.

DirectStay implication: every serious Preview Build should get a small DESIGN.md-style brief with concrete palette/type/component choices derived from the listing photos and property fingerprint.

### Refero Styles

Source: `https://styles.refero.design/`

Useful takeaways:

- Use curated visual references by brand, mood, color, typography, or URL.
- Extract 2–4 directions before building, not one copied style.
- Use references for palette, typography, spacing, component rhythm, and interaction ideas.

DirectStay implication: if a lead has a strong visual/property identity, search references that match the mood: coastal editorial, boutique hotel, modern cabin, luxury resort, organic retreat, urban apartment, etc.

### getdesign.md / awesome-design-md

Sources:

- `https://getdesign.md/`
- `https://github.com/VoltAgent/awesome-design-md`

Useful takeaways:

- Existing DESIGN.md files are often brand-inspired and can provide structure, but must not be copied blindly.
- Relevant reference categories for DirectStay:
  - Airbnb: warm coral, photography-driven, rounded travel UI.
  - Apple: premium whitespace, cinematic imagery.
  - Nike: full-bleed photography, bold uppercase moments.
  - The Verge / editorial references: distinctive typography and layout energy.
  - Mastercard / hospitality-adjacent warm editorial palettes.
  - Clay / Figma / Framer: design-forward layouts when owner interiors are modern/editorial.

DirectStay implication: use these as visual grammar references, then adapt to the property. A mountain cabin should not inherit Airbnb coral just because it is a travel site.

## Hospitality design research notes

From current web research, strong hotel/villa/boutique-hospitality sites consistently rely on:

- High-quality photography as the primary trust/desire engine.
- Clear visual identity through colors, typography, and imagery that align with the property personality.
- Intuitive mobile navigation and fast path to inquiry/booking confidence.
- Unique local/story content, not just amenity lists.
- Visual sophistication plus practical clarity.

DirectStay implication: Preview Builds should be both beautiful and operationally convincing: guest desire plus owner confidence.

## Reference directions by property type

### Coastal villa / island home

Important: coastal villas must not all look alike. Start with exact place and photos.

Potential influences:

- Airbnb for travel familiarity and rounded warmth.
- Apple for calm premium whitespace and cinematic image treatment.
- Boutique hotel/editorial references for magazine-like destination storytelling.

Micro-location splits:

- **Turks and Caicos / Chalk Sound:** electric turquoise, limestone, tropical green, intense clean sunlight, resort privacy; airy but saturated enough to honor the water.
- **Cape Cod / New England:** weathered shingle, dune grass, hydrangea, navy/cream, gray-blue sea; classic, restrained, literary.
- **Malibu / California coast:** glass, bluff, pale concrete, golden hour, modern surf minimalism; sharper, more architectural.
- **Greek islands:** whitewash, cobalt, stone, bougainvillea, hard sunlight; crisp contrast and stepped compositions.
- **Lowcountry / marsh coast:** spartina, oyster shell, porch shade, live oak, lantern warmth; slower, softer, more textural.

Photo-derived design cues:

- Pull palette from actual water/sky/landscape, not generic aqua.
- Mirror the interior’s decor style: coastal casual, minimalist modern, collected traditional, resort-polished, etc.
- Use image sequencing that matches the property’s strongest promise: view-first, architecture-first, family-flow-first, privacy-first, or local-experience-first.
- Typography should reflect the owner’s property style: classic serif for traditional/coastal heritage, crisp sans/editorial for modern architecture, softer serif/sans pair for relaxed island homes.

### Mountain cabin / forest retreat

Potential influences:

- Editorial/outdoor hospitality sites.
- Warm boutique hotel sites.
- High-end lodge and nature-retreat references.

Design cues:

- Palette from pine, stone, charcoal, fog, firelight, weathered wood.
- Heavier texture, warmer cards, less glassy modern SaaS.
- Typography can be grounded and tactile; consider serif/display accents.

### Modern design stay

Potential influences:

- Apple / Framer / Clay-style design-forward references.
- Architecture/editorial portfolios.

Design cues:

- Material-driven palette from concrete, oak, marble, black metal, plaster, linen.
- Crisp grid, asymmetry, large image crops, minimal copy.
- More editorial tension; fewer generic amenity cards.

### Family beach/lake house

Potential influences:

- Airbnb familiarity for travel clarity.
- Boutique hospitality for trust and aspiration.

Design cues:

- Palette from dock wood, freshwater blue, sunset amber, sand/cream, interior textiles.
- Clear sleeping/amenity confidence, local family activity cards, practical CTAs.
- Warm but not childish.

### Urban apartment / neighborhood stay

Potential influences:

- Editorial city guides.
- Boutique hotel neighborhood pages.
- Uber/Nike-like urban energy if interior style supports it.

Design cues:

- Sharper grid, location texture, map/local-guide modules.
- Palette from city materials, signage, interior accents, nightlife/daylight contrast.
- Copy should sell neighborhood access and ease.

### Historic/classic property

Potential influences:

- Heritage editorial sites.
- Boutique hotel and museum/gallery references.

Design cues:

- Warm neutral canvas, deep ink, restrained accent, serif/display typography.
- Respect existing character; do not modernize it into generic startup minimalism.

## DirectStay Preview DESIGN.md structure

When a Preview Build becomes more than a tiny experiment, create a property-specific design file alongside the preview artifact:

```md
---
name: Property Preview Name
colors:
  primary: "#..."
  secondary: "#..."
  accent: "#..."
  neutral: "#..."
typography:
  display:
    fontFamily: "..."
    fontSize: "..."
  body:
    fontFamily: "..."
    fontSize: "..."
rounded:
  sm: 6px
  md: 14px
  lg: 28px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  owner-callout:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
---

# Overview

## Colors

## Typography

## Layout

## Components

## Do's and Don'ts
```

The YAML gives exact implementation values. The prose explains property-specific rationale.

## Inspiration workflow for each lead

1. Read the submitted listing and inspect photos.
2. Build the Property Design Fingerprint.
3. Choose 2–4 inspiration references:
   - one based on property type,
   - one based on owner/decor style,
   - one based on destination/location,
   - optionally one based on target guest.
4. Extract only useful principles; do not clone.
5. Create the property-specific DESIGN.md/design brief.
6. Build preview against the brief.
7. QA with the anti-template checklist.

## Anti-patterns

- Generic blue/gray SaaS rental site.
- Same rounded cards and gradients for every property.
- Palette unrelated to photos.
- Typography unrelated to owner/decor style.
- Hero copy that could apply to any vacation rental.
- Overusing Airbnb-like coral for every travel site.
- Full-bleed luxury photography with no practical guest information.
- Amenity cards replacing actual property story.
- Fake specificity.

## Research backlog

Continue building this library with:

- Specific luxury villa site references.
- Boutique hotel examples by destination type.
- Cabin/lodge references.
- Lake-house and family-retreat references.
- Urban boutique stay references.
- A small set of approved DirectStay archetype DESIGN.md seed files.
