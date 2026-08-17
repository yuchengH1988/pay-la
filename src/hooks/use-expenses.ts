"use client";

import { useEffect, useState } from "react";
import { subscribeToExpenses } from "@/src/services/expenses";
import type { Expense } from "@/src/types/expense";

type ExpensesState = {
  groupId: string | null;
  expenses: Expense[];
  loading: boolean;
  error: string | null;
};

function getErrorMessage(error: Error) {
  return error.message || "Unable to load expenses.";
}

export function useExpenses(groupId: string | null) {
  const [state, setState] = useState<ExpensesState>({
    groupId,
    expenses: [],
    loading: Boolean(groupId),
    error: null,
  });

  useEffect(() => {
    if (!groupId) {
      return;
    }

    return subscribeToExpenses(
      groupId,
      (expenses) => setState({ groupId, expenses, loading: false, error: null }),
      (error) =>
        setState({
          groupId,
          expenses: [],
          loading: false,
          error: getErrorMessage(error),
        }),
    );
  }, [groupId]);

  if (!groupId) {
    return { expenses: [], loading: false, error: null };
  }

  if (state.groupId !== groupId) {
    return { expenses: [], loading: true, error: null };
  }

  return {
    expenses: state.expenses,
    loading: state.loading,
    error: state.error,
  };
}
