import { Suspense } from "react";
import { JoinInvitation } from "@/src/components/invitations/join-invitation";
import { LoadingCard, ThemeToggle } from "@/src/components/ui";

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-background px-4 py-5 text-foreground">
          <div className="mx-auto grid w-full max-w-3xl gap-5">
            <ThemeToggle />
            <LoadingCard />
          </div>
        </main>
      }
    >
      <JoinInvitation />
    </Suspense>
  );
}
