"use client";

import { useState, type FormEvent } from "react";
import { expenseCategories } from "@/src/constants/expense-categories";
import { Button, FieldLabel, SelectField, TextInput } from "@/src/components/ui";
import { useI18n, type TranslationKey } from "@/src/i18n";
import { calculateSplit, type SplitErrorCode } from "@/src/lib/split-engine";
import {
  formatDateForInput,
  parseAmountToMinor,
  parseNonNegativeAmountToMinor,
  parsePercentageToBasisPoints,
} from "@/src/services/expenses";
import type { Expense, ExpenseFormValues, SplitType } from "@/src/types/expense";
import type { Group } from "@/src/types/group";
import type { UserProfileMap } from "@/src/types/user-profile";
import { formatMemberLabel } from "@/src/utils/member-label";

type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;
type ExpenseFormTab = "basic" | "split" | "details";

type SplitSummary =
  | { type: "equal"; shares: Array<{ userId: string; resolvedAmountMinor: number }> }
  | { type: "exact"; assignedMinor: number; remainingMinor: number | null }
  | { type: "percentage"; assignedBasisPoints: number; remainingBasisPoints: number };

const splitTypes: SplitType[] = ["equal", "exact", "percentage"];

const formTabs: ExpenseFormTab[] = ["basic", "split", "details"];

const splitErrorMessageKeys: Record<SplitErrorCode, TranslationKey> = {
  invalid_amount: "validation.amountPositive",
  no_participants: "validation.participantsRequired",
  duplicate_participant: "validation.duplicateParticipant",
  invalid_exact_amount: "validation.exactAmountInvalid",
  exact_total_mismatch: "validation.exactTotalMismatch",
  invalid_percentage: "validation.percentageInvalid",
  percentage_total_mismatch: "validation.percentageTotalMismatch",
};

