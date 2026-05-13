"use client";

import { useMemo, useState } from "react";

type AgreementDocumentProps = {
  bodyMarkdown: string;
  signerName: string;
  signerEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: string;
  total: string;
  deposit: string;
  paymentMethod: string;
  agreementVersion: string;
  contractId: string;
  token: string;
  isOwnerPreview: boolean;
  accepted: boolean;
};

type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; rows: string[][] };

function cleanInline(value: string) {
  return value.replace(/\*\*(.*?)\*\*/g, "$1").trim();
}

function parseAgreement(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]?.trim() || "";
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length as 1 | 2 | 3, text: cleanInline(heading[2]) });
      index += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (lines[index]?.trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      const rows = tableLines
        .filter((row) => !/^\|\s*-+/.test(row.replace(/\s/g, "")))
        .filter((row) => !row.includes("---"))
        .map((row) => row.split("|").slice(1, -1).map(cleanInline));
      if (rows.length) blocks.push({ kind: "table", rows });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (/^[-*]\s+/.test(lines[index]?.trim() || "")) {
        items.push(cleanInline((lines[index]?.trim() || "").replace(/^[-*]\s+/, "")));
        index += 1;
      }
      blocks.push({ kind: "list", items });
      continue;
    }

    const paragraph: string[] = [];
    while (lines[index] && !/^#{1,3}\s+/.test(lines[index].trim()) && !lines[index].trim().startsWith("|") && !/^[-*]\s+/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
      if (!lines[index]?.trim()) break;
    }
    blocks.push({ kind: "paragraph", text: cleanInline(paragraph.join(" ")) });
  }

  return blocks;
}

function resolveText(value: string, summary: Omit<AgreementDocumentProps, "bodyMarkdown" | "contractId" | "token" | "isOwnerPreview" | "accepted">) {
  return value
    .replace("Guest identified in the booking record", summary.signerName)
    .replace("Guest contact details in the booking record", `${summary.signerEmail}${summary.guestPhone !== "Not provided" ? ` / ${summary.guestPhone}` : ""}`)
    .replace("Booking confirmation date", summary.checkIn)
    .replace("Amount shown in booking confirmation/payment record", summary.total)
    .replace("the primary guest identified in the booking record", summary.signerName)
    .replace("the primary guest identified in the booking record (the “Guest”)", `${summary.signerName} (the “Guest”)`)
    .replace("The check-in date, check-out date, and nightly count are the details shown in the booking confirmation.", `The confirmed stay is ${summary.checkIn} to ${summary.checkOut}, for ${summary.nights}.`)
    .replace("The total rental amount, taxes, deposit/down payment, final payment, due dates, and payment method are the amounts and terms shown in the booking confirmation and payment record.", `The current owner-approved booking terms show ${summary.total} total rental amount, ${summary.deposit} deposit/down payment, and payment method: ${summary.paymentMethod}. Final payment timing and any additional payment details are controlled by the owner-approved booking confirmation and payment record.`);
}

