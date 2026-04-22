"use client";

import { Monitor, Sun, Moon, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSettingsStore, Theme } from "@/store/settingsStore";
import { Language, useTranslation } from "@/constants/languages";

export const ThemeLanguageSection = () => {
  const { setTheme } = useTheme();
  const { theme, language, setTheme: setSettingsTheme, setLanguage } = useSettingsStore();
  const t = useTranslation(language);

  const handleThemeChange = (newTheme: Theme) => {
    setSettingsTheme(newTheme);
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="grid grid-cols-2 gap-2 p-1">
      <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
        <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
          {t("theme")}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-full justify-start gap-2 bg-background/50 hover:bg-accent"
          onClick={() => {
            const themes: Theme[] = ["system", "light", "dark"];
            const currentIndex = themes.indexOf(theme);
            const nextIndex = (currentIndex + 1) % themes.length;
            handleThemeChange(themes[nextIndex]);
          }}>
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
          <span className="text-[10px] font-semibold capitalize">
            {t(theme)}
          </span>
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
        <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
          {t("language")}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-full justify-start gap-2 bg-background/50 hover:bg-accent"
          onClick={() => handleLanguageChange(language === "en" ? "bn" : "en")}>
          <Languages className="h-4 w-4" />
          <span className="text-[10px] font-semibold uppercase">
            {language === "en" ? "EN (English)" : "BN (বাংলা)"}
          </span>
        </Button>
      </div>
    </div>
  );
};
