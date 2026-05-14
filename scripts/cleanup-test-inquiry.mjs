#!/usr/bin/env node
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL && fs.existsSync(".env.local")) {
  const match = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m);
  if (match?.[1]) process.env.DATABASE_URL = match[1].replace(/^[\'"]|[\'"]$/g, "");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const args = new Set(process.argv.slice(2));
const id = process.env.INQUIRY_ID || process.argv.find((arg) => !arg.startsWith("--"));
const apply = args.has("--apply");
const markOnly = args.has("--mark-only");
const force = args.has("--force");
if (!id) throw new Error("Usage: INQUIRY_ID=<id> node scripts/cleanup-test-inquiry.mjs [--mark-only] [--apply] [--force]");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      property: { select: { slug: true, name: true } },
      messages: { select: { id: true } },
      drafts: { select: { id: true } },
      reservations: { select: { id: true, guestName: true, checkIn: true, checkOut: true } },
      contractExecutions: { select: { id: true, status: true } },
    },
  });
  if (!inquiry) throw new Error(`Inquiry not found: ${id}`);

  const summary = {
    mode: apply ? (markOnly ? "mark-test" : "delete-test") : "dry-run",
    inquiry: {
      id: inquiry.id,
      property: inquiry.property.slug,
      fullName: inquiry.fullName,
      email: inquiry.email,
      checkIn: inquiry.checkIn?.toISOString().slice(0, 10) || null,
      checkOut: inquiry.checkOut?.toISOString().slice(0, 10) || null,
      status: inquiry.status,
      isTest: inquiry.isTest,
    },
    linked: {
      messages: inquiry.messages.length,
      drafts: inquiry.drafts.length,
      reservations: inquiry.reservations.map((reservation) => ({
        id: reservation.id,
        guestName: reservation.guestName,
        checkIn: reservation.checkIn.toISOString().slice(0, 10),
        checkOut: reservation.checkOut.toISOString().slice(0, 10),
      })),
      contracts: inquiry.contractExecutions,
    },
  };
  console.log(JSON.stringify(summary, null, 2));

  if (!apply) {
    console.log("Dry run only. Add --apply after reviewing the summary.");
    process.exit(0);
  }

  if (!inquiry.isTest && !force && !markOnly) {
    throw new Error("Refusing to delete an inquiry that is not marked isTest. Re-run with --mark-only --apply first, or use --force after review.");
  }

  if (markOnly) {
    await prisma.inquiry.update({ where: { id }, data: { isTest: true } });
    await prisma.reservation.updateMany({ where: { sourceInquiryId: id }, data: { isTest: true } });
    console.log(`Marked inquiry ${id} and linked reservations as test data.`);
  } else {
    await prisma.$transaction([
      prisma.reservation.updateMany({ where: { sourceInquiryId: id }, data: { sourceInquiryId: null, isTest: true } }),
      prisma.contractExecution.updateMany({ where: { inquiryId: id }, data: { inquiryId: null } }),
      prisma.inquiry.delete({ where: { id } }),
    ]);
    console.log(`Deleted test inquiry ${id}; linked reservations were detached and marked test.`);
  }
} finally {
  await prisma.$disconnect();
  await pool.end();
}
