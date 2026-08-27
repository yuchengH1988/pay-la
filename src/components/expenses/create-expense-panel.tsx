"use client";

import { useState } from "react";
import { Alert, Button, Dialog, Frame, Icon } from "@/src/components/ui";
import { useI18n } from "@/src/i18n";
import { createExpense } from "@/src/services/expenses";
import type { ExpenseFormValues } from "@/src/types/expense";
import type { Group } from "@/src/types/group";
import type { UserProfileMap } from "@/src/types/user-profile";
import { ExpenseForm } from "./expense-form";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create expense.";
}

export function CreateExpensePanel({
  group,
  currentUserId,
  memberProfiles,
  onCreated,
}: {
  group: Group;
  currentUserId: string;
  memberProfiles: UserProfileMap;
  onCreated?: () => void;
}) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateExpense(values: ExpenseFormValues) {
    setIsSaving(true);
    setError(null);

    try {
      await createExpense(group.id, currentUserId, values);
      setIsOpen(false);
      onCreated?.();
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Frame as="section" className="p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-h3">{t("action.addExpense")}</h2>
        </div>
        <Button type="button" onClick={() => setIsOpen(true)}>
          <Icon name="plus" />
          {t("action.add")}
        </Button>
      </div>

      <Dialog
        open={isOpen}
        title={t("action.addExpense")}
        description={t("expense.storeDescription")}
        onClose={() => setIsOpen(false)}
      >
        <ExpenseForm
          group={group}
          currentUserId={currentUserId}
          memberProfiles={memberProfiles}
          submitLabel={t("action.createExpense")}
          loading={isSaving}
          onSubmit={handleCreateExpense}
          onCancel={() => setIsOpen(false)}
        />
      </Dialog>

      {error ? (
        <div className="mt-4">
          <Alert title={t("expense.error")} tone="danger">
            {error}
          </Alert>
        </div>
      ) : null}
    </Frame>
  );
}
