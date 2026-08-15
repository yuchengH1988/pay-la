import { Avatar } from "@/src/components/ui";

export function SettlementSuggestion({
  from,
  to,
  amount,
}: {
  from: string;
  to: string;
  amount: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xs border-[3px] border-border bg-surface-raised p-3 shadow-hard-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={from} />
        <span className="type-h3">-&gt;</span>
        <Avatar name={to} hot />
      </div>
      <p className="type-amount-md">{amount}</p>
    </div>
  );
}
