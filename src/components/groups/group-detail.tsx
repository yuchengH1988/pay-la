"use client";

import Link from "next/link";
import type { User } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Frame,
  LoadingCard,
  ThemeToggle,
} from "@/src/components/ui";
import { useGroup } from "@/src/hooks/use-group";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import { updateGroup } from "@/src/services/groups";
import { signOut } from "@/src/services/auth";
import { CreateExpensePanel, ExpenseHistory } from "@/src/components/expenses";
import { formatMemberLabel } from "@/src/utils/member-label";
import { GroupForm } from "./group-form";
import { InvitationPanel } from "./invitation-panel";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function GroupDetail({
  groupId,
  user,
}: {
  groupId: string;
  user: User;
}) {
  const { group, loading, error } = useGroup(groupId);
  const { profiles, error: profilesError } = useUserProfiles(group?.memberIds ?? []);
  const [isEditing, setIsEditing] = useState(false);
  const [expenseHistoryVersion, setExpenseHistoryVersion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const displayName = user.displayName || user.email || "Pay La user";

  async function handleUpdateGroup(values: { name: string; currency: string }) {
    setIsSaving(true);
    setActionError(null);

    try {
      await updateGroup(groupId, values);
      setIsEditing(false);
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setIsSaving(false);
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
            <Link
              href="/"
              className="type-control grid size-12 place-items-center border-[3px] border-border bg-primary text-primary-foreground shadow-hard-sm"
              aria-label="Back to groups"
            >
              ←
            </Link>
            <div>
              <p className="type-caption text-muted">Group workspace</p>
              <h1 className="type-h2">{loading ? "Loading" : group?.name || "Group"}</h1>
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
              <p className="type-small truncate">{displayName}</p>
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

        {loading ? (
          <LoadingCard />
        ) : group ? (
          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-5">
              <Frame as="section" className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Badge tone="muted">{group.currency}</Badge>
                    <h2 className="type-display mt-4">{group.name}</h2>
                    <p className="type-caption mt-3 text-muted">
                      {group.memberIds.length}/30 members
                    </p>
                  </div>
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Group
                  </Button>
                </div>
              </Frame>

              <CreateExpensePanel
                group={group}
                currentUserId={user.uid}
                memberProfiles={profiles}
                onCreated={() =>
                  setExpenseHistoryVersion((currentVersion) => currentVersion + 1)
                }
              />

              <ExpenseHistory
                key={expenseHistoryVersion}
                group={group}
                currentUserId={user.uid}
                memberProfiles={profiles}
              />
            </div>

            <div className="grid content-start gap-5">
              <Frame as="section" className="p-5">
                <h2 className="type-h3">Members</h2>
                <p className="type-small mt-2 text-muted">
                  All current members have the same group permissions.
                </p>
                <div className="mt-5 grid gap-3">
                  {group.memberIds.map((memberId) => (
                    <div
                      key={memberId}
                      className="flex items-center justify-between gap-3 border-[3px] border-border bg-surface-raised p-3 shadow-hard-sm"
                    >
                      <span className="type-small min-w-0 truncate">
                        {formatMemberLabel(memberId, user.uid, profiles)}
                      </span>
                      {memberId === group.createdBy ? (
                        <Badge tone="primary">Created</Badge>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Frame>

              <InvitationPanel group={group} userId={user.uid} />

              {isEditing ? (
                <Frame as="section" className="p-5">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="type-h3">Edit Group</h2>
                      <p className="type-small mt-2 text-muted">
                        Currency changes only update the label.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <GroupForm
                    key={`${group.id}-${group.name}-${group.currency}`}
                    initialValues={{
                      name: group.name,
                      currency: group.currency,
                    }}
                    submitLabel="Save Group"
                    loading={isSaving}
                    onSubmit={handleUpdateGroup}
                  />
                </Frame>
              ) : null}
            </div>
          </section>
        ) : (
          <Frame surface="surface" dashed className="p-6 text-center">
            <h2 className="type-h2">Group unavailable</h2>
            <p className="type-small mx-auto mt-2 max-w-sm text-muted">
              This group does not exist or your account is not a member.
            </p>
            <Link
              href="/"
              className="type-control mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xs border-[3px] border-border bg-primary px-4 py-2 text-primary-foreground shadow-hard-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info"
            >
              Back to Groups
            </Link>
          </Frame>
        )}

        {error || profilesError || actionError ? (
          <Alert title="Group error" tone="danger">
            {error || profilesError || actionError}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
