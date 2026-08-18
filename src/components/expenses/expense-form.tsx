"use client";

import { useState, type FormEvent } from "react";
import {
  expenseCategories,
  expenseCategoryLabels,
} from "@/src/constants/expense-categories";
import { Button, FieldLabel, SelectField, TextInput } from "@/src/components/ui";
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

const splitTypes: Array<{ value: SplitType; label: string }> = [
  { value: "equal", label: "Equal" },
  { value: "exact", label: "Exact amount" },
  { value: "percentage", label: "Percentage" },
];

type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

type SplitSummary =
  | {
      type: "equal";
      shares: Array<{ userId: string; resolvedAmountMinor: number }>;
    }
  | {
      type: "exact";
      assignedMinor: number;
      remainingMinor: number | null;
    }
  | {
      type: "percentage";
      assignedBasisPoints: number;
      remainingBasisPoints: number;
    };

const splitErrorMessages: Record<SplitErrorCode, string> = {
  invalid_amount: "Amount must be greater than 0 with up to 2 decimals.",
  no_participants: "Choose at least one participant.",
  duplicate_participant: "Each participant can only appear once.",
  invalid_exact_amount: "Exact amounts must be zero or greater.",
  exact_total_mismatch: "Exact amounts must add up to the expense amount.",
  invalid_percentage: "Percentages must be between 0 and 100.",
  percentage_total_mismatch: "Percentages must add up to 100%.",
};

