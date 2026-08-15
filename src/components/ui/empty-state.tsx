import { Button } from "./button";
import { Frame } from "./frame";

export function EmptyState() {
  return (
    <Frame surface="surface" dashed className="p-6 text-center">
      <div className="poster-grid mx-auto mb-4 size-16 border-[3px] border-border bg-primary" />
      <h3 className="type-h2">
        No expenses yet
      </h3>
      <p className="type-small mx-auto mt-2 max-w-xs text-muted">
        Add the first shared cost when the table starts ordering.
      </p>
      <Button className="mt-5">+ Add expense</Button>
    </Frame>
  );
}
