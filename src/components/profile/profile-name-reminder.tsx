"use client";

import type { User } from "firebase/auth";
import { useState, type FormEvent } from "react";
import { Button, Dialog, Frame, Icon, TextInput } from "@/src/components/ui";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import { updateUserProfileName } from "@/src/services/users";

function getFallbackName(user: User) {
  return user.displayName || user.email || "Pay La user";
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
      setFieldError("Name is required.");
      return;
    }

    if (nextShortName.length > 32) {
      setFieldError("Keep the name under 32 characters.");
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
      onError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Frame surface="secondary" shadow="sm" className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="type-h3">Set a short name</p>
            <p className="type-small mt-2 max-w-xl text-secondary-foreground/80">
              Use a cleaner name in expenses, balances, and group history.
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
              Set Name
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDismissed(true)}>
              Later
            </Button>
          </div>
        </div>
      </Frame>

      <Dialog
        open={open}
        title="Short Name"
        description="This name is only used inside Pay La."
        onClose={() => setOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextInput
            label="Short name"
            value={shortName}
            error={fieldError ?? undefined}
            maxLength={32}
            placeholder={getFallbackName(user)}
            onChange={(event) => {
              setFieldError(null);
              setShortName(event.target.value);
            }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Icon name="check" />
              Save Name
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
