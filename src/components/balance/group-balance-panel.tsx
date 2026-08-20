"use client";

import { useMemo } from "react";
import { Badge, Frame } from "@/src/components/ui";
import { calculateBalances } from "@/src/lib/balance-engine";
import { formatAmountFromMinor } from "@/src/services/expenses";
import type { Expense } from "@/src/types/expense";
import type { Group } from "@/src/types/group";
import type { Settlement, SettlementFormValues } from "@/src/types/settlement";
import type { UserProfileMap } from "@/src/types/user-profile";
import { formatMemberLabel } from "@/src/utils/member-label";
import { BalanceSummary } from "./balance-summary";
import { MemberBalance } from "./member-balance";
import { SettlementSuggestion } from "./settlement-suggestion";

function formatSignedAmount(amountMinor: number, currency: string) {
  if (amountMinor === 0) {
    return formatAmountFromMinor(0, currency);
  }

  const prefix = amountMinor > 0 ? "+" : "-";

  return `${prefix}${formatAmountFromMinor(Math.abs(amountMinor), currency)}`;
}

function getBalanceNote(amountMinor: number) {
  if (amountMinor > 0) {
    return "is owed";
  }

  if (amountMinor < 0) {
    return "owes";
  }

  return "settled";
}

export function GroupBalancePanel({
  group,
  currentUserId,
  memberProfiles,
  expenses,
  settlements,
  onSettleUp,
}: {
  group: Group;
  currentUserId: string;
  memberProfiles: UserProfileMap;
  expenses: Expense[];
  settlements: Settlement[];
  onSettleUp: (values: SettlementFormValues) => void;
}) {
  const balance = useMemo(
    () =>
      calculateBalances({
        memberIds: group.memberIds,
        expenses,
        settlements,
        currentUserId,
      }),
    [currentUserId, expenses, group.memberIds, settlements],
  );
  const isSettled =
    (balance.currentUserSummary?.owesMinor ?? 0) === 0 &&
    (balance.currentUserSummary?.isOwedMinor ?? 0) === 0;

  return (
    <Frame as="section" className="p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-h3">Balance</h2>
          <p className="type-small mt-2 text-muted">
            Calculated from expense shares and recorded settlements.
          </p>
        </div>
        <Badge tone="muted">{group.currency}</Badge>
      </div>

      <BalanceSummary
        owesAmount={formatAmountFromMinor(
          balance.currentUserSummary?.owesMinor ?? 0,
          group.currency,
        )}
        isOwedAmount={formatAmountFromMinor(
          balance.currentUserSummary?.isOwedMinor ?? 0,
          group.currency,
        )}
        settled={isSettled}
      />

      <div className="mt-5">
        <h3 className="type-label">Member balance</h3>
        <div className="mt-2">
          {balance.memberBalances.map((memberBalance) => (
            <MemberBalance
              key={memberBalance.userId}
              name={formatMemberLabel(
                memberBalance.userId,
                currentUserId,
                memberProfiles,
              )}
              balance={formatSignedAmount(memberBalance.netAmountMinor, group.currency)}
              note={getBalanceNote(memberBalance.netAmountMinor)}
              tone={
                memberBalance.netAmountMinor > 0
                  ? "positive"
                  : memberBalance.netAmountMinor < 0
                    ? "negative"
                    : "neutral"
              }
            />
          ))}
        </div>
      </div>

      {balance.simplifiedDebts.length > 0 ? (
        <div className="mt-5">
          <h3 className="type-label">Settlement suggestions</h3>
          <div className="mt-3 grid gap-3">
            {balance.simplifiedDebts.map((debt) => (
              <SettlementSuggestion
                key={`${debt.fromUserId}-${debt.toUserId}-${debt.amountMinor}`}
                from={formatMemberLabel(debt.fromUserId, currentUserId, memberProfiles)}
                to={formatMemberLabel(debt.toUserId, currentUserId, memberProfiles)}
                amount={formatAmountFromMinor(debt.amountMinor, group.currency)}
                actionLabel="Settle"
                onAction={() =>
                  onSettleUp({
                    payerId: debt.fromUserId,
                    receiverId: debt.toUserId,
                    amount: (debt.amountMinor / 100).toFixed(2),
                    date: new Date().toISOString().slice(0, 10),
                    note: "",
                  })
                }
              />
            ))}
          </div>
        </div>
      ) : null}
    </Frame>
  );
}
