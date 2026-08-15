import { Avatar, Frame } from "@/src/components/ui";

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
    <Frame
      shadow="sm"
      className="grid grid-cols-[1fr_auto] items-center gap-3 p-3"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={from} />
        <span className="type-h3">-&gt;</span>
        <Avatar name={to} tone="secondary" />
      </div>
      <p className="type-amount-md">{amount}</p>
    </Frame>
  );
}
