import type { ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";

export function Frame({
  as: Component = "div",
  surface = "raised",
  shadow = "hard",
  dashed = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & {
  as?: "article" | "aside" | "div" | "section";
  surface?: "background" | "surface" | "raised" | "primary" | "secondary";
  shadow?: "none" | "sm" | "hard";
  dashed?: boolean;
}) {
  return (
    <Component
      className={cx(
        "rounded-xs border-[3px] border-border",
        dashed && "border-dashed",
        surface === "background" && "bg-background",
        surface === "surface" && "bg-surface",
        surface === "raised" && "bg-surface-raised",
        surface === "primary" && "bg-primary text-primary-foreground",
        surface === "secondary" && "bg-secondary text-secondary-foreground",
        shadow === "sm" && "shadow-hard-sm",
        shadow === "hard" && "shadow-hard",
        className,
      )}
      {...props}
    />
  );
}
