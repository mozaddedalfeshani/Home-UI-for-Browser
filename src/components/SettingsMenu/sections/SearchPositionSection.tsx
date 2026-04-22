"use client";

import { Search, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore, SearchEngine } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

export const SearchPositionSection = () => {
  const { language, searchEngine, tabsPosition, setSearchEngine, setTabsPosition } = useSettingsStore();
  const t = useTranslation(language);

  return (
    <div className="grid grid-cols-2 gap-2 p-1">
      <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
        <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
          {t("searchEngine")}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-full justify-start gap-1 bg-background/50 px-1.5 hover:bg-accent"
          onClick={() => {
            const engines: SearchEngine[] = ["google", "duckduckgo", "bing"];
            const currentIndex = engines.indexOf(searchEngine);
            const nextIndex = (currentIndex + 1) % engines.length;
            setSearchEngine(engines[nextIndex]);
          }}>
          <Search className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold capitalize">
            {searchEngine === "duckduckgo" ? "DDG" : searchEngine}
          </span>
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
        <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
          {t("shortcutPosition")}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-full justify-start gap-1 bg-background/50 px-1.5 hover:bg-accent"
          onClick={() => setTabsPosition(tabsPosition === "top" ? "center" : "top")}>
          <LayoutTemplate className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold capitalize">
            {t(tabsPosition)}
          </span>
        </Button>
      </div>
    </div>
  );
};
