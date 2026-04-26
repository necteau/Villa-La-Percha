# DirectStay App Architecture (Initial Product Direction)

## Goal
Build DirectStay as a real multi-property app, not a collection of one-off site settings.

The product should support:
- multiple owners
- multiple properties per owner
- per-property booking rules
- per-property payment method configuration
- reservations, pricing, leads, and operations in one owner portal
- a guest-facing direct-booking experience that can later feel closer to Airbnb/VRBO flow without inheriting their fees or loss of control

---

## Product Surfaces

### 1. Marketing Site
Purpose:
- explain DirectStay
- show live examples
- acquire owner leads

Current route examples:
- `/`
- `/owner-portal`
- `/villa-la-percha`

### 2. Guest Booking Site(s)
Purpose:
- property storytelling
- date selection
- pricing comparison
- inquiry / booking initiation

Future direction:
- shared booking-flow components
- property-config-driven content and rules
- property-config-driven payment methods

### 3. Owner Portal App
Purpose:
- reservations
- pricing
- payment settings
- booking rules
- lead/inquiry handling
- eventually contracts, payouts, reminders, automation, and AI ops

---

## Recommended Technical Direction

### Frontend
- Keep **Next.js app router** as the initial web app shell.
- Treat owner portal and guest booking flow as reusable app surfaces, not page-specific hacks.
- Favor shared components + typed config over hardcoded property logic.

### Backend / Data
Recommended first real persistence layer:
- **Postgres**

Good options:
- Supabase Postgres
- Vercel Postgres
- Neon

Reason:
- relational data fits the product well
- reservations, owners, properties, pricing rules, and payment configs are strongly structured
- easier long-term than trying to stretch JSON files into a fake backend

### Auth
Current direction: **Supabase Auth**.

Current implementation now uses Supabase email/password auth plus an owner-email allowlist for the owner portal.

Near-term follow-up still needed:
- password reset flow
- invite/admin user provisioning flow
- richer role model (`owner`, `manager`, `admin`)

Requirements:
- email/password login
- password reset
- session management
- later: roles (owner, manager, admin)

---

## Core Data Model

### users
Represents login identities.

Fields:
- id
- email
- password_hash (or managed by auth provider)
- full_name
- role (`owner`, `manager`, `admin`)
- created_at
- updated_at

### owners
Represents account/business ownership layer.

Fields:
- id
- display_name
- primary_user_id
- support_email
- support_phone
- created_at
- updated_at

### properties
Represents a site / rental property.

Fields:
- id
- owner_id
- slug
- name
- status (`draft`, `live`, `archived`)
- public_domain
- inquiry_email
- inquiry_phone
- timezone
- currency
- minimum_stay_nights
- check_in_time
- check_out_time
- created_at
- updated_at

### property_content
Separates editable content from property core record.

Fields:
- id
- property_id
- headline
- subheadline
- location_summary
- about_copy
- fishing_copy
- location_copy
- faq_enabled
- experience_page_enabled
- updated_at

### reservations
Source of truth for blocked and booked stays.

Fields:
- id
- property_id
- external_reference (nullable)
- status (`tentative`, `confirmed`, `checked_in`, `completed`, `cancelled`, `owner_hold`)
- source (`direct`, `airbnb`, `vrbo`, `manual`, `owner`)
- guest_name
- guest_email
- guest_phone
- check_in
- check_out
- nights
- total_amount
- currency
- is_owner_week
- notes
- created_at
- updated_at

### pricing_rules
Per-property pricing windows.

Fields:
- id
- property_id
- platform (`direct`, `airbnb`, `vrbo`)
- start_date
- end_date
- nightly_rate
- minimum_stay_nights
- notes
- created_at
- updated_at

### pricing_charges
Separate fees/taxes attached to a pricing rule.

Fields:
- id
- pricing_rule_id
- label
- category (`fee`, `tax`)
- charge_type (`fixed`, `percent`)
- value
- basis (`base`, `base_plus_fees`, `subtotal_before_tax`)
- per_night

### payment_methods
Per-property configuration.

Fields:
- id
- property_id
- method (`stripe`, `zelle`, `venmo`, `cash_app`)
- enabled
- is_primary
- display_order
- instructions
- created_at
- updated_at

