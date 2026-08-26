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
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      {settled ? (
        <Frame surface="primary" className="min-w-0 p-4 sm:col-span-2">
          <p className="type-amount-md break-words sm:text-4xl">All settled</p>
        </Frame>
      ) : (
        <>
          <Frame surface="secondary" className="min-w-0 p-4">
            <p className="type-label">You owe</p>
            <p className="type-amount-md break-words sm:text-4xl">
              {owesAmount}
            </p>
          </Frame>
          <Frame surface="primary" className="min-w-0 p-4">
            <p className="type-label">You are owed</p>
            <p className="type-amount-md break-words sm:text-4xl">
              {isOwedAmount}
            </p>
          </Frame>
        </>
      )}
    </div>
  );
}
