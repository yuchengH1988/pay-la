"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Frame,
  Icon,
  LoadingCard,
} from "@/src/components/ui";
import { cx } from "@/src/components/ui/cx";
import { SettlementForm } from "@/src/components/settlements";
import { useI18n } from "@/src/i18n";
import {
  deleteExpense,
  formatAmountFromMinor,
  updateExpense,
} from "@/src/services/expenses";
import {
  deleteSettlement,
  updateSettlement,
} from "@/src/services/settlements";
import type { Expense, ExpenseFormValues } from "@/src/types/expense";
import type { Group } from "@/src/types/group";
import type { Settlement, SettlementFormValues } from "@/src/types/settlement";
import type { UserProfileMap } from "@/src/types/user-profile";
import { formatMemberLabel } from "@/src/utils/member-label";
import { ExpenseForm } from "./expense-form";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function settlementToFormValues(settlement: Settlement): SettlementFormValues {
  return {
    payerId: settlement.payerId,
    receiverId: settlement.receiverId,
    amount: (settlement.amountMinor / 100).toFixed(2),
    date: settlement.date.toDate().toISOString().slice(0, 10),
    note: settlement.note,
  };
}

type GroupHistoryItem =
  | { type: "expense"; sortTime: number; expense: Expense }
  | { type: "settlement"; sortTime: number; settlement: Settlement };

type DeleteTarget =
  | { type: "expense"; id: string }
  | { type: "settlement"; id: string };