export default function AgreementDocument(props: AgreementDocumentProps) {
  const { bodyMarkdown, signerName, signerEmail, guestPhone, checkIn, checkOut, nights, total, deposit, paymentMethod, agreementVersion, contractId, token, isOwnerPreview, accepted } = props;
  const [checked, setChecked] = useState(false);
  const blocks = useMemo(() => {
    const parsed = parseAgreement(bodyMarkdown);
    const signatureIndex = parsed.findIndex((block) => block.kind === "heading" && block.text.includes("Signature Blocks"));
    return signatureIndex >= 0 ? parsed.slice(0, signatureIndex) : parsed;
  }, [bodyMarkdown]);
  const summary = { signerName, signerEmail, guestPhone, checkIn, checkOut, nights, total, deposit, paymentMethod, agreementVersion };

  return (
    <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#d8c8ae] bg-[#f2eadc] shadow-[0_24px_70px_rgba(58,39,16,0.14)]">
      <div className="border-b border-[#dbcbb4] bg-[#352719] px-5 py-4 text-white sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8c8ae]">{isOwnerPreview ? "Owner Review Copy" : "Guest Review Copy"}</p>
        <p className="mt-2 text-sm text-[#f8efe1]">{isOwnerPreview ? "PDF-style customer presentation preview. No guest activity is recorded from this page." : "Please review the agreement carefully, then check the acknowledgment box to accept."}</p>
      </div>

      <article className="mx-auto my-6 max-w-[820px] bg-[#fffdf8] px-5 py-7 text-[#241d16] shadow-[0_8px_30px_rgba(58,39,16,0.12)] sm:my-8 sm:px-10 sm:py-10 lg:px-14">
        <div className="border-b border-[#dfd1bd] pb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8b7355]">Villa La Percha</p>
          <h2 className="mt-3 font-display text-4xl font-light leading-tight text-[#2f251b] sm:text-5xl">Guest Rental Agreement</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#655849]">{isOwnerPreview ? "A polished owner-preview rendering of the agreement that will be used for customer review after approval." : "Please review this agreement before accepting electronically below."}</p>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-[#eadfce] bg-[#fff8ea] p-4 text-sm sm:grid-cols-2">
          <p><span className="font-semibold text-[#3a2b1c]">Primary guest:</span> {signerName}</p>
          <p><span className="font-semibold text-[#3a2b1c]">Email:</span> {signerEmail}</p>
          <p><span className="font-semibold text-[#3a2b1c]">Phone:</span> {guestPhone}</p>
          <p><span className="font-semibold text-[#3a2b1c]">Stay:</span> {checkIn} to {checkOut}</p>
          <p><span className="font-semibold text-[#3a2b1c]">Length:</span> {nights}</p>
          <p><span className="font-semibold text-[#3a2b1c]">Total / deposit:</span> {total} / {deposit}</p>
        </div>

        <div className="mt-8 space-y-5">
          {blocks.map((block, idx) => {
            if (block.kind === "heading") {
              if (block.level === 1) return null;
              const Tag = block.level === 2 ? "h3" : "h4";
              return <Tag key={idx} className={`${block.level === 2 ? "mt-9 border-t border-[#eadfce] pt-6 text-2xl" : "mt-6 text-lg"} font-display font-light leading-tight text-[#2f251b]`}>{block.text}</Tag>;
            }
            if (block.kind === "table") {
              const resolvedRows = block.rows.map((row) => {
                const label = row[0];
                if (label === "Primary Guest") return [label, signerName];
                if (label === "Guest Email / Phone") return [label, `${signerEmail}${guestPhone !== "Not provided" ? ` / ${guestPhone}` : " / Not provided"}`];
                if (label === "Check-in Date") return [label, checkIn];
                if (label === "Check-out Date") return [label, checkOut];
                if (label === "Total Rental Amount") return [label, total];
                if (label === "Agreement Version") return [label, agreementVersion];
                return row.map((cell) => resolveText(cell, summary));
              });
              const [head, ...rows] = resolvedRows;
              return (
                <div key={idx} className="overflow-hidden rounded-2xl border border-[#e5d8c6]">
                  <table className="w-full border-collapse text-left text-sm">
                    {head ? <thead className="bg-[#f5ead8] text-[#3a2b1c]"><tr>{head.map((cell, cellIdx) => <th key={cellIdx} className="px-4 py-3 font-semibold">{cell}</th>)}</tr></thead> : null}
                    <tbody>
                      {rows.map((row, rowIdx) => <tr key={rowIdx} className="border-t border-[#eadfce] odd:bg-[#fffaf2]">{row.map((cell, cellIdx) => <td key={cellIdx} className="px-4 py-3 align-top leading-6 text-[#4e453b]">{cell}</td>)}</tr>)}
                    </tbody>
                  </table>
                </div>
              );
            }
            if (block.kind === "list") {
              return <ul key={idx} className="ml-5 list-disc space-y-2 text-sm leading-7 text-[#4e453b]">{block.items.map((item, itemIdx) => <li key={itemIdx}>{resolveText(item, summary)}</li>)}</ul>;
            }
            return <p key={idx} className="text-sm leading-7 text-[#4e453b]">{resolveText(block.text, summary)}</p>;
          })}
        </div>
      </article>

      <div className="border-t border-[#dbcbb4] bg-[#fffaf2] p-5 sm:p-8">
        <div className="mx-auto max-w-[820px] rounded-3xl border border-[#d8cebf] bg-white p-5">
          <p className="font-semibold text-[#181612]">{isOwnerPreview ? "Acceptance control preview" : "Accept agreement"}</p>
          <p className="mt-2 text-sm leading-6 text-[#5b554b]">{isOwnerPreview ? "In the customer version, the accept button stays disabled until the guest checks the agreement box. This owner preview demonstrates that behavior without accepting anything." : "Check the acknowledgment below to enable the accept button. Your acceptance will be stored with the agreement version, timestamp, and booking record."}</p>
          <label className="mt-4 flex gap-3 text-sm leading-6 text-[#5b554b]">
            <input checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} type="checkbox" className="mt-1 h-4 w-4" />
            <span>I have reviewed and agree to the Villa La Percha Guest Rental Agreement.</span>
          </label>
          {isOwnerPreview || accepted ? (
            <button disabled={!checked || accepted} className="mt-5 rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:bg-[#b8b0a3]" type="button">
              {accepted ? "Agreement accepted" : "Accept agreement"}
            </button>
          ) : (
            <form action={`/api/guest-contracts/${contractId}/accept`} method="post" className="mt-5 space-y-4">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="signerName" value={signerName} />
              <input type="hidden" name="signerEmail" value={signerEmail} />
              <input type="hidden" name="acceptedTerms" value={checked ? "yes" : ""} />
              <button disabled={!checked} className="rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:bg-[#b8b0a3]" type="submit">
                Accept agreement
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
