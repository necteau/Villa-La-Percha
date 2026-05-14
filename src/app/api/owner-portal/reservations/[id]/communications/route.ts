import { NextResponse } from "next/server";
import { requireOwnerPortalSession, requireOwnerPortalWriteAccess } from "@/lib/ownerPortalApi";
import { getOwnerPortalPropertyScope } from "@/lib/ownerPortalScope";
import { ensureReservationEmailJobs, getReservationCommunicationSummary, markReservationEmailJobStatus, type ReservationEmailStatus } from "@/lib/reservationComms";
import { getPrismaClient } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

async function assertScopedReservation(id: string) {
  const property = await getOwnerPortalPropertyScope();
  const prisma = await getPrismaClient();
  const reservation = await prisma.reservation.findFirst({ where: { id, propertyId: property.id }, select: { id: true } });
  if (!reservation) return null;
  return reservation;
}

export async function GET(_req: Request, context: Params) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const reservation = await assertScopedReservation(id);
  if (!reservation) return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
  await ensureReservationEmailJobs(id);
  const communication = await getReservationCommunicationSummary(id);
  return NextResponse.json({ ok: true, communication });
}

export async function POST(req: Request, context: Params) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;
  const { id } = await context.params;
  const reservation = await assertScopedReservation(id);
  if (!reservation) return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");
  if (action === "ensure_email_jobs") {
    const emailJobs = await ensureReservationEmailJobs(id);
    return NextResponse.json({ ok: true, emailJobs });
  }
  if (action === "job_status") {
    const jobId = String(body?.jobId || "");
    const status = String(body?.status || "");
    if (!jobId || !["pending_approval", "approved", "sent", "cancelled", "failed"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Missing job or unsupported status" }, { status: 400 });
    }
    const job = await markReservationEmailJobStatus(id, jobId, status as ReservationEmailStatus);
    return NextResponse.json({ ok: true, job });
  }
  return NextResponse.json({ ok: false, error: "Unsupported communication action" }, { status: 400 });
}
