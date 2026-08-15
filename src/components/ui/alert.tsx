import type { ReactNode } from "react";
import { cx } from "./cx";

export function Alert({
  title,
  children,
  tone = "warning",
}: {
  title: string;
  children: ReactNode;
  tone?: "warning" | "danger" | "success";
}) {
  return (
    <div
      className={cx(
        "rounded-xs border-[3px] border-border p-4 shadow-hard-sm",
        tone === "warning" && "bg-warning text-primary-foreground",
        tone === "danger" && "bg-danger text-foreground",
        tone === "success" && "bg-success text-foreground",
      )}
    >
      <p className="type-h3">
        {title}
      </p>
      <p className="type-small mt-2">{children}</p>
    </div>
  );
}
