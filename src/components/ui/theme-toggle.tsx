"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function getPreferredTheme(): Theme {
  const savedTheme = window.localStorage.getItem("payla-ui-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function emitThemeChange() {
  window.dispatchEvent(new Event("payla-theme-change"));
}

function subscribeThemeChange(onStoreChange: () => void) {
  window.addEventListener("payla-theme-change", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("payla-theme-change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getThemeSnapshot(): Theme {
  return getPreferredTheme();
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function applyTheme(theme: Theme, notify = false) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("light", !isDark);
  document.documentElement.classList.toggle("dark", isDark);
  window.localStorage.setItem("payla-ui-theme", theme);

  if (notify) {
    emitThemeChange();
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeThemeChange,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDark = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";

    applyTheme(nextTheme, true);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="type-label inline-flex min-h-11 items-center gap-2 rounded-xs border-[3px] border-border bg-surface-raised px-3 text-foreground shadow-hard-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info"
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      suppressHydrationWarning
    >
      <span
        className="grid size-6 place-items-center border-[3px] border-border bg-primary text-primary-foreground"
        suppressHydrationWarning
      >
        {isDark ? "L" : "D"}
      </span>
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
