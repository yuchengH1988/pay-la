"use client";

import { useEffect, useState } from "react";
import { subscribeToGroup } from "@/src/services/groups";
import type { Group } from "@/src/types/group";

type GroupState = {
  groupId: string | null;
  group: Group | null;
  loading: boolean;
  error: string | null;
};

function getErrorMessage(error: Error) {
  return error.message || "Unable to load group.";
}

export function useGroup(groupId: string | null) {
  const [state, setState] = useState<GroupState>({
    groupId,
    group: null,
    loading: Boolean(groupId),
    error: null,
  });

  useEffect(() => {
    if (!groupId) {
      return;
    }

    return subscribeToGroup(
      groupId,
      (group) => setState({ groupId, group, loading: false, error: null }),
      (error) =>
        setState({
          groupId,
          group: null,
          loading: false,
          error: getErrorMessage(error),
        }),
    );
  }, [groupId]);

  if (!groupId) {
    return { group: null, loading: false, error: null };
  }

  if (state.groupId !== groupId) {
    return { group: null, loading: true, error: null };
  }

  return {
    group: state.group,
    loading: state.loading,
    error: state.error,
  };
}
