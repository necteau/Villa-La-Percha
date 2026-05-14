#!/usr/bin/env node
import assert from "node:assert/strict";
import { getPrismaClient } from "../src/lib/db.ts";
import { appendInquiryMessage } from "../src/lib/inquiries.ts";
import { ensureReservationEmailJobs, findActiveReservationForInquiry, getReservationCommunicationSummary, markReservationEmailJobStatus, markReservationNeedsReply } from "../src/lib/reservationComms.ts";

const prisma = await getPrismaClient();
const suffix = Date.now();
const ownerId = `qa-owner-${suffix}`;
const propertySlug = `qa-reservation-comms-${suffix}`;
let created = { ownerId: null, propertyId: null, inquiryId: null, reservationId: null };

try {
  const owner = await prisma.owner.create({
    data: {
      id: ownerId,
      displayName: "QA Reservation Comms Owner",
      properties: { create: { slug: propertySlug, name: "QA Villa", status: "LIVE", inquiryEnabled: true } },
    },
    include: { properties: true },
  });
  const property = owner.properties[0];
  created.ownerId = owner.id;
  created.propertyId = property.id;

  const customer = await prisma.customer.create({
    data: { ownerId: owner.id, primaryPropertyId: property.id, fullName: "QA Guest", email: `qa-${suffix}@example.com` },
  });
  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      customerId: customer.id,
      fullName: "QA Guest",
      email: customer.email,
      checkIn: new Date("2031-03-10T00:00:00.000Z"),
      checkOut: new Date("2031-03-15T00:00:00.000Z"),
      message: "We are booked and have an arrival question.",
      status: "BOOKED",
      isTest: true,
    },
  });
  created.inquiryId = inquiry.id;
  const reservation = await prisma.reservation.create({
    data: {
      propertyId: property.id,
      customerId: customer.id,
      sourceInquiryId: inquiry.id,
      status: "CONFIRMED",
      source: "DIRECT",
      bookingType: "Direct",
      guestName: "QA Guest",
      guestEmail: customer.email,
      checkIn: new Date("2031-03-10T00:00:00.000Z"),
      checkOut: new Date("2031-03-15T00:00:00.000Z"),
      nights: 5,
      totalAmount: 5000,
      amountReceived: 1500,
      paymentStatus: "DEPOSIT_RECEIVED",
      isTest: true,
    },
  });
  created.reservationId = reservation.id;

  const activeReservation = await findActiveReservationForInquiry(inquiry.id);
  assert.equal(activeReservation?.id, reservation.id, "booked inquiry should resolve to active reservation");

  const inbound = await appendInquiryMessage({
    inquiryId: inquiry.id,
    reservationId: reservation.id,
    direction: "inbound",
    authorType: "guest",
    subject: "Arrival question",
    body: "Can we check in a little early?",
    emailMessageId: `qa-message-${suffix}`,
    receivedAt: new Date().toISOString(),
  });
  await markReservationNeedsReply(reservation.id, inbound.id, inbound.receivedAt);

  const inquiryAfterInbound = await prisma.inquiry.findUnique({ where: { id: inquiry.id }, select: { status: true } });
  assert.equal(inquiryAfterInbound?.status, "BOOKED", "booked inquiry should remain historical/non-actionable");
  const summaryAfterInbound = await getReservationCommunicationSummary(reservation.id);
  assert.equal(summaryAfterInbound.needsReply, true, "reservation should be marked needs-reply");
  assert.equal(summaryAfterInbound.messages.some((message) => message.id === inbound.id && message.reservationId !== null), true, "inbound message should appear in reservation timeline");

  const jobs = await ensureReservationEmailJobs(reservation.id);
  assert.equal(jobs.length, 4, "four default reservation email jobs should be created");
  assert.equal(jobs.every((job) => job.status === "pending_approval"), true, "reservation email jobs should start approval-gated");
  assert.equal(jobs.some((job) => job.kind === "final_payment_reminder" && job.body.includes("$3,500")), true, "final payment reminder should render balance due");

  const approved = await markReservationEmailJobStatus(reservation.id, jobs[0].id, "approved");
  assert.equal(approved.status, "approved", "job should move to approved");
  const cancelled = await markReservationEmailJobStatus(reservation.id, jobs[1].id, "cancelled");
  assert.equal(cancelled.status, "cancelled", "job should move to cancelled");

  console.log(JSON.stringify({ ok: true, reservationId: reservation.id, checked: ["booked inquiry stays booked", "reservation needs-reply timeline", "approval-gated email jobs"] }, null, 2));
} finally {
  if (created.ownerId) {
    await prisma.owner.delete({ where: { id: created.ownerId } }).catch(async () => {
      if (created.propertyId) await prisma.property.deleteMany({ where: { id: created.propertyId } });
      await prisma.owner.deleteMany({ where: { id: created.ownerId } });
    });
  }
  await prisma.$disconnect();
}
