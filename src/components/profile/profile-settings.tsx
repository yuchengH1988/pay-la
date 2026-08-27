"use client";

import type { User } from "firebase/auth";
import { useState, type FormEvent } from "react";
import { Button, Dialog, Icon, TextInput } from "@/src/components/ui";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import { useI18n } from "@/src/i18n";
import { updateUserProfileName } from "@/src/services/users";

function getProfileName(user: User, fallbackName: string) {
  return user.displayName || user.email || fallbackName;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to update profile.";
}

export function ProfileSettings({
  user,
  onError,
}: {
  user: User;
  onError: (message: string | null) => void;
}) {
  const { t } = useI18n();
  const { profiles } = useUserProfiles([user.uid]);
  const profile = profiles[user.uid];
  const displayName =
    profile?.shortName ||
    profile?.displayName ||
    getProfileName(user, t("profile.defaultName"));
  const [open, setOpen] = useState(false);
  const [shortName, setShortName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openDialog() {
    setShortName(profile?.shortName || "");
    setFieldError(null);
    onError(null);
    setOpen(true);
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
    } catch (error) {
      onError(getErrorMessage(error) || t("profile.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" variant="ghost" onClick={openDialog}>
        <Icon name="user" />
        {t("profile.title")}
      </Button>

      <Dialog
        open={open}
        title={t("profile.title")}
        description={t("profile.settingsDescription")}
        onClose={() => setOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextInput
            label={t("profile.shortName")}
            value={shortName}
            error={fieldError ?? undefined}
            maxLength={32}
            placeholder={getProfileName(user, t("profile.defaultName"))}
            onChange={(event) => {
              setFieldError(null);
              setShortName(event.target.value);
            }}
          />
          <p className="type-small text-muted">
            {t("profile.currentDisplay", { name: displayName })}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t("action.cancel")}
            </Button>
            <Button type="submit" loading={saving}>
              <Icon name="check" />
              {t("profile.saveProfile")}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
