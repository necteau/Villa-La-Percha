# External Reservation Reconciliation

## Purpose

Keep DirectStay-owned reservations and imported external reservations separate while using both sources for availability, matching, and owner review.

## Core Data Model

- `Reservation` is for DirectStay-created reservations only.
- `ExternalReservation` is the durable mirror of PMS / management company / other external bookings.
- External reservations should not be imported into the DirectStay reservation table.
- Availability is computed from both tables:
  - DirectStay reservations block availability.
  - Active external reservations block availability.
  - Matched DirectStay/external pairs count as one stay conceptually; do not duplicate lifecycle state.

## Match Statuses

Use these owner-facing statuses:

- `Not matched`
- `Pending match`
- `Matched`
- `Conflict`
- `Ignored`

`Needs review` is a derived dashboard concept, not a separate lifecycle/status.

## What Counts as Needs Review

A record or pair needs owner review when:

1. It is a `Pending match` candidate.
2. It is a `Conflict`.
3. It is `Matched` but has data mismatches and the owner has not clicked **Confirm match**.
4. A DirectStay reservation remains `Not matched` after the owner-configured review delay.
5. An external reservation disappears from a sync and is marked `missing` according to the rules below.

External-only reservations are normal and do not need review unless they conflict or disappear after having previously blocked availability.

## Owner Site Setting

Add a setting in the Owner Portal site/settings area:

- Label: **External reservation match review delay**
- Type: number of days
- Default: `3`
- Meaning: DirectStay reservations without an external match after this many days appear for review.
- Timer starts from DirectStay reservation creation time.

## Owner Resolution Actions

Owners can resolve reconciliation issues in the Owner Portal.

Supported actions:

- Confirm a match even if minor data differences remain.
- Ignore an irrelevant external reservation/review item.
- Unlink a previously confirmed match.
- Edit the DirectStay reservation.
- Contact the management company/PMS operator to fix external data.

For date or major data issues, the owner should correct either the DirectStay reservation or the external source. The next integration run should naturally re-evaluate and resolve the issue if the data then matches.

For minor data mismatches, **Confirm match** links the records and leaves the mismatch visible/auditable rather than forcing a data merge.

Store at least:

- `confirmedAt`
- `confirmedBy`

An optional owner note can be supported but should not be required.

## Integration Run Behavior

External integration runs should be idempotent snapshot reconciliations.

### Upsert Rule

Each imported external booking should have a stable identity key such as:

- `ownerId`
- `propertyId`
- `source`
- `externalReservationId`

Add a unique constraint over that identity. Each run should:

- update the existing `ExternalReservation` row when the external key already exists;
- create a new row when it does not exist;
- never create duplicates for the same external booking.

### Source Freshness

Track source freshness with fields such as:

- `lastSeenAt`
- `lastSyncedAt`
- `syncRunId`

Preserve owner decisions and match metadata across normal external updates, including:

- DirectStay match link;
- ignored state;
- owner-confirmed match;
- review resolution metadata.

If the external reservation materially changes after confirmation, especially dates/property/guest identity, it should re-enter review.

## Missing / Disappeared External Reservations

When an external reservation was seen previously but is absent in a later full sync:

### If linked to a DirectStay reservation

- Mark the external reservation `missing`.
- It needs owner review.
- The linked DirectStay reservation remains intact.
- This review item should explain that the external record disappeared from the latest integration run and may need owner/management-company follow-up.

### If not linked to a DirectStay reservation

- Mark the external reservation `missing` for one day.
- Stop blocking availability immediately.
- Show it as a needs-review item in its own **Missing external reservations** category.
- Owner-facing documentation should explain that the missing external reservation no longer blocks availability and will be removed after one day if it does not reappear.
- If it reappears in a later sync before removal, restore/update it via the same upsert identity and evaluate matching/conflicts again.

### Explicit cancellation

If the external source explicitly says the reservation is cancelled:

- keep the record for audit/history;
- mark it cancelled;
- do not block availability.

## Availability Rules

- Active DirectStay reservations block availability.
- Active external reservations block availability.
- Cancelled or missing external reservations do not block availability.
- If a matched DirectStay/external pair has different date ranges, block the union of both ranges until the mismatch is resolved or explicitly confirmed.
- Overlapping external reservations from the same source should be treated as conflicts/needs review; do not auto-resolve.

## Matching Rules

Start with conservative, explainable conflict detection:

- same property;
- overlapping dates.

Candidate matching can later become smarter with guest/date/email/name similarity, but fuzzy behavior should be visible and reviewable by the owner.

## Existing Imported External Reservation Cleanup

Existing external reservations that were previously imported into the DirectStay `Reservation` table should be deleted rather than migrated, because they likely do not contain the external identity and metadata needed for reliable reconciliation.

The next integration run will recreate them correctly in `ExternalReservation`.

Exception:

- Preserve the single manually-created DirectStay test reservation created by Jaimal.

Before deletion, identify which reservation row is the manually-created DirectStay test reservation and exclude it from cleanup.

## Implementation Notes

Implemented foundation commits:

- `df461da` — external reservation schema, migration, owner site setting, availability blocks, review API, cleanup script.
- `178346d` — owner review workflow UI and actions for confirm match, ignore, and unlink.
- `0022b06` — automatic conservative reconciliation/classification and richer review item context.
- `7b4437b` — owner dashboard external-review count and priority action.
- `404f8ca` — Prisma 7-compatible maintenance scripts with `.env.local` loading.

Maintenance scripts:

- Dry-run imported external cleanup: `node scripts/cleanup-imported-external-reservations.mjs`
- Apply imported external cleanup after preserving Jaimal's DirectStay test row: `KEEP_DIRECTSTAY_RESERVATION_ID=<id> node scripts/cleanup-imported-external-reservations.mjs --apply`
- Dry-run expired missing external cleanup: `node scripts/purge-expired-missing-external-reservations.mjs`
- Apply expired missing external cleanup: `node scripts/purge-expired-missing-external-reservations.mjs --apply`

The cleanup script targets old imported `Reservation` rows by external source (`AIRBNB`/`VRBO`) and by known external/imported booking types (`Rental Guest`, `Airbnb`, `VRBO`, `External Booking`, `Direct Booking`, `Owner`). It is dry-run by default and should only be applied after the matching records have been imported into `ExternalReservation` and the manually-created DirectStay test reservation is confirmed outside the candidate list.

2026-05-04 production cleanup result:

- Imported all 9 records from `src/data/owner-portal-reservations.json` into `ExternalReservation` using `owner-portal-json` as source.
- Deleted the 8 remaining old imported rows from `Reservation` after comparing IDs/dates/types.
- Preserved the manually-created DirectStay test reservation `cmorg2rf8000104kzdgalp57q` (`Jaimal Fecteau`, 2026-05-16 → 2026-05-23).
- Final production state: 9 active external reservations, 1 DirectStay reservation.
