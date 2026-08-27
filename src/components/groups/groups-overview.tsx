"use client";

import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Frame,
  Icon,
  LoadingCard,
} from "@/src/components/ui";
import { PayLaLogo3D } from "@/src/components/brand";
import { AppHeader, SignedInHeaderActions } from "@/src/components/layout";
import { ProfileNameReminder } from "@/src/components/profile/profile-name-reminder";
import { useGroups } from "@/src/hooks/use-groups";
import { useI18n } from "@/src/i18n";
import { createGroup } from "@/src/services/groups";
import { GroupBalancePreview } from "./group-balance-preview";
import { GroupForm } from "./group-form";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function GroupsOverview({ user }: { user: User }) {
  const { t } = useI18n();
  const router = useRouter();
  const { groups, loading, error } = useGroups(user.uid);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  return (
    <main className="min-h-dvh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <AppHeader
          leading={<PayLaLogo3D />}
          eyebrow="Pay La"
          title={t("groups.title")}
          actions={() => (
            <SignedInHeaderActions
              user={user}
              showSignedInLabel
              onError={setActionError}
            />
          )}
        />

        <ProfileNameReminder user={user} onError={setActionError} />

        <section className="grid gap-5">
          <div className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge tone="accent">{t("group.listBadge")}</Badge>
                <p className="type-small mt-3 max-w-xl text-muted">
                  {t("group.listDescription")}
                </p>
              </div>
              <Button
                type="button"
                className="hidden sm:inline-flex"
                onClick={() => setShowCreateForm(true)}
              >
                <Icon name="plus" />
                {t("action.createGroup")}
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
                    <Frame
                      as="article"
                      className="grid min-h-full gap-4 p-4 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="type-h3 truncate">{group.name}</h2>
                          <p className="type-caption mt-2 flex items-center gap-2 text-muted">
                            <Icon name="user" className="size-4" />
                            {t("members.memberCount", {
                              count: group.memberIds.length,
                            })}
                          </p>
                        </div>
                        <Badge tone="muted">{group.currency}</Badge>
                      </div>
                      <Frame surface="surface" shadow="sm" className="p-3">
                        <GroupBalancePreview group={group} currentUserId={user.uid} />
                      </Frame>
                    </Frame>
                  </button>
                ))}
              </div>
            ) : (
              <Frame surface="surface" dashed className="p-6 text-center">
                <div className="poster-grid mx-auto mb-4 size-16 border-[3px] border-border bg-primary" />
                <h2 className="type-h2">{t("group.emptyTitle")}</h2>
                <p className="type-small mx-auto mt-2 max-w-sm text-muted">
                  {t("group.emptyDescription")}
                </p>
                <Button
                  type="button"
                  className="mt-5"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Icon name="plus" />
                  {t("action.createGroup")}
                </Button>
              </Frame>
            )}
          </div>

        </section>

        <Button
          type="button"
          size="lg"
          className="fixed bottom-5 right-4 z-40 sm:hidden"
          onClick={() => setShowCreateForm(true)}
        >
          <Icon name="plus" />
          {t("action.createGroup")}
        </Button>

        <Dialog
          open={showCreateForm}
          title={t("action.createGroup")}
          description={t("group.createDescription")}
          onClose={() => setShowCreateForm(false)}
        >
          <GroupForm
            submitLabel={t("action.createGroup")}
            loading={isCreating}
            onSubmit={handleCreateGroup}
          />
        </Dialog>

        {error || actionError ? (
          <Alert title={t("group.groupsError")} tone="danger">
            {error || actionError}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
