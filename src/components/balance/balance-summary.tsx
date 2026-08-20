import { Frame } from "@/src/components/ui";

export function BalanceSummary({
  owesAmount = "¥6,950",
  isOwedAmount = "¥8,400",
  settled = false,
}: {
  owesAmount?: string;
  isOwedAmount?: string;
  settled?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {settled ? (
        <Frame surface="primary" className="p-4 sm:col-span-2">
          <p className="type-label">Balance</p>
          <p className="type-amount-lg">All settled</p>
        </Frame>
      ) : (
        <>
          <Frame surface="secondary" className="p-4">
            <p className="type-label">You owe</p>
            <p className="type-amount-lg">{owesAmount}</p>
          </Frame>
          <Frame surface="primary" className="p-4">
            <p className="type-label">You are owed</p>
            <p className="type-amount-lg">{isOwedAmount}</p>
          </Frame>
        </>
      )}
    </div>
  );
}
