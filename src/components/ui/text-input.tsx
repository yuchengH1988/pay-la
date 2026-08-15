import type { ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";
import { FieldLabel } from "./field-label";

export function TextInput({
  label,
  error,
  ...props
}: ComponentPropsWithoutRef<"input"> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        className={cx(
          "min-h-12 rounded-xs border-[3px] border-border bg-surface-raised px-3 font-mono text-sm text-foreground shadow-hard-sm outline-none placeholder:text-muted focus:shadow-hard focus:ring-[3px] focus:ring-info",
          error && "border-danger",
        )}
        {...props}
      />
      {error ? <span className="text-sm font-bold text-danger">{error}</span> : null}
    </label>
  );
}
