import { Avatar } from "@/src/components/ui";
import { cx } from "@/src/components/ui/cx";
import { type BalanceTone, toneText } from "@/src/components/ui/tone";

export function MemberBalance({
  name,
  balance,
  note,
  tone,
}: {
  name: string;
  balance: string;
  note: string;
  tone: BalanceTone;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-[3px] border-border py-3">
      <div className="flex items-center gap-3">
        <Avatar name={name} tone={tone === "negative" ? "secondary" : "primary"} />
        <div>
          <p className="font-bold">{name}</p>
          <p className="type-caption text-muted">{note}</p>
        </div>
      </div>
      <p
        className={cx(
          "type-amount-md",
          toneText[tone],
        )}
      >
        {balance}
      </p>
    </div>
  );
}
