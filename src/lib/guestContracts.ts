import crypto from "crypto";
import { GuestContractExecutionStatus } from "@prisma/client";
import { getPrismaClient } from "./db";

const APPROVED_GUEST_AGREEMENT_VERSION = "2026-05-13-approved";
const APPROVED_GUEST_AGREEMENT_NAME = "Villa La Percha Guest Rental Agreement";

function contractSecret(): string {
  return process.env.CONTRACT_LINK_SECRET || process.env.OWNER_PORTAL_SESSION_SECRET || process.env.NEXTAUTH_SECRET || process.env.RESEND_API_KEY || "directstay-development-contract-secret";
}

export function hashContractBody(bodyMarkdown: string): string {
  return crypto.createHash("sha256").update(bodyMarkdown, "utf8").digest("hex");
}

export function signContractLink(contractId: string, bodyHash: string): string {
  return crypto.createHmac("sha256", contractSecret()).update(`${contractId}:${bodyHash}`).digest("hex");
}

export function verifyContractLink(contractId: string, bodyHash: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = signContractLink(contractId, bodyHash);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function publicContractUrl(contractId: string, bodyHash: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "https://directstay.app").replace(/\/$/, "");
  const normalizedBase = base.startsWith("http") ? base : `https://${base}`;
  return `${normalizedBase}/villa-la-percha/guest-agreement/${contractId}?token=${signContractLink(contractId, bodyHash)}`;
}

