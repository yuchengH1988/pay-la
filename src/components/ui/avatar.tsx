import { cx } from "./cx";

export function Avatar({
  name,
  tone = "primary",
}: {
  name: string;
  tone?: "primary" | "secondary";
}) {
  return (
    <div
      className={cx(
        "type-control grid size-11 place-items-center rounded-xs border-[3px] border-border shadow-hard-sm",
        tone === "secondary"
          ? "bg-secondary text-secondary-foreground"
          : "bg-primary text-primary-foreground",
      )}
      aria-label={name}
    >
      {name.slice(0, 1)}
    </div>
  );
}
