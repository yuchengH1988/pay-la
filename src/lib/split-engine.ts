export type SplitType = "equal" | "exact" | "percentage";

export type SplitParticipantInput = {
  userId: string;
  exactAmountMinor?: number | null;
  percentageBasisPoints?: number | null;
};

export type SplitShare = {
  userId: string;
  resolvedAmountMinor: number;
  exactAmountMinor: number | null;
  percentageBasisPoints: number | null;
};

export type SplitErrorCode =
  | "invalid_amount"
  | "no_participants"
  | "duplicate_participant"
  | "invalid_exact_amount"
  | "exact_total_mismatch"
  | "invalid_percentage"
  | "percentage_total_mismatch";

export type SplitResult =
  | { ok: true; shares: SplitShare[] }
  | { ok: false; errors: SplitErrorCode[] };

export type SplitInput = {
  amountMinor: number;
  splitType: SplitType;
  participants: SplitParticipantInput[];
};

const fullPercentageBasisPoints = 10_000;

function hasValidAmount(amountMinor: number) {
  return Number.isSafeInteger(amountMinor) && amountMinor > 0;
}

function validateBase(input: SplitInput) {
  const errors: SplitErrorCode[] = [];
  const userIds = input.participants.map((participant) => participant.userId);
  const uniqueUserIds = new Set(userIds);

  if (!hasValidAmount(input.amountMinor)) {
    errors.push("invalid_amount");
  }

  if (input.participants.length === 0) {
    errors.push("no_participants");
  }

  if (uniqueUserIds.size !== userIds.length) {
    errors.push("duplicate_participant");
  }

  return errors;
}

function uniqueErrors(errors: SplitErrorCode[]) {
  return [...new Set(errors)];
}

function errorResult(errors: SplitErrorCode[]): SplitResult {
  return { ok: false, errors: uniqueErrors(errors) };
}

function splitEqual(input: SplitInput): SplitResult {
  const baseErrors = validateBase(input);

  if (baseErrors.length > 0) {
    return errorResult(baseErrors);
  }

  const baseShare = Math.floor(input.amountMinor / input.participants.length);
  const remainder = input.amountMinor % input.participants.length;
  const shares = input.participants.map((participant, index) => ({
    userId: participant.userId,
    resolvedAmountMinor: baseShare + (index < remainder ? 1 : 0),
    exactAmountMinor: null,
    percentageBasisPoints: null,
  }));

  return { ok: true, shares };
}

function splitExact(input: SplitInput): SplitResult {
  const errors = validateBase(input);
  const exactTotal = input.participants.reduce((total, participant) => {
    const exactAmountMinor = participant.exactAmountMinor;

    if (
      !Number.isSafeInteger(exactAmountMinor) ||
      exactAmountMinor === null ||
      exactAmountMinor === undefined ||
      exactAmountMinor < 0
    ) {
      errors.push("invalid_exact_amount");
      return total;
    }

    return total + exactAmountMinor;
  }, 0);

  if (exactTotal !== input.amountMinor) {
    errors.push("exact_total_mismatch");
  }

  if (errors.length > 0) {
    return errorResult(errors);
  }

  return {
    ok: true,
    shares: input.participants.map((participant) => ({
      userId: participant.userId,
      resolvedAmountMinor: participant.exactAmountMinor ?? 0,
      exactAmountMinor: participant.exactAmountMinor ?? 0,
      percentageBasisPoints: null,
    })),
  };
}

function splitPercentage(input: SplitInput): SplitResult {
  const errors = validateBase(input);
  const percentageTotal = input.participants.reduce((total, participant) => {
    const percentageBasisPoints = participant.percentageBasisPoints;

    if (
      !Number.isSafeInteger(percentageBasisPoints) ||
      percentageBasisPoints === null ||
      percentageBasisPoints === undefined ||
      percentageBasisPoints < 0 ||
      percentageBasisPoints > fullPercentageBasisPoints
    ) {
      errors.push("invalid_percentage");
      return total;
    }

    return total + percentageBasisPoints;
  }, 0);

  if (percentageTotal !== fullPercentageBasisPoints) {
    errors.push("percentage_total_mismatch");
  }

  if (errors.length > 0) {
    return errorResult(errors);
  }

  const rawShares = input.participants.map((participant, index) => {
    const percentageBasisPoints = participant.percentageBasisPoints ?? 0;
    const numerator = input.amountMinor * percentageBasisPoints;
    const resolvedAmountMinor = Math.floor(numerator / fullPercentageBasisPoints);
    const remainder = numerator % fullPercentageBasisPoints;

    return {
      index,
      userId: participant.userId,
      resolvedAmountMinor,
      exactAmountMinor: null,
      percentageBasisPoints,
      remainder,
    };
  });
  const currentTotal = rawShares.reduce(
    (total, share) => total + share.resolvedAmountMinor,
    0,
  );
  const remainingMinor = input.amountMinor - currentTotal;
  const remainderWinners = new Set(
    [...rawShares]
      .sort((shareA, shareB) => {
        if (shareB.remainder !== shareA.remainder) {
          return shareB.remainder - shareA.remainder;
        }

        return shareA.index - shareB.index;
      })
      .slice(0, remainingMinor)
      .map((share) => share.index),
  );
  const shares = rawShares.map((share) => ({
    userId: share.userId,
    resolvedAmountMinor:
      share.resolvedAmountMinor + (remainderWinners.has(share.index) ? 1 : 0),
    exactAmountMinor: share.exactAmountMinor,
    percentageBasisPoints: share.percentageBasisPoints,
  }));

  return { ok: true, shares };
}

export function calculateSplit(input: SplitInput): SplitResult {
  if (input.splitType === "equal") {
    return splitEqual(input);
  }

  if (input.splitType === "exact") {
    return splitExact(input);
  }

  return splitPercentage(input);
}
