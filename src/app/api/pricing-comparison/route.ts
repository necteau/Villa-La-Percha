import { NextResponse } from "next/server";
import { calculateStayPricing, getSavingsPercentage, getStayNights } from "@/lib/pricing";
import { listPricingEntries } from "@/lib/pricingData";

function pickEntry(entries: Awaited<ReturnType<typeof listPricingEntries>>, platform: "direct" | "airbnb" | "vrbo", checkIn: string, checkOut: string) {
  const nights = getStayNights(checkIn, checkOut);
  const matches = entries.filter((entry) => {
    if (entry.platform !== platform) return false;
    if (entry.startDate > checkIn) return false;
    if (entry.endDate < checkOut) return false;
    if (entry.minimumStayNights && nights < entry.minimumStayNights) return false;
    return true;
  });

  if (matches.length === 0) return null;

  return matches.sort((a, b) => {
    const spanA = getStayNights(a.startDate, a.endDate);
    const spanB = getStayNights(b.startDate, b.endDate);
    return spanA - spanB;
  })[0];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return NextResponse.json({ ok: false, error: "Invalid dates" }, { status: 400 });
  }

  const entries = await listPricingEntries();
  const directEntry = pickEntry(entries, "direct", checkIn, checkOut);
  const airbnbEntry = pickEntry(entries, "airbnb", checkIn, checkOut);
  const vrboEntry = pickEntry(entries, "vrbo", checkIn, checkOut);

  const direct = directEntry ? calculateStayPricing(directEntry, checkIn, checkOut) : null;
  const airbnb = airbnbEntry ? calculateStayPricing(airbnbEntry, checkIn, checkOut) : null;
  const vrbo = vrboEntry ? calculateStayPricing(vrboEntry, checkIn, checkOut) : null;

  return NextResponse.json({
    ok: true,
    comparison: {
      nights: getStayNights(checkIn, checkOut),
      direct,
      airbnb,
      vrbo,
      savings: direct
        ? {
            airbnb: airbnb ? Math.round((airbnb.total - direct.total) * 100) / 100 : null,
            vrbo: vrbo ? Math.round((vrbo.total - direct.total) * 100) / 100 : null,
            airbnbPct: airbnb ? getSavingsPercentage(airbnb.total, direct.total) : null,
            vrboPct: vrbo ? getSavingsPercentage(vrbo.total, direct.total) : null,
          }
        : null,
    },
  });
}
