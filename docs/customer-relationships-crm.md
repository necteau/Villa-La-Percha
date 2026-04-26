# DirectStay Customer Relationships / CRM Design

## Why this should exist

The owner portal currently treats inquiries and reservations as separate operational objects. That works for one-off lead handling, but it breaks down as soon as the same person:

- inquires multiple times
- books once and returns later
- becomes a repeat guest
- has preferences, context, or trust history worth preserving

A **Customer** layer should become the long-lived person record that sits above inquiries and reservations.

That gives the portal a real relationship model instead of a sequence of disconnected transactions.

---

## Product goal

Add a **Customers** section to the owner portal that becomes the canonical record for each guest/lead.

A customer record should answer:

- Who is this person?
- Have they contacted us before?
- Have they stayed before?
- What do they usually want?
- How valuable are they as a lead or repeat guest?
- What should we remember next time we speak to them?

---

## Core model direction

### New primary model: `Customer`

Each customer should represent a real person or primary household contact.

### Relationship model

- one `Customer` -> many `Inquiry`
- one `Customer` -> many `Reservation`
- one `Customer` -> many future `CustomerNote`
- one `Customer` -> many future `CustomerTag` / preference records

### Linking rules

Initial linking should be conservative:

1. **Primary key for matching:** normalized email
2. Secondary hints:
   - phone
   - full name similarity
   - prior reservation/inquiry overlap
3. If uncertain, do **not** auto-merge aggressively
4. Provide a future manual **merge customers** workflow

The safest first implementation is:
- auto-link by exact normalized email
- create a new customer when email is new
- allow manual cleanup later

---

## Recommended schema changes

### `Customer`

Suggested fields:

- `id`
- `ownerId` or `propertyId` strategy (see note below)
- `primaryPropertyId` (optional for first touch)
- `fullName`
- `email` (required, normalized)
- `phone` (nullable)
- `secondaryEmails` (future)
- `locationLabel` (nullable; city/state/country freeform at first)
- `timezone` (nullable)
- `preferredContactMethod` (`email`, `phone`, `sms`, `whatsapp`, `unknown`)
- `status` (`lead`, `active`, `booked`, `repeat_guest`, `inactive`, `do_not_contact`, `vip`)
- `sourceFirstTouch` (nullable)
- `sourceLatestTouch` (nullable)
- `firstInquiryAt`
- `lastInquiryAt`
- `firstStayAt`
- `lastStayAt`
- `lastContactAt`
- `totalInquiries`
- `totalReservations`
- `totalCompletedStays`
- `totalRevenue`
- `averageStayNights` (derived or materialized later)
- `notes` (owner-editable relationship notes)
- `preferencesSummary` (short human summary)
- `householdSummary` (family / couples / group travel context)
- `specialOccasions` (nullable summary)
- `conciergeInterests` (nullable summary)
- `internalFlags` (future structured flags)
- `createdAt`
- `updatedAt`

### `Inquiry`
Add:
- `customerId String?`

### `Reservation`
Add:
- `customerId String?`

### Future supporting tables
Not required in phase 1, but likely useful:

#### `CustomerNote`
- `id`
- `customerId`
- `authorUserId` (nullable initially)
- `body`
- `createdAt`

#### `CustomerTag`
- `id`
- `customerId`
- `label`
- `createdAt`

#### `CustomerPreference`
If structured preferences become important:
- `id`
- `customerId`
- `key`
- `value`
- `source`
- `createdAt`
- `updatedAt`

---

## Scope decision: owner-level vs property-level customers

### Recommendation: model customers at the **owner/account level**

Why:
- DirectStay is intended to become multi-property
- repeat guests may stay across properties
- CRM value is in remembering the person across the portfolio, not trapping them inside one site

So preferred structure:
- `Customer.ownerId`
- optional `Customer.primaryPropertyId`
- inquiries/reservations still keep their own `propertyId`

This preserves cross-property history while keeping property context intact.

If implementation speed matters, a temporary `propertyId`-only customer model is acceptable — but long-term it should move up to owner/account scope.

---

## Customer lifecycle and automation

### On new inquiry
When a guest submits an inquiry:

1. normalize name/email/phone
2. search for existing customer by exact normalized email
3. if found:
   - link `Inquiry.customerId`
   - update `lastInquiryAt`
   - increment `totalInquiries`
   - refresh missing profile fields when safe
4. if not found:
   - create new customer
   - link `Inquiry.customerId`
   - initialize lifecycle stats

### On reservation creation
When a reservation is created:

1. try to link by `customerId` already present on converted inquiry
2. otherwise match by normalized email
3. set `Reservation.customerId`
4. update customer stats:
   - `totalReservations`
   - `firstStayAt` / `lastStayAt`
   - revenue totals if available
   - status -> `booked` or `repeat_guest`

### On inquiry conversion
When inquiry status becomes converted:
- preserve inquiry history on customer timeline
- optionally attach reservation linkage if reservation gets created from it

---

## Owner portal UX recommendation

## 1. New nav item: `Customers`
Add a dedicated owner portal area:
- `/owner-portal/customers`

Navigation placement recommendation:
- Dashboard
- Sites
- Payments
- Reservations
- Pricing
- Inquiries
- **Customers**

Arguably Customers could sit near Inquiries/Reservations because it is the relationship layer connecting both.

