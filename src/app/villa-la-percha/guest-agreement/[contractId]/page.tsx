import { notFound } from "next/navigation";
import { getGuestContractForReview } from "@/lib/guestContracts";
import AgreementDocument from "./AgreementDocument";

function formatDate(value?: Date | null) {
  if (!value) return "Not set";
  return value.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function formatMoney(value?: { toString(): string } | number | null) {
  if (!value) return "Not set";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `$${numeric.toLocaleString()}` : "Not set";
}

function formatNights(checkIn?: Date | null, checkOut?: Date | null) {
  if (!checkIn || !checkOut) return "Not set";
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  return nights > 0 ? `${nights} night${nights === 1 ? "" : "s"}` : "Not set";
}

export default async function GuestAgreementPage({ params, searchParams }: { params: Promise<{ contractId: string }>; searchParams: Promise<{ token?: string; preview?: string }> }) {
  const { contractId } = await params;
  const { token, preview } = await searchParams;
  const isOwnerPreview = preview === "owner";
  const contract = await getGuestContractForReview(contractId, token, { preview: isOwnerPreview });
  if (!contract) notFound();

  const checkIn = contract.reservation?.checkIn || contract.inquiry?.checkIn;
  const checkOut = contract.reservation?.checkOut || contract.inquiry?.checkOut;
  const accepted = contract.status === "ACCEPTED";
  const signerName = contract.signerName || contract.inquiry?.fullName || contract.reservation?.guestName || "Guest";
  const signerEmail = contract.signerEmail || contract.inquiry?.email || contract.reservation?.guestEmail || "Not set";

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-8 text-[#181612] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#e3d8c8] bg-white p-5 shadow-xl sm:p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7355]">Villa La Percha</p>
        <h1 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">Guest rental agreement</h1>
        <p className="mt-4 text-sm leading-6 text-[#5b554b]">
          {isOwnerPreview
            ? "Owner preview mode: review this agreement safely before sending it. This preview does not mark the guest agreement as viewed and does not allow acceptance."
            : "Please review the agreement below. The accept button remains disabled until the acknowledgment box is checked."}
        </p>

        {isOwnerPreview ? (
          <div className="mt-5 rounded-3xl border border-[#d9c49d] bg-[#fff7e0] p-4 text-sm leading-6 text-[#5b4217]">
            <p className="font-semibold">Owner preview — no guest activity recorded.</p>
            <p>Use the standard guest link when you are ready for the guest to review and accept the agreement.</p>
          </div>
        ) : null}

        {accepted ? (
          <div className="mt-6 rounded-3xl border border-[#b7d9c2] bg-[#eef8f1] p-4 text-sm leading-6 text-[#1e4536]">
            <p className="font-semibold">Agreement accepted.</p>
            <p>Accepted {contract.acceptedAt?.toLocaleString()} by {signerName}. You may save or print this page for your records.</p>
          </div>
        ) : null}

        <AgreementDocument
          bodyMarkdown={contract.template.bodyMarkdown}
          signerName={signerName}
          signerEmail={signerEmail}
          guestPhone={contract.inquiry?.phone || "Not provided"}
          checkIn={formatDate(checkIn)}
          checkOut={formatDate(checkOut)}
          nights={formatNights(checkIn, checkOut)}
          total={formatMoney(contract.reservation?.totalAmount || contract.inquiry?.quotedAmount)}
          deposit={formatMoney(contract.inquiry?.depositAmount)}
          paymentMethod={contract.inquiry?.paymentMethod || "Not specified in booking record"}
          agreementVersion={contract.template.version}
          contractId={contract.id}
          token={token || ""}
          isOwnerPreview={isOwnerPreview}
          accepted={accepted}
        />
      </div>
    </main>
  );
}
