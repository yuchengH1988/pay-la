"use client";

import { useEffect, useState } from "react";
import { subscribeToInvitation } from "@/src/services/invitations";
import type { Invitation } from "@/src/types/invitation";

type InvitationState = {
  invitationId: string | null;
  invitation: Invitation | null;
  loading: boolean;
  error: string | null;
};

function getErrorMessage(error: Error) {
  return error.message || "Unable to load invitation.";
}

export function useInvitation(invitationId: string | null) {
  const [state, setState] = useState<InvitationState>({
    invitationId,
    invitation: null,
    loading: Boolean(invitationId),
    error: null,
  });

  useEffect(() => {
    if (!invitationId) {
      return;
    }

    return subscribeToInvitation(
      invitationId,
      (invitation) =>
        setState({ invitationId, invitation, loading: false, error: null }),
      (error) =>
        setState({
          invitationId,
          invitation: null,
          loading: false,
          error: getErrorMessage(error),
        }),
    );
  }, [invitationId]);

  if (!invitationId) {
    return { invitation: null, loading: false, error: null };
  }

  if (state.invitationId !== invitationId) {
    return { invitation: null, loading: true, error: null };
  }

  return {
    invitation: state.invitation,
    loading: state.loading,
    error: state.error,
  };
}
