import { listReservations } from "@/lib/reservations";
import { listPricingEntries } from "@/lib/pricingData";
import { listInquiries } from "@/lib/inquiries";

export interface OwnerPortalStats {
  reservationsTotal: number;
  reservationsUpcoming: number;
  ownerWeeks: number;
  pricingWindows: number;
  directPricingNightly: number | null;
  inquiriesTotal: number;
  inquiriesNew: number;
  inquiriesUnreplied: number;
}

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getOwnerPortalStats(): Promise<OwnerPortalStats> {
  const [reservations, pricingEntries, inquiries] = await Promise.all([
    listReservations(),
    listPricingEntries(),
    listInquiries(),
  ]);

  const today = todayYmd();
  const directEntry = pricingEntries.find((entry) => entry.platform === "direct");
  const inquiriesNew = inquiries.filter((inquiry) => inquiry.status === "new").length;
  const inquiriesUnreplied = inquiries.filter((inquiry) => inquiry.status === "new" || inquiry.status === "replied").length;

  return {
    reservationsTotal: reservations.length,
    reservationsUpcoming: reservations.filter((reservation) => reservation.checkIn >= today).length,
    ownerWeeks: reservations.filter((reservation) => reservation.isOwnerWeek).length,
    pricingWindows: pricingEntries.length,
    directPricingNightly: directEntry?.nightlyRate ?? null,
    inquiriesTotal: inquiries.length,
    inquiriesNew,
    inquiriesUnreplied,
  };
}
