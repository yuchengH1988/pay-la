import { Frame } from "@/src/components/ui";

type BalanceEmphasis = "settled" | "owes" | "owed" | "mixed";

export function BalanceSummary({
  owesAmount = "¥6,950",
  isOwedAmount = "¥8,400",
  emphasis = "mixed",
}: {
  owesAmount?: string;
  isOwedAmount?: string;
  emphasis?: BalanceEmphasis;
}) {
  if (emphasis === "settled") {
    return (
      <Frame surface="surface" dashed className="min-w-0 p-4 text-center">
        <p className="type-label text-muted">Balance</p>
        <p className="type-amount-md mt-2 break-words">All settled</p>
      </Frame>
    );
  }

  if (emphasis === "mixed") {
    return (
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <Frame surface="secondary" className="min-w-0 p-4">
          <p className="type-label">You owe</p>
          <p className="type-amount-md mt-2 break-words sm:text-4xl">
            {owesAmount}
          </p>
        </Frame>
        <Frame surface="primary" className="min-w-0 p-4">
          <p className="type-label">You are owed</p>
          <p className="type-amount-md mt-2 break-words sm:text-4xl">
            {isOwedAmount}
          </p>
        </Frame>
      </div>
    );
  }

  const primaryLabel = emphasis === "owes" ? "You owe" : "You are owed";
  const primaryAmount = emphasis === "owes" ? owesAmount : isOwedAmount;
  const secondaryLabel = emphasis === "owes" ? "You are owed" : "You owe";
  const secondaryAmount = emphasis === "owes" ? isOwedAmount : owesAmount;

  return (
    <div className="grid min-w-0 gap-3">
      <Frame
        surface={emphasis === "owes" ? "secondary" : "primary"}
        className="min-w-0 p-4"
      >
        <p className="type-label">{primaryLabel}</p>
        <p className="type-amount-md mt-2 break-words sm:text-4xl">
          {primaryAmount}
        </p>
      </Frame>
      <Frame surface="surface" shadow="sm" className="min-w-0 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="type-caption text-muted">{secondaryLabel}</p>
          <p className="type-amount-sm break-words text-right">{secondaryAmount}</p>
        </div>
      </Frame>
    </div>
  );
}
