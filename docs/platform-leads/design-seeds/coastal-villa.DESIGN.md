---
name: DirectStay Coastal Villa Seed
description: A non-template seed for coastal/island villa previews. Must be overridden by actual photos and micro-location.
colors:
  ink: "#12313A"
  warmCanvas: "#FFF9EF"
  limestone: "#F4EBDD"
  water: "#4CBFC3"
  foliage: "#5F7F61"
  sunsetAccent: "#D98263"
typography:
  display:
    fontFamily: "serif editorial display"
    fontSize: "clamp(3rem, 8vw, 7rem)"
    lineHeight: "0.92"
  body:
    fontFamily: "warm humanist sans"
    fontSize: "1rem"
    lineHeight: "1.65"
rounded:
  sm: 8px
  md: 18px
  lg: 32px
spacing:
  sm: 8px
  md: 18px
  lg: 40px
  xl: 88px
components:
  cta-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.warmCanvas}"
    rounded: "999px"
  owner-callout:
    backgroundColor: "{colors.limestone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
---

# Overview

A coastal villa preview should feel like a property-specific hospitality brand, not an OTA listing. This seed supports privacy, water, light, and direct-booking confidence.

This is not a universal coastal look. Always adapt to the exact coast: Chalk Sound turquoise is not Cape Cod gray-blue; Malibu glass is not Lowcountry marsh.

## Colors

Start from the listing photos. Replace seed tokens with actual extracted colors.

- Use water/sky/landscape colors only if they appear in the property images.
- Use architecture and interior neutrals to control the canvas.
- Use one restrained accent from decor, sunset, local flora, tile, art, or exterior detail.

## Typography

Pair an elegant display face with a readable warm sans. For modern glassy villas, reduce serif romance and use cleaner editorial type. For classic coastal homes, allow more heritage serif warmth.

## Layout

- Large hero photography.
- Editorial image rhythm: view → arrival → living flow → bedrooms → local/context.
- Spacious sections and clear guest confidence blocks.
- Owner callouts should feel like tasteful annotations, not warning banners.

## Components

- Owner callouts: soft warm canvas, small label, specific strategy note.
- Amenity blocks: fewer, better, tied to guest moments.
- CTA: preview-only and disabled/non-functional unless launch-approved.

## Do's and Don'ts

Do:
- Derive palette from photos.
- Let exact geography change the mood.
- Lead with the strongest emotional view or arrival moment.

Don't:
- Use generic turquoise/coral for every coastal property.
- Add fake beach/luxury claims.
- Make it look like Villa La Percha unless the property genuinely shares those cues.
