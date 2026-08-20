"use client";

import { useEffect, useState } from "react";
import { subscribeToSettlements } from "@/src/services/settlements";
import type { Settlement } from "@/src/types/settlement";

type SettlementsState = {
  groupId: string | null;
  settlements: Settlement[];
  loading: boolean;
  error: string | null;
};

function getErrorMessage(error: Error) {
  return error.message || "Unable to load settlements.";
}

export function useSettlements(groupId: string | null) {
  const [state, setState] = useState<SettlementsState>({
    groupId,
    settlements: [],
    loading: Boolean(groupId),
    error: null,
  });

  useEffect(() => {
    if (!groupId) {
      return;
    }

    return subscribeToSettlements(
      groupId,
      (settlements) =>
        setState({ groupId, settlements, loading: false, error: null }),
      (error) =>
        setState({
          groupId,
          settlements: [],
          loading: false,
          error: getErrorMessage(error),
        }),
    );
  }, [groupId]);

  if (!groupId) {
    return { settlements: [], loading: false, error: null };
  }

  if (state.groupId !== groupId) {
    return { settlements: [], loading: true, error: null };
  }

  return {
    settlements: state.settlements,
    loading: state.loading,
    error: state.error,
  };
}
