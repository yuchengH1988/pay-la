import { Avatar, Button, Frame } from "@/src/components/ui";

export function SettlementSuggestion({
  from,
  to,
  amount,
  actionLabel,
  onAction,
}: {
  from: string;
  to: string;
  amount: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Frame
      shadow="sm"
      className="grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={from} />
        <span className="type-h3">-&gt;</span>
        <Avatar name={to} tone="secondary" />
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="type-amount-md">{amount}</p>
        {onAction ? (
          <Button type="button" size="sm" variant="secondary" onClick={onAction}>
            {actionLabel ?? "Settle"}
          </Button>
        ) : null}
      </div>
    </Frame>
  );
}
