"use client";

import { useState } from "react";
import { Button, Icon } from "@/src/components/ui";
import { cx } from "@/src/components/ui/cx";
import { languages } from "@/src/i18n";
import { useI18n } from "@/src/i18n";

export function LanguageSwitcher({ fullWidth = false }: { fullWidth?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const languageLabel = language === "en" ? t("language.en") : t("language.zhTW");
  const nextLanguages = languages.filter((nextLanguage) => nextLanguage !== language);

  return (
    <div className={cx("relative inline-flex", fullWidth && "w-full")}>
      <button
        type="button"
        className={cx(
          "type-label inline-flex min-h-11 items-center gap-2 rounded-xs border-[3px] border-border bg-surface-raised px-3 text-foreground shadow-hard-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info",
          fullWidth && "w-full justify-start",
        )}
        aria-label={t("language.switch")}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span className="grid size-6 place-items-center border-[3px] border-border bg-primary text-primary-foreground">
          <Icon name="global" className="size-4" />
        </span>
        {languageLabel}
      </button>

      {open ? (
        <div
          className={cx(
            "absolute top-full z-50 mt-2 grid min-w-36 gap-2 border-[3px] border-border bg-surface p-2 shadow-hard",
            fullWidth ? "left-0 right-0" : "right-0",
          )}
        >
          {nextLanguages.map((nextLanguage) => (
            <Button
              key={nextLanguage}
              type="button"
              size="sm"
              variant="ghost"
              className={cx("w-full justify-start bg-background")}
              onClick={() => {
                setLanguage(nextLanguage);
                setOpen(false);
              }}
            >
              {nextLanguage === "en" ? t("language.en") : t("language.zhTW")}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
