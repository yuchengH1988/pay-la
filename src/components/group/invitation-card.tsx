import { Badge, Button } from "@/src/components/ui";

export function InvitationCard() {
  return (
    <article className="rounded-xs border-[3px] border-border bg-surface-raised p-4 shadow-hard">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="type-h2">
          Invite link
        </h3>
        <Badge tone="accent">Valid</Badge>
      </div>
      <div className="flex items-center gap-2 border-[3px] border-border bg-background p-2">
        <code className="type-caption min-w-0 flex-1 truncate">
          payla.app/join/japan-trip
        </code>
        <Button className="min-h-9 px-3 text-sm">Copy</Button>
      </div>
    </article>
  );
}
