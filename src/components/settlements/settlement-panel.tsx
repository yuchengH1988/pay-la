"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  Frame,
  Icon,
} from "@/src/components/ui";
import { useI18n } from "@/src/i18n";
import {
  createSettlement,
} from "@/src/services/settlements";
import {
  formatAmountFromMinor,
  parseAmountToMinor,
} from "@/src/services/expenses";
import type { Group } from "@/src/types/group";
import type { SettlementFormValues } from "@/src/types/settlement";
import type { UserProfileMap } from "@/src/types/user-profile";
import { formatMemberLabel } from "@/src/utils/member-label";
import { SettlementForm } from "./settlement-form";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to record settlement.";
}

function formatDraftKey(values: SettlementFormValues | null) {
  if (!values) {
    return "empty";
  }

  return [
    values.payerId,
    values.receiverId,
    values.amount,
    values.date,
    values.note,
  ].join("|");
}

export function SettlementPanel({
  group,
  currentUserId,
  memberProfiles,
  draft,
  onDraftConsumed,
  className,
  buttonSize = "md",
}: {
  group: Group;
  currentUserId: string;
  memberProfiles: UserProfileMap;
  draft: SettlementFormValues | null;
  onDraftConsumed: () => void;
  className?: string;
  buttonSize?: "md" | "lg";
}) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingValues, setPendingValues] = useState<SettlementFormValues | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const draftKey = useMemo(() => formatDraftKey(draft), [draft]);
  const isDialogOpen = isOpen || draft !== null;

  function closeDialog() {
    setIsOpen(false);
    onDraftConsumed();
    setPendingValues(null);
    setActionError(null);
  }

  async function handlePrepareSettlement(values: SettlementFormValues) {
    setPendingValues(values);
    setSuccessMessage(null);
  }

  async function handleConfirmSettlement() {
    if (!pendingValues) {
      return;
    }

    setIsSaving(true);
    setActionError(null);

    try {
      await createSettlement(group, currentUserId, pendingValues);
      setPendingValues(null);
      setIsOpen(false);
      onDraftConsumed();
      setSuccessMessage(t("settlement.success"));
    } catch (settlementError) {
      setActionError(getErrorMessage(settlementError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size={buttonSize}
        className={className}
        onClick={() => {
          setIsOpen(true);
          onDraftConsumed();
          setPendingValues(null);
          setActionError(null);
          setSuccessMessage(null);
        }}
      >
        <Icon name="wallet" />
        {t("action.settleUp")}
      </Button>

      <Dialog
        open={isDialogOpen}
        title={pendingValues ? t("settlement.confirmDialogTitle") : t("action.settleUp")}
        description={t("settlement.description")}
        onClose={closeDialog}
      >
        {!pendingValues ? (
          <SettlementForm
            key={draftKey}
            group={group}
            currentUserId={currentUserId}
            memberProfiles={memberProfiles}
            initialValues={draft ?? undefined}
            submitLabel={t("action.reviewSettlement")}
            onSubmit={handlePrepareSettlement}
            onCancel={closeDialog}
          />
        ) : (
          <Frame surface="surface" shadow="sm" className="grid gap-4 p-4">
            <div>
              <p className="type-label">{t("settlement.confirmTitle")}</p>
              <p className="type-small mt-2 text-muted">
                {formatMemberLabel(
                  pendingValues.payerId,
                  currentUserId,
                  memberProfiles,
                )}{" "}
                {t("settlement.pays")}{" "}
                {formatMemberLabel(
                  pendingValues.receiverId,
                  currentUserId,
                  memberProfiles,
                )}
              </p>
              <p className="type-amount-md mt-2">
                {formatAmountFromMinor(
                  parseAmountToMinor(pendingValues.amount) ?? 0,
                  group.currency,
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                loading={isSaving}
                onClick={handleConfirmSettlement}
              >
                <Icon name="check" />
                {t("action.confirm")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPendingValues(null)}
              >
                {t("action.back")}
              </Button>
            </div>
          </Frame>
        )}
      </Dialog>

      {successMessage ? (
        <div>
          <Alert title={t("settlement.saved")} tone="success">
            {successMessage}
          </Alert>
        </div>
      ) : null}

      {actionError ? (
        <div>
          <Alert title={t("settlement.error")} tone="danger">
            {actionError}
          </Alert>
        </div>
      ) : null}
    </>
  );
}
