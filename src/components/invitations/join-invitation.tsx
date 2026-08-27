"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, Badge, Button, Frame, LoadingCard, ThemeToggle } from "@/src/components/ui";
import { LanguageSwitcher } from "@/src/components/i18n";
import { AppHeader } from "@/src/components/layout";
import { useAuth } from "@/src/hooks/use-auth";
import { useInvitation } from "@/src/hooks/use-invitation";
import { useI18n } from "@/src/i18n";
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
  const { t } = useI18n();
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
        <h1 className="type-h2">{t("invitation.missingTitle")}</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          {t("invitation.missingDescription")}
        </p>
      </Frame>
    );
  } else if (authLoading) {
    content = <LoadingCard />;
  } else if (!user) {
    content = (
      <Frame className="p-5">
        <Badge tone="accent">{t("invitation.authRequired")}</Badge>
        <h1 className="type-h2 mt-4">{t("invitation.joinTitle")}</h1>
        <p className="type-small mt-2 text-muted">
          {t("invitation.joinDescription")}
        </p>
        <Button
          type="button"
          size="lg"
          loading={actionLoading}
          onClick={handleSignIn}
          className="mt-5 w-full"
        >
          {t("action.continueWithGoogle")}
        </Button>
      </Frame>
    );
  } else if (invitationLoading) {
    content = <LoadingCard />;
  } else if (!invitation) {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">{t("invitation.notFoundTitle")}</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          {t("invitation.notFoundDescription")}
        </p>
      </Frame>
    );
  } else if (invitation.status === "used") {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">{t("invitation.alreadyUsedTitle")}</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          {t("invitation.alreadyUsedDescription")}
        </p>
      </Frame>
    );
  } else if (invitation.status === "revoked") {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">{t("invitation.revokedTitle")}</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          {t("invitation.revokedDescription")}
        </p>
      </Frame>
    );
  } else if (isInvitationExpired(invitation)) {
    content = (
      <Frame surface="surface" dashed className="p-6 text-center">
        <h1 className="type-h2">{t("invitation.expiredTitle")}</h1>
        <p className="type-small mx-auto mt-2 max-w-sm text-muted">
          {t("invitation.expiredDescription")}
        </p>
      </Frame>
    );
  } else {
    content = (
      <Frame className="p-5">
        <Badge tone="accent">{t("invitation.active")}</Badge>
        <h1 className="type-h2 mt-4">{t("action.joinGroup")}</h1>
        <p className="type-small mt-2 text-muted">
          {t("invitation.activeDescription")}
        </p>
        <Button
          type="button"
          size="lg"
          loading={actionLoading}
          onClick={handleAcceptInvitation}
          className="mt-5 w-full"
        >
          {t("action.joinGroup")}
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
              {t("brand.name")}
            </Link>
          }
          title=""
          actions={(placement) => (
            <>
              <LanguageSwitcher fullWidth={placement === "menu"} />
              <ThemeToggle
                className={placement === "menu" ? "w-full justify-start" : undefined}
              />
            </>
          )}
        />
        {content}
        {result ? (
          <Alert title={t("invitation.accepted")} tone="success">
            {result === "already-member"
              ? t("invitation.alreadyMember")
              : t("invitation.joined")}
          </Alert>
        ) : null}
        {authError || invitationError || actionError ? (
          <Alert title={t("invitation.error")} tone="danger">
            {authError || invitationError || actionError}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