export function ExpenseHistory({
  group,
  currentUserId,
  memberProfiles,
  expenses,
  settlements,
  loading,
  error,
}: {
  group: Group;
  currentUserId: string;
  memberProfiles: UserProfileMap;
  expenses: Expense[];
  settlements: Settlement[];
  loading: boolean;
  error: string | null;
}) {
  const {
    t,
    categoryLabel,
    splitTypeLabel,
    formatDate,
    formatDateParts,
  } = useI18n();
  const [selectedItem, setSelectedItem] = useState<GroupHistoryItem | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<DeleteTarget | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [savingExpenseId, setSavingExpenseId] = useState<string | null>(null);
  const [savingSettlementId, setSavingSettlementId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const historyItems = [
    ...expenses.map<GroupHistoryItem>((expense) => ({
      type: "expense",
      sortTime: expense.date.toMillis(),
      expense,
    })),
    ...settlements.map<GroupHistoryItem>((settlement) => ({
      type: "settlement",
      sortTime: settlement.date.toMillis(),
      settlement,
    })),
  ].sort((first, second) => second.sortTime - first.sortTime);

  async function handleUpdateExpense(values: ExpenseFormValues) {
    if (!editingExpense) {
      return;
    }

    setSavingExpenseId(editingExpense.id);
    setActionError(null);

    try {
      await updateExpense(group.id, editingExpense.id, values);
      setEditingExpense(null);
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setSavingExpenseId(null);
    }
  }

  async function handleUpdateSettlement(values: SettlementFormValues) {
    if (!editingSettlement) {
      return;
    }

    setSavingSettlementId(editingSettlement.id);
    setActionError(null);

    try {
      await updateSettlement(group, editingSettlement.id, values);
      setEditingSettlement(null);
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setSavingSettlementId(null);
    }
  }

  async function handleDelete(target: DeleteTarget) {
    const deleteKey = `${target.type}-${target.id}`;

    setDeletingKey(deleteKey);
    setActionError(null);

    try {
      if (target.type === "expense") {
        await deleteExpense(group.id, target.id);
      } else {
        await deleteSettlement(group.id, target.id);
      }

      setConfirmingDelete(null);
      setSelectedItem(null);
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    } finally {
      setDeletingKey(null);
    }
  }

  function closeDetailDialog() {
    setSelectedItem(null);
    setConfirmingDelete(null);
  }

  function getParticipantText(expense: Expense) {
    const participantCount = Object.keys(expense.participants).length;
    const includesAllMembers =
      participantCount === group.memberIds.length &&
      group.memberIds.every((memberId) => expense.participants[memberId]);

    return includesAllMembers
      ? null
      : t("members.participantCount", { count: participantCount });
  }

  function renderSettlementSummary(settlement: Settlement) {
    return (
      <>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="primary">{t("settlement.title")}</Badge>
          <span className="type-caption text-muted">
            {formatDate(settlement.date.toDate())}
          </span>
        </div>
        <p className="type-h3 truncate">
          {formatMemberLabel(settlement.payerId, currentUserId, memberProfiles)}{" "}
          {t("settlement.paid")}{" "}
          {formatMemberLabel(settlement.receiverId, currentUserId, memberProfiles)}
        </p>
        <p className="type-small mt-1 text-muted">{t("settlement.balanceRepayment")}</p>
      </>
    );
  }

  function renderSettlementRow(settlement: Settlement) {
    const date = formatDateParts(settlement.date.toDate());
    const rowMeta =
      settlement.payerId === currentUserId
        ? { label: t("settlement.youPaid"), amount: settlement.amountMinor, tone: "negative" }
        : settlement.receiverId === currentUserId
          ? { label: t("settlement.youReceived"), amount: settlement.amountMinor, tone: "positive" }
          : { label: t("settlement.recorded"), amount: settlement.amountMinor, tone: "neutral" };

    return (
      <article className="border-b-[3px] border-border bg-surface px-2 py-4 transition-colors hover:bg-muted-surface last:border-b-0 sm:px-3">
        <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto] sm:gap-4">
          <div className="text-muted">
            <p className="type-caption">{date.month}</p>
            <p className="font-amount text-2xl font-black leading-none">{date.day}</p>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge tone="primary">
                <Icon name="wallet" className="size-3" />
                {t("settlement.title")}
              </Badge>
            </div>
            <p className="type-label truncate">
              {formatMemberLabel(settlement.payerId, currentUserId, memberProfiles)}{" "}
              {t("settlement.paid")}{" "}
              {formatMemberLabel(settlement.receiverId, currentUserId, memberProfiles)}
            </p>
            <p className="type-caption mt-1 truncate text-muted">
              {t("settlement.balanceRepayment")}
            </p>
          </div>
          <div className="min-w-0 text-right">
            <p className="font-amount whitespace-nowrap text-base font-black leading-none sm:text-xl">
              {formatAmountFromMinor(settlement.amountMinor, group.currency)}
            </p>
            <p
              className={cx(
                "type-caption mt-2 whitespace-nowrap",
                rowMeta.tone === "positive" && "text-success",
                rowMeta.tone === "negative" && "text-danger",
                rowMeta.tone === "neutral" && "text-muted",
              )}
            >
              {rowMeta.label} {formatAmountFromMinor(rowMeta.amount, group.currency)}
            </p>
          </div>
        </div>
      </article>
    );
  }

  function renderExpenseSummary(expense: Expense) {
    const participantText = getParticipantText(expense);

    return (
      <>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="accent">{categoryLabel(expense.category)}</Badge>
          <span className="type-caption text-muted">
            {formatDate(expense.date.toDate())}
          </span>
          <Badge tone="muted">{splitTypeLabel(expense.splitType)}</Badge>
        </div>
        <p className="type-h3 truncate">{expense.name}</p>
        <p className="type-small mt-1 text-muted">
          {t("expense.paidBy")}{" "}
          {formatMemberLabel(expense.paidBy, currentUserId, memberProfiles)}
        </p>
        {participantText ? (
          <p className="type-small mt-1 text-muted">{participantText}</p>
        ) : null}
      </>
    );
  }

  function renderExpenseRow(expense: Expense) {
    const date = formatDateParts(expense.date.toDate());
    const participantText = getParticipantText(expense);
    const currentUserShare =
      expense.participants[currentUserId]?.resolvedAmountMinor ?? 0;
    const currentUserPaid = expense.paidBy === currentUserId ? expense.amountMinor : 0;
    const currentUserNet = currentUserPaid - currentUserShare;
    const rowMeta =
      currentUserNet > 0
        ? { label: t("expense.youCovered"), amount: currentUserNet, tone: "positive" }
        : currentUserNet < 0
          ? { label: t("expense.yourShare"), amount: Math.abs(currentUserNet), tone: "negative" }
          : currentUserShare > 0
            ? { label: t("expense.settledShare"), amount: currentUserShare, tone: "neutral" }
            : { label: t("expense.amount"), amount: expense.amountMinor, tone: "neutral" };

    return (
      <article className="border-b-[3px] border-border bg-surface px-2 py-4 transition-colors hover:bg-muted-surface last:border-b-0 sm:px-3">
        <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto] sm:gap-4">
          <div className="text-muted">
            <p className="type-caption">{date.month}</p>
            <p className="font-amount text-2xl font-black leading-none">{date.day}</p>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge tone="accent">
                <Icon name="receipt" className="size-3" />
                {categoryLabel(expense.category)}
              </Badge>
            </div>
            <p className="type-label truncate">{expense.name}</p>
            <p className="type-caption mt-1 truncate text-muted">
              {t("expense.paidBy")}{" "}
              {formatMemberLabel(expense.paidBy, currentUserId, memberProfiles)}
              {participantText ? ` / ${participantText}` : ""}
            </p>
          </div>
          <div className="min-w-0 text-right">
            <p className="font-amount whitespace-nowrap text-base font-black leading-none sm:text-xl">
              {formatAmountFromMinor(expense.amountMinor, group.currency)}
            </p>
            <p
              className={cx(
                "type-caption mt-2 whitespace-nowrap",
                rowMeta.tone === "positive" && "text-success",
                rowMeta.tone === "negative" && "text-danger",
                rowMeta.tone === "neutral" && "text-muted",
              )}
            >
              {rowMeta.label} {formatAmountFromMinor(rowMeta.amount, group.currency)}
            </p>
          </div>
        </div>
      </article>
    );
  }

  function renderDetailActions(target: DeleteTarget, onEdit: () => void) {
    const isConfirming =
      confirmingDelete?.type === target.type && confirmingDelete.id === target.id;
    const deleteKey = `${target.type}-${target.id}`;

    return (
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" onClick={onEdit}>
          <Icon name="edit" />
          {t("action.edit")}
        </Button>
        {isConfirming ? (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmingDelete(null)}
            >
              {t("action.cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deletingKey === deleteKey}
              onClick={() => handleDelete(target)}
            >
              <Icon name="trash" />
              {t("action.confirmDelete")}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmingDelete(target)}
          >
            <Icon name="trash" />
            {t("action.delete")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Frame as="section" className="min-w-0 p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="type-h2">{t("expense.historyTitle")}</h2>
          <p className="type-small mt-2 max-w-xl text-muted">
            {t("expense.historyDescription")}
          </p>
        </div>
        <Badge tone="muted">
          {t("history.recordCount", { count: historyItems.length })}
        </Badge>
      </div>

      {loading ? (
        <LoadingCard />
      ) : historyItems.length > 0 ? (
        <div className="grid gap-3">
          {historyItems.map((item) => {
            if (item.type === "settlement") {
              const { settlement } = item;

              return (
                <button
                  key={`settlement-${settlement.id}`}
                  type="button"
                  className="block w-full text-left"
                  onClick={() => setSelectedItem(item)}
                >
                  {renderSettlementRow(settlement)}
                </button>
              );
            }

            const { expense } = item;

            return (
              <button
                key={`expense-${expense.id}`}
                type="button"
                className="block w-full text-left"
                onClick={() => setSelectedItem(item)}
              >
                {renderExpenseRow(expense)}
              </button>
            );
          })}
        </div>
      ) : (
        <Frame surface="surface" dashed className="p-6 text-center">
          <div className="poster-grid mx-auto mb-4 size-16 border-[3px] border-border bg-primary" />
          <h3 className="type-h2">{t("expense.emptyTitle")}</h3>
          <p className="type-small mx-auto mt-2 max-w-sm text-muted">
            {t("expense.emptyDescription")}
          </p>
        </Frame>
      )}

      {error || actionError ? (
        <div className="mt-4">
          <Alert title={t("expense.historyError")} tone="danger">
            {error || actionError}
          </Alert>
        </div>
      ) : null}

      <Dialog
        open={selectedItem !== null}
        title={selectedItem?.type === "settlement" ? t("settlement.title") : t("expense.details")}
        onClose={closeDetailDialog}
      >
        {selectedItem?.type === "expense" ? (
          <div className="grid gap-4">
            <div>
              {renderExpenseSummary(selectedItem.expense)}
              {selectedItem.expense.note ? (
                <p className="type-small mt-3 text-muted">{selectedItem.expense.note}</p>
              ) : null}
            </div>
            <Frame surface="surface" shadow="sm" className="grid gap-2 p-3">
              <p className="type-label">{t("expense.amount")}</p>
              <p className="type-amount-md">
                {formatAmountFromMinor(selectedItem.expense.amountMinor, group.currency)}
              </p>
              {selectedItem.expense.participants[currentUserId] ? (
                <p className="type-small text-muted">
                  {t("expense.yourShare")}{" "}
                  {formatAmountFromMinor(
                    selectedItem.expense.participants[currentUserId].resolvedAmountMinor,
                    group.currency,
                  )}
                </p>
              ) : null}
            </Frame>
            {renderDetailActions(
              { type: "expense", id: selectedItem.expense.id },
              () => {
                setEditingExpense(selectedItem.expense);
                closeDetailDialog();
              },
            )}
          </div>
        ) : null}

        {selectedItem?.type === "settlement" ? (
          <div className="grid gap-4">
            <div>
              {renderSettlementSummary(selectedItem.settlement)}
              {selectedItem.settlement.note ? (
                <p className="type-small mt-3 text-muted">
                  {selectedItem.settlement.note}
                </p>
              ) : null}
            </div>
            <Frame surface="surface" shadow="sm" className="grid gap-2 p-3">
              <p className="type-label">{t("expense.amount")}</p>
              <p className="type-amount-md">
                {formatAmountFromMinor(selectedItem.settlement.amountMinor, group.currency)}
              </p>
            </Frame>
            {renderDetailActions(
              { type: "settlement", id: selectedItem.settlement.id },
              () => {
                setEditingSettlement(selectedItem.settlement);
                closeDetailDialog();
              },
            )}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={editingExpense !== null}
        title={t("action.editExpense")}
        description={t("expense.editDescription")}
        onClose={() => setEditingExpense(null)}
      >
        {editingExpense ? (
          <ExpenseForm
            key={editingExpense.id}
            group={group}
            currentUserId={currentUserId}
            memberProfiles={memberProfiles}
            initialExpense={editingExpense}
            submitLabel={t("action.saveExpense")}
            loading={savingExpenseId === editingExpense.id}
            onSubmit={handleUpdateExpense}
            onCancel={() => setEditingExpense(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={editingSettlement !== null}
        title={t("action.editSettlement")}
        description={t("settlement.editDescription")}
        onClose={() => setEditingSettlement(null)}
      >
        {editingSettlement ? (
          <SettlementForm
            key={editingSettlement.id}
            group={group}
            currentUserId={currentUserId}
            memberProfiles={memberProfiles}
            initialValues={settlementToFormValues(editingSettlement)}
            submitLabel={t("action.saveSettlement")}
            loading={savingSettlementId === editingSettlement.id}
            onSubmit={handleUpdateSettlement}
            onCancel={() => setEditingSettlement(null)}
          />
        ) : null}
      </Dialog>
    </Frame>
  );
}
