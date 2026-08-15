import type { ComponentPropsWithoutRef } from "react";
import { FieldLabel } from "./field-label";

export function SelectField({
  label,
  children,
  ...props
}: ComponentPropsWithoutRef<"select"> & { label: string }) {
  return (
    <label className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        className="min-h-12 rounded-xs border-[3px] border-border bg-surface-raised px-3 font-bold text-foreground shadow-hard-sm outline-none focus:shadow-hard focus:ring-[3px] focus:ring-info"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
