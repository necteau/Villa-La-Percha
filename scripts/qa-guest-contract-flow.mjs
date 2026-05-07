import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { GuestContractExecutionStatus } from '@prisma/client';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const db = await import('../src/lib/db.ts');
const { getPrismaClient } = db;
const guestContracts = await import('../src/lib/guestContracts.ts');
const { ensureApprovedGuestAgreementTemplate, createOrSendInquiryGuestContract, getGuestContractForReview, acceptGuestContract } = guestContracts;

const prisma = await getPrismaClient();
const runId = `guest-contract-qa-${Date.now()}`;
const results = [];
function pass(name, detail = '') { results.push({ name, status: 'pass', detail }); }
function fail(name, error) { results.push({ name, status: 'fail', detail: error?.stack || error?.message || String(error) }); }

function statusLabel(status) {
  switch (status) {
    case GuestContractExecutionStatus.ACCEPTED: return 'accepted';
    case GuestContractExecutionStatus.VIEWED: return 'viewed';
    case GuestContractExecutionStatus.SENT: return 'sent';
    case GuestContractExecutionStatus.VOIDED: return 'voided';
    case GuestContractExecutionStatus.SUPERSEDED: return 'superseded';
    case GuestContractExecutionStatus.DRAFT:
    default: return 'not_sent';
  }
}
function primaryContract(contracts) {
  return contracts.find((c) => statusLabel(c.status) === 'accepted')
    ?? contracts.find((c) => statusLabel(c.status) === 'viewed')
    ?? contracts.find((c) => statusLabel(c.status) === 'sent')
    ?? contracts[0];
}
function contractCopy(contract, booked) {
  const status = contract ? statusLabel(contract.status) : undefined;
  if (status === 'accepted') return 'Rental agreement received';
  if (status === 'sent' || status === 'viewed') return 'Agreement reminder';
  if (booked) return 'Agreement next step';
  return 'Booking next step';
}

