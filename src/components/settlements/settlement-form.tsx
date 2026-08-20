"use client";

import { useState, type FormEvent } from "react";
import { Button, FieldLabel, SelectField, TextInput } from "@/src/components/ui";
import { validateSettlementInput } from "@/src/lib/settlement-validation";
import {
  formatDateForInput,
  parseAmountToMinor,
} from "@/src/services/expenses";
import type { Group } from "@/src/types/group";
import type { SettlementFormValues } from "@/src/types/settlement";
import type { UserProfileMap } from "@/src/types/user-profile";
import { formatMemberLabel } from "@/src/utils/member-label";

type SettlementFormErrors = Partial<Record<keyof SettlementFormValues, string>>;

const validationMessages = {
  invalid_payer: "Payer must be a group member.",
  invalid_receiver: "Receiver must be a group member.",
  same_member: "Payer and receiver must be different.",
  invalid_amount: "Amount must be greater than 0 with up to 2 decimals.",
};

function validateSettlementForm(values: SettlementFormValues, group: Group) {
  const errors: SettlementFormErrors = {};
  const result = validateSettlementInput({
    memberIds: group.memberIds,
    payerId: values.payerId,
    receiverId: values.receiverId,
    amountMinor: parseAmountToMinor(values.amount),
  });

  if (!result.ok) {
    for (const error of result.errors) {
      if (error === "invalid_payer") {
        errors.payerId = validationMessages[error];
      }

      if (error === "invalid_receiver") {
        errors.receiverId = validationMessages[error];
      }

      if (error === "same_member") {
        errors.receiverId = validationMessages[error];
      }

      if (error === "invalid_amount") {
        errors.amount = validationMessages[error];
      }
    }
  }

  if (!values.date) {
    errors.date = "Date is required.";
  }

  if (values.note.length > 500) {
    errors.note = "Keep the note under 500 characters.";
  }

  return errors;
}

export function SettlementForm({
  group,
  currentUserId,
  memberProfiles,
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
  onCancel,
}: {
  group: Group;
  currentUserId: string;
  memberProfiles: UserProfileMap;
  initialValues?: SettlementFormValues;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: SettlementFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const fallbackReceiverId =
    group.memberIds.find((memberId) => memberId !== currentUserId) ??
    group.memberIds[0] ??
    "";
  const [values, setValues] = useState<SettlementFormValues>(
    initialValues ?? {
      payerId: currentUserId,
      receiverId: fallbackReceiverId,
      amount: "",
      date: formatDateForInput(),
      note: "",
    },
  );
  const [errors, setErrors] = useState<SettlementFormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValues = {
      ...values,
      note: values.note.trim(),
    };
    const nextErrors = validateSettlementForm(nextValues, group);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(nextValues);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <SelectField
        label="Payer"
        value={values.payerId}
        onChange={(event) =>
          setValues((current) => ({ ...current, payerId: event.target.value }))
        }
      >
        {group.memberIds.map((memberId) => (
          <option key={memberId} value={memberId}>
            {formatMemberLabel(memberId, currentUserId, memberProfiles)}
          </option>
        ))}
      </SelectField>
      {errors.payerId ? <p className="type-small text-danger">{errors.payerId}</p> : null}

      <SelectField
        label="Receiver"
        value={values.receiverId}
        onChange={(event) =>
          setValues((current) => ({ ...current, receiverId: event.target.value }))
        }
      >
        {group.memberIds.map((memberId) => (
          <option key={memberId} value={memberId}>
            {formatMemberLabel(memberId, currentUserId, memberProfiles)}
          </option>
        ))}
      </SelectField>
      {errors.receiverId ? (
        <p className="type-small text-danger">{errors.receiverId}</p>
      ) : null}

      <TextInput
        label="Amount"
        value={values.amount}
        error={errors.amount}
        inputMode="decimal"
        placeholder="500.00"
        onChange={(event) =>
          setValues((current) => ({ ...current, amount: event.target.value }))
        }
      />

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
          placeholder="Optional"
          className="min-h-24 rounded-xs border-[3px] border-border bg-surface-raised px-3 py-2 font-mono text-sm text-foreground shadow-hard-sm outline-none placeholder:text-muted focus:shadow-hard focus:ring-[3px] focus:ring-info"
          onChange={(event) =>
            setValues((current) => ({ ...current, note: event.target.value }))
          }
        />
        {errors.note ? <span className="text-sm font-bold text-danger">{errors.note}</span> : null}
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
