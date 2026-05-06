import { GuestContractExecutionStatus } from "@prisma/client";

export type ContractStatusLabel = "not_sent" | "sent" | "viewed" | "accepted" | "voided" | "superseded";

export interface ContractSummary {
  id: string;
  status: ContractStatusLabel;
  templateName?: string;
  templateVersion?: string;
  signerName?: string;
  signerEmail?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
}

export function fromDbContractStatus(status?: GuestContractExecutionStatus | null): ContractStatusLabel {
  switch (status) {
    case GuestContractExecutionStatus.ACCEPTED:
      return "accepted";
    case GuestContractExecutionStatus.VIEWED:
      return "viewed";
    case GuestContractExecutionStatus.SENT:
      return "sent";
    case GuestContractExecutionStatus.VOIDED:
      return "voided";
    case GuestContractExecutionStatus.SUPERSEDED:
      return "superseded";
    case GuestContractExecutionStatus.DRAFT:
    default:
      return "not_sent";
  }
}

export function summarizeContractExecution(record: {
  id: string;
  status: GuestContractExecutionStatus;
  signerName?: string | null;
  signerEmail?: string | null;
  sentAt?: Date | null;
  viewedAt?: Date | null;
  acceptedAt?: Date | null;
  template?: { name: string; version: string } | null;
}): ContractSummary {
  return {
    id: record.id,
    status: fromDbContractStatus(record.status),
    templateName: record.template?.name,
    templateVersion: record.template?.version,
    signerName: record.signerName ?? undefined,
    signerEmail: record.signerEmail ?? undefined,
    sentAt: record.sentAt?.toISOString(),
    viewedAt: record.viewedAt?.toISOString(),
    acceptedAt: record.acceptedAt?.toISOString(),
  };
}

export function pickPrimaryContract(contracts?: ContractSummary[]): ContractSummary | undefined {
  if (!contracts?.length) return undefined;
  return contracts.find((contract) => contract.status === "accepted")
    ?? contracts.find((contract) => contract.status === "viewed")
    ?? contracts.find((contract) => contract.status === "sent")
    ?? contracts[0];
}

export function contractStatusCopy(contract?: ContractSummary) {
  switch (contract?.status) {
    case "accepted":
      return { label: "Contract accepted", tone: "success" as const };
    case "viewed":
      return { label: "Contract viewed", tone: "warning" as const };
    case "sent":
      return { label: "Contract sent", tone: "warning" as const };
    case "voided":
      return { label: "Contract voided", tone: "danger" as const };
    case "superseded":
      return { label: "Contract superseded", tone: "neutral" as const };
    case "not_sent":
    default:
      return { label: "Contract pending", tone: "warning" as const };
  }
}
