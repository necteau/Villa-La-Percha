import { NextResponse } from "next/server";
import { getSavingsPercentage, getStayNights } from "@/lib/pricing";
import { getCalculatedStayPricing, getPricingTaxSettings } from "@/lib/pricingData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return NextResponse.json({ ok: false, error: "Invalid dates" }, { status: 400 });
  }

  const [direct, airbnb, vrbo, taxSettings] = await Promise.all([
    getCalculatedStayPricing("direct", checkIn, checkOut),
    getCalculatedStayPricing("airbnb", checkIn, checkOut),
    getCalculatedStayPricing("vrbo", checkIn, checkOut),
    getPricingTaxSettings(),
  ]);

  return NextResponse.json({
    ok: true,
    comparison: {
      nights: getStayNights(checkIn, checkOut),
      direct,
      airbnb,
      vrbo,
      taxSettings,
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
