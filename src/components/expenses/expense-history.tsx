"use client";

import { useState } from "react";
import { expenseCategoryLabels } from "@/src/constants/expense-categories";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Frame,
  LoadingCard,
} from "@/src/components/ui";
import { SettlementForm } from "@/src/components/settlements";
import {
  deleteExpense,
  formatAmountFromMinor,
  formatExpenseDate,
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

    return includesAllMembers ? null : `${participantCount} participants`;
  }

  function renderSettlementSummary(settlement: Settlement) {
    return (
      <>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="primary">Settlement</Badge>
          <span className="type-caption text-muted">
            {formatExpenseDate(settlement.date)}
          </span>
        </div>
        <p className="type-h3 truncate">
          {formatMemberLabel(settlement.payerId, currentUserId, memberProfiles)} paid{" "}
          {formatMemberLabel(settlement.receiverId, currentUserId, memberProfiles)}
        </p>
        <p className="type-small mt-1 text-muted">Balance repayment</p>
      </>
    );
  }

  function renderExpenseSummary(expense: Expense) {
    const participantText = getParticipantText(expense);

    return (
      <>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="accent">{expenseCategoryLabels[expense.category]}</Badge>
          <span className="type-caption text-muted">
            {formatExpenseDate(expense.date)}
          </span>
          <Badge tone="muted">{expense.splitType}</Badge>
        </div>
        <p className="type-h3 truncate">{expense.name}</p>
        <p className="type-small mt-1 text-muted">
          Paid by {formatMemberLabel(expense.paidBy, currentUserId, memberProfiles)}
        </p>
        {participantText ? (
          <p className="type-small mt-1 text-muted">{participantText}</p>
        ) : null}
      </>
    );
  }

  function renderDetailActions(target: DeleteTarget, onEdit: () => void) {
    const isConfirming =
      confirmingDelete?.type === target.type && confirmingDelete.id === target.id;
    const deleteKey = `${target.type}-${target.id}`;

    return (
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" onClick={onEdit}>
          Edit
        </Button>
        {isConfirming ? (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deletingKey === deleteKey}
              onClick={() => handleDelete(target)}
            >
              Confirm Delete
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmingDelete(target)}
          >
            Delete
          </Button>
        )}
      </div>
    );
  }

  return (
    <Frame as="section" className="min-w-0 p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="type-h2">Group history</h2>
          <p className="type-small mt-2 text-muted">
            Expenses and settlements feed the group balance.
          </p>
        </div>
        <Badge tone="muted">{historyItems.length} records</Badge>
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
                  <article className="border-b-[3px] border-border bg-surface px-1 py-4 transition-colors hover:bg-muted-surface last:border-b-0">
                    <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <div className="min-w-0">
                        {renderSettlementSummary(settlement)}
                      </div>
                      <p className="type-amount-md min-w-0 break-words text-left sm:text-right">
                        {formatAmountFromMinor(settlement.amountMinor, group.currency)}
                      </p>
                    </div>
                  </article>
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
                <article className="border-b-[3px] border-border bg-surface px-1 py-4 transition-colors hover:bg-muted-surface last:border-b-0">
                  <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      {renderExpenseSummary(expense)}
                    </div>
                    <p className="type-amount-md min-w-0 break-words text-left sm:text-right">
                      {formatAmountFromMinor(expense.amountMinor, group.currency)}
                    </p>
                  </div>
                </article>
              </button>
            );
          })}
        </div>
      ) : (
        <Frame surface="surface" dashed className="p-6 text-center">
          <div className="poster-grid mx-auto mb-4 size-16 border-[3px] border-border bg-primary" />
          <h3 className="type-h2">No expenses yet</h3>
          <p className="type-small mx-auto mt-2 max-w-sm text-muted">
            Add the first shared cost when the group starts spending.
          </p>
        </Frame>
      )}

      {error || actionError ? (
        <div className="mt-4">
          <Alert title="History error" tone="danger">
            {error || actionError}
          </Alert>
        </div>
      ) : null}

      <Dialog
        open={selectedItem !== null}
        title={selectedItem?.type === "settlement" ? "Settlement" : "Expense"}
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
              <p className="type-label">Amount</p>
              <p className="type-amount-md">
                {formatAmountFromMinor(selectedItem.expense.amountMinor, group.currency)}
              </p>
              {selectedItem.expense.participants[currentUserId] ? (
                <p className="type-small text-muted">
                  Your share{" "}
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
              <p className="type-label">Amount</p>
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
        title="Edit Expense"
        description="Changes update the stored expense and derived balance."
        onClose={() => setEditingExpense(null)}
      >
        {editingExpense ? (
          <ExpenseForm
            key={editingExpense.id}
            group={group}
            currentUserId={currentUserId}
            memberProfiles={memberProfiles}
            initialExpense={editingExpense}
            submitLabel="Save Expense"
            loading={savingExpenseId === editingExpense.id}
            onSubmit={handleUpdateExpense}
            onCancel={() => setEditingExpense(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={editingSettlement !== null}
        title="Edit Settlement"
        description="Changes update the recorded repayment and derived balance."
        onClose={() => setEditingSettlement(null)}
      >
        {editingSettlement ? (
          <SettlementForm
            key={editingSettlement.id}
            group={group}
            currentUserId={currentUserId}
            memberProfiles={memberProfiles}
            initialValues={settlementToFormValues(editingSettlement)}
            submitLabel="Save Settlement"
            loading={savingSettlementId === editingSettlement.id}
            onSubmit={handleUpdateSettlement}
            onCancel={() => setEditingSettlement(null)}
          />
        ) : null}
      </Dialog>
    </Frame>
  );
}
