"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Frame,
  ThemeToggle,
} from "@/src/components/ui";
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
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="poster-grid size-12 border-[3px] border-border bg-primary shadow-hard-sm" />
            <div>
              <p className="type-caption text-muted">Shared expense tracker</p>
              <p className="type-h3">Pay La</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid flex-1 items-center gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <Badge tone="accent">MVP Authentication</Badge>
            <h1 className="type-display max-w-3xl">
              Split costs. Settle clearly.
            </h1>
            <p className="type-body max-w-2xl text-muted">
              Create shared expense groups, record costs, and understand who
              owes what without extra financial complexity.
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
                <div>
                  <p className="type-caption text-muted">
                    Continue with Google
                  </p>
                  <h2 className="type-h2 mt-2">Start Pay La</h2>
                </div>
                <p className="type-small text-muted">
                  Google Sign-In is the only authentication method for Pay La
                  MVP.
                </p>
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