export function approvedGuestAgreementBody(): string {
  return `# Villa La Percha Guest Rental Agreement

## Reservation Information Summary

The final booking record controls the stay details below.

| Field | Booking Record Value |
| --- | --- |
| Property | Villa La Percha, 27 Ocean Point Drive, Providenciales, Turks and Caicos Islands |
| Owner / Host | Turkoise Investments LLC |
| Primary Guest | Guest identified in the booking record |
| Guest Email / Phone | Guest contact details in the booking record |
| Check-in Date | Booking confirmation date |
| Check-in Time | 4:00 PM |
| Check-out Date | Booking confirmation date |
| Check-out Time | 10:00 AM |
| Maximum Occupancy | 8 people present at the Property at any time |
| Total Rental Amount | Amount shown in booking confirmation/payment record |
| Occupancy / Government Taxes | 12% Turks and Caicos accommodation/tourism tax, or the then-current legally applicable Turks and Caicos rate |
| Security Deposit / Card Hold | Up to $1,500 potential security deposit/card hold; Owner may charge a card on file for damages or Additional Charges where permitted |
| Agreement Version | ${APPROVED_GUEST_AGREEMENT_VERSION} |

## 1. Parties and Agreement

This Villa La Percha Guest Rental Agreement (the “Agreement”) is between:

- **Owner / Host:** Turkoise Investments LLC (the “Owner”); and
- **Guest:** the primary guest identified in the booking record (the “Guest”).

The Owner agrees to make Villa La Percha available to Guest for the confirmed stay, and Guest agrees to rent and use the Property only under the terms of this Agreement, the booking confirmation, the payment record, and any written house rules or addenda approved by Owner.

Guest represents that Guest is authorized to enter this Agreement for themselves and all occupants, invitees, vendors, and service providers Guest permits at the Property.

## 2. Property

The rental property is **Villa La Percha**, located at **27 Ocean Point Drive, Providenciales, Turks and Caicos Islands**, including the furnished accommodations, approved outdoor areas, and amenities expressly included in the booking confirmation (the “Property”).

This Agreement provides short-term vacation-rental access only. It is not a residential lease and does not create a tenancy beyond the confirmed stay dates.

## 3. Reservation Dates, Check-In, and Check-Out

The check-in date, check-out date, and nightly count are the details shown in the booking confirmation.

- Check-in is **4:00 PM**.
- Check-out is **10:00 AM**.
- Early check-in or late check-out is not guaranteed and must be approved by the Owner, concierge, or authorized property manager.

Guest must vacate and return possession of the Property by the check-out time. If Guest fails to vacate on time, Guest may be charged additional rent for each day or partial day of holdover at up to **three times the applicable daily rate**, plus any costs, damages, losses, or expenses caused by the late departure.

## 4. Occupancy, Events, and Visitors

Maximum occupancy is **8 people present at the Property at any time**.

For clarity, maximum occupancy means everyone present at the Property, not only overnight guests.

Guest agrees:

- not to exceed the maximum occupancy;
- not to host weddings, parties, family reunions, commercial events, or gatherings that would cause more than 8 people to be present at the Property at any time;
- not to allow unauthorized overnight guests;
- to ensure all members of Guest’s party and all invitees comply with this Agreement and the house rules.

Over-occupancy, unauthorized events, or prohibited gatherings may result in denial of entry, immediate termination of the stay, removal from the Property where permitted by law, forfeiture of payments, and Additional Charges.

## 5. Payment Terms

The total rental amount, taxes, deposit/down payment, final payment, due dates, and payment method are the amounts and terms shown in the booking confirmation and payment record.

Unless otherwise stated in writing by Owner:

- the required down payment/deposit is due when the reservation is accepted or the Agreement is executed;
- the down payment/deposit is nonrefundable except as expressly provided in this Agreement or the booking confirmation;
- the reservation is not fully secured until required payments are received;
- the remaining balance must be paid by the stated due date;
- failure to pay on time may allow Owner to cancel the reservation, retain payments already made to the extent permitted by the approved cancellation/payment terms, and pursue any allowed cancellation charges or collection costs.

## 6. Taxes

Government occupancy taxes and other applicable taxes will be charged as shown in the booking confirmation. The current intended tax line is a **12% Turks and Caicos accommodation/tourism tax**, or the then-current legally applicable Turks and Caicos rate.

If the government increases an applicable tax or imposes a new tax on the rental before or during the stay, Guest is responsible for the increase unless Owner agrees otherwise in writing.

## 7. Cancellation, Refunds, and Travel Insurance

The cancellation and refund terms must be shown clearly in the booking flow and booking confirmation.

- For stays that do **not** overlap **December 18 through January 2**, Guest may cancel by written notice at least **90 days before arrival** and pay a cancellation fee equal to **25% of the rental amount**.
- At any other time, or for any other reason, the reservation is non-cancelable and nonrefundable unless applicable law requires otherwise.
- No-shows, late arrivals, reduced party size, and early departures are nonrefundable.
- Guest remains responsible for amounts due, collection costs, and reasonable attorneys’ fees to the extent permitted by law and the final approved terms.

Because cancellation terms are strict and the Property is located in a destination exposed to travel disruption, weather events, airline issues, illness, and other risks, Guest is strongly encouraged to purchase travel insurance.

If the Property becomes unavailable because it is sold, out of order, unsafe, materially damaged, legally unavailable, or otherwise unavailable for reasons outside Owner’s reasonable control, Owner may cancel the reservation. Owner’s remedy may be limited to refunding amounts paid for the unavailable stay or offering a comparable alternative if available and accepted by Guest. Owner is not responsible for Guest’s other travel costs or consequential losses except where prohibited by law.

## 8. Security Deposit, Card Hold, Damage, and Additional Charges

Owner may require a security deposit, open credit-card authorization, or payment hold of up to **$1,500**. Owner does not necessarily collect a security deposit or card hold for every booking, but Guest remains responsible for damage and other Additional Charges under this Agreement.

Guest is responsible for the Property during the stay and for all damage, loss, excessive cleaning, missing items, policy violations, fines, or extraordinary service costs caused by Guest or anyone Guest permits at the Property, including invitees and third-party service providers.

If Owner has a payment card or payment method on file, Owner may charge that card or payment method for damages or Additional Charges where permitted by law and payment-provider rules. Owner may also deduct from any security deposit/card hold actually collected or invoice Guest for Additional Charges, including without limitation:

- damage or breakage beyond ordinary wear and tear;
- missing items;
- excessive cleaning;
- key, gate remote, access device, or lock replacement;
- long-distance telephone, paid media, or other guest-incurred service charges;
- A/C, electricity, or utility usage above any stated allowance;
- late check-out or failure to vacate;
- unauthorized occupancy, visitors, pets, smoking, events, or parties;
- sewer or drain blockage caused by improper flushing or disposal;
- damage to garbage disposal or appliances from misuse;
- water or wind damage caused by failure to close or secure doors or windows;
- fines, service calls, or emergency costs arising from Guest conduct.

Any Additional Charges not covered by a card charge, payment method on file, security deposit, or card hold are due immediately upon request, subject to applicable law and payment-provider procedures.

## 9. Furniture, Fixtures, and Property Care

Guest must use the Property carefully, lawfully, and respectfully.

Furniture may not be moved or relocated without written approval. Indoor furniture may not be moved outdoors. Deck, pool, or outdoor furniture may not be taken to the beach or elsewhere. Guest is responsible for damage, loss, labor, or replacement costs related to moved or relocated furniture.

Guest must close and secure windows and doors when appropriate, especially during rain, wind, storms, or when leaving the Property unattended.

Guest must not flush paper towels, facial tissues, feminine hygiene products, wipes, or any other improper items. The Property uses island/septic-style infrastructure that may be damaged by improper flushing or drain use.

## 10. House Rules, Noise, Smoking, and Pets

Guest and all occupants/invitees must comply with all house rules provided before or during the stay, including rules posted at the Property or communicated by Owner, concierge, or property manager.

Guest agrees:

- to comply with applicable laws and community standards;
- to respect neighbors;
- not to create unreasonable noise, loud music, live music, shouting, profanity, nuisance, or disturbance;
- not to smoke or vape inside the Property;
- not to bring pets or animals onto or inside the Property unless Owner gives express written approval.

Evidence of smoking or unauthorized pets may result in immediate termination of the stay, a **$500 fine**, forfeiture of payments/deposits where permitted, and Additional Charges for cleaning, repair, deodorizing, or damage.

## 11. Amenities and Included Services

The Property is expected to include a reasonable supply of linens, beach towels, kitchenware, televisions, washer/dryer access, kayaks, paddleboards, and the amenities listed in the booking confirmation.

For stays of **7 nights or longer**, one midweek maid-service visit is included. The cleaning schedule should be arranged with the concierge or property manager. Guest may be asked to vacate the Property during cleaning. Additional maid service may be available for an additional charge.

Maid service does not include personal laundry, cooking, babysitting, or services not expressly approved.

## 12. Maintenance, Repairs, and Access

Owner will make commercially reasonable efforts to deliver the Property in rentable condition.

Guest must promptly report any maintenance, safety, cleanliness, appliance, utility, internet, A/C, pool, or other issue to the concierge/property manager and Owner’s designated contact during the stay.

Owner, property manager, concierge, pool service, gardeners, repair personnel, inspectors, emergency responders, and other authorized service providers may access the Property when reasonably necessary for maintenance, repair, inspection, safety, emergency response, legal compliance, or protection of the Property, with reasonable notice when practicable.

No claim for compensation will be considered for issues Guest failed to report during the stay where timely notice would have allowed investigation or repair. Guest who abandons the Property without written authorization forfeits any claim to a refund or rebate except where applicable law requires otherwise.

## 13. Complaints, Service Interruptions, Construction, and Island Conditions

Guest understands that island travel and property use may involve conditions outside Owner’s control, including utility interruptions, public water or gas issues, internet/cable outages, A/C or appliance service needs, weather, insects, wildlife, road conditions, and nearby construction.

Owner is not responsible for disturbances or inconvenience caused by neighboring properties, traffic, off-property construction, third-party services, or conditions outside Owner’s reasonable control. Owner and authorized service providers will endeavor to address reported issues at the Property as soon as reasonably practicable.

No full or partial refund will be granted unless a condition at the Property causes extreme discomfort or material inconvenience that cannot be remedied within a reasonable time after proper notice, subject to the final approved terms and applicable law.

## 14. Medical Conditions and Accessibility

Guest should notify Owner before booking acceptance of any allergies, mobility limitations, medical conditions, accessibility needs, or other conditions that could be affected by the Property or island environment, including but not limited to stairs, pool areas, fragrances, cleaning products, pool chemicals, insects, heat, humidity, or limited medical/service availability.

Any special accommodation, representation, or condition of booking must be documented in writing and approved by Owner.

## 15. Medical Emergencies, Death, Evacuation, and Repatriation

Guest understands that Turks & Caicos is an island destination and that emergency medical care, evacuation, transportation, mortuary, consular, and repatriation services may be limited, delayed, costly, or provided by third parties outside Owner’s control.

In the event of a medical emergency, serious injury, death, evacuation, travel interruption, or similar incident involving Guest or any occupant or invitee, Guest and the affected occupant/invitee, or their estate or responsible party, are responsible for all related medical, emergency-response, ambulance, hospital, evacuation, transportation, mortuary, repatriation, travel, accommodation, and other costs, except to the extent caused by Owner’s gross negligence, willful misconduct, or liability that cannot be limited by law.

Owner, property manager, concierge, and authorized service providers may contact emergency services, permit emergency access to the Property, and provide reasonable cooperation or local contact information when practicable, but they are not medical providers, insurers, guarantors of emergency response, or responsible for the acts, omissions, availability, timing, or costs of hospitals, clinics, ambulances, airlines, government agencies, consulates, transportation providers, funeral/mortuary providers, insurers, or other third parties.

Guest is strongly encouraged to purchase travel insurance that includes medical expense coverage, emergency medical evacuation, trip interruption, and repatriation of remains coverage for all occupants.

## 16. Air Conditioning and Utility Use

Air conditioning and utilities are costly on island and may be subject to usage expectations, metering, or allowances if stated in the booking confirmation.

Guest must use A/C and utilities responsibly, keep doors/windows closed while A/C is running, and follow any instructions provided by Owner, concierge, or property manager. Excessive or unauthorized usage may result in Additional Charges if disclosed in the booking terms.

## 17. Personal Property

Guest is solely responsible for Guest’s personal property, valuables, vehicles, travel documents, electronics, and belongings. Owner, property manager, concierge, and any booking/operational agent are not responsible for lost, stolen, damaged, or weather-damaged personal property except where liability cannot be limited by law.

## 18. Assumption of Risk

Guest understands that the Property and destination may involve ordinary travel and occupancy risks, including stairs, decks, balconies, wet surfaces, pool areas, outdoor areas, docks or water-adjacent areas where applicable, weather, insects/wildlife, power or internet interruptions, road conditions, and third-party vendors selected by Guest.

Except to the extent caused by Owner’s gross negligence, willful misconduct, or liability that cannot be limited by law, Guest assumes the ordinary risks of occupancy and use of the Property for themselves and all occupants and invitees.

## 19. Liability Limits and Indemnity

To the fullest extent permitted by law, Guest agrees to indemnify, defend, and hold harmless Owner and Owner’s authorized operators, managers, and agents from claims, losses, damages, costs, and expenses arising from Guest’s use or occupancy of the Property, breach of this Agreement, unlawful conduct, negligence, misuse of the Property, or acts/omissions of Guest’s occupants, invitees, or service providers.

To the fullest extent permitted by law, Owner is not liable for indirect, incidental, consequential, punitive, exemplary, or special damages, or for losses caused by weather, natural disasters, utility interruption, third-party services, adjacent properties, traffic, construction, government action, travel disruption, or events outside Owner’s reasonable control.

Nothing in this Agreement limits liability where limitation is prohibited by law.

## 20. Violation, Termination, and Removal

If Guest materially breaches this Agreement or house rules, Owner or the authorized property manager may require corrective action, terminate the stay, deny continued access, enter the Property where permitted, seek removal, and retain payments/deposits or charge Additional Charges to the extent permitted by law and the final approved terms.

Upon notice of termination, Guest must vacate the Property immediately.

## 21. Governing Law, Venue, and Attorneys’ Fees

This Agreement will be governed by the laws of **The Turks & Caicos Islands**. Any dispute, claim, or proceeding relating to this Agreement or the stay must be filed in the courts of **The Turks & Caicos Islands**, and Guest and Owner submit to the jurisdiction and venue of those courts. The prevailing party in litigation may recover reasonable attorneys’ fees and expenses to the extent permitted by law.

## 22. Entire Agreement and Priority of Records

This Agreement, the booking confirmation, payment record, house rules, and any written addenda approved by Owner form the entire agreement between Owner and Guest for the stay.

If there is a conflict, the final owner-approved booking confirmation and final approved agreement language control, unless applicable law requires otherwise.

## 23. Electronic Acceptance and Signature

Owner may present this Agreement for electronic review and acceptance. The recommended electronic booking flow is checkbox acknowledgment plus typed legal name, with timestamped acceptance stored against the reservation. Owner may use an e-signature provider if later required.

The reservation should not be treated as contract-complete until the final approved agreement version has been accepted and the acceptance record has been stored with the reservation.

## 24. Signature Blocks

**Guest**

Signature / typed legal name: _______________________________

Date: ___________________________________

Email: __________________________________

Phone: __________________________________

**Owner / Authorized Representative**

Signature: Jaimal Fecteau

Title / Entity: Authorized Signer, Turkoise Investments LLC
`;
}