### payment_settings
Property-level payment rules.

Fields:
- id
- property_id
- deposit_percentage
- final_payment_due_days
- allow_manual_fallbacks
- require_owner_approval_before_payment
- created_at
- updated_at

### inquiries
Guest leads before they become bookings.

Fields:
- id
- property_id
- full_name
- email
- phone
- check_in
- check_out
- message
- status (`new`, `replied`, `approved`, `declined`, `converted`)
- created_at
- updated_at

### inquiry_messages
Conversation timeline for each inquiry.

Fields:
- id
- inquiry_id
- direction (`inbound`, `outbound`)
- author_type (`guest`, `owner`, `assistant`, `system`)
- subject
- body
- email_message_id
- sent_at
- received_at
- created_at

### customers (recommended next core model)
Canonical relationship record for a lead/guest across inquiries and reservations.

Fields:
- id
- owner_id (preferred long-term scope)
- primary_property_id (nullable)
- full_name
- email
- phone
- location_label
- timezone
- preferred_contact_method
- status (`lead`, `active`, `booked`, `repeat_guest`, `inactive`, `do_not_contact`, `vip`)
- source_first_touch
- source_latest_touch
- first_inquiry_at
- last_inquiry_at
- first_stay_at
- last_stay_at
- last_contact_at
- total_inquiries
- total_reservations
- total_completed_stays
- total_revenue
- notes
- preferences_summary
- household_summary
- special_occasions
- concierge_interests
- created_at
- updated_at

Recommended links:
- `inquiries.customer_id`
- `reservations.customer_id`

See `docs/customer-relationships-crm.md` for the fuller CRM design and implementation recommendation.

### inquiry_reply_drafts
Draft responses that can be prepared by the assistant, reviewed by the owner, edited, approved, and later sent.

Fields:
- id
- inquiry_id
- subject
- body
- status (`draft`, `pending_owner_approval`, `approved`, `sent`)
- created_by_type (`assistant`, `owner`, `system`)
- approved_at
- sent_at
- created_at
- updated_at

---

## Immediate App Modules (v1)

### 1. Reservations
Must support:
- calendar view
- add manually
- edit
- delete
- side-panel details
- owner holds / owner weeks
- direct booking records
- imported OTA blocks later

### 2. Pricing
Must support:
- direct pricing windows
- Airbnb/VRBO comparison windows
- tax/fee assumptions
- minimum stay rules
- property-by-property configuration

### 3. Payments
Must support:
- enable/disable Stripe, Zelle, Venmo, Cash App per property
- choose primary method
- fallback/manual instructions
- deposit and payment timing rules

### 4. Sites
Must support:
- property status
- inquiry enabled/disabled
- min stay defaults
- feature toggles for sections/pages

### 5. Leads / Inquiries
Must support:
- new inquiry list
- date request visibility
- contact details
- conversion into reservation

---

## Guest Booking Experience Direction

Current improvement already underway:
- date selection
- total comparison
- inquiry form
in one continuous flow

Next UX layers:
1. sticky booking summary
2. live selected-date recap
3. clearer CTA progression
4. soft hold / approved-booking flow
5. optional deposit/payment step after owner approval

Longer-term:
- inquiry-first for some properties
- instant-request or instant-book variants for others
- all controlled per property

---

## Suggested Build Order

### Phase A — real app foundation
1. choose Postgres provider
2. add auth provider
3. create schema + migrations
4. move reservations/pricing/payment settings off local state into DB

### Phase B — owner workflow
1. reservations CRUD backed by DB
2. pricing CRUD backed by DB
3. payment method config backed by DB
4. inquiry inbox backed by DB

### Phase C — guest booking system
1. booking flow reads property config from DB
2. availability reads reservations from DB
3. pricing comparison reads pricing rules from DB
4. inquiry creates inquiry records in DB
5. owner can approve inquiry and generate payment step

---

## Recommendation
The next serious move should be:

**Implement a real Postgres-backed data model for properties, reservations, pricing rules, payment methods, and inquiries.**

That is the point where DirectStay stops being a convincing prototype and starts becoming an actual app.
