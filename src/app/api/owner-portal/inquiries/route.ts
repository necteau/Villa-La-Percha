import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { appendInquiryMessage, getInquiryThreadById, listInquiryThreads, runInquiryInboundAutomation, saveInquiryDraft, updateInquiryPayment, updateInquiryStatus, type InquiryThreadRecord } from "@/lib/inquiries";
import { sendApprovedInquiryDraft } from "@/lib/inquiryEmail";
import { getInquiryCopilotInsights } from "@/lib/inquiryCopilot";
import { getPaymentSettings } from "@/lib/ownerPortalSettings";
import { getStayPricing } from "@/lib/pricing";
import { createAiRevisionJob, type AiRevisionIntent } from "@/lib/aiDraftJobs";
import { trackInquiryConverted } from "@/lib/analytics";

function needsFreshDraftAfterLatestInbound(inquiry: InquiryThreadRecord): boolean {
  if (inquiry.status === "closed") return false;

  const latestInbound = [...inquiry.messages].reverse().find((message) => message.direction === "inbound");
  if (!latestInbound) return false;

  const latestInboundAt = Date.parse(latestInbound.receivedAt || latestInbound.createdAt);
  if (!Number.isFinite(latestInboundAt)) return false;

  const latestOutbound = [...inquiry.messages].reverse().find((message) => message.direction === "outbound");
  const latestOutboundAt = latestOutbound ? Date.parse(latestOutbound.sentAt || latestOutbound.createdAt) : null;
  if (latestOutboundAt && Number.isFinite(latestOutboundAt) && latestOutboundAt > latestInboundAt) {
    return false;
  }

  const latestOpenDraft = inquiry.drafts.find((draft) => draft.createdByType !== "system" && draft.status === "draft");
  if (!latestOpenDraft) return true;

  return Date.parse(latestOpenDraft.updatedAt) < latestInboundAt;
}

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  let inquiries = await listInquiryThreads();
  const staleDraftInquiries = inquiries.filter(needsFreshDraftAfterLatestInbound).slice(0, 5);
  if (staleDraftInquiries.length > 0) {
    await Promise.all(staleDraftInquiries.map((inquiry) => runInquiryInboundAutomation(inquiry.id).catch(() => {})));
    inquiries = await listInquiryThreads();
  }

  const paymentSettings = await getPaymentSettings();
  const inquiriesWithPricingContext = inquiries.map((inquiry) => {
    const pricing = inquiry.checkIn && inquiry.checkOut ? getStayPricing("direct", inquiry.checkIn, inquiry.checkOut) : null;
    const currentQuotedAmount = pricing?.total ?? undefined;
    const currentDepositAmount = currentQuotedAmount && paymentSettings.depositPercent > 0
      ? Math.round(currentQuotedAmount * paymentSettings.depositPercent) / 100
      : undefined;
    const quotedAmount = inquiry.quotedAmount;
    const hasStoredQuote = typeof quotedAmount === "number" && quotedAmount > 0;
    const hasCurrentQuote = typeof currentQuotedAmount === "number" && currentQuotedAmount > 0;
    const pricingSnapshotNotice = hasStoredQuote && hasCurrentQuote && Math.abs(quotedAmount - currentQuotedAmount) >= 1
      ? `Current pricing for these dates is now $${currentQuotedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}. This inquiry was quoted at $${quotedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} when submitted.`
      : !hasStoredQuote && hasCurrentQuote
        ? `This older inquiry does not have a stored quote snapshot. Current pricing for these dates is $${currentQuotedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`
        : undefined;
    return { ...inquiry, currentQuotedAmount, currentDepositAmount, pricingSnapshotNotice };
  });
  return NextResponse.json({ ok: true, inquiries: inquiriesWithPricingContext, paymentSettings });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const action = String(body?.action || "");

    if (action === "status") {
      const id = String(body?.id || "");
      const status = body?.status;
      if (!id || !status) {
        return NextResponse.json({ ok: false, error: "Missing inquiry id or status" }, { status: 400 });
      }

      const previousThread = await getInquiryThreadById(id);
      const previousStatus = previousThread?.status || "needs_reply";
      const inquiry = await updateInquiryStatus(id, status);
      if (!inquiry) {
        return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });
      }

      if (status === "booked") {
        void trackInquiryConverted(id).catch(() => {});
      }
      if (status === "closed" && body?.reason) {
        await appendInquiryMessage({
          inquiryId: id,
          direction: "outbound",
          authorType: "system",
          subject: "Inquiry closed",
          body: `Inquiry closed. Reason: ${String(body.reason).slice(0, 200)}\nPrevious status: ${previousStatus}`,
          sentAt: new Date().toISOString(),
        });
        await updateInquiryStatus(id, "closed");
      }

      return NextResponse.json({ ok: true, inquiry });
    }

    if (action === "reopen") {
      const id = String(body?.id || "");
      if (!id) return NextResponse.json({ ok: false, error: "Missing inquiry id" }, { status: 400 });

      const thread = await getInquiryThreadById(id);
      if (!thread) return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });

      const closedMessage = [...thread.messages]
        .reverse()
        .find((message) => message.authorType === "system" && message.subject === "Inquiry closed" && message.body.includes("Previous status:"));
      const previousStatus = closedMessage?.body.match(/Previous status:\s*(needs_reply|awaiting_guest|booked|closed)/)?.[1] || "needs_reply";
      const nextStatus = previousStatus === "closed" ? "needs_reply" : previousStatus;
      const inquiry = await updateInquiryStatus(id, nextStatus as InquiryThreadRecord["status"]);
      await appendInquiryMessage({
        inquiryId: id,
        direction: "outbound",
        authorType: "system",
        subject: "Inquiry reopened",
        body: `Inquiry reopened. Restored status: ${nextStatus}`,
        sentAt: new Date().toISOString(),
      });
      await updateInquiryStatus(id, nextStatus as InquiryThreadRecord["status"]);

      return NextResponse.json({ ok: true, inquiry });
    }

    if (action === "payment") {
      const id = String(body?.id || "");
      if (!id) return NextResponse.json({ ok: false, error: "Missing inquiry id" }, { status: 400 });
      const inquiry = await updateInquiryPayment(id, {
        quotedAmount: body?.quotedAmount,
        paymentStatus: body?.paymentStatus || "unpaid",
        depositAmount: body?.depositAmount,
        amountReceived: body?.amountReceived,
        paymentMethod: body?.paymentMethod ? String(body.paymentMethod) : undefined,
        paymentNote: body?.paymentNote ? String(body.paymentNote) : undefined,
        paymentConfirmedAt: body?.paymentConfirmedAt ? String(body.paymentConfirmedAt) : undefined,
      });
      if (!inquiry) return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });

      await appendInquiryMessage({
        inquiryId: id,
        direction: "outbound",
        authorType: "system",
        subject: "Payment updated",
        body: `Payment status updated: ${inquiry.paymentStatus.replaceAll("_", " ")}. Amount received: ${inquiry.amountReceived ? `$${inquiry.amountReceived.toLocaleString()}` : "not recorded"}. Method: ${inquiry.paymentMethod || "not recorded"}.${inquiry.paymentNote ? ` Note: ${inquiry.paymentNote}` : ""}`,
        sentAt: new Date().toISOString(),
      });

      let refreshedDraft = null;
      if (["deposit_received", "paid_in_full"].includes(inquiry.paymentStatus)) {
        const thread = await getInquiryThreadById(id);
        if (thread) {
          const insights = await getInquiryCopilotInsights(thread);
          const paymentDraft = insights.draftOptions.find((option) => option.key === "payment") || insights.draftOptions[0];
          const openDraft = [...thread.drafts]
            .filter((draft) => draft.createdByType !== "system" && draft.status === "draft")
            .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
          refreshedDraft = await saveInquiryDraft({
            id: openDraft?.id,
            inquiryId: id,
            subject: paymentDraft.subject,
            body: paymentDraft.body,
            status: "draft",
            createdByType: "assistant",
          });
        }
      }

      const refreshedThread = await getInquiryThreadById(id);
      const refreshedInsights = refreshedThread ? await getInquiryCopilotInsights(refreshedThread) : null;

      return NextResponse.json({ ok: true, inquiry: refreshedThread || inquiry, draft: refreshedDraft, insights: refreshedInsights });
    }

    if (action === "payment_defaults") {
      const inquiryId = String(body?.inquiryId || "");
      const inquiry = await getInquiryThreadById(inquiryId);
      if (!inquiry) return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });
      const pricing = inquiry.checkIn && inquiry.checkOut ? getStayPricing("direct", inquiry.checkIn, inquiry.checkOut) : null;
      const paymentSettings = await getPaymentSettings();
      const reservationTotal = pricing?.total ?? null;
      const depositAmount = reservationTotal && paymentSettings.depositPercent > 0
        ? Math.round(reservationTotal * paymentSettings.depositPercent) / 100
        : null;
      return NextResponse.json({ ok: true, defaults: { reservationTotal, depositAmount, depositPercent: paymentSettings.depositPercent } });
    }

    if (action === "draft") {
      const inquiryId = String(body?.inquiryId || "");
      const thread = await getInquiryThreadById(inquiryId);
      if (thread?.status === "closed") {
        return NextResponse.json({ ok: false, error: "Closed inquiries must be reopened before drafting." }, { status: 400 });
      }
      const draft = await saveInquiryDraft({
        id: body?.id ? String(body.id) : undefined,
        inquiryId,
        subject: body?.subject ? String(body.subject) : undefined,
        body: String(body?.body || ""),
        status: body?.status,
        createdByType: body?.createdByType,
      });
      return NextResponse.json({ ok: true, draft });
    }

    if (action === "ai_revision") {
      const inquiryId = String(body?.inquiryId || "");
      const draftId = String(body?.draftId || "");
      const revisionIntent = String(body?.revisionIntent || "custom") as AiRevisionIntent;
      const allowedIntents = new Set(["shorter", "warmer", "direct", "custom"]);
      if (!inquiryId || !draftId || !allowedIntents.has(revisionIntent)) {
        return NextResponse.json({ ok: false, error: "Missing inquiry, draft, or revision type" }, { status: 400 });
      }
      const thread = await getInquiryThreadById(inquiryId);
      if (thread?.status === "closed") {
        return NextResponse.json({ ok: false, error: "Closed inquiries must be reopened before AI revisions." }, { status: 400 });
      }
      const job = await createAiRevisionJob({
        inquiryId,
        draftId,
        subject: body?.subject ? String(body.subject) : undefined,
        body: String(body?.draftBody || ""),
        intent: revisionIntent,
        instruction: body?.instruction ? String(body.instruction) : undefined,
      });
      return NextResponse.json({ ok: true, job: { id: job.id } });
    }

    if (action === "send") {
      const inquiryId = String(body?.inquiryId || "");
      const draftId = String(body?.draftId || "");
      const thread = await getInquiryThreadById(inquiryId);
      if (thread?.status === "closed") {
        return NextResponse.json({ ok: false, error: "Closed inquiries must be reopened before sending replies." }, { status: 400 });
      }
      if (!inquiryId || !draftId) {
        return NextResponse.json({ ok: false, error: "Missing inquiry or draft id" }, { status: 400 });
      }
      const draft = await saveInquiryDraft({
        id: draftId,
        inquiryId,
        subject: body?.subject ? String(body.subject) : undefined,
        body: String(body?.body || ""),
        status: "approved",
        createdByType: "owner",
      });
      const sent = await sendApprovedInquiryDraft(inquiryId, draft.id);
      return NextResponse.json({ ok: true, sent });
    }

    if (action === "assist") {
      const inquiryId = String(body?.inquiryId || "");
      if (!inquiryId) {
        return NextResponse.json({ ok: false, error: "Missing inquiry id" }, { status: 400 });
      }
      const inquiry = await getInquiryThreadById(inquiryId);
      if (!inquiry) {
        return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });
      }
      const insights = await getInquiryCopilotInsights(inquiry);
      return NextResponse.json({ ok: true, insights });
    }

    return NextResponse.json({ ok: false, error: "Unsupported inquiry action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update inquiry" },
      { status: 400 }
    );
  }
}
