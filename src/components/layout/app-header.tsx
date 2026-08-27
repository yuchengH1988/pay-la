"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button, Dialog, Icon } from "@/src/components/ui";
import { cx } from "@/src/components/ui/cx";
import { useI18n } from "@/src/i18n";

export function AppHeader({
  leading,
  eyebrow,
  title,
  actions,
  bordered = true,
  className,
}: {
  leading: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode | (() => ReactNode);
  bordered?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopActions = typeof actions === "function" ? actions() : actions;
  const menuActions = typeof actions === "function" ? actions() : actions;

  return (
    <>
      <header
        className={cx(
          "flex items-center justify-between gap-4",
          bordered && "border-b-[3px] border-border pb-5",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {leading}
          {eyebrow || title ? (
            <div className="min-w-0">
              {eyebrow ? <p className="type-caption text-muted">{eyebrow}</p> : null}
              {title ? <h1 className="type-h2 truncate">{title}</h1> : null}
            </div>
          ) : null}
        </div>
        {actions ? (
          <>
            <div className="hidden flex-wrap items-center gap-3 md:flex">
              {desktopActions}
            </div>
            <Button
              type="button"
              variant="outline"
              className="md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label={t("dialog.menu")}
            >
              <Icon name="menu" />
            </Button>
          </>
        ) : null}
      </header>

      {actions ? (
        <Dialog
          open={menuOpen}
          title={t("dialog.menu")}
          onClose={() => setMenuOpen(false)}
        >
          <div className="grid gap-4">{menuActions}</div>
        </Dialog>
      ) : null}
    </>
  );
}
