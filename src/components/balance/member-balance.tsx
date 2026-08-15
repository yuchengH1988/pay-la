import { Avatar } from "@/src/components/ui";
import { cx } from "@/src/components/ui/cx";

export function MemberBalance({
  name,
  balance,
  note,
  tone,
}: {
  name: string;
  balance: string;
  note: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-[3px] border-border py-3">
      <div className="flex items-center gap-3">
        <Avatar name={name} hot={tone === "negative"} />
        <div>
          <p className="font-bold">{name}</p>
          <p className="type-caption text-muted">{note}</p>
        </div>
      </div>
      <p
        className={cx(
          "type-amount-md",
          tone === "positive" && "text-success",
          tone === "negative" && "text-danger",
          tone === "neutral" && "text-muted",
        )}
      >
        {balance}
      </p>
    </div>
  );
}
