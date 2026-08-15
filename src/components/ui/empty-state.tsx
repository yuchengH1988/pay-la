import { Button } from "./button";

export function EmptyState() {
  return (
    <div className="rounded-xs border-[3px] border-dashed border-border bg-surface p-6 text-center">
      <div className="poster-grid mx-auto mb-4 size-16 border-[3px] border-border bg-primary" />
      <h3 className="type-h2">
        No expenses yet
      </h3>
      <p className="type-small mx-auto mt-2 max-w-xs text-muted">
        Add the first shared cost when the table starts ordering.
      </p>
      <Button className="mt-5">+ Add expense</Button>
    </div>
  );
}
