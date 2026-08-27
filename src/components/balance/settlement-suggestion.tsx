import { Avatar, Button, Frame, Icon } from "@/src/components/ui";

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
    <Frame shadow="sm" className="grid min-w-0 gap-3 p-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={from} />
          <Icon name="arrow-left" className="size-5 shrink-0 rotate-180" />
          <Avatar name={to} tone="secondary" />
        </div>
        <p className="type-amount-sm min-w-0 break-words text-right">{amount}</p>
      </div>
      <div className="grid min-w-0">
        {onAction ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={onAction}
          >
            <Icon name="wallet" className="size-4" />
            {actionLabel ?? "Settle"}
          </Button>
        ) : null}
      </div>
    </Frame>
  );
}
