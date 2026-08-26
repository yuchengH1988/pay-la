import type { ReactNode } from "react";
import { cx } from "@/src/components/ui/cx";

export function AppHeader({
  leading,
  eyebrow,
  title,
  actions,
  bordered = true,
  className,
}: {
  leading: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cx(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        bordered && "border-b-[3px] border-border pb-5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        {eyebrow || title ? (
          <div className="min-w-0">
            {eyebrow ? <p className="type-caption text-muted">{eyebrow}</p> : null}
            {title ? <h1 className="type-h2 truncate">{title}</h1> : null}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  );
}
