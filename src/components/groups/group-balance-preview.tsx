"use client";

import { useMemo } from "react";
import { calculateBalances } from "@/src/lib/balance-engine";
import { formatAmountFromMinor } from "@/src/services/expenses";
import { useExpenses } from "@/src/hooks/use-expenses";
import { useSettlements } from "@/src/hooks/use-settlements";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import type { Group } from "@/src/types/group";
import { formatMemberLabel } from "@/src/utils/member-label";

function getTotalLabel(netAmountMinor: number) {
  if (netAmountMinor > 0) {
    return "You are owed";
  }

  if (netAmountMinor < 0) {
    return "You owe";
  }

  return "Settled";
}

export function GroupBalancePreview({
  group,
  currentUserId,
}: {
  group: Group;
  currentUserId: string;
}) {
  const { expenses, loading: expensesLoading, error: expensesError } = useExpenses(group.id);
  const {
    settlements,
    loading: settlementsLoading,
    error: settlementsError,
  } = useSettlements(group.id);
  const { profiles } = useUserProfiles(group.memberIds);
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
  const currentNetAmount = balance.currentUserSummary?.netAmountMinor ?? 0;
  const currentUserDebts = balance.simplifiedDebts.filter(
    (debt) => debt.fromUserId === currentUserId || debt.toUserId === currentUserId,
  );

  if (expensesLoading || settlementsLoading) {
    return (
      <p className="type-small text-muted" aria-live="polite">
        Loading your balance...
      </p>
    );
  }

  if (expensesError || settlementsError) {
    return (
      <p className="type-small text-danger">
        Unable to load your balance.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <p className="type-small text-muted">
        {getTotalLabel(currentNetAmount)}{" "}
        <span className="font-mono font-black text-foreground">
          {formatAmountFromMinor(Math.abs(currentNetAmount), group.currency)}
        </span>
      </p>

      {currentUserDebts.length > 0 ? (
        <div className="grid gap-1">
          {currentUserDebts.map((debt) => {
            const isCurrentUserOwing = debt.fromUserId === currentUserId;
            const otherUserId = isCurrentUserOwing ? debt.toUserId : debt.fromUserId;
            const otherLabel = formatMemberLabel(otherUserId, currentUserId, profiles);

            return (
              <p
                key={`${debt.fromUserId}-${debt.toUserId}-${debt.amountMinor}`}
                className="type-caption text-muted"
              >
                {isCurrentUserOwing ? "You owe" : `${otherLabel} owes you`}{" "}
                {isCurrentUserOwing ? otherLabel : ""}{" "}
                <span className="text-foreground">
                  {formatAmountFromMinor(debt.amountMinor, group.currency)}
                </span>
              </p>
            );
          })}
        </div>
      ) : (
        <p className="type-caption text-muted">
          No open balances with members.
        </p>
      )}
    </div>
  );
}
