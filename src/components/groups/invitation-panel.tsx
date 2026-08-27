"use client";

import { useMemo, useState } from "react";
import { Alert, Badge, Button, Frame, Icon } from "@/src/components/ui";
import { useI18n } from "@/src/i18n";
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
  const { t } = useI18n();
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
      setError(t("invitation.copyFailed"));
    }
  }

  return (
    <Frame as="section" className="p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-h3">{t("invitation.title")}</h2>
          <p className="type-small mt-2 text-muted">
            {t("invitation.description")}
          </p>
        </div>
        <Badge tone={isFull ? "danger" : "accent"}>
          {group.memberIds.length}/30
        </Badge>
      </div>

      {isFull ? (
        <Alert title={t("invitation.fullTitle")} tone="warning">
          {t("invitation.fullDescription")}
        </Alert>
      ) : invitationId ? (
        <div className="grid gap-3">
          <div className="border-[3px] border-border bg-background p-3 shadow-hard-sm">
            <p className="type-caption mb-2 text-muted">{t("invitation.link")}</p>
            <code className="type-small block break-all">{invitationUrl}</code>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={handleCopyInvitation}>
              <Icon name={copied ? "check" : "copy"} />
              {copied ? t("action.copied") : t("action.copyLink")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={isCreating}
              onClick={handleCreateInvitation}
            >
              <Icon name="link" />
              {t("action.newLink")}
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
          <Icon name="link" />
          {t("action.createInvitation")}
        </Button>
      )}

      {error ? (
        <div className="mt-4">
          <Alert title={t("invitation.error")} tone="danger">
            {error}
          </Alert>
        </div>
      ) : null}
    </Frame>
  );
}
