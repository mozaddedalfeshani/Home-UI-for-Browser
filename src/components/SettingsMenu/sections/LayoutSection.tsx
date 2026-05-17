"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { useSettingsStore, type SearchEngine } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { cn } from "@/lib/utils";
import { SectionLabel } from "../shared/SectionLabel";

const ENGINES: SearchEngine[] = ["google", "duckduckgo", "bing", "brave"];

const ENGINE_LABEL: Record<SearchEngine, string> = {
  google: "Google",
  duckduckgo: "DuckDuckGo",
  bing: "Bing",
  brave: "Brave",
};

export function LayoutSection() {
  const {
    searchEngine,
    tabsPosition,
    language,
    setSearchEngine,
    setTabsPosition,
  } = useSettingsStore();
  const t = useTranslation(language);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>{t("searchEngine")}</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {ENGINES.map((engine) => (
            <button
              key={engine}
              onClick={() => setSearchEngine(engine)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                searchEngine === engine
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40",
              )}
            >
              <HugeiconsIcon icon={Search01Icon} size={14} strokeWidth={1.5} />
              <span>{ENGINE_LABEL[engine]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>{t("shortcutPosition")}</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {(["top", "center"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setTabsPosition(pos)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                tabsPosition === pos
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40",
              )}
            >
              <HugeiconsIcon icon={Image01Icon} size={14} strokeWidth={1.5} />
              <span className="capitalize">{t(pos)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
