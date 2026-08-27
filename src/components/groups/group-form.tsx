"use client";

import { useState, type FormEvent } from "react";
import { Button, SelectField, TextInput } from "@/src/components/ui";
import { useI18n, type TranslationKey } from "@/src/i18n";
import type { GroupFormValues } from "@/src/types/group";

const currencies = ["TWD", "USD", "JPY", "EUR", "GBP"];

type GroupFormErrors = {
  name?: string;
  currency?: string;
};

function validateGroupForm(
  values: GroupFormValues,
  t: (key: TranslationKey) => string,
) {
  const errors: GroupFormErrors = {};

  if (!values.name.trim()) {
    errors.name = t("validation.groupNameRequired");
  } else if (values.name.trim().length > 80) {
    errors.name = t("validation.groupNameLength");
  }

  if (!currencies.includes(values.currency)) {
    errors.currency = t("validation.groupCurrencyRequired");
  }

  return errors;
}

export function GroupForm({
  initialValues = { name: "", currency: "TWD" },
  submitLabel,
  loading = false,
  onSubmit,
}: {
  initialValues?: GroupFormValues;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: GroupFormValues) => Promise<void>;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<GroupFormValues>(initialValues);
  const [errors, setErrors] = useState<GroupFormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValues = {
      name: values.name.trim(),
      currency: values.currency,
    };
    const nextErrors = validateGroupForm(nextValues, t);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(nextValues);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <TextInput
        label={t("group.name")}
        value={values.name}
        error={errors.name}
        maxLength={80}
        placeholder="Japan Trip"
        onChange={(event) =>
          setValues((current) => ({ ...current, name: event.target.value }))
        }
      />
      <SelectField
        label={t("group.currency")}
        value={values.currency}
        onChange={(event) =>
          setValues((current) => ({ ...current, currency: event.target.value }))
        }
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </SelectField>
      {errors.currency ? (
        <p className="type-small text-danger">{errors.currency}</p>
      ) : null}
      <Button type="submit" loading={loading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
