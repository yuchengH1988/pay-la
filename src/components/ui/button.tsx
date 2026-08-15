import type { ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xs border-[3px] border-border shadow-hard-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        size === "sm" && "type-control-sm min-h-9 px-3 py-1.5",
        size === "md" && "type-control min-h-11 px-4 py-2",
        size === "lg" && "type-control-lg min-h-14 px-5 py-3",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "bg-background text-foreground",
        variant === "ghost" && "bg-surface-raised text-foreground",
        variant === "danger" && "bg-danger text-foreground",
        className,
      )}
      disabled={props.disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <span className="size-2 animate-pulse bg-border" /> : null}
      {children}
    </button>
  );
}
