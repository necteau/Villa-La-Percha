function formatDateLabel(value?: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

type InquiryLike = {
  checkIn?: string;
  checkOut?: string;
};

export function buildInquiryEmailSubject(inquiry: InquiryLike): string {
  const checkIn = formatDateLabel(inquiry.checkIn);
  const checkOut = formatDateLabel(inquiry.checkOut);

  if (checkIn && checkOut) {
    return `Villa La Percha Inquiry ${checkIn} - ${checkOut}`;
  }

  if (checkIn) {
    return `Villa La Percha Inquiry starting ${checkIn}`;
  }

  return "Villa La Percha Inquiry";
}

