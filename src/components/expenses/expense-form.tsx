"use client";

import { useState, type FormEvent } from "react";
import {
  expenseCategories,
  expenseCategoryLabels,
} from "@/src/constants/expense-categories";
import { Button, FieldLabel, SelectField, TextInput } from "@/src/components/ui";
import { formatDateForInput, parseAmountToMinor } from "@/src/services/expenses";
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

function expenseToFormValues(expense: Expense): ExpenseFormValues {
  return {
    name: expense.name,
    amount: (expense.amountMinor / 100).toFixed(2),
    category: expense.category,
    paidBy: expense.paidBy,
    participantIds: Object.keys(expense.participants),
    splitType: expense.splitType,
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

  return errors;
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
          date: formatDateForInput(),
          note: "",
        },
  );
  const [errors, setErrors] = useState<ExpenseFormErrors>({});

  function toggleParticipant(memberId: string) {
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
        onChange={(event) =>
          setValues((current) => ({ ...current, amount: event.target.value }))
        }
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
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            splitType: event.target.value as SplitType,
          }))
        }
      >
        {splitTypes.map((splitType) => (
          <option key={splitType.value} value={splitType.value}>
            {splitType.label}
          </option>
        ))}
      </SelectField>

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
