"use client";

import { useState } from "react";
import { expenseCategoryLabels } from "@/src/constants/expense-categories";
import { Alert, Badge, Button, Frame, LoadingCard } from "@/src/components/ui";
import {
  deleteExpense,
  formatAmountFromMinor,
  formatExpenseDate,
  updateExpense,
} from "@/src/services/expenses";
import type { Expense, ExpenseFormValues } from "@/src/types/expense";
import type { Group } from "@/src/types/group";
import type { Settlement } from "@/src/types/settlement";
import type { UserProfileMap } from "@/src/types/user-profile";
import { formatMemberLabel } from "@/src/utils/member-label";
import { ExpenseForm } from "./expense-form";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

type GroupHistoryItem =
  | { type: "expense"; sortTime: number; expense: Expense }
  | { type: "settlement"; sortTime: number; settlement: Settlement };

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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [savingExpenseId, setSavingExpenseId] = useState<string | null>(null);
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

  async function handleDeleteExpense(expenseId: string) {
    setDeletingExpenseId(expenseId);
    setActionError(null);

    try {
      await deleteExpense(group.id, expenseId);
      setConfirmingDeleteId(null);
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    } finally {
      setDeletingExpenseId(null);
    }
  }

  return (
    <Frame as="section" className="p-5">
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
                <article
                  key={`settlement-${settlement.id}`}
                  className="border-b-[3px] border-border bg-surface px-1 py-4 last:border-b-0"
                >
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2 items-center">
                        <Badge tone="primary">Settlement</Badge>
                        <span className="type-caption text-muted">
                          {formatExpenseDate(settlement.date)}
                        </span>
                      </div>
                      <p className="type-h3 truncate">
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
                      <p className="type-small mt-1 text-muted">
                        Balance repayment
                      </p>
                      {settlement.note ? (
                        <p className="type-small mt-2 text-muted">
                          {settlement.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-3 text-left sm:text-right">
                      <p className="type-amount-md">
                        {formatAmountFromMinor(settlement.amountMinor, group.currency)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            }

            const { expense } = item;

            return (
              <article
                key={`expense-${expense.id}`}
                className="border-b-[3px] border-border bg-surface px-1 py-4 last:border-b-0"
              >
                {editingExpense?.id === expense.id ? (
                  <ExpenseForm
                    group={group}
                    currentUserId={currentUserId}
                    memberProfiles={memberProfiles}
                    initialExpense={expense}
                    submitLabel="Save Expense"
                    loading={savingExpenseId === expense.id}
                    onSubmit={handleUpdateExpense}
                    onCancel={() => setEditingExpense(null)}
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2 items-center">
                        <Badge tone="accent">
                          {expenseCategoryLabels[expense.category]}
                        </Badge>
                        <span className="type-caption text-muted">
                          {formatExpenseDate(expense.date)}
                        </span>
                        <Badge tone="muted">{expense.splitType}</Badge>
                      </div>
                      <p className="type-h3 truncate">{expense.name}</p>
                      <p className="type-small mt-1 text-muted">
                        Paid by{" "}
                        {formatMemberLabel(
                          expense.paidBy,
                          currentUserId,
                          memberProfiles,
                        )}
                      </p>
                      <p className="type-small mt-1 text-muted">
                        {Object.keys(expense.participants).length} participants
                      </p>
                      {expense.participants[currentUserId] ? (
                        <p className="type-small mt-1 text-muted">
                          Your share{" "}
                          {formatAmountFromMinor(
                            expense.participants[currentUserId].resolvedAmountMinor,
                            group.currency,
                          )}
                        </p>
                      ) : null}
                      {expense.note ? (
                        <p className="type-small mt-2 text-muted">{expense.note}</p>
                      ) : null}
                    </div>
                    <div className="grid gap-3 text-left sm:text-right">
                      <p className="type-amount-md">
                        {formatAmountFromMinor(expense.amountMinor, group.currency)}
                      </p>
                      <div className="flex gap-2 sm:justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingExpense(expense)}
                        >
                          Edit
                        </Button>
                        {confirmingDeleteId === expense.id ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmingDeleteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              loading={deletingExpenseId === expense.id}
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              Confirm
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => setConfirmingDeleteId(expense.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
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
          <Alert title="Expense error" tone="danger">
            {error || actionError}
          </Alert>
        </div>
      ) : null}
    </Frame>
  );
}
