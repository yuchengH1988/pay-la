import { describe, expect, it } from "vitest";
import {
  calculateBalances,
  simplifyDebts,
  type BalanceExpenseInput,
  type BalanceResult,
} from "./balance-engine";

function expense(
  id: string,
  amountMinor: number,
  paidBy: string,
  shares: Record<string, number>,
): BalanceExpenseInput {
  return {
    id,
    amountMinor,
    paidBy,
    participants: Object.fromEntries(
      Object.entries(shares).map(([userId, resolvedAmountMinor]) => [
        userId,
        { userId, resolvedAmountMinor },
      ]),
    ),
  };
}

function balanceMap(result: BalanceResult) {
  return Object.fromEntries(
    result.memberBalances.map((balance) => [
      balance.userId,
      balance.netAmountMinor,
    ]),
  );
}

function expectZeroSum(result: BalanceResult) {
  expect(
    result.memberBalances.reduce(
      (total, balance) => total + balance.netAmountMinor,
      0,
    ),
  ).toBe(0);
}

function expectSimplifiedDebtsPreserveBalances(result: BalanceResult) {
  const simplifiedBalanceByUser = new Map<string, number>();

  for (const debt of result.simplifiedDebts) {
    simplifiedBalanceByUser.set(
      debt.fromUserId,
      (simplifiedBalanceByUser.get(debt.fromUserId) ?? 0) - debt.amountMinor,
    );
    simplifiedBalanceByUser.set(
      debt.toUserId,
      (simplifiedBalanceByUser.get(debt.toUserId) ?? 0) + debt.amountMinor,
    );
  }

  for (const balance of result.memberBalances) {
    expect(simplifiedBalanceByUser.get(balance.userId) ?? 0).toBe(
      balance.netAmountMinor,
    );
  }
}