export async function ensureApprovedGuestAgreementTemplate() {
  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({ where: { slug: "villa-la-percha" } });
  if (!property) throw new Error("Villa La Percha property not found");
  const bodyMarkdown = approvedGuestAgreementBody();
  const bodyHash = hashContractBody(bodyMarkdown);
  return prisma.contractTemplate.upsert({
    where: { type_version_propertyId: { type: "GUEST_RENTAL_AGREEMENT", version: APPROVED_GUEST_AGREEMENT_VERSION, propertyId: property.id } },
    create: {
      propertyId: property.id,
      type: "GUEST_RENTAL_AGREEMENT",
      status: "APPROVED",
      name: APPROVED_GUEST_AGREEMENT_NAME,
      version: APPROVED_GUEST_AGREEMENT_VERSION,
      title: APPROVED_GUEST_AGREEMENT_NAME,
      bodyMarkdown,
      bodyHash,
      approvedAt: new Date(),
      reviewNotes: "Approved by Jaimal Fecteau via Telegram on 2026-05-07 for customer use.",
    },
    update: {
      status: "APPROVED",
      name: APPROVED_GUEST_AGREEMENT_NAME,
      title: APPROVED_GUEST_AGREEMENT_NAME,
      bodyMarkdown,
      bodyHash,
      approvedAt: new Date(),
      reviewNotes: "Approved by Jaimal Fecteau via Telegram on 2026-05-07 for customer use.",
    },
  });
}

