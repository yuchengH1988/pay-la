export function LoadingCard() {
  return (
    <div className="rounded-xs border-[3px] border-border bg-surface-raised p-4 shadow-hard">
      <div className="mb-4 h-6 w-28 animate-pulse bg-primary" />
      <div className="space-y-3">
        <div className="h-12 animate-pulse border-[3px] border-border bg-muted-surface" />
        <div className="h-12 w-4/5 animate-pulse border-[3px] border-border bg-muted-surface" />
        <div className="h-12 w-2/3 animate-pulse border-[3px] border-border bg-muted-surface" />
      </div>
    </div>
  );
}
