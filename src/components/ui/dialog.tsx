import type { ReactNode } from "react";
import { Button } from "./button";
import { Frame } from "./frame";

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 px-4 py-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <Frame
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-md p-5"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b-[3px] border-border pb-3">
          <div>
            <h2 id="dialog-title" className="type-h3">
              {title}
            </h2>
            {description ? (
              <p className="type-small mt-2 text-muted">{description}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            x
          </Button>
        </div>
        {children}
      </Frame>
    </div>
  );
}
