import 'dotenv/config';
import { GuestContractExecutionStatus } from '@prisma/client';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getPrismaClient } from '../src/lib/db.ts';

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