function formatMinorAmount(
  amountMinor: number,
  formatNumber: ReturnType<typeof useI18n>["formatNumber"],
) {
  return formatNumber(amountMinor / 100, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatBasisPoints(
  basisPoints: number,
  formatNumber: ReturnType<typeof useI18n>["formatNumber"],
) {
  return `${formatNumber(basisPoints / 100, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

function expenseToFormValues(expense: Expense): ExpenseFormValues {
  return {
    name: expense.name,
    amount: (expense.amountMinor / 100).toFixed(2),
    category: expense.category,
    paidBy: expense.paidBy,
    participantIds: Object.keys(expense.participants),
    splitType: expense.splitType,
    exactAmounts: Object.fromEntries(
      Object.entries(expense.participants).map(([userId, share]) => [
        userId,
        share.exactAmountMinor === null
          ? ""
          : (share.exactAmountMinor / 100).toFixed(2),
      ]),
    ),
    percentages: Object.fromEntries(
      Object.entries(expense.participants).map(([userId, share]) => [
        userId,
        share.percentageBasisPoints === null
          ? ""
          : (share.percentageBasisPoints / 100).toFixed(2),
      ]),
    ),
    date: formatDateForInput(expense.date.toDate()),
    note: expense.note,
  };
}

function validateExpenseForm(
  values: ExpenseFormValues,
  group: Group,
  t: (key: TranslationKey) => string,
) {
  const errors: ExpenseFormErrors = {};

  if (!values.name.trim()) {
    errors.name = t("validation.expenseNameRequired");
  } else if (values.name.trim().length > 100) {
    errors.name = t("validation.expenseNameLength");
  }

  if (!parseAmountToMinor(values.amount)) {
    errors.amount = t("validation.amountPositive");
  }

  if (!expenseCategories.includes(values.category)) {
    errors.category = t("validation.categoryRequired");
  }

  if (!group.memberIds.includes(values.paidBy)) {
    errors.paidBy = t("validation.payerMember");
  }

  if (values.participantIds.length < 1) {
    errors.participantIds = t("validation.participantsRequired");
  } else if (
    values.participantIds.some((participantId) => !group.memberIds.includes(participantId))
  ) {
    errors.participantIds = t("validation.participantsMembers");
  }

  if (!values.date) {
    errors.date = t("validation.dateRequired");
  }

  if (values.note.length > 500) {
    errors.note = t("validation.noteLength");
  }

  const amountMinor = parseAmountToMinor(values.amount);

  if (amountMinor) {
    const splitResult = calculateSplit({
      amountMinor,
      splitType: values.splitType,
      participants: values.participantIds.map((userId) => {
        if (values.splitType === "exact") {
          return {
            userId,
            exactAmountMinor: parseNonNegativeAmountToMinor(
              values.exactAmounts[userId] ?? "",
            ),
          };
        }

        if (values.splitType === "percentage") {
          return {
            userId,
            percentageBasisPoints: parsePercentageToBasisPoints(
              values.percentages[userId] ?? "",
            ),
          };
        }

        return { userId };
      }),
    });

    if (!splitResult.ok) {
      const splitMessage = splitResult.errors.map((errorCode) =>
        t(splitErrorMessageKeys[errorCode]),
      )[0];

      if (
        splitResult.errors.includes("invalid_exact_amount") ||
        splitResult.errors.includes("exact_total_mismatch") ||
        splitResult.errors.includes("invalid_percentage") ||
        splitResult.errors.includes("percentage_total_mismatch")
      ) {
        errors.splitType = splitMessage;
      }
    }
  }

  return errors;
}

function getSplitSummary(values: ExpenseFormValues): SplitSummary {
  const amountMinor = parseAmountToMinor(values.amount);

  if (values.splitType === "equal") {
    if (!amountMinor || values.participantIds.length === 0) {
      return { type: "equal", shares: [] };
    }

    const splitResult = calculateSplit({
      amountMinor,
      splitType: "equal",
      participants: values.participantIds.map((userId) => ({ userId })),
    });

    return {
      type: "equal",
      shares: splitResult.ok
        ? splitResult.shares.map((share) => ({
            userId: share.userId,
            resolvedAmountMinor: share.resolvedAmountMinor,
          }))
        : [],
    };
  }

  if (values.splitType === "exact") {
    const assignedMinor = values.participantIds.reduce((total, userId) => {
      const exactAmountMinor = parseNonNegativeAmountToMinor(
        values.exactAmounts[userId] ?? "",
      );

      return total + (exactAmountMinor ?? 0);
    }, 0);

    return {
      type: "exact",
      assignedMinor,
      remainingMinor: amountMinor === null ? null : amountMinor - assignedMinor,
    };
  }

  const assignedBasisPoints = values.participantIds.reduce((total, userId) => {
    const percentageBasisPoints = parsePercentageToBasisPoints(
      values.percentages[userId] ?? "",
    );

    return total + (percentageBasisPoints ?? 0);
  }, 0);

  return {
    type: "percentage",
    assignedBasisPoints,
    remainingBasisPoints: 10_000 - assignedBasisPoints,
  };
}

function getErrorTab(errors: ExpenseFormErrors): ExpenseFormTab | null {
  if (errors.name || errors.amount) {
    return "basic";
  }

  if (errors.paidBy) {
    return "basic";
  }

  if (errors.participantIds || errors.splitType) {
    return "split";
  }

  if (errors.category || errors.date || errors.note) {
    return "details";
  }

  return null;
}

export function ExpenseForm({
  group,
  currentUserId,
  memberProfiles,
  initialExpense,
  submitLabel,
  loading = false,
  onSubmit,
  onCancel,
}: {
  group: Group;
  currentUserId: string;
  memberProfiles: UserProfileMap;
  initialExpense?: Expense;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const { t, categoryLabel, splitTypeLabel, formatNumber } = useI18n();
  const [values, setValues] = useState<ExpenseFormValues>(
    initialExpense
      ? expenseToFormValues(initialExpense)
      : {
          name: "",
          amount: "",
          category: "food",
          paidBy: currentUserId,
          participantIds: group.memberIds,
          splitType: "equal",
          exactAmounts: {},
          percentages: {},
          date: formatDateForInput(),
          note: "",
        },
  );
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [activeTab, setActiveTab] = useState<ExpenseFormTab>("basic");
  const splitSummary = getSplitSummary(values);

  function clearSplitError() {
    setErrors((current) => {
      if (!current.splitType) {
        return current;
      }

      const remainingErrors = { ...current };

      delete remainingErrors.splitType;
      return remainingErrors;
    });
  }

  function toggleParticipant(memberId: string) {
    clearSplitError();
    setValues((current) => {
      const isSelected = current.participantIds.includes(memberId);
      const participantIds = isSelected
        ? current.participantIds.filter((participantId) => participantId !== memberId)
        : [...current.participantIds, memberId];

      return { ...current, participantIds };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValues = {
      ...values,
      name: values.name.trim(),
      note: values.note.trim(),
    };
    const nextErrors = validateExpenseForm(nextValues, group, t);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const errorTab = getErrorTab(nextErrors);

      if (errorTab) {
        setActiveTab(errorTab);
      }

      return;
    }

    await onSubmit(nextValues);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="max-w-full overflow-x-auto pb-2">
        <div className="flex w-max gap-2 p-1">
          {formTabs.map((tab) => (
            <Button
              key={tab}
              type="button"
              size="sm"
              variant={activeTab === tab ? "primary" : "ghost"}
              onClick={() => setActiveTab(tab)}
            >
              {t(`expense.tab${tab[0].toUpperCase()}${tab.slice(1)}` as TranslationKey)}
            </Button>
          ))}
        </div>
      </div>

      {activeTab === "basic" ? (
        <div className="grid gap-4">
          <TextInput
            label={t("expense.name")}
            value={values.name}
            error={errors.name}
            maxLength={100}
            placeholder={t("expense.placeholderName")}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
          />
          <TextInput
            label={t("expense.amount")}
            value={values.amount}
            error={errors.amount}
            inputMode="decimal"
            placeholder={t("expense.placeholderAmount")}
            onChange={(event) => {
              clearSplitError();
              setValues((current) => ({ ...current, amount: event.target.value }));
            }}
          />
          <div className="border-[3px] border-border bg-muted-surface p-3 shadow-hard-sm">
            <SelectField
              label={t("expense.paidBy")}
              value={values.paidBy}
              onChange={(event) =>
                setValues((current) => ({ ...current, paidBy: event.target.value }))
              }
            >
              {group.memberIds.map((memberId) => (
                <option key={memberId} value={memberId}>
                  {formatMemberLabel(memberId, currentUserId, memberProfiles)}
                </option>
              ))}
            </SelectField>
            {errors.paidBy ? (
              <p className="type-small mt-2 text-danger">{errors.paidBy}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeTab === "split" ? (
        <div className="grid gap-4">
          <SelectField
            label={t("expense.splitMethod")}
            value={values.splitType}
            onChange={(event) => {
              clearSplitError();
              setValues((current) => ({
                ...current,
                splitType: event.target.value as SplitType,
              }));
            }}
          >
            {splitTypes.map((splitType) => (
              <option key={splitType} value={splitType}>
                {splitTypeLabel(splitType)}
              </option>
            ))}
          </SelectField>
          {errors.splitType ? (
            <p className="type-small text-danger">{errors.splitType}</p>
          ) : null}

          <div className="grid gap-2">
            <FieldLabel>{t("expense.participants")}</FieldLabel>
            <div className="grid gap-2">
              {group.memberIds.map((memberId) => (
                <label
                  key={memberId}
                  className="flex min-h-11 items-center gap-3 rounded-xs border-[3px] border-border bg-surface-raised px-3 font-bold shadow-hard-sm"
                >
                  <input
                    type="checkbox"
                    checked={values.participantIds.includes(memberId)}
                    onChange={() => toggleParticipant(memberId)}
                    className="size-5 accent-[var(--primary)]"
                  />
                  <span>{formatMemberLabel(memberId, currentUserId, memberProfiles)}</span>
                </label>
              ))}
            </div>
            {errors.participantIds ? (
              <p className="type-small text-danger">{errors.participantIds}</p>
            ) : null}
          </div>

          {values.splitType === "exact" ? (
            <div className="grid gap-2">
              <FieldLabel>{t("expense.exactAmounts")}</FieldLabel>
              <div className="grid gap-2">
                {values.participantIds.map((memberId) => (
                  <label
                    key={memberId}
                    className="grid min-h-12 grid-cols-[minmax(0,1fr)_minmax(6rem,8rem)] items-center gap-3 rounded-xs border-[3px] border-border bg-surface-raised px-3 py-2 shadow-hard-sm"
                  >
                    <span className="type-small min-w-0 truncate">
                      {formatMemberLabel(memberId, currentUserId, memberProfiles)}
                    </span>
                    <input
                      value={values.exactAmounts[memberId] ?? ""}
                      inputMode="decimal"
                      placeholder={t("expense.placeholderExact")}
                      className="min-h-9 w-full rounded-xs border-[3px] border-border bg-background px-2 text-right font-mono text-sm text-foreground outline-none placeholder:text-muted focus:ring-[3px] focus:ring-info"
                      onChange={(event) => {
                        clearSplitError();
                        setValues((current) => ({
                          ...current,
                          exactAmounts: {
                            ...current.exactAmounts,
                            [memberId]: event.target.value,
                          },
                        }));
                      }}
                    />
                  </label>
                ))}
              </div>
              {splitSummary.type === "exact" ? (
                <div className="grid gap-2 border-[3px] border-border bg-muted-surface p-3 shadow-hard-sm">
                  <p className="type-small">
                    {t("expense.assigned")}: {group.currency}{" "}
                    {formatMinorAmount(splitSummary.assignedMinor, formatNumber)}
                  </p>
                  <p className="type-small">
                    {t("expense.remaining")}:{" "}
                    {splitSummary.remainingMinor === null
                      ? "-"
                      : `${group.currency} ${formatMinorAmount(
                          splitSummary.remainingMinor,
                          formatNumber,
                        )}`}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {values.splitType === "percentage" ? (
            <div className="grid gap-2">
              <FieldLabel>{t("expense.percentages")}</FieldLabel>
              <div className="grid gap-2">
                {values.participantIds.map((memberId) => (
                  <label
                    key={memberId}
                    className="grid min-h-12 grid-cols-[minmax(0,1fr)_minmax(5.5rem,7rem)] items-center gap-3 rounded-xs border-[3px] border-border bg-surface-raised px-3 py-2 shadow-hard-sm"
                  >
                    <span className="type-small min-w-0 truncate">
                      {formatMemberLabel(memberId, currentUserId, memberProfiles)}
                    </span>
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <input
                        value={values.percentages[memberId] ?? ""}
                        inputMode="decimal"
                        placeholder={t("expense.placeholderPercentage")}
                        className="min-h-9 w-full rounded-xs border-[3px] border-border bg-background px-2 text-right font-mono text-sm text-foreground outline-none placeholder:text-muted focus:ring-[3px] focus:ring-info"
                        onChange={(event) => {
                          clearSplitError();
                          setValues((current) => ({
                            ...current,
                            percentages: {
                              ...current.percentages,
                              [memberId]: event.target.value,
                            },
                          }));
                        }}
                      />
                      <span className="type-small">%</span>
                    </div>
                  </label>
                ))}
              </div>
              {splitSummary.type === "percentage" ? (
                <div className="grid gap-2 border-[3px] border-border bg-muted-surface p-3 shadow-hard-sm">
                  <p className="type-small">
                    {t("expense.assigned")}:{" "}
                    {formatBasisPoints(splitSummary.assignedBasisPoints, formatNumber)}
                  </p>
                  <p className="type-small">
                    {t("expense.remaining")}:{" "}
                    {formatBasisPoints(splitSummary.remainingBasisPoints, formatNumber)}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {splitSummary.type === "equal" && splitSummary.shares.length > 0 ? (
            <div className="grid gap-2 border-[3px] border-border bg-muted-surface p-3 shadow-hard-sm">
              <FieldLabel>{t("expense.equalShares")}</FieldLabel>
              {splitSummary.shares.map((share) => (
                <p key={share.userId} className="type-small flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {formatMemberLabel(share.userId, currentUserId, memberProfiles)}
                  </span>
                  <span>
                    {group.currency}{" "}
                    {formatMinorAmount(share.resolvedAmountMinor, formatNumber)}
                  </span>
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "details" ? (
        <div className="grid gap-4">
          <SelectField
            label={t("expense.category")}
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value as ExpenseFormValues["category"],
              }))
            }
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </SelectField>
          {errors.category ? <p className="type-small text-danger">{errors.category}</p> : null}

          <TextInput
            label={t("expense.date")}
            type="date"
            value={values.date}
            error={errors.date}
            onChange={(event) =>
              setValues((current) => ({ ...current, date: event.target.value }))
            }
          />

          <label className="grid gap-2">
            <FieldLabel>{t("expense.note")}</FieldLabel>
            <textarea
              value={values.note}
              maxLength={500}
              rows={3}
              className="rounded-xs border-[3px] border-border bg-surface-raised px-3 py-2 font-mono text-sm text-foreground shadow-hard-sm outline-none placeholder:text-muted focus:shadow-hard focus:ring-[3px] focus:ring-info"
              placeholder={t("expense.optional")}
              onChange={(event) =>
                setValues((current) => ({ ...current, note: event.target.value }))
              }
            />
            {errors.note ? <p className="type-small text-danger">{errors.note}</p> : null}
          </label>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("action.cancel")}
          </Button>
        ) : null}
        <Button type="submit" loading={loading} className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
