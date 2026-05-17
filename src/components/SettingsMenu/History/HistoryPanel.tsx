"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Delete02Icon,
  Search01Icon,
  Globe02Icon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { useTranslation } from "@/constants/languages";
import { useSettingsStore } from "@/store/settingsStore";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useTabClickHistoryStore } from "@/store/tabClickHistoryStore";

interface HistoryPanelProps {
  onBack?: () => void;
}

export function HistoryPanel({ onBack }: HistoryPanelProps) {
  const language = useSettingsStore((s) => s.language);
  const t = useTranslation(language);

  const searchEntries = useSearchHistoryStore((s) => s.entries);
  const removeSearchEntry = useSearchHistoryStore(
    (s) => s.removeSearchHistoryEntry,
  );
  const tabEntries = useTabClickHistoryStore((s) => s.entries);
  const removeTabEntry = useTabClickHistoryStore(
    (s) => s.removeTabClickHistoryEntry,
  );

  const entries = [
    ...searchEntries.map((e) => ({
      id: `search-${e.id}`,
      entryId: e.id,
      type: "search" as const,
      primary: e.value,
      secondary: t("searchEntry"),
    })),
    ...tabEntries.map((e) => ({
      id: `tab-${e.id}`,
      entryId: e.id,
      type: "tab" as const,
      primary: e.title,
      secondary: e.url,
    })),
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={2} />
          Back
        </button>
      )}

      {entries.length > 0 ? (
        <div className="space-y-2 overflow-y-auto flex-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/10 p-3"
            >
              <div className="p-1.5 rounded-full bg-muted/40 text-muted-foreground shrink-0">
                <HugeiconsIcon
                  icon={entry.type === "search" ? Search01Icon : Globe02Icon}
                  size={13}
                  strokeWidth={2}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {entry.primary}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {entry.secondary}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  entry.type === "search"
                    ? removeSearchEntry(entry.entryId)
                    : removeTabEntry(entry.entryId)
                }
                className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed border-border/40 text-center py-8">
          <HugeiconsIcon
            icon={TimeScheduleIcon}
            size={28}
            strokeWidth={1.5}
            className="text-muted-foreground/40 mb-2"
          />
          <p className="text-sm font-medium text-foreground">
            {t("noHistory")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("historyEmptyDescription")}
          </p>
        </div>
      )}
    </div>
  );
}
