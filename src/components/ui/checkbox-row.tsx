export function CheckboxRow({
  label,
  checked,
  type = "checkbox",
}: {
  label: string;
  checked?: boolean;
  type?: "checkbox" | "radio";
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xs border-[3px] border-border bg-surface-raised px-3 font-bold shadow-hard-sm">
      <input
        type={type}
        defaultChecked={checked}
        className="size-5 accent-[var(--primary)]"
      />
      <span>{label}</span>
    </label>
  );
}
