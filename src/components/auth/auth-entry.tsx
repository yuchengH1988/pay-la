"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Frame,
  ThemeToggle,
} from "@/src/components/ui";
import { PayLaLogo3D } from "@/src/components/brand";
import { AppHeader } from "@/src/components/layout";
import { GroupsOverview } from "@/src/components/groups/groups-overview";
import { useAuth } from "@/src/hooks/use-auth";
import { signInWithGoogle } from "@/src/services/auth";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function AuthEntry() {
  const { user, loading, error: authError } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  if (user) {
    return <GroupsOverview user={user} />;
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl flex-col gap-6">
        <AppHeader
          bordered={false}
          leading={<PayLaLogo3D />}
          eyebrow="Shared expense tracker"
          title="Pay La"
          actions={<ThemeToggle />}
        />

        <section className="grid flex-1 items-center gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <Badge tone="accent">Shared expenses, settled fast</Badge>
            <h1 className="type-display lg:max-w-3xl">
              Split co$ts. Settle clearly.
            </h1>
            <p className="type-small max-w-2xl text-muted">
              Track group spending in seconds, split each cost your way,
              <br/>
              and turn messy paybacks into clear next steps.
            </p>
          </div>

          <Frame as="section" className="p-5 sm:p-6">
            {loading ? (
              <div className="space-y-4" aria-live="polite">
                <p className="type-h2">Checking session</p>
                <div className="h-14 animate-pulse border-[3px] border-border bg-muted-surface" />
                <div className="h-11 w-3/4 animate-pulse border-[3px] border-border bg-muted-surface" />
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="type-h2">Start Pay La</h2>
                <Button
                  type="button"
                  size="lg"
                  loading={actionLoading}
                  onClick={handleSignIn}
                  className="w-full"
                >
                  Continue with Google
                </Button>
              </div>
            )}
          </Frame>
        </section>

        {authError || actionError ? (
          <Alert title="Authentication error" tone="danger">
            {authError || actionError}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
