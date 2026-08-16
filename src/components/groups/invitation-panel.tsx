"use client";

import { useMemo, useState } from "react";
import { Alert, Badge, Button, Frame } from "@/src/components/ui";
import { createInvitation } from "@/src/services/invitations";
import type { Group } from "@/src/types/group";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create invitation.";
}

function buildInvitationUrl(invitationId: string) {
  if (typeof window === "undefined") {
    return `/join?invitationId=${invitationId}`;
  }

  return `${window.location.origin}/join?invitationId=${invitationId}`;
}

export function InvitationPanel({
  group,
  userId,
}: {
  group: Group;
  userId: string;
}) {
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFull = group.memberIds.length >= 30;
  const invitationUrl = useMemo(
    () => (invitationId ? buildInvitationUrl(invitationId) : ""),
    [invitationId],
  );

  async function handleCreateInvitation() {
    setIsCreating(true);
    setCopied(false);
    setError(null);

    try {
      const nextInvitationId = await createInvitation(group, userId);

      setInvitationId(nextInvitationId);
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopyInvitation() {
    if (!invitationUrl) {
      return;
    }

    try {
      await window.navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
    } catch {
      setError("Copy failed. Select and copy the link manually.");
    }
  }

  return (
    <Frame as="section" className="p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-h3">Invite</h2>
          <p className="type-small mt-2 text-muted">
            Invitations are single-use and expire after 24 hours.
          </p>
        </div>
        <Badge tone={isFull ? "danger" : "accent"}>
          {group.memberIds.length}/30
        </Badge>
      </div>

      {isFull ? (
        <Alert title="Group full" tone="warning">
          This group already has 30 members.
        </Alert>
      ) : invitationId ? (
        <div className="grid gap-3">
          <div className="border-[3px] border-border bg-background p-3 shadow-hard-sm">
            <p className="type-caption mb-2 text-muted">Invitation link</p>
            <code className="type-small block break-all">{invitationUrl}</code>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={handleCopyInvitation}>
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={isCreating}
              onClick={handleCreateInvitation}
            >
              New Link
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          loading={isCreating}
          onClick={handleCreateInvitation}
          className="w-full"
        >
          Create Invitation
        </Button>
      )}

      {error ? (
        <div className="mt-4">
          <Alert title="Invitation error" tone="danger">
            {error}
          </Alert>
        </div>
      ) : null}
    </Frame>
  );
}
