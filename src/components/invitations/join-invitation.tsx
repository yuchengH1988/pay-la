"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, Badge, Button, Frame, LoadingCard, ThemeToggle } from "@/src/components/ui";
import { AppHeader } from "@/src/components/layout";
import { useAuth } from "@/src/hooks/use-auth";
import { useInvitation } from "@/src/hooks/use-invitation";
import {
  acceptInvitation,
  isInvitationExpired,
} from "@/src/services/invitations";
import { signInWithGoogle } from "@/src/services/auth";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to accept invitation.";
}

export function JoinInvitation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invitationId = searchParams.get("invitationId");
  const { user, loading: authLoading, error: authError } = useAuth();
  const { invitation, loading: invitationLoading, error: invitationError } =
    useInvitation(user && invitationId ? invitationId : null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<"joined" | "already-member" | null>(null);

  async function handleSignIn() {
    setActionLoading(true);
    setActionError(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAcceptInvitation() {
    if (!invitationId || !user) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const acceptResult = await acceptInvitation(invitationId, user.uid);

      setResult(acceptResult.status);
      router.push(`/groups?groupId=${acceptResult.groupId}`);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  let content;

  if (!invitationId) {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">Invitation missing</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          Open the complete invitation link from a group member.
        </p>
      </Frame>
    );
  } else if (authLoading) {
    content = <LoadingCard />;
  } else if (!user) {
    content = (
      <Frame className="p-5">
        <Badge tone="accent">Authentication required</Badge>
        <h1 className="type-h2 mt-4">Join Pay La group</h1>
        <p className="type-small mt-2 text-muted">
          Continue with Google to keep this invitation and join the group.
        </p>
        <Button
          type="button"
          size="lg"
          loading={actionLoading}
          onClick={handleSignIn}
          className="mt-5 w-full"
        >
          Continue with Google
        </Button>
      </Frame>
    );
  } else if (invitationLoading) {
    content = <LoadingCard />;
  } else if (!invitation) {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">Invitation not found</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          Ask a group member for a fresh invitation link.
        </p>
      </Frame>
    );
  } else if (invitation.status === "used") {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">Already used</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          This invitation was single-use. Ask for a new link.
        </p>
      </Frame>
    );
  } else if (invitation.status === "revoked") {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">Revoked</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          This invitation is no longer active.
        </p>
      </Frame>
    );
  } else if (isInvitationExpired(invitation)) {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">Expired</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          Invitations expire 24 hours after they are created.
        </p>
      </Frame>
    );
  } else {
    content = (
      <Frame className="p-5">
        <Badge tone="accent">Active invitation</Badge>
        <h1 className="type-h2 mt-4">Join group</h1>
        <p className="type-small mt-2 text-muted">
          This link can be used once before it expires.
        </p>
        <Button
          type="button"
          size="lg"
          loading={actionLoading}
          onClick={handleAcceptInvitation}
          className="mt-5 w-full"
        >
          Join Group
        </Button>
      </Frame>
    );
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-3xl content-center gap-5">
        <AppHeader
          bordered={false}
          leading={
            <Link href="/" className="type-h3">
              Pay La
            </Link>
          }
          title=""
          actions={<ThemeToggle />}
        />
        {content}
        {result ? (
          <Alert title="Invitation accepted" tone="success">
            {result === "already-member"
              ? "You were already a member of this group."
              : "You joined the group."}
          </Alert>
        ) : null}
        {authError || invitationError || actionError ? (
          <Alert title="Invitation error" tone="danger">
            {authError || invitationError || actionError}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
