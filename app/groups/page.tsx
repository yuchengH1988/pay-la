import { Suspense } from "react";
import { LoadingCard, ThemeToggle } from "@/src/components/ui";
import { GroupDetailRoute } from "@/src/components/groups/group-detail-route";

export default function GroupsPage() {
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
      <GroupDetailRoute />
    </Suspense>
  );
}
