"use client";

import Link from "next/link";
import type { User } from "firebase/auth";
import { useCallback, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Frame,
  LoadingCard,
} from "@/src/components/ui";
import { AppHeader, SignedInHeaderActions } from "@/src/components/layout";
import { useGroup } from "@/src/hooks/use-group";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import { updateGroup } from "@/src/services/groups";
import { ExpenseHistory } from "@/src/components/expenses";
import { ExpenseForm } from "@/src/components/expenses/expense-form";
import { GroupBalancePanel } from "@/src/components/balance";
import { useExpenses } from "@/src/hooks/use-expenses";
import { useSettlements } from "@/src/hooks/use-settlements";
import { SettlementPanel } from "@/src/components/settlements";
import { createExpense } from "@/src/services/expenses";
import type { ExpenseFormValues } from "@/src/types/expense";
import type { SettlementFormValues } from "@/src/types/settlement";
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
  const {
    expenses,
    loading: expensesLoading,
    error: expensesError,
  } = useExpenses(group?.id ?? null);
  const {
    settlements,
    error: settlementsError,
  } = useSettlements(group?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [settlementDraft, setSettlementDraft] =
    useState<SettlementFormValues | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  async function handleCreateExpense(values: ExpenseFormValues) {
    if (!group) {
      return;
    }

    setIsCreatingExpense(true);
    setActionError(null);

    try {
      await createExpense(group.id, user.uid, values);
      setIsAddingExpense(false);
    } catch (createError) {
      setActionError(getErrorMessage(createError));
    } finally {
      setIsCreatingExpense(false);
    }
  }

  const handleSettlementDraftConsumed = useCallback(() => {
    setSettlementDraft(null);
  }, []);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <AppHeader
          leading={
            <Link
              href="/"
              className="type-control grid size-12 place-items-center border-[3px] border-border bg-primary text-primary-foreground shadow-hard-sm"
              aria-label="Back to groups"
            >
              ←
            </Link>
          }
          eyebrow="Group workspace"
          title={loading ? "Loading" : group?.name || "Group"}
          actions={() => (
            <SignedInHeaderActions user={user} onError={setActionError} />
          )}
        />

        {loading ? (
          <LoadingCard />
        ) : group ? (
          <section className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
            <div className="min-w-0 md:col-start-2 md:row-start-1">
              <GroupBalancePanel
                group={group}
                currentUserId={user.uid}
                memberProfiles={profiles}
                expenses={expenses}
                settlements={settlements}
                onSettleUp={(values) => setSettlementDraft(values)}
              />
            </div>

            <Frame
              as="section"
              className="min-w-0 p-3 md:col-start-2 md:row-start-2 md:p-5"
            >
              <div className="max-w-full overflow-x-auto pb-1 md:overflow-visible md:pb-0">
                <div className="flex w-max max-w-none gap-3 pr-1 md:grid md:w-full md:max-w-full md:pr-0">
                <Button
                  type="button"
                  className="shrink-0 md:w-full"
                  onClick={() => setIsAddingExpense(true)}
                >
                  Add Expense
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 md:w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Group
                </Button>
                <SettlementPanel
                  group={group}
                  currentUserId={user.uid}
                  memberProfiles={profiles}
                  draft={settlementDraft}
                  onDraftConsumed={handleSettlementDraftConsumed}
                  className="shrink-0 md:w-full"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="shrink-0 md:w-full"
                  onClick={() => setIsMembersOpen(true)}
                >
                  Members
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="shrink-0 md:w-full"
                  onClick={() => setIsInviteOpen(true)}
                >
                  Create Invitation
                </Button>
                </div>
              </div>
            </Frame>

            <div className="grid min-w-0 gap-5 md:col-start-1 md:row-span-3 md:row-start-1">
              <ExpenseHistory
                group={group}
                currentUserId={user.uid}
                memberProfiles={profiles}
                expenses={expenses}
                settlements={settlements}
                loading={expensesLoading}
                error={expensesError}
              />
            </div>

            <Button
              type="button"
              size="lg"
              className="fixed bottom-5 right-4 z-40 md:hidden"
              onClick={() => setIsAddingExpense(true)}
            >
              Add Expense
            </Button>

            <Dialog
              open={isAddingExpense}
              title="Add Expense"
              onClose={() => setIsAddingExpense(false)}
            >
              <ExpenseForm
                group={group}
                currentUserId={user.uid}
                memberProfiles={profiles}
                submitLabel="Create Expense"
                loading={isCreatingExpense}
                onSubmit={handleCreateExpense}
                onCancel={() => setIsAddingExpense(false)}
              />
            </Dialog>

            <Dialog
              open={isEditing}
              title="Edit Group"
              description="Currency changes only update the label."
              onClose={() => setIsEditing(false)}
            >
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
            </Dialog>

            <Dialog
              open={isMembersOpen}
              title="Members"
              description="All current members have the same group permissions."
              onClose={() => setIsMembersOpen(false)}
            >
              <div className="grid gap-3">
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
            </Dialog>

            <Dialog
              open={isInviteOpen}
              title="Create Invitation"
              description="Invitations are single-use and expire after 24 hours."
              onClose={() => setIsInviteOpen(false)}
            >
              <InvitationPanel group={group} userId={user.uid} />
            </Dialog>
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

        {error || profilesError || settlementsError || actionError ? (
          <Alert title="Group error" tone="danger">
            {error || profilesError || settlementsError || actionError}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
