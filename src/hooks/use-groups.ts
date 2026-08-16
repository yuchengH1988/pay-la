"use client";

import { useEffect, useState } from "react";
import { subscribeToUserGroups } from "@/src/services/groups";
import type { Group } from "@/src/types/group";

type GroupsState = {
  userId: string | undefined;
  groups: Group[];
  loading: boolean;
  error: string | null;
};

function getErrorMessage(error: Error) {
  return error.message || "Unable to load groups.";
}

export function useGroups(userId: string | undefined) {
  const [state, setState] = useState<GroupsState>({
    userId,
    groups: [],
    loading: Boolean(userId),
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeToUserGroups(
      userId,
      (groups) => setState({ userId, groups, loading: false, error: null }),
      (error) =>
        setState({
          userId,
          groups: [],
          loading: false,
          error: getErrorMessage(error),
        }),
    );
  }, [userId]);

  if (!userId) {
    return { groups: [], loading: false, error: null };
  }

  if (state.userId !== userId) {
    return { groups: [], loading: true, error: null };
  }

  return {
    groups: state.groups,
    loading: state.loading,
    error: state.error,
  };
}
