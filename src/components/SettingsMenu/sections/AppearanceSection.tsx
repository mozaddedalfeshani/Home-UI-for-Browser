"use client";

import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun01Icon,
  Moon01Icon,
  ColorsIcon,
  LanguageCircleIcon,
} from "@hugeicons/core-free-icons";
import { useSettingsStore, type Theme } from "@/store/settingsStore";
import { type Language, useTranslation } from "@/constants/languages";
import { cn } from "@/lib/utils";
import { SectionLabel } from "../shared/SectionLabel";

export function AppearanceSection() {
  const {
    theme,
    language,
    setTheme: setSettingsTheme,
    setLanguage,
  } = useSettingsStore();
  const { setTheme } = useTheme();
  const t = useTranslation(language);

  const handleThemeChange = (newTheme: Theme) => {
    setSettingsTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>{t("theme")}</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {(["light", "dark", "system"] as Theme[]).map((th) => (
            <button
              key={th}
              onClick={() => handleThemeChange(th)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all",
                theme === th
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40",
              )}
            >
              <HugeiconsIcon
                icon={
                  th === "light"
                    ? Sun01Icon
                    : th === "dark"
                      ? Moon01Icon
                      : ColorsIcon
                }
                size={18}
                strokeWidth={1.5}
              />
              <span className="capitalize">{t(th)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>{t("language")}</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {(["en", "bn"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                language === lang
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40",
              )}
            >
              <HugeiconsIcon
                icon={LanguageCircleIcon}
                size={16}
                strokeWidth={1.5}
              />
              {lang === "en" ? "EN (English)" : "BN (বাংলা)"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
