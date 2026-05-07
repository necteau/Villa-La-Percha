import { notFound } from "next/navigation";
import { getGuestContractForReview } from "@/lib/guestContracts";

function formatDate(value?: Date | null) {
  if (!value) return "Not set";
  return value.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default async function GuestAgreementPage({ params, searchParams }: { params: Promise<{ contractId: string }>; searchParams: Promise<{ token?: string }> }) {
  const { contractId } = await params;
  const { token } = await searchParams;
  const contract = await getGuestContractForReview(contractId, token);
  if (!contract) notFound();

  const checkIn = contract.reservation?.checkIn || contract.inquiry?.checkIn;
  const checkOut = contract.reservation?.checkOut || contract.inquiry?.checkOut;
  const total = contract.reservation?.totalAmount || contract.inquiry?.quotedAmount;
  const accepted = contract.status === "ACCEPTED";

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-8 text-[#181612] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#e3d8c8] bg-white p-5 shadow-xl sm:p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7355]">Villa La Percha</p>
        <h1 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">Guest rental agreement</h1>
        <p className="mt-4 text-sm leading-6 text-[#5b554b]">
          Please review the agreement below and accept it using your typed legal name. Your acceptance is stored with the agreement version, timestamp, and booking record.
        </p>

        <section className="mt-6 grid gap-3 rounded-3xl border border-[#eadfce] bg-[#fffaf2] p-4 text-sm sm:grid-cols-2">
          <p><span className="font-semibold">Guest:</span> {contract.signerName || contract.inquiry?.fullName || contract.reservation?.guestName || "Guest"}</p>
          <p><span className="font-semibold">Email:</span> {contract.signerEmail || contract.inquiry?.email || contract.reservation?.guestEmail || "Not set"}</p>
          <p><span className="font-semibold">Check-in:</span> {formatDate(checkIn)}</p>
          <p><span className="font-semibold">Check-out:</span> {formatDate(checkOut)}</p>
          <p><span className="font-semibold">Agreement version:</span> {contract.template.version}</p>
          <p><span className="font-semibold">Total:</span> {total ? `$${Number(total).toLocaleString()}` : "Shown in booking confirmation"}</p>
        </section>

        {accepted ? (
          <div className="mt-6 rounded-3xl border border-[#b7d9c2] bg-[#eef8f1] p-4 text-sm leading-6 text-[#1e4536]">
            <p className="font-semibold">Agreement accepted.</p>
            <p>Accepted {contract.acceptedAt?.toLocaleString()} by {contract.signerName || "guest"}. You may save or print this page for your records.</p>
          </div>
        ) : null}

        <article className="prose prose-stone mt-8 max-w-none whitespace-pre-wrap rounded-3xl border border-[#eee5d8] bg-[#fffdf8] p-5 text-sm leading-7 text-[#2c2923] sm:p-6">
          {contract.template.bodyMarkdown}
        </article>

        {!accepted ? (
          <form action={`/api/guest-contracts/${contract.id}/accept`} method="post" className="mt-8 rounded-3xl border border-[#e3d8c8] bg-[#fffaf2] p-5">
            <input type="hidden" name="token" value={token || ""} />
            <label className="block text-sm font-semibold text-[#181612]" htmlFor="signerName">Typed legal name</label>
            <input id="signerName" name="signerName" required defaultValue={contract.signerName || contract.inquiry?.fullName || contract.reservation?.guestName || ""} className="mt-2 w-full rounded-2xl border border-[#d8cebf] px-4 py-3" />
            <label className="mt-4 block text-sm font-semibold text-[#181612]" htmlFor="signerEmail">Email</label>
            <input id="signerEmail" name="signerEmail" type="email" required defaultValue={contract.signerEmail || contract.inquiry?.email || contract.reservation?.guestEmail || ""} className="mt-2 w-full rounded-2xl border border-[#d8cebf] px-4 py-3" />
            <label className="mt-4 flex gap-3 text-sm leading-6 text-[#5b554b]">
              <input name="acceptedTerms" value="yes" type="checkbox" required className="mt-1 h-4 w-4" />
              <span>I have reviewed and agree to the Villa La Percha Guest Rental Agreement, including cancellation, payment, occupancy, house rule, security deposit/card hold, and liability terms.</span>
            </label>
            <button className="mt-5 rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white" type="submit">
              Accept agreement
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
