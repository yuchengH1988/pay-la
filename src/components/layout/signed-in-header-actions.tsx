"use client";

import type { User } from "firebase/auth";
import { useState } from "react";
import { Avatar, Button, Frame, Icon, ThemeToggle } from "@/src/components/ui";
import { LanguageSwitcher } from "@/src/components/i18n";
import { ProfileSettings } from "@/src/components/profile/profile-settings";
import { useUserProfiles } from "@/src/hooks/use-user-profiles";
import { useI18n } from "@/src/i18n";
import { signOut } from "@/src/services/auth";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function SignedInHeaderActions({
  user,
  showSignedInLabel = false,
  layout = "inline",
  onError,
}: {
  user: User;
  showSignedInLabel?: boolean;
  layout?: "inline" | "menu";
  onError: (message: string | null) => void;
}) {
  const { t } = useI18n();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { profiles } = useUserProfiles([user.uid]);
  const profile = profiles[user.uid];
  const displayName =
    profile?.shortName ||
    profile?.displayName ||
    user.displayName ||
    user.email ||
    t("profile.defaultName");

  async function handleSignOut() {
    setIsSigningOut(true);
    onError(null);

    try {
      await signOut();
    } catch (signOutError) {
      onError(getErrorMessage(signOutError));
      setIsSigningOut(false);
    }
  }

  const identity = (
    <div className="flex min-w-0 items-center gap-2">
      {user.photoURL ? (
        <div
          role="img"
          aria-label={t("profile.imageAlt", { name: displayName })}
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
        {showSignedInLabel ? (
          <p className="type-caption text-muted">{t("profile.signedIn")}</p>
        ) : null}
        <p className="type-small truncate">{displayName}</p>
      </div>
    </div>
  );

  if (layout === "menu") {
    return (
      <div className="grid gap-3">
        <Frame surface="surface" shadow="sm" className="p-3">
          {identity}
        </Frame>
        <div className="grid gap-3 sm:grid-cols-2">
          <LanguageSwitcher fullWidth />
          <ThemeToggle className="w-full justify-start" />
        </div>
        <ProfileSettings user={user} onError={onError} className="w-full" />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          loading={isSigningOut}
          onClick={handleSignOut}
        >
          <Icon name="arrow-left" />
          {t("action.signOut")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <LanguageSwitcher />
      <ThemeToggle />
    </>
  );
}
