export function BalanceSummary() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xs border-[3px] border-border bg-secondary p-4 text-secondary-foreground shadow-hard">
        <p className="type-label">You owe</p>
        <p className="type-amount-lg">¥6,950</p>
      </div>
      <div className="rounded-xs border-[3px] border-border bg-primary p-4 text-primary-foreground shadow-hard">
        <p className="type-label">You are owed</p>
        <p className="type-amount-lg">¥8,400</p>
      </div>
    </div>
  );
}
