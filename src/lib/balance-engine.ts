export type BalanceParticipantShareInput = {
  userId: string;
  resolvedAmountMinor: number;
};

export type BalanceExpenseInput = {
  id: string;
  amountMinor: number;
  paidBy: string;
  participants: Record<string, BalanceParticipantShareInput>;
};

export type BalanceSettlementInput = {
  id: string;
  payerId: string;
  receiverId: string;
  amountMinor: number;
};

export type MemberNetBalance = {
  userId: string;
  netAmountMinor: number;
};

export type DebtRelationship = {
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
};

export type CurrentUserBalanceSummary = {
  userId: string;
  owesMinor: number;
  isOwedMinor: number;
  netAmountMinor: number;
};

export type BalanceResult = {
  memberBalances: MemberNetBalance[];
  debts: DebtRelationship[];
  simplifiedDebts: DebtRelationship[];
  currentUserSummary: CurrentUserBalanceSummary | null;
};

export type CalculateBalancesInput = {
  memberIds: string[];
  expenses: BalanceExpenseInput[];
  settlements?: BalanceSettlementInput[];
  currentUserId?: string;
};

function addNetBalance(
  balances: Map<string, number>,
  userId: string,
  amountMinor: number,
) {
  balances.set(userId, (balances.get(userId) ?? 0) + amountMinor);
}

function compareUserId(first: string, second: string) {
  return first.localeCompare(second);
}

function toSortedMemberBalances(balances: Map<string, number>) {
  return [...balances.entries()]
    .map<MemberNetBalance>(([userId, netAmountMinor]) => ({
      userId,
      netAmountMinor,
    }))
    .sort((first, second) => compareUserId(first.userId, second.userId));
}

function buildDebtsFromNetBalances(memberBalances: MemberNetBalance[]) {
  const creditors = memberBalances
    .filter((balance) => balance.netAmountMinor > 0)
    .map((balance) => ({ userId: balance.userId, remainingMinor: balance.netAmountMinor }))
    .sort((first, second) => compareUserId(first.userId, second.userId));

  const debtors = memberBalances
    .filter((balance) => balance.netAmountMinor < 0)
    .map((balance) => ({
      userId: balance.userId,
      remainingMinor: Math.abs(balance.netAmountMinor),
    }))
    .sort((first, second) => compareUserId(first.userId, second.userId));

  const debts: DebtRelationship[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountMinor = Math.min(debtor.remainingMinor, creditor.remainingMinor);

    if (amountMinor > 0) {
      debts.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amountMinor,
      });
    }

    debtor.remainingMinor -= amountMinor;
    creditor.remainingMinor -= amountMinor;

    if (debtor.remainingMinor === 0) {
      debtorIndex += 1;
    }

    if (creditor.remainingMinor === 0) {
      creditorIndex += 1;
    }
  }

  return debts;
}

export function simplifyDebts(debts: DebtRelationship[]) {
  const balances = new Map<string, number>();

  for (const debt of debts) {
    addNetBalance(balances, debt.fromUserId, -debt.amountMinor);
    addNetBalance(balances, debt.toUserId, debt.amountMinor);
  }

  return buildDebtsFromNetBalances(toSortedMemberBalances(balances));
}

export function calculateBalances({
  memberIds,
  expenses,
  settlements = [],
  currentUserId,
}: CalculateBalancesInput): BalanceResult {
  const balances = new Map<string, number>();

  for (const memberId of [...memberIds].sort(compareUserId)) {
    balances.set(memberId, 0);
  }

  for (const expense of [...expenses].sort((first, second) =>
    first.id.localeCompare(second.id),
  )) {
    addNetBalance(balances, expense.paidBy, expense.amountMinor);

    for (const share of Object.values(expense.participants).sort((first, second) =>
      compareUserId(first.userId, second.userId),
    )) {
      addNetBalance(balances, share.userId, -share.resolvedAmountMinor);
    }
  }

  for (const settlement of [...settlements].sort((first, second) =>
    first.id.localeCompare(second.id),
  )) {
    addNetBalance(balances, settlement.payerId, settlement.amountMinor);
    addNetBalance(balances, settlement.receiverId, -settlement.amountMinor);
  }

  const memberBalances = toSortedMemberBalances(balances);
  const debts = buildDebtsFromNetBalances(memberBalances);
  const simplifiedDebts = simplifyDebts(debts);
  const currentUserSummary = currentUserId
    ? {
        userId: currentUserId,
        owesMinor: simplifiedDebts
          .filter((debt) => debt.fromUserId === currentUserId)
          .reduce((total, debt) => total + debt.amountMinor, 0),
        isOwedMinor: simplifiedDebts
          .filter((debt) => debt.toUserId === currentUserId)
          .reduce((total, debt) => total + debt.amountMinor, 0),
        netAmountMinor: balances.get(currentUserId) ?? 0,
      }
    : null;

  return {
    memberBalances,
    debts,
    simplifiedDebts,
    currentUserSummary,
  };
}
