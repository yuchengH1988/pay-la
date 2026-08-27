"use client";

import { Button } from "@/src/components/ui";
import { languages } from "@/src/i18n";
import { useI18n } from "@/src/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      {languages.map((nextLanguage) => (
        <Button
          key={nextLanguage}
          type="button"
          size="sm"
          variant={language === nextLanguage ? "primary" : "ghost"}
          onClick={() => setLanguage(nextLanguage)}
          aria-pressed={language === nextLanguage}
        >
          {nextLanguage === "en" ? t("language.en") : t("language.zhTW")}
        </Button>
      ))}
    </div>
  );
}
