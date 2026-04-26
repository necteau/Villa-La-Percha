import { listReservations } from "@/lib/reservations";
import { listPricingEntries } from "@/lib/pricingData";
import { listInquiryThreads } from "@/lib/inquiries";
import { listCustomers } from "@/lib/customers";

export interface OwnerPortalStats {
  reservationsTotal: number;
  reservationsUpcoming: number;
  ownerWeeks: number;
  pricingWindows: number;
  directPricingNightly: number | null;
  inquiriesTotal: number;
  inquiriesNew: number;
  inquiriesUnreplied: number;
  inquiriesAwaitingApproval: number;
  inquiriesSentReplies: number;
  inquiriesConverted: number;
  inquiryConversionRate: number | null;
  avgFirstResponseHours: number | null;
  customersTotal: number;
  repeatGuests: number;
}

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function getOwnerPortalStats(): Promise<OwnerPortalStats> {
  const [reservations, pricingEntries, inquiries, customers] = await Promise.all([
    listReservations(),
    listPricingEntries(),
    listInquiryThreads(),
    listCustomers(),
  ]);

  const today = todayYmd();
  const directEntry = pricingEntries.find((entry) => entry.platform === "direct");
  const inquiriesNew = inquiries.filter((inquiry) => inquiry.status === "new").length;
  const inquiriesUnreplied = inquiries.filter((inquiry) => inquiry.status === "new" || inquiry.status === "replied").length;
  const inquiriesAwaitingApproval = inquiries.filter((inquiry) =>
    inquiry.drafts.some((draft) => draft.status === "pending_owner_approval" || draft.status === "approved")
  ).length;
  const inquiriesSentReplies = inquiries.filter((inquiry) => inquiry.messages.some((message) => message.direction === "outbound")).length;
  const inquiriesConverted = inquiries.filter((inquiry) => inquiry.status === "converted").length;

  const firstResponseHours = inquiries
    .map((inquiry) => {
      const firstInbound = inquiry.messages.find((message) => message.direction === "inbound");
      const firstOutbound = inquiry.messages.find((message) => message.direction === "outbound");
      if (!firstInbound || !firstOutbound) return null;
      const inboundTime = new Date(firstInbound.receivedAt || firstInbound.createdAt).getTime();
      const outboundTime = new Date(firstOutbound.sentAt || firstOutbound.createdAt).getTime();
      if (Number.isNaN(inboundTime) || Number.isNaN(outboundTime) || outboundTime < inboundTime) return null;
      return (outboundTime - inboundTime) / (1000 * 60 * 60);
    })
    .filter((value): value is number => value !== null);

  return {
    reservationsTotal: reservations.length,
    reservationsUpcoming: reservations.filter((reservation) => reservation.checkIn >= today).length,
    ownerWeeks: reservations.filter((reservation) => reservation.isOwnerWeek).length,
    pricingWindows: pricingEntries.length,
    directPricingNightly: directEntry?.nightlyRate ?? null,
    inquiriesTotal: inquiries.length,
    inquiriesNew,
    inquiriesUnreplied,
    inquiriesAwaitingApproval,
    inquiriesSentReplies,
    inquiriesConverted,
    inquiryConversionRate: inquiries.length > 0 ? inquiriesConverted / inquiries.length : null,
    avgFirstResponseHours: average(firstResponseHours),
    customersTotal: customers.length,
    repeatGuests: customers.filter((customer) => customer.status === "repeat_guest" || customer.status === "vip").length,
  };
}
