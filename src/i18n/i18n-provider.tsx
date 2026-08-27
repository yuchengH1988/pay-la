"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  categoryTranslations,
  languages,
  splitTypeTranslations,
  translations,
  type Language,
  type TranslationKey,
} from "./translations";
import type { ExpenseCategory } from "@/src/constants/expense-categories";
import type { SplitType } from "@/src/types/expense";

const storageKey = "payla-language";
const fallbackLanguage: Language = "en";

type TranslationValues = Record<string, string | number>;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
  categoryLabel: (category: ExpenseCategory) => string;
  splitTypeLabel: (splitType: SplitType) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDateParts: (date: Date) => { month: string; day: string };
  formatDate: (date: Date) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getStoredLanguage(): Language | null {
  const savedLanguage = window.localStorage.getItem(storageKey);

  return languages.includes(savedLanguage as Language)
    ? (savedLanguage as Language)
    : null;
}

function getBrowserLanguage(): Language {
  const browserLanguage = window.navigator.language;

  return browserLanguage.toLowerCase().startsWith("zh") ? "zh-TW" : fallbackLanguage;
}

function emitLanguageChange() {
  window.dispatchEvent(new Event("payla-language-change"));
}

function subscribeLanguageChange(onStoreChange: () => void) {
  window.addEventListener("payla-language-change", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("payla-language-change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getLanguageSnapshot(): Language {
  return getStoredLanguage() ?? getBrowserLanguage();
}

function getServerLanguageSnapshot(): Language {
  return fallbackLanguage;
}

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values[key] === undefined ? `{${key}}` : String(values[key]),
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguageChange,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(nextLanguage: Language) {
    window.localStorage.setItem(storageKey, nextLanguage);
    emitLanguageChange();
  }

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = translations[language];

    return {
      language,
      setLanguage,
      t: (key, values) => interpolate(dictionary[key], values),
      categoryLabel: (category) => categoryTranslations[language][category],
      splitTypeLabel: (splitType) => splitTypeTranslations[language][splitType],
      formatNumber: (numberValue, options) =>
        numberValue.toLocaleString(language, options),
      formatDateParts: (date) => ({
        month: date.toLocaleDateString(language, { month: "short" }),
        day: date.toLocaleDateString(language, { day: "numeric" }),
      }),
      formatDate: (date) =>
        date.toLocaleDateString(language, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
