import { describe, expect, it } from "vitest";
import { calculateSplit, type SplitInput, type SplitResult } from "./split-engine";

function expectValid(result: SplitResult) {
  expect(result.ok).toBe(true);

  if (!result.ok) {
    throw new Error("Expected valid split result.");
  }

  return result.shares;
}

function expectInvalid(result: SplitResult) {
  expect(result.ok).toBe(false);

  if (result.ok) {
    throw new Error("Expected invalid split result.");
  }

  return result.errors;
}

function expectShareTotal(input: SplitInput) {
  const shares = expectValid(calculateSplit(input));
  const total = shares.reduce((sum, share) => sum + share.resolvedAmountMinor, 0);

  expect(total).toBe(input.amountMinor);
}

describe("calculateSplit equal", () => {
  it("splits divisible amounts evenly", () => {
    expect(calculateSplit({
      amountMinor: 900,
      splitType: "equal",
      participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }],
    })).toEqual({
      ok: true,
      shares: [
        { userId: "a", resolvedAmountMinor: 300, exactAmountMinor: null, percentageBasisPoints: null },
        { userId: "b", resolvedAmountMinor: 300, exactAmountMinor: null, percentageBasisPoints: null },
        { userId: "c", resolvedAmountMinor: 300, exactAmountMinor: null, percentageBasisPoints: null },
      ],
    });
  });

  it("assigns indivisible remainder deterministically by participant order", () => {
    const input: SplitInput = {
      amountMinor: 100,
      splitType: "equal",
      participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }],
    };

    expect(calculateSplit(input)).toEqual(calculateSplit(input));
    expectValid(calculateSplit(input)).map((share) => share.resolvedAmountMinor);
    expect(calculateSplit(input)).toEqual({
      ok: true,
      shares: [
        { userId: "a", resolvedAmountMinor: 34, exactAmountMinor: null, percentageBasisPoints: null },
        { userId: "b", resolvedAmountMinor: 33, exactAmountMinor: null, percentageBasisPoints: null },
        { userId: "c", resolvedAmountMinor: 33, exactAmountMinor: null, percentageBasisPoints: null },
      ],
    });
  });

  it("supports a single participant", () => {
    expectShareTotal({
      amountMinor: 501,
      splitType: "equal",
      participants: [{ userId: "a" }],
    });
  });

  it("rejects no participants", () => {
    expect(expectInvalid(calculateSplit({
      amountMinor: 100,
      splitType: "equal",
      participants: [],
    }))).toContain("no_participants");
  });
});

describe("calculateSplit exact", () => {
  it("accepts exact amounts matching the total", () => {
    expectShareTotal({
      amountMinor: 1000,
      splitType: "exact",
      participants: [
        { userId: "a", exactAmountMinor: 200 },
        { userId: "b", exactAmountMinor: 300 },
        { userId: "c", exactAmountMinor: 500 },
      ],
    });
  });

  it("rejects totals that are too high", () => {
    expect(expectInvalid(calculateSplit({
      amountMinor: 1000,
      splitType: "exact",
      participants: [
        { userId: "a", exactAmountMinor: 600 },
        { userId: "b", exactAmountMinor: 500 },
      ],
    }))).toContain("exact_total_mismatch");
  });

  it("rejects totals that are too low", () => {
    expect(expectInvalid(calculateSplit({
      amountMinor: 1000,
      splitType: "exact",
      participants: [
        { userId: "a", exactAmountMinor: 400 },
        { userId: "b", exactAmountMinor: 500 },
      ],
    }))).toContain("exact_total_mismatch");
  });

  it("rejects negative exact amounts", () => {
    expect(expectInvalid(calculateSplit({
      amountMinor: 1000,
      splitType: "exact",
      participants: [
        { userId: "a", exactAmountMinor: -1 },
        { userId: "b", exactAmountMinor: 1001 },
      ],
    }))).toContain("invalid_exact_amount");
  });
});

describe("calculateSplit percentage", () => {
  it("supports 50/50", () => {
    expect(calculateSplit({
      amountMinor: 1000,
      splitType: "percentage",
      participants: [
        { userId: "a", percentageBasisPoints: 5000 },
        { userId: "b", percentageBasisPoints: 5000 },
      ],
    })).toEqual({
      ok: true,
      shares: [
        { userId: "a", resolvedAmountMinor: 500, exactAmountMinor: null, percentageBasisPoints: 5000 },
        { userId: "b", resolvedAmountMinor: 500, exactAmountMinor: null, percentageBasisPoints: 5000 },
      ],
    });
  });

  it("supports 50/30/20", () => {
    expectShareTotal({
      amountMinor: 1000,
      splitType: "percentage",
      participants: [
        { userId: "a", percentageBasisPoints: 5000 },
        { userId: "b", percentageBasisPoints: 3000 },
        { userId: "c", percentageBasisPoints: 2000 },
      ],
    });
  });

  it("rounds deterministically by largest fractional remainder then input order", () => {
    const input: SplitInput = {
      amountMinor: 101,
      splitType: "percentage",
      participants: [
        { userId: "a", percentageBasisPoints: 3333 },
        { userId: "b", percentageBasisPoints: 3333 },
        { userId: "c", percentageBasisPoints: 3334 },
      ],
    };

    expect(calculateSplit(input)).toEqual(calculateSplit(input));
    expect(calculateSplit(input)).toEqual({
      ok: true,
      shares: [
        { userId: "a", resolvedAmountMinor: 34, exactAmountMinor: null, percentageBasisPoints: 3333 },
        { userId: "b", resolvedAmountMinor: 33, exactAmountMinor: null, percentageBasisPoints: 3333 },
        { userId: "c", resolvedAmountMinor: 34, exactAmountMinor: null, percentageBasisPoints: 3334 },
      ],
    });
  });

  it("rejects percentage totals that are not 100%", () => {
    expect(expectInvalid(calculateSplit({
      amountMinor: 1000,
      splitType: "percentage",
      participants: [
        { userId: "a", percentageBasisPoints: 5000 },
        { userId: "b", percentageBasisPoints: 4000 },
      ],
    }))).toContain("percentage_total_mismatch");
  });

  it("rejects negative percentages", () => {
    expect(expectInvalid(calculateSplit({
      amountMinor: 1000,
      splitType: "percentage",
      participants: [
        { userId: "a", percentageBasisPoints: -1 },
        { userId: "b", percentageBasisPoints: 10001 },
      ],
    }))).toContain("invalid_percentage");
  });
});

describe("calculateSplit invariants", () => {
  it("rejects duplicate participants", () => {
    expect(expectInvalid(calculateSplit({
      amountMinor: 100,
      splitType: "equal",
      participants: [{ userId: "a" }, { userId: "a" }],
    }))).toContain("duplicate_participant");
  });

  it("all valid result totals equal the expense amount", () => {
    [
      {
        amountMinor: 100,
        splitType: "equal",
        participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }],
      },
      {
        amountMinor: 100,
        splitType: "exact",
        participants: [
          { userId: "a", exactAmountMinor: 1 },
          { userId: "b", exactAmountMinor: 99 },
        ],
      },
      {
        amountMinor: 100,
        splitType: "percentage",
        participants: [
          { userId: "a", percentageBasisPoints: 1 },
          { userId: "b", percentageBasisPoints: 9999 },
        ],
      },
    ].forEach((input) => expectShareTotal(input as SplitInput));
  });
});
