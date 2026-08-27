"use client";

import type { User } from "firebase/auth";
import { useState, type FormEvent } from "react";
import { Button, Dialog, Frame, Icon, TextInput } from "@/src/components/ui";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import { useI18n } from "@/src/i18n";
import { updateUserProfileName } from "@/src/services/users";

function getFallbackName(user: User, fallbackName: string) {
  return user.displayName || user.email || fallbackName;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to update profile.";
}

export function ProfileNameReminder({
  user,
  onError,
}: {
  user: User;
  onError: (message: string | null) => void;
}) {
  const { t } = useI18n();
  const { profiles } = useUserProfiles([user.uid]);
  const profile = profiles[user.uid];
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [shortName, setShortName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!profile || profile.shortName || dismissed) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextShortName = shortName.trim();

    if (!nextShortName) {
      setFieldError(t("profile.nameRequired"));
      return;
    }

    if (nextShortName.length > 32) {
      setFieldError(t("profile.nameLength"));
      return;
    }

    setSaving(true);
    setFieldError(null);
    onError(null);

    try {
      await updateUserProfileName(user.uid, nextShortName);
      setOpen(false);
      setDismissed(true);
    } catch (error) {
      onError(getErrorMessage(error) || t("profile.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Frame surface="secondary" shadow="sm" className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="type-h3">{t("profile.reminderTitle")}</p>
            <p className="type-small mt-2 max-w-xl text-secondary-foreground/80">
              {t("profile.reminderDescription")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShortName(profile.displayName || "");
                setFieldError(null);
                setOpen(true);
              }}
            >
              <Icon name="user" />
              {t("profile.setName")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDismissed(true)}>
              {t("profile.later")}
            </Button>
          </div>
        </div>
      </Frame>

      <Dialog
        open={open}
        title={t("profile.shortName")}
        description={t("profile.shortNameDescription")}
        onClose={() => setOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextInput
            label={t("profile.shortName")}
            value={shortName}
            error={fieldError ?? undefined}
            maxLength={32}
            placeholder={getFallbackName(user, t("profile.defaultName"))}
            onChange={(event) => {
              setFieldError(null);
              setShortName(event.target.value);
            }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t("action.cancel")}
            </Button>
            <Button type="submit" loading={saving}>
              <Icon name="check" />
              {t("profile.saveName")}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
