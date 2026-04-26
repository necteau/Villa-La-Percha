# Villa La Percha - Direct Booking Website

## Mission
Direct-booking website for Villa La Percha in the Chalk Sound neighborhood of Providenciales, Turks & Caicos.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Contact Form:** Resend (free tier)
- **Database foundation:** Prisma + Postgres-ready schema

## Property DNA
- **Location:** Chalk Sound neighborhood, Providenciales — between Taylor Bay and Sapodilla Bay
- **Key Features:** 4 en-suite suites, 1 half bath, private pool + hot tub, dock swimming/fishing, 2 kayaks, 2 paddle boards, outdoor kitchen, Sonos throughout
- **Vibe:** Refined waterfront villa / indoor-outdoor Caribbean living / direct-booking value
- **Target Audience:** Families, couples traveling together, and groups who want a high-end villa stay without OTA markup

## Available Amenities
- 4 en-suite suites + 1 additional half bath
- Private pool and connected hot tub
- Dock with stairs into swimmable water
- Dock fishing for bonefish, yellowtail snapper, and jacks
- 2 kayaks + 2 paddle boards
- Fully equipped kitchen + outdoor kitchen with professional grill and sink
- Screened indoor-outdoor living area
- Pergola seating, gas fire pit, and hammock pergola
- Taylor Bay a 1–2 minute walk away
- Sonos coverage across bedrooms and main indoor/outdoor gathering spaces

## Strategic Advantages
1. **Better Direct Value:** Direct bookings are typically 15–30% lower than Airbnb/VRBO total pricing
2. **Stronger Location Story:** Quiet Chalk Sound neighborhood with easy access to Taylor Bay and Sapodilla Bay
3. **On-Property Experience:** Pool, hot tub, dock access, fishing, paddling, and indoor-outdoor living make the house part of the vacation

## Inquiry Flow
- Frontend inquiry form posts to `src/app/api/inquiry/route.ts`
- Delivery is handled through Resend
- Live email delivery requires `RESEND_API_KEY` to be configured in Vercel
- Inquiry destination: `VillaLaPercha@gmail.com`

## DirectStay App Foundation
- Prisma schema now lives at `prisma/schema.prisma`
- Database client helper: `src/lib/db.ts`
- Environment template: `.env.example`
- Runtime should use pooled `DATABASE_URL`; Prisma migrations should use direct `DIRECT_DATABASE_URL`
- Current schema direction supports:
  - users / owners
  - properties
  - reservations
  - pricing rules + charges
  - payment methods + payment settings
  - inquiries
- See `docs/directstay-app-architecture.md` for the broader product/data direction

## Database bootstrap
- Create the schema with `npm run prisma:migrate:deploy`
- Seed current demo/property data with `npm run db:seed`
- Supabase setup should use:
  - `DATABASE_URL` = transaction pooler connection string
  - `DIRECT_DATABASE_URL` = direct database connection string

## Contact
VillaLaPercha@gmail.com