## 2. Customers list page
Primary columns/cards:
- name
- email
- status
- last contact
- total stays
- total inquiries
- total revenue
- tags / repeat guest badge / VIP badge

Filters:
- status
- repeat guests only
- booked vs unbooked
- recent inquiries
- high-value guests
- property

Search:
- name
- email
- phone

## 3. Customer detail page
This should feel like a mini CRM record.

Sections:

### Header
- name
- email
- phone
- status
- quick actions:
  - create note
  - open latest inquiry
  - open reservations
  - mark VIP
  - merge duplicate (future)

### Relationship summary
- first contact
- last contact
- total inquiries
- total stays
- total revenue
- average stay length
- latest property

### Preferences / notes
- editable owner notes
- household / travel style summary
- special occasion history
- favorite room/setup notes
- children/family indicator
- payment / communication preferences

### Inquiry timeline
- linked inquiries in date order
- statuses
- sent replies
- outcomes

### Reservation history
- past and future stays
- stay dates
- status
- source
- amount
- notes

### AI / assistant box
- relationship summary
- suggested follow-up
- likely preferences
- risks / friction notes

---

## Data that is genuinely useful to store

### Core identity
- full name
- primary email
- phone
- general location/home base if known
- timezone if known

### Relationship / business value
- first inquiry date
- last inquiry date
- last contact date
- first stay date
- last stay date
- repeat guest indicator
- total inquiries
- total stays
- total booked revenue
- average stay length

### Travel behavior
- typical group type (family / couples / friends / solo)
- usual season/month
- typical stay length
- budget sensitivity notes
- minimum-stay friction history

### Hospitality notes
- birthdays / anniversaries / special trips
- child/family details only when volunteered and useful
- amenity interests (pool, beach proximity, fishing, paddle boards, etc.)
- communication style notes
- issue history or service recovery notes

### Internal sales/ops notes
- objection history
- booking source history
- OTA comparison discussed Y/N
- payment friction notes
- trust level / reliability notes

---

## What should be avoided

Do **not** store creepy or weakly justified data just because it can be found.

Avoid by default:
- speculative family/member identities from social media
- inferred protected characteristics
- invasive personal details unrelated to hospitality/service
- scraping every lead automatically across social platforms
- low-confidence identity enrichment stored as fact

This should feel like a high-touch hospitality CRM, not surveillance software.

---

## Public-web enrichment recommendation

### Recommendation: manual, review-first enrichment only

The assistant can help with public research, but it should be:
- explicit
- reviewable
- low-volume
- confidence-scored

### Good product pattern
Add a button later:
- **Research guest**

When used, the system can:
1. search public web results using name + email/domain + city if available
2. present candidate matches
3. summarize only clearly relevant hospitality context
4. require manual confirmation before saving anything to the customer record

### Safe enrichment examples
Useful and reasonable:
- likely city/location if clearly public and high-confidence
- public professional identity if relevant to tone/personalization
- trip purpose hints if explicitly stated in inquiry or public profile
- social proof that helps avoid awkward mismatches (e.g. family traveler vs bachelor-group assumption)

### Unsafe / poor default behavior
Not recommended:
- automatically harvesting all social accounts
- saving speculative matches silently
- pulling in personal facts that are not relevant to booking/service

---

## AI opportunities once Customers exist

Once the customer object is real, the assistant gets much more useful.

### Examples
- generate relationship summary before replying
- detect repeat guest and adjust tone accordingly
- suggest upsell / concierge relevance based on prior preferences
- recommend faster close strategy for high-intent repeat customers
- suggest “welcome back” or loyalty language
- summarize past stay + inquiry history into one paragraph
- warn when this person had prior issues or service recovery notes

This is materially more valuable than single-inquiry AI because the model can reason over longitudinal context.

---

## Phase-based implementation recommendation

## Phase 1 — Foundation
Goal: establish canonical customer record and linking.

Ship:
- `Customer` model
- `customerId` on inquiries/reservations
- auto-link by normalized email
- basic customers list page
- customer detail page with linked inquiries + reservations
- manual notes field on customer

## Phase 2 — CRM usefulness
Goal: make it operationally valuable day to day.

Ship:
- customer stats and relationship summary
- repeat guest / VIP markers
- filters and search
- owner-editable notes/preferences
- dashboard widgets for repeat guests and top-value customers

## Phase 3 — intelligence and enrichment
Goal: make it strategically helpful.

Ship:
- assistant relationship summaries
- follow-up suggestions
- duplicate detection / merge flow
- manual public-web research action
- richer tags/preferences model

---

## Recommended next implementation step

If this moves from design into build, the most practical next slice is:

1. Prisma schema migration for `Customer` + links
2. customer-linking logic in inquiry/reservation creation paths
3. `/api/owner-portal/customers`
4. `Customers` portal page (list + detail)
5. nav/dashboard integration

That gets the relationship layer live quickly without overbuilding.

---

## Recommendation summary

### Strong yes on Customers
This should exist and should become the canonical relationship layer for DirectStay.

### Link both inquiries and reservations to customer
Yes — that is the right data model.

### Store hospitality-relevant relationship context
Yes — especially preferences, history, revenue, travel style, and notes.

### Do not auto-scrape the internet for every guest
Not by default.

### Do allow manual, review-first research later
Yes — explicit, careful, and high-confidence only.