function formatMinorAmount(amountMinor: number) {
  return (amountMinor / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatBasisPoints(basisPoints: number) {
  return `${(basisPoints / 100).toLocaleString(undefined, {
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

function validateExpenseForm(values: ExpenseFormValues, group: Group) {
  const errors: ExpenseFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Expense name is required.";
  } else if (values.name.trim().length > 100) {
    errors.name = "Keep the expense name under 100 characters.";
  }

  if (!parseAmountToMinor(values.amount)) {
    errors.amount = "Amount must be greater than 0 with up to 2 decimals.";
  }

  if (!expenseCategories.includes(values.category)) {
    errors.category = "Choose a category.";
  }

  if (!group.memberIds.includes(values.paidBy)) {
    errors.paidBy = "Payer must be a group member.";
  }

  if (values.participantIds.length < 1) {
    errors.participantIds = "Choose at least one participant.";
  } else if (
    values.participantIds.some((participantId) => !group.memberIds.includes(participantId))
  ) {
    errors.participantIds = "Participants must be group members.";
  }

  if (!values.date) {
    errors.date = "Date is required.";
  }

  if (values.note.length > 500) {
    errors.note = "Keep the note under 500 characters.";
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
      const splitMessage = splitResult.errors.map(
        (errorCode) => splitErrorMessages[errorCode],
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
  const [values, setValues] = useState<ExpenseFormValues>(
    initialExpense
      ? expenseToFormValues(initialExpense)
      : {
          name: "",
          amount: "",
          category: "food",
          paidBy: currentUserId,
          participantIds: [currentUserId],
          splitType: "equal",
          exactAmounts: {},
          percentages: {},
          date: formatDateForInput(),
          note: "",
        },
  );
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
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
    const nextErrors = validateExpenseForm(nextValues, group);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(nextValues);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <TextInput
        label="Expense name"
        value={values.name}
        error={errors.name}
        maxLength={100}
        placeholder="Dinner"
        onChange={(event) =>
          setValues((current) => ({ ...current, name: event.target.value }))
        }
      />
      <TextInput
        label="Amount"
        value={values.amount}
        error={errors.amount}
        inputMode="decimal"
        placeholder="1200.00"
        onChange={(event) => {
          clearSplitError();
          setValues((current) => ({ ...current, amount: event.target.value }));
        }}
      />
      <SelectField
        label="Category"
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
            {expenseCategoryLabels[category]}
          </option>
        ))}
      </SelectField>
      {errors.category ? <p className="type-small text-danger">{errors.category}</p> : null}

      <SelectField
        label="Paid by"
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
      {errors.paidBy ? <p className="type-small text-danger">{errors.paidBy}</p> : null}

      <div className="grid gap-2">
        <FieldLabel>Participants</FieldLabel>
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

      <SelectField
        label="Split method"
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
          <option key={splitType.value} value={splitType.value}>
            {splitType.label}
          </option>
        ))}
      </SelectField>
      {errors.splitType ? (
        <p className="type-small text-danger">{errors.splitType}</p>
      ) : null}

      {values.splitType === "exact" ? (
        <div className="grid gap-2">
          <FieldLabel>Exact amounts</FieldLabel>
          <div className="grid gap-2">
            {values.participantIds.map((memberId) => (
              <label
                key={memberId}
                className="grid min-h-12 grid-cols-[minmax(0,1fr)_8rem] items-center gap-3 rounded-xs border-[3px] border-border bg-surface-raised px-3 py-2 shadow-hard-sm"
              >
                <span className="type-small min-w-0 truncate">
                  {formatMemberLabel(memberId, currentUserId, memberProfiles)}
                </span>
                <input
                  value={values.exactAmounts[memberId] ?? ""}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="min-h-9 rounded-xs border-[3px] border-border bg-background px-2 text-right font-mono text-sm text-foreground outline-none placeholder:text-muted focus:ring-[3px] focus:ring-info"
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
                Assigned: {group.currency} {formatMinorAmount(splitSummary.assignedMinor)}
              </p>
              <p className="type-small">
                Remaining:{" "}
                {splitSummary.remainingMinor === null
                  ? "-"
                  : `${group.currency} ${formatMinorAmount(splitSummary.remainingMinor)}`}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {values.splitType === "percentage" ? (
        <div className="grid gap-2">
          <FieldLabel>Percentages</FieldLabel>
          <div className="grid gap-2">
            {values.participantIds.map((memberId) => (
              <label
                key={memberId}
                className="grid min-h-12 grid-cols-[minmax(0,1fr)_8rem] items-center gap-3 rounded-xs border-[3px] border-border bg-surface-raised px-3 py-2 shadow-hard-sm"
              >
                <span className="type-small min-w-0 truncate">
                  {formatMemberLabel(memberId, currentUserId, memberProfiles)}
                </span>
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <input
                    value={values.percentages[memberId] ?? ""}
                    inputMode="decimal"
                    placeholder="50"
                    className="min-h-9 rounded-xs border-[3px] border-border bg-background px-2 text-right font-mono text-sm text-foreground outline-none placeholder:text-muted focus:ring-[3px] focus:ring-info"
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
                Assigned: {formatBasisPoints(splitSummary.assignedBasisPoints)}
              </p>
              <p className="type-small">
                Remaining: {formatBasisPoints(splitSummary.remainingBasisPoints)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {splitSummary.type === "equal" && splitSummary.shares.length > 0 ? (
        <div className="grid gap-2 border-[3px] border-border bg-muted-surface p-3 shadow-hard-sm">
          <FieldLabel>Equal shares</FieldLabel>
          {splitSummary.shares.map((share) => (
            <p key={share.userId} className="type-small flex justify-between gap-3">
              <span className="min-w-0 truncate">
                {formatMemberLabel(share.userId, currentUserId, memberProfiles)}
              </span>
              <span>
                {group.currency} {formatMinorAmount(share.resolvedAmountMinor)}
              </span>
            </p>
          ))}
        </div>
      ) : null}

      <TextInput
        label="Date"
        type="date"
        value={values.date}
        error={errors.date}
        onChange={(event) =>
          setValues((current) => ({ ...current, date: event.target.value }))
        }
      />

      <label className="grid gap-2">
        <FieldLabel>Note</FieldLabel>
        <textarea
          value={values.note}
          maxLength={500}
          rows={3}
          className="rounded-xs border-[3px] border-border bg-surface-raised px-3 py-2 font-mono text-sm text-foreground shadow-hard-sm outline-none placeholder:text-muted focus:shadow-hard focus:ring-[3px] focus:ring-info"
          placeholder="Optional"
          onChange={(event) =>
            setValues((current) => ({ ...current, note: event.target.value }))
          }
        />
        {errors.note ? <p className="type-small text-danger">{errors.note}</p> : null}
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={loading} className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
