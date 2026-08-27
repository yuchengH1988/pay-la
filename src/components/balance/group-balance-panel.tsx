"use client";

import { useMemo } from "react";
import { Badge, Frame } from "@/src/components/ui";
import { useI18n } from "@/src/i18n";
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

function getBalanceNote(amountMinor: number, t: ReturnType<typeof useI18n>["t"]) {
  if (amountMinor > 0) {
    return t("balance.isOwed");
  }

  if (amountMinor < 0) {
    return t("balance.owes");
  }

  return t("balance.settled");
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
  const { t } = useI18n();
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
  const owesMinor = balance.currentUserSummary?.owesMinor ?? 0;
  const isOwedMinor = balance.currentUserSummary?.isOwedMinor ?? 0;
  const balanceEmphasis = isSettled
    ? "settled"
    : owesMinor > isOwedMinor
      ? "owes"
      : isOwedMinor > owesMinor
        ? "owed"
        : "mixed";

  return (
    <Frame
      as="section"
      surface={isSettled ? "surface" : "raised"}
      className="p-4 sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3 md:mb-5">
        <div>
          <h2 className="type-h3">{t("balance.title")}</h2>
          <p className="type-small mt-2 hidden text-muted md:block">
            {isSettled
              ? t("balance.currentSettledDescription")
              : t("balance.currentUnsettledDescription")}
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
        emphasis={balanceEmphasis}
      />

      <div className="mt-4 hidden md:block">
        <div>
          {balance.memberBalances.map((memberBalance) => (
            <MemberBalance
              key={memberBalance.userId}
              name={formatMemberLabel(
                memberBalance.userId,
                currentUserId,
                memberProfiles,
              )}
              balance={formatSignedAmount(memberBalance.netAmountMinor, group.currency)}
              note={getBalanceNote(memberBalance.netAmountMinor, t)}
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

      {!isSettled && balance.simplifiedDebts.length > 0 ? (
        <div className="mt-5 hidden md:block">
          <h3 className="type-label">{t("balance.suggestions")}</h3>
          <div className="mt-3 grid gap-3">
            {balance.simplifiedDebts.map((debt) => (
              <SettlementSuggestion
                key={`${debt.fromUserId}-${debt.toUserId}-${debt.amountMinor}`}
                from={formatMemberLabel(debt.fromUserId, currentUserId, memberProfiles)}
                to={formatMemberLabel(debt.toUserId, currentUserId, memberProfiles)}
                amount={formatAmountFromMinor(debt.amountMinor, group.currency)}
                actionLabel={t("action.settle")}
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
