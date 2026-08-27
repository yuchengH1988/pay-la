"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button, Dialog, Icon } from "@/src/components/ui";
import { cx } from "@/src/components/ui/cx";
import { useI18n } from "@/src/i18n";

type AppHeaderActionPlacement = "header" | "menu";

export function AppHeader({
  leading,
  eyebrow,
  title,
  actions,
  showMenuButtonOnDesktop = false,
  bordered = true,
  className,
}: {
  leading: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode | ((placement: AppHeaderActionPlacement) => ReactNode);
  showMenuButtonOnDesktop?: boolean;
  bordered?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopActions = typeof actions === "function" ? actions("header") : actions;
  const menuActions = typeof actions === "function" ? actions("menu") : actions;

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
          <div className="flex flex-wrap items-center gap-3 [&>*:not(:last-child)]:hidden md:[&>*:not(:last-child)]:inline-flex">
            {desktopActions}
            <Button
              type="button"
              variant="outline"
              className={cx(!showMenuButtonOnDesktop && "md:hidden")}
              onClick={() => setMenuOpen(true)}
              aria-label={t("dialog.menu")}
            >
              <Icon name="menu" />
            </Button>
          </div>
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
