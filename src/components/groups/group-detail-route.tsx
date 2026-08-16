"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Frame, ThemeToggle } from "@/src/components/ui";
import { useAuth } from "@/src/hooks/use-auth";
import { AuthEntry } from "@/src/components/auth/auth-entry";
import { GroupDetail } from "./group-detail";

export function GroupDetailRoute() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-dvh bg-background px-4 py-5 text-foreground">
        <div className="mx-auto grid w-full max-w-3xl gap-5">
          <ThemeToggle />
          <Frame className="p-5">
            <p className="type-h2">Checking session</p>
            <div className="mt-4 h-14 animate-pulse border-[3px] border-border bg-muted-surface" />
          </Frame>
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthEntry />;
  }

  if (!groupId) {
    return (
      <main className="min-h-dvh bg-background px-4 py-5 text-foreground">
        <div className="mx-auto grid w-full max-w-3xl gap-5">
          <ThemeToggle />
          <Frame surface="surface" dashed className="p-6 text-center">
            <h1 className="type-h2">Choose a group</h1>
            <p className="type-small mx-auto mt-2 max-w-sm text-muted">
              Open a group from your groups overview.
            </p>
            <Link
              href="/"
              className="type-control mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xs border-[3px] border-border bg-primary px-4 py-2 text-primary-foreground shadow-hard-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info"
            >
              Back to Groups
            </Link>
          </Frame>
        </div>
      </main>
    );
  }

  return <GroupDetail groupId={groupId} user={user} />;
}
