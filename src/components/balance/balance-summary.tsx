import { Frame } from "@/src/components/ui";

export function BalanceSummary() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Frame surface="secondary" className="p-4">
        <p className="type-label">You owe</p>
        <p className="type-amount-lg">¥6,950</p>
      </Frame>
      <Frame surface="primary" className="p-4">
        <p className="type-label">You are owed</p>
        <p className="type-amount-lg">¥8,400</p>
      </Frame>
    </div>
  );
}
