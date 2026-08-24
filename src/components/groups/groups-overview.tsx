"use client";

import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Dialog,
  Frame,
  LoadingCard,
  ThemeToggle,
} from "@/src/components/ui";
import { PayLaLogo3D } from "@/src/components/brand";
import { useGroups } from "@/src/hooks/use-groups";
import { createGroup } from "@/src/services/groups";
import { signOut } from "@/src/services/auth";
import { GroupForm } from "./group-form";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function GroupsOverview({ user }: { user: User }) {
  const router = useRouter();
  const { groups, loading, error } = useGroups(user.uid);
  const [isCreating, setIsCreating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const displayName = user.displayName || user.email || "Pay La user";

  async function handleCreateGroup(values: { name: string; currency: string }) {
    setIsCreating(true);
    setActionError(null);

    try {
      const groupId = await createGroup(user.uid, values);

      router.push(`/groups?groupId=${groupId}`);
    } catch (createError) {
      setActionError(getErrorMessage(createError));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    setActionError(null);

    try {
      await signOut();
    } catch (signOutError) {
      setActionError(getErrorMessage(signOutError));
      setIsSigningOut(false);
    }
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="flex flex-col gap-4 border-b-[3px] border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <PayLaLogo3D />
            <div>
              <p className="type-caption text-muted">Pay La</p>
              <h1 className="type-h2">Groups</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {user.photoURL ? (
                <div
                  role="img"
                  aria-label={`${displayName} profile image`}
                  className="size-11 rounded-xs border-[3px] border-border bg-muted-surface shadow-hard-sm"
                  style={{
                    backgroundImage: `url(${user.photoURL})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                />
              ) : (
                <Avatar name={displayName} />
              )}
              <div className="min-w-0">
                <p className="type-caption text-muted">Signed in</p>
                <p className="type-small truncate">{displayName}</p>
              </div>
            </div>
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              loading={isSigningOut}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </header>

        <section className="grid gap-5">
          <div className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge tone="accent">Member groups</Badge>
                <p className="type-body mt-3 max-w-xl text-muted">
                  Create a shared expense group and keep the currency as a
                  display label for future expenses.
                </p>
              </div>
              <Button type="button" onClick={() => setShowCreateForm(true)}>
                Create Group
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <LoadingCard />
                <LoadingCard />
              </div>
            ) : groups.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className="text-left"
                    onClick={() => router.push(`/groups?groupId=${group.id}`)}
                  >
                    <Frame as="article" className="p-4 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="type-h3 truncate">{group.name}</h2>
                          <p className="type-caption mt-2 text-muted">
                            {group.memberIds.length}/30 members
                          </p>
                        </div>
                        <Badge tone="muted">{group.currency}</Badge>
                      </div>
                      <p className="type-small text-muted">
                        Open group settings and future expense workspace.
                      </p>
                    </Frame>
                  </button>
                ))}
              </div>
            ) : (
              <Frame surface="surface" dashed className="p-6 text-center">
                <div className="poster-grid mx-auto mb-4 size-16 border-[3px] border-border bg-primary" />
                <h2 className="type-h2">No groups yet</h2>
                <p className="type-small mx-auto mt-2 max-w-sm text-muted">
                  Start with one group for a trip, household, dinner, or shared
                  activity.
                </p>
                <Button
                  type="button"
                  className="mt-5"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Group
                </Button>
              </Frame>
            )}
          </div>

        </section>

        <Dialog
          open={showCreateForm}
          title="Create Group"
          description="The creator is recorded, but all members have the same group permissions."
          onClose={() => setShowCreateForm(false)}
        >
          <GroupForm
            submitLabel="Create Group"
            loading={isCreating}
            onSubmit={handleCreateGroup}
          />
        </Dialog>

        {error || actionError ? (
          <Alert title="Groups error" tone="danger">
            {error || actionError}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
