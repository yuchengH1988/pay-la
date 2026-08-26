"use client";

import type { User } from "firebase/auth";
import { useState, type FormEvent } from "react";
import { Button, Dialog, TextInput } from "@/src/components/ui";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import { updateUserProfileName } from "@/src/services/users";

function getProfileName(user: User) {
  return user.displayName || user.email || "Pay La user";
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
  const { profiles } = useUserProfiles([user.uid]);
  const profile = profiles[user.uid];
  const displayName = profile?.shortName || profile?.displayName || getProfileName(user);
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
    } catch (error) {
      onError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" variant="ghost" onClick={openDialog}>
        Profile
      </Button>

      <Dialog
        open={open}
        title="Profile"
        description="Use a short name for group expenses and balances."
        onClose={() => setOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextInput
            label="Short name"
            value={shortName}
            error={fieldError ?? undefined}
            maxLength={32}
            placeholder={getProfileName(user)}
            onChange={(event) => {
              setFieldError(null);
              setShortName(event.target.value);
            }}
          />
          <p className="type-small text-muted">
            Current display: {displayName}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
