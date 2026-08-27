"use client";

import { useState, type FormEvent } from "react";
import { Button, FieldLabel, SelectField, TextInput } from "@/src/components/ui";
import { useI18n, type TranslationKey } from "@/src/i18n";
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

const validationMessageKeys = {
  invalid_payer: "validation.payerMember",
  invalid_receiver: "validation.receiverMember",
  same_member: "validation.sameSettlementMember",
  invalid_amount: "validation.amountPositive",
} satisfies Record<string, TranslationKey>;

function validateSettlementForm(
  values: SettlementFormValues,
  group: Group,
  t: (key: TranslationKey) => string,
) {
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
        errors.payerId = t(validationMessageKeys[error]);
      }

      if (error === "invalid_receiver") {
        errors.receiverId = t(validationMessageKeys[error]);
      }

      if (error === "same_member") {
        errors.receiverId = t(validationMessageKeys[error]);
      }

      if (error === "invalid_amount") {
        errors.amount = t(validationMessageKeys[error]);
      }
    }
  }

  if (!values.date) {
    errors.date = t("validation.dateRequired");
  }

  if (values.note.length > 500) {
    errors.note = t("validation.noteLength");
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
  const { t } = useI18n();
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
    const nextErrors = validateSettlementForm(nextValues, group, t);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(nextValues);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <SelectField
        label={t("settlement.payer")}
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
        label={t("settlement.receiver")}
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
        label={t("expense.amount")}
        value={values.amount}
        error={errors.amount}
        inputMode="decimal"
        placeholder="500.00"
        onChange={(event) =>
          setValues((current) => ({ ...current, amount: event.target.value }))
        }
      />

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
          placeholder={t("expense.optional")}
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
            {t("action.cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