export async function createOrSendInquiryGuestContract(inquiryId: string) {
  const prisma = await getPrismaClient();
  const template = await ensureApprovedGuestAgreementTemplate();
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId }, include: { reservations: true } });
  if (!inquiry) throw new Error("Inquiry not found");
  const existing = await prisma.contractExecution.findFirst({
    where: { inquiryId, status: { in: ["DRAFT", "SENT", "VIEWED", "ACCEPTED"] } },
    include: { template: true },
    orderBy: { updatedAt: "desc" },
  });
  const contract = existing || await prisma.contractExecution.create({
    data: {
      templateId: template.id,
      propertyId: inquiry.propertyId,
      inquiryId: inquiry.id,
      reservationId: inquiry.reservations[0]?.id ?? null,
      customerId: inquiry.customerId,
      status: "DRAFT",
      signerName: inquiry.fullName,
      signerEmail: inquiry.email,
      notes: "Created from owner portal approved guest agreement flow.",
    },
    include: { template: true },
  });
  const sent = contract.status === GuestContractExecutionStatus.ACCEPTED ? contract : await prisma.contractExecution.update({
    where: { id: contract.id },
    data: {
      status: contract.status === GuestContractExecutionStatus.VIEWED ? "VIEWED" : "SENT",
      sentAt: contract.sentAt ?? new Date(),
      signerName: contract.signerName || inquiry.fullName,
      signerEmail: contract.signerEmail || inquiry.email,
    },
    include: { template: true },
  });
  return { contract: sent, url: publicContractUrl(sent.id, sent.template.bodyHash) };
}

