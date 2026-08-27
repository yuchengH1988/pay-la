import type { CSSProperties } from "react";
import { cx } from "./cx";

export const iconNames = [
  "arrow-left",
  "check",
  "coin",
  "copy",
  "close",
  "edit",
  "link",
  "menu",
  "moon",
  "plus",
  "receipt",
  "settings",
  "sun",
  "trash",
  "user",
  "wallet",
] as const;

export type IconName = (typeof iconNames)[number];

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const url = `/icons/${name}.svg`;
  const style = {
    WebkitMask: `url("${url}") center / contain no-repeat`,
    mask: `url("${url}") center / contain no-repeat`,
  } satisfies CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={cx("inline-block size-5 shrink-0 bg-current", className)}
      style={style}
    />
  );
}
