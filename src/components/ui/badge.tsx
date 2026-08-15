import type { ReactNode } from "react";
import { cx } from "./cx";

export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "accent" | "danger" | "muted";
}) {
  return (
    <span
      className={cx(
        "type-badge inline-flex items-center rounded-xs border-2 border-border px-2 py-1",
        tone === "primary" && "bg-primary text-primary-foreground",
        tone === "accent" && "bg-accent text-accent-foreground",
        tone === "danger" && "bg-danger text-foreground",
        tone === "muted" && "bg-muted-surface text-foreground",
      )}
    >
      {children}
    </span>
  );
}