describe("calculateBalances", () => {
  it("calculates a single expense", () => {
    const result = calculateBalances({
      memberIds: ["a", "b", "c"],
      expenses: [expense("dinner", 900, "a", { a: 300, b: 300, c: 300 })],
    });

    expect(balanceMap(result)).toEqual({ a: 600, b: -300, c: -300 });
    expect(result.simplifiedDebts).toEqual([
      { fromUserId: "b", toUserId: "a", amountMinor: 300 },
      { fromUserId: "c", toUserId: "a", amountMinor: 300 },
    ]);
    expectZeroSum(result);
    expectSimplifiedDebtsPreserveBalances(result);
  });

  it("supports a payer who is also a participant", () => {
    const result = calculateBalances({
      memberIds: ["calvin", "harry"],
      expenses: [
        expense("meal", 600, "calvin", { calvin: 120, harry: 480 }),
      ],
    });

    expect(balanceMap(result)).toEqual({ calvin: 480, harry: -480 });
    expectZeroSum(result);
  });

  it("supports a payer who is not a participant", () => {
    const result = calculateBalances({
      memberIds: ["calvin", "harry"],
      expenses: [expense("tickets", 600, "calvin", { harry: 600 })],
    });

    expect(balanceMap(result)).toEqual({ calvin: 600, harry: -600 });
    expectZeroSum(result);
  });

  it("calculates multiple expenses with multiple payers", () => {
    const result = calculateBalances({
      memberIds: ["a", "b", "c"],
      expenses: [
        expense("e1", 900, "a", { a: 300, b: 300, c: 300 }),
        expense("e2", 600, "b", { a: 200, b: 200, c: 200 }),
      ],
    });

    expect(balanceMap(result)).toEqual({ a: 400, b: 100, c: -500 });
    expect(result.simplifiedDebts).toEqual([
      { fromUserId: "c", toUserId: "a", amountMinor: 400 },
      { fromUserId: "c", toUserId: "b", amountMinor: 100 },
    ]);
    expectZeroSum(result);
    expectSimplifiedDebtsPreserveBalances(result);
  });

  it("supports partial participation", () => {
    const result = calculateBalances({
      memberIds: ["a", "b", "c"],
      expenses: [expense("taxi", 450, "a", { b: 225, c: 225 })],
    });

    expect(balanceMap(result)).toEqual({ a: 450, b: -225, c: -225 });
    expectZeroSum(result);
  });

  it("supports uneven resolved shares", () => {
    const result = calculateBalances({
      memberIds: ["a", "b", "c"],
      expenses: [expense("snacks", 100, "b", { a: 34, b: 33, c: 33 })],
    });

    expect(balanceMap(result)).toEqual({ a: -34, b: 67, c: -33 });
    expectZeroSum(result);
  });

  it("represents positive, negative, and zero balances", () => {
    const result = calculateBalances({
      memberIds: ["a", "b", "c"],
      expenses: [expense("shared", 300, "a", { a: 100, b: 100, c: 100 })],
      settlements: [{ id: "s1", payerId: "b", receiverId: "a", amountMinor: 100 }],
    });

    expect(balanceMap(result)).toEqual({ a: 100, b: 0, c: -100 });
    expectZeroSum(result);
  });

  it("applies settlement input without changing expense history", () => {
    const result = calculateBalances({
      memberIds: ["a", "b"],
      expenses: [expense("hotel", 500, "a", { b: 500 })],
      settlements: [{ id: "s1", payerId: "b", receiverId: "a", amountMinor: 200 }],
    });

    expect(balanceMap(result)).toEqual({ a: 300, b: -300 });
    expect(result.simplifiedDebts).toEqual([
      { fromUserId: "b", toUserId: "a", amountMinor: 300 },
    ]);
    expectZeroSum(result);
  });

  it("handles a fully settled group", () => {
    const result = calculateBalances({
      memberIds: ["a", "b"],
      expenses: [expense("ride", 500, "a", { b: 500 })],
      settlements: [{ id: "s1", payerId: "b", receiverId: "a", amountMinor: 500 }],
      currentUserId: "a",
    });

    expect(balanceMap(result)).toEqual({ a: 0, b: 0 });
    expect(result.simplifiedDebts).toEqual([]);
    expect(result.currentUserSummary).toEqual({
      userId: "a",
      owesMinor: 0,
      isOwedMinor: 0,
      netAmountMinor: 0,
    });
    expectZeroSum(result);
  });

  it("calculates current user's owed and owing totals", () => {
    const result = calculateBalances({
      memberIds: ["a", "b", "c"],
      expenses: [
        expense("e1", 900, "a", { a: 300, b: 300, c: 300 }),
        expense("e2", 600, "c", { a: 300, b: 300 }),
      ],
      currentUserId: "b",
    });

    expect(result.currentUserSummary).toEqual({
      userId: "b",
      owesMinor: 600,
      isOwedMinor: 0,
      netAmountMinor: -600,
    });
    expectZeroSum(result);
  });

  it("simplifies debt relationships deterministically", () => {
    const debts = [
      { fromUserId: "a", toUserId: "b", amountMinor: 300 },
      { fromUserId: "b", toUserId: "c", amountMinor: 500 },
    ];

    expect(simplifyDebts(debts)).toEqual([
      { fromUserId: "a", toUserId: "c", amountMinor: 300 },
      { fromUserId: "b", toUserId: "c", amountMinor: 200 },
    ]);
  });

  it("keeps simplified total equal to original obligation total", () => {
    const result = calculateBalances({
      memberIds: ["a", "b", "c", "d"],
      expenses: [
        expense("e1", 1000, "a", { b: 333, c: 333, d: 334 }),
        expense("e2", 400, "c", { a: 100, b: 300 }),
      ],
    });

    const totalPositive = result.memberBalances
      .filter((balance) => balance.netAmountMinor > 0)
      .reduce((total, balance) => total + balance.netAmountMinor, 0);
    const simplifiedTotal = result.simplifiedDebts.reduce(
      (total, debt) => total + debt.amountMinor,
      0,
    );

    expect(simplifiedTotal).toBe(totalPositive);
    expectZeroSum(result);
    expectSimplifiedDebtsPreserveBalances(result);
  });

  it("returns deterministic output for the same financial history", () => {
    const input = {
      memberIds: ["c", "a", "b"],
      expenses: [
        expense("z", 600, "b", { a: 120, c: 480 }),
        expense("a", 900, "a", { a: 300, b: 300, c: 300 }),
      ],
      settlements: [{ id: "m", payerId: "c", receiverId: "a", amountMinor: 200 }],
      currentUserId: "a",
    };

    expect(calculateBalances(input)).toEqual(calculateBalances(input));
  });

  it("supports partial repayment", () => {
    const result = calculateBalances({
      memberIds: ["calvin", "harry"],
      expenses: [expense("dinner", 600, "calvin", { harry: 600 })],
      settlements: [
        { id: "settlement-1", payerId: "harry", receiverId: "calvin", amountMinor: 250 },
      ],
    });

    expect(balanceMap(result)).toEqual({ calvin: 350, harry: -350 });
    expect(result.simplifiedDebts).toEqual([
      { fromUserId: "harry", toUserId: "calvin", amountMinor: 350 },
    ]);
    expectZeroSum(result);
  });

  it("supports multiple settlements", () => {
    const result = calculateBalances({
      memberIds: ["calvin", "harry"],
      expenses: [expense("hotel", 1000, "calvin", { harry: 1000 })],
      settlements: [
        { id: "settlement-1", payerId: "harry", receiverId: "calvin", amountMinor: 300 },
        { id: "settlement-2", payerId: "harry", receiverId: "calvin", amountMinor: 200 },
      ],
    });

    expect(balanceMap(result)).toEqual({ calvin: 500, harry: -500 });
    expect(result.simplifiedDebts).toEqual([
      { fromUserId: "harry", toUserId: "calvin", amountMinor: 500 },
    ]);
    expectZeroSum(result);
  });
});
