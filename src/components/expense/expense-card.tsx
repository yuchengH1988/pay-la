import { Badge } from "@/src/components/ui";
import { cx } from "@/src/components/ui/cx";
import { type BalanceTone, toneText } from "@/src/components/ui/tone";

export function ExpenseCard({
  title,
  category,
  payer,
  date,
  amount,
  effect,
  tone,
}: {
  title: string;
  category: string;
  payer: string;
  date: string;
  amount: string;
  effect: string;
  tone: BalanceTone;
}) {
  return (
    <article className="grid grid-cols-[1fr_auto] gap-4 border-b-[3px] border-border bg-surface px-1 py-4">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge tone="accent">{category}</Badge>
          <span className="type-caption text-muted">{date}</span>
        </div>
        <p className="type-h3 truncate">
          {title}
        </p>
        <p className="type-small mt-1 text-muted">Paid by {payer}</p>
      </div>
      <div className="text-right">
        <p className="type-amount-md">{amount}</p>
        <p className={cx("type-amount-sm mt-1", toneText[tone])}>
          {effect}
        </p>
      </div>
    </article>
  );
}
