import type { ReactNode } from "react";
import { Button } from "./button";
import { Frame } from "./frame";
import { Icon } from "./icon";
import { useI18n } from "@/src/i18n";

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
  const { t } = useI18n();

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-stretch bg-foreground/35 md:place-items-center md:px-4 md:py-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <Frame
        shadow="none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="h-dvh w-full max-w-none overflow-y-auto rounded-none p-5 md:h-auto md:max-h-[calc(100dvh-3rem)] md:max-w-md md:rounded-xs md:shadow-hard"
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
            aria-label={t("dialog.close")}
          >
            <Icon name="close" className="size-4" />
          </Button>
        </div>
        {children}
      </Frame>
    </div>
  );
}
