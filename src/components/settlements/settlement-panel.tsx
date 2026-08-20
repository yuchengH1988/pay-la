"use client";

import { useMemo, useState } from "react";
import { Alert, Badge, Button, Frame, LoadingCard } from "@/src/components/ui";
import {
  createSettlement,
} from "@/src/services/settlements";
import {
  formatAmountFromMinor,
  formatExpenseDate,
  parseAmountToMinor,
} from "@/src/services/expenses";
import type { Group } from "@/src/types/group";
import type { Settlement, SettlementFormValues } from "@/src/types/settlement";
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
  settlements,
  loading,
  error,
  draft,
  onDraftConsumed,
}: {
  group: Group;
  currentUserId: string;
  memberProfiles: UserProfileMap;
  settlements: Settlement[];
  loading: boolean;
  error: string | null;
  draft: SettlementFormValues | null;
  onDraftConsumed: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingValues, setPendingValues] = useState<SettlementFormValues | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const draftKey = useMemo(() => formatDraftKey(draft), [draft]);
  const isFormOpen = isOpen || draft !== null;

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
      setSuccessMessage("Settlement recorded.");
    } catch (settlementError) {
      setActionError(getErrorMessage(settlementError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Frame as="section" className="p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-h3">Settlements</h2>
          <p className="type-small mt-2 text-muted">
            Record repayments without changing expense history.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setIsOpen(!isFormOpen);
            onDraftConsumed();
            setPendingValues(null);
            setActionError(null);
            setSuccessMessage(null);
          }}
        >
          {isFormOpen ? "Close" : "Settle Up"}
        </Button>
      </div>

      {isFormOpen && !pendingValues ? (
        <SettlementForm
          key={draftKey}
          group={group}
          currentUserId={currentUserId}
          memberProfiles={memberProfiles}
          initialValues={draft ?? undefined}
          submitLabel="Review Settlement"
          onSubmit={handlePrepareSettlement}
          onCancel={() => {
            setIsOpen(false);
            onDraftConsumed();
            setPendingValues(null);
          }}
        />
      ) : null}

      {pendingValues ? (
        <Frame surface="surface" shadow="sm" className="grid gap-4 p-4">
          <div>
            <p className="type-label">Confirm settlement</p>
            <p className="type-small mt-2 text-muted">
              {formatMemberLabel(
                pendingValues.payerId,
                currentUserId,
                memberProfiles,
              )}{" "}
              pays{" "}
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
              Confirm
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingValues(null)}
            >
              Back
            </Button>
          </div>
        </Frame>
      ) : null}

      {successMessage ? (
        <div className="mt-4">
          <Alert title="Settlement saved" tone="success">
            {successMessage}
          </Alert>
        </div>
      ) : null}

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="type-label">History</h3>
          <Badge tone="muted">{settlements.length} records</Badge>
        </div>

        {loading ? (
          <LoadingCard />
        ) : settlements.length > 0 ? (
          <div className="grid gap-3">
            {settlements.map((settlement) => (
              <article
                key={settlement.id}
                className="border-b-[3px] border-border py-3 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="type-small font-bold">
                      {formatMemberLabel(
                        settlement.payerId,
                        currentUserId,
                        memberProfiles,
                      )}{" "}
                      paid{" "}
                      {formatMemberLabel(
                        settlement.receiverId,
                        currentUserId,
                        memberProfiles,
                      )}
                    </p>
                    <p className="type-caption mt-1 text-muted">
                      {formatExpenseDate(settlement.date)}
                    </p>
                    {settlement.note ? (
                      <p className="type-small mt-2 text-muted">{settlement.note}</p>
                    ) : null}
                  </div>
                  <p className="type-amount-md">
                    {formatAmountFromMinor(settlement.amountMinor, group.currency)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Frame surface="surface" dashed className="p-5 text-center">
            <h3 className="type-h3">No settlements yet</h3>
            <p className="type-small mx-auto mt-2 max-w-sm text-muted">
              Record a repayment when one member pays another back.
            </p>
          </Frame>
        )}
      </div>

      {error || actionError ? (
        <div className="mt-4">
          <Alert title="Settlement error" tone="danger">
            {error || actionError}
          </Alert>
        </div>
      ) : null}
    </Frame>
  );
}
