import { Badge, Frame } from "@/src/components/ui";
import { cx } from "@/src/components/ui/cx";

export function GroupCard({
  name,
  currency,
  members,
  amount,
  status,
  accent,
}: {
  name: string;
  currency: string;
  members: number;
  amount: string;
  status: string;
  accent: string;
}) {
  return (
    <Frame as="article" className="relative p-4">
      <div
        className={cx(
          "absolute -top-3 left-4 h-5 w-24 border-[3px] border-border",
          accent,
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="type-h3">
            {name}
          </p>
          <p className="type-caption mt-2 text-muted">
            {members} members . {currency}
          </p>
        </div>
        <Badge tone="muted">{status}</Badge>
      </div>
      <p className="type-amount-lg mt-8">
        {amount}
      </p>
    </Frame>
  );
}
