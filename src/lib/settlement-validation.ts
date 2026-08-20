export type SettlementValidationErrorCode =
  | "invalid_payer"
  | "invalid_receiver"
  | "same_member"
  | "invalid_amount";

export type SettlementValidationResult =
  | { ok: true }
  | { ok: false; errors: SettlementValidationErrorCode[] };

export function validateSettlementInput({
  memberIds,
  payerId,
  receiverId,
  amountMinor,
}: {
  memberIds: string[];
  payerId: string;
  receiverId: string;
  amountMinor: number | null;
}): SettlementValidationResult {
  const errors: SettlementValidationErrorCode[] = [];

  if (!memberIds.includes(payerId)) {
    errors.push("invalid_payer");
  }

  if (!memberIds.includes(receiverId)) {
    errors.push("invalid_receiver");
  }

  if (payerId && receiverId && payerId === receiverId) {
    errors.push("same_member");
  }

  if (amountMinor === null || amountMinor <= 0) {
    errors.push("invalid_amount");
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true };
}
