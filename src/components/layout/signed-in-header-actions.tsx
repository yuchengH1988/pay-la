"use client";

import type { User } from "firebase/auth";
import { useState } from "react";
import { Avatar, Button, ThemeToggle } from "@/src/components/ui";
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
  onError,
}: {
  user: User;
  showSignedInLabel?: boolean;
  onError: (message: string | null) => void;
}) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const displayName = user.displayName || user.email || "Pay La user";

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

  return (
    <>
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
          {showSignedInLabel ? (
            <p className="type-caption text-muted">Signed in</p>
          ) : null}
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
    </>
  );
}
