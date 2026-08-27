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
  Icon,
  LoadingCard,
} from "@/src/components/ui";
import { AppHeader, SignedInHeaderActions } from "@/src/components/layout";
import { useGroup } from "@/src/hooks/use-group";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import { useI18n } from "@/src/i18n";
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
  const { t } = useI18n();
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
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
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
              aria-label={t("action.backToGroups")}
            >
              <Icon name="arrow-left" />
            </Link>
          }
          eyebrow={t("group.workspace")}
          title={loading ? t("common.loading") : group?.name || t("group.titleFallback")}
          showMenuButtonOnDesktop
          actions={(placement) => (
            <SignedInHeaderActions
              user={user}
              layout={placement === "menu" ? "menu" : "inline"}
              onError={setActionError}
            />
          )}
        />

        {loading ? (
          <LoadingCard />
        ) : group ? (
          <section className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
            <div className="hidden min-w-0 md:col-start-2 md:row-start-1 md:block">
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
              className="hidden min-w-0 md:col-start-2 md:row-start-2 md:block md:p-5"
            >
              <div className="mb-3 hidden md:block">
                <p className="type-label">{t("group.actions")}</p>
                <p className="type-caption mt-1 text-muted">
                  {t("group.actionsDescription")}
                </p>
              </div>
              <div className="grid gap-2 md:gap-3">
                <div className="hidden md:block">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() => setIsAddingExpense(true)}
                  >
                    <Icon name="plus" />
                    {t("action.addExpense")}
                  </Button>
                </div>
                <div>
                  <SettlementPanel
                    group={group}
                    currentUserId={user.uid}
                    memberProfiles={profiles}
                    draft={settlementDraft}
                    onDraftConsumed={handleSettlementDraftConsumed}
                    className="w-full bg-secondary text-secondary-foreground"
                  />
                </div>
                <div className="hidden md:block">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsGroupMenuOpen(true)}
                  >
                    <Icon name="settings" />
                    {t("action.groupSettings")}
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

            <div className="fixed inset-x-4 bottom-5 z-40 grid grid-cols-2 gap-2 md:hidden">
              <SettlementPanel
                group={group}
                currentUserId={user.uid}
                memberProfiles={profiles}
                draft={settlementDraft}
                onDraftConsumed={handleSettlementDraftConsumed}
                buttonSize="lg"
                className="w-full bg-secondary px-3 text-secondary-foreground"
              />
              <Button
                type="button"
                size="lg"
                className="w-full px-3"
                onClick={() => setIsAddingExpense(true)}
              >
                <Icon name="plus" />
                {t("action.addExpense")}
              </Button>
            </div>

            <Dialog
              open={isAddingExpense}
              title={t("action.addExpense")}
              onClose={() => setIsAddingExpense(false)}
            >
              <ExpenseForm
                group={group}
                currentUserId={user.uid}
                memberProfiles={profiles}
                submitLabel={t("action.createExpense")}
                loading={isCreatingExpense}
                onSubmit={handleCreateExpense}
                onCancel={() => setIsAddingExpense(false)}
              />
            </Dialog>

            <Dialog
              open={isGroupMenuOpen}
              title={t("action.groupSettings")}
              onClose={() => setIsGroupMenuOpen(false)}
            >
              <div className="grid gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsGroupMenuOpen(false);
                    setIsEditing(true);
                  }}
                >
                  <Icon name="edit" />
                  {t("action.editGroup")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsGroupMenuOpen(false);
                    setIsMembersOpen(true);
                  }}
                >
                  <Icon name="user" />
                  {t("members.title")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsGroupMenuOpen(false);
                    setIsInviteOpen(true);
                  }}
                >
                  <Icon name="link" />
                  {t("action.createInvitation")}
                </Button>
              </div>
            </Dialog>

            <Dialog
              open={isEditing}
              title={t("action.editGroup")}
              description={t("group.settingsDescription")}
              onClose={() => setIsEditing(false)}
            >
              <GroupForm
                key={`${group.id}-${group.name}-${group.currency}`}
                initialValues={{
                  name: group.name,
                  currency: group.currency,
                }}
                submitLabel={t("action.saveGroup")}
                loading={isSaving}
                onSubmit={handleUpdateGroup}
              />
            </Dialog>

            <Dialog
              open={isMembersOpen}
              title={t("members.title")}
              description={t("members.description")}
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
                      <Badge tone="primary">{t("group.created")}</Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            </Dialog>

            <Dialog
              open={isInviteOpen}
              title={t("action.createInvitation")}
              description={t("invitation.description")}
              onClose={() => setIsInviteOpen(false)}
            >
              <InvitationPanel group={group} userId={user.uid} />
            </Dialog>
          </section>
        ) : (
          <Frame surface="surface" dashed className="p-6 text-center">
            <h2 className="type-h2">{t("group.unavailableTitle")}</h2>
            <p className="type-small mx-auto mt-2 max-w-sm text-muted">
              {t("group.unavailableDescription")}
            </p>
            <Link
              href="/"
              className="type-control mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xs border-[3px] border-border bg-primary px-4 py-2 text-primary-foreground shadow-hard-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info"
            >
              <Icon name="arrow-left" />
              {t("action.backToGroups")}
            </Link>
          </Frame>
        )}

        {error || profilesError || settlementsError || actionError ? (
          <Alert title={t("group.error")} tone="danger">
            {error || profilesError || settlementsError || actionError}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