export async function getGuestContractForReview(contractId: string, token: string | null | undefined) {
  const prisma = await getPrismaClient();
  const contract = await prisma.contractExecution.findUnique({
    where: { id: contractId },
    include: { template: true, inquiry: true, reservation: true, property: true },
  });
  if (!contract || !verifyContractLink(contract.id, contract.template.bodyHash, token)) return null;
  if (contract.status === "SENT") {
    await prisma.contractExecution.update({ where: { id: contract.id }, data: { status: "VIEWED", viewedAt: contract.viewedAt ?? new Date() } });
    contract.status = "VIEWED";
    contract.viewedAt = contract.viewedAt ?? new Date();
  }
  return contract;
}

export async function acceptGuestContract(input: { contractId: string; token?: string | null; signerName: string; signerEmail: string; ip?: string | null; userAgent?: string | null; }) {
  const prisma = await getPrismaClient();
  const contract = await prisma.contractExecution.findUnique({ where: { id: input.contractId }, include: { template: true } });
  if (!contract || !verifyContractLink(contract.id, contract.template.bodyHash, input.token)) throw new Error("Invalid or expired agreement link");
  if (contract.status === "VOIDED" || contract.status === "SUPERSEDED") throw new Error("This agreement is no longer active");
  return prisma.contractExecution.update({
    where: { id: contract.id },
    data: {
      status: "ACCEPTED",
      signerName: input.signerName.trim().slice(0, 160),
      signerEmail: input.signerEmail.trim().toLowerCase().slice(0, 200),
      viewedAt: contract.viewedAt ?? new Date(),
      acceptedAt: new Date(),
      acceptedBodyHash: contract.template.bodyHash,
      acceptanceIp: input.ip ?? null,
      acceptanceUserAgent: input.userAgent ?? null,
      acceptanceMetadata: { method: "typed-name-checkbox", version: contract.template.version },
    },
    include: { template: true, inquiry: true, reservation: true, property: true },
  });
}