async function main() {
  assert(process.env.DATABASE_URL, 'DATABASE_URL is required');
  const property = await prisma.property.findUnique({ where: { slug: 'villa-la-percha' } });
  assert(property, 'Villa La Percha property not found');
  pass('property exists', property.id);

  const approvedTemplate = await ensureApprovedGuestAgreementTemplate();
  assert.equal(approvedTemplate.status, 'APPROVED');
  assert.equal(approvedTemplate.type, 'GUEST_RENTAL_AGREEMENT');
  assert(!approvedTemplate.bodyMarkdown.includes('Draft only'), 'approved customer agreement must not contain draft-only warning');
  assert(!approvedTemplate.bodyMarkdown.includes('Owner/Counsel Review Checklist'), 'approved customer agreement must not contain internal review checklist');
  assert(!approvedTemplate.bodyMarkdown.includes('Counsel should confirm'), 'approved customer agreement must not contain counsel-review placeholders');
  pass('approved guest agreement template is active and customer-clean', `${approvedTemplate.version} / ${approvedTemplate.bodyHash.slice(0, 12)}`);

  const existingReservations = await prisma.reservation.findMany({
    where: { propertyId: property.id },
    include: { contractExecutions: { include: { template: true }, orderBy: { updatedAt: 'desc' } } },
    orderBy: { checkIn: 'asc' },
  });
  assert(existingReservations.length > 0, 'No existing reservations found for Villa La Percha');
  const noContractReservation = existingReservations.find((r) => r.contractExecutions.length === 0) ?? existingReservations[0];
  pass('existing reservation available for no-contract QA', `${noContractReservation.id} / contracts=${noContractReservation.contractExecutions.length}`);
  assert.equal(primaryContract(noContractReservation.contractExecutions), undefined, 'Existing no-contract reservation should have no primary contract');
  assert.equal(contractCopy(undefined, true), 'Agreement next step');
  pass('existing reservation with no contract maps to pending agreement copy');

  try {
    await prisma.$transaction(async (tx) => {
      const template = await tx.contractTemplate.create({
        data: {
          propertyId: property.id,
          type: 'GUEST_RENTAL_AGREEMENT',
          status: 'DRAFT',
          name: `QA Guest Rental Agreement ${runId}`,
          version: runId,
          title: 'QA Guest Rental Agreement — rollback transaction',
          bodyMarkdown: '# QA only\nThis template is created inside a rollback transaction.',
          bodyHash: crypto.createHash('sha256').update(runId).digest('hex'),
          reviewNotes: 'QA rollback transaction; should never persist.',
        },
      });
      pass('creates draft guest contract template in transaction', template.id);

      const draft = await tx.contractExecution.create({
        data: {
          templateId: template.id,
          propertyId: property.id,
          reservationId: noContractReservation.id,
          customerId: noContractReservation.customerId,
          status: 'DRAFT',
          signerName: noContractReservation.guestName,
          signerEmail: noContractReservation.guestEmail,
          notes: 'QA draft execution in rollback transaction.',
        },
        include: { template: true },
      });
      assert.equal(statusLabel(draft.status), 'not_sent');
      assert.equal(contractCopy(draft, true), 'Agreement next step');
      pass('draft contract execution stays not_sent/pending');

      const sent = await tx.contractExecution.update({
        where: { id: draft.id },
        data: { status: 'SENT', sentAt: new Date() },
        include: { template: true },
      });
      assert.equal(statusLabel(sent.status), 'sent');
      assert.equal(contractCopy(sent, true), 'Agreement reminder');
      pass('sent contract execution maps to reminder copy');

      const viewed = await tx.contractExecution.update({
        where: { id: draft.id },
        data: { status: 'VIEWED', viewedAt: new Date() },
        include: { template: true },
      });
      assert.equal(statusLabel(viewed.status), 'viewed');
      assert.equal(contractCopy(viewed, true), 'Agreement reminder');
      pass('viewed contract execution maps to reminder copy');

      const accepted = await tx.contractExecution.update({
        where: { id: draft.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedBodyHash: template.bodyHash,
          acceptanceIp: '127.0.0.1',
          acceptanceUserAgent: 'DirectStay QA rollback',
          acceptanceMetadata: { runId, mode: 'rollback-qa' },
        },
        include: { template: true },
      });
      assert.equal(statusLabel(accepted.status), 'accepted');
      assert.equal(contractCopy(accepted, true), 'Rental agreement received');
      pass('accepted contract execution maps to received copy and stores audit metadata');

      const inquiry = await tx.inquiry.create({
        data: {
          propertyId: property.id,
          fullName: `QA Contract Guest ${runId}`,
          email: `qa+${runId}@example.com`,
          message: 'QA inquiry for contract carry-forward rollback test.',
          checkIn: new Date('2027-06-01T00:00:00Z'),
          checkOut: new Date('2027-06-08T00:00:00Z'),
          status: 'AWAITING_GUEST',
          quotedAmount: 12000,
        },
      });
      const inquiryContract = await tx.contractExecution.create({
        data: {
          templateId: template.id,
          propertyId: property.id,
          inquiryId: inquiry.id,
          status: 'ACCEPTED',
          signerName: inquiry.fullName,
          signerEmail: inquiry.email,
          acceptedAt: new Date(),
          acceptedBodyHash: template.bodyHash,
        },
      });
      const reservation = await tx.reservation.create({
        data: {
          propertyId: property.id,
          sourceInquiryId: inquiry.id,
          status: 'CONFIRMED',
          source: 'DIRECT',
          bookingType: 'Direct',
          bookedDate: new Date(),
          guestName: inquiry.fullName,
          guestEmail: inquiry.email,
          checkIn: new Date('2027-06-01T00:00:00Z'),
          checkOut: new Date('2027-06-08T00:00:00Z'),
          nights: 7,
          totalAmount: 12000,
          currency: 'USD',
          paymentStatus: 'UNPAID',
          isOwnerWeek: false,
        },
      });
      await tx.contractExecution.updateMany({
        where: { inquiryId: inquiry.id, reservationId: null },
        data: { reservationId: reservation.id },
      });
      const carried = await tx.contractExecution.findUnique({ where: { id: inquiryContract.id } });
      assert.equal(carried?.reservationId, reservation.id);
      pass('accepted inquiry contract carries forward to new reservation', reservation.id);

      throw new Error('ROLLBACK_QA_TRANSACTION');
    }, { timeout: 20000 });
  } catch (error) {
    if (error.message === 'ROLLBACK_QA_TRANSACTION') pass('rollback transaction completed without persisting QA records');
    else throw error;
  }

  const qaInquiry = await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      fullName: `QA Link Guest ${runId}`,
      email: `qa-link+${runId}@example.com`,
      message: 'QA persisted contract link/acceptance flow; cleaned up at end.',
      checkIn: new Date('2027-07-01T00:00:00Z'),
      checkOut: new Date('2027-07-08T00:00:00Z'),
      status: 'AWAITING_GUEST',
      quotedAmount: 15000,
    },
  });
  try {
    const sentResult = await createOrSendInquiryGuestContract(qaInquiry.id);
    assert.equal(sentResult.contract.status, 'SENT');
    assert(sentResult.url.includes(`/villa-la-percha/guest-agreement/${sentResult.contract.id}`));
    pass('owner action creates secure guest contract link', sentResult.url.replace(/token=.*/, 'token=[redacted]'));

    const token = new URL(sentResult.url).searchParams.get('token');
    const viewed = await getGuestContractForReview(sentResult.contract.id, token);
    assert(viewed, 'contract review link should load with valid token');
    assert.equal(viewed.status, 'VIEWED');
    pass('customer opening link marks agreement viewed');

    const accepted = await acceptGuestContract({
      contractId: sentResult.contract.id,
      token,
      signerName: `QA Link Guest ${runId}`,
      signerEmail: `qa-link+${runId}@example.com`,
      ip: '127.0.0.1',
      userAgent: 'DirectStay QA persisted cleanup',
    });
    assert.equal(accepted.status, 'ACCEPTED');
    assert.equal(accepted.acceptedBodyHash, approvedTemplate.bodyHash);
    assert(accepted.acceptedAt, 'accepted timestamp required');
    pass('customer acceptance stores signer, timestamp, metadata, and body hash', accepted.id);
  } finally {
    await prisma.contractExecution.deleteMany({ where: { inquiryId: qaInquiry.id } });
    await prisma.inquiry.deleteMany({ where: { id: qaInquiry.id } });
  }
  const leakedQaInquiry = await prisma.inquiry.findUnique({ where: { id: qaInquiry.id } });
  assert.equal(leakedQaInquiry, null, 'persisted QA inquiry cleanup failed');
  pass('persisted customer-flow QA cleaned up temporary inquiry/execution');

  const leakedTemplate = await prisma.contractTemplate.findFirst({ where: { version: runId } });
  assert.equal(leakedTemplate, null, 'QA template leaked outside rollback transaction');
  const leakedInquiry = await prisma.inquiry.findFirst({ where: { email: `qa+${runId}@example.com` } });
  assert.equal(leakedInquiry, null, 'QA inquiry leaked outside rollback transaction');
  pass('verified rollback left no QA template/inquiry residue');
}

try {
  await main();
} catch (error) {
  fail('qa script fatal', error);
  process.exitCode = 1;
} finally {
  console.log(JSON.stringify({ runId, generatedAt: new Date().toISOString(), results }, null, 2));
  await prisma.$disconnect();
}
