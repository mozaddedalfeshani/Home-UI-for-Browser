"use client";

import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe, History, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/constants/languages";
import { useSettingsStore } from "@/store/settingsStore";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useTabClickHistoryStore } from "@/store/tabClickHistoryStore";

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type UnifiedHistoryEntry =
  | {
      id: string;
      entryId: string;
      type: "search";
      primaryText: string;
      secondaryText: string;
    }
  | {
      id: string;
      entryId: string;
      type: "tab";
      primaryText: string;
      secondaryText: string;
    };

export const HistoryDialog = ({ open, onOpenChange }: HistoryDialogProps) => {
  const language = useSettingsStore((state) => state.language);
  const searchEntries = useSearchHistoryStore((state) => state.entries);
  const removeSearchHistoryEntry = useSearchHistoryStore(
    (state) => state.removeSearchHistoryEntry,
  );
  const tabEntries = useTabClickHistoryStore((state) => state.entries);
  const removeTabClickHistoryEntry = useTabClickHistoryStore(
    (state) => state.removeTabClickHistoryEntry,
  );
  const t = useTranslation(language);

  const historyEntries: UnifiedHistoryEntry[] = [
    ...searchEntries.map((entry) => ({
      id: `search-${entry.id}`,
      type: "search" as const,
      entryId: entry.id,
      primaryText: entry.value,
      secondaryText: t("searchEntry"),
    })),
    ...tabEntries.map((entry) => ({
      id: `tab-${entry.id}`,
      type: "tab" as const,
      entryId: entry.id,
      primaryText: entry.title,
      secondaryText: entry.url,
    })),
  ];

  const handleRemoveHistoryEntry = (entry: UnifiedHistoryEntry) => {
    if (entry.type === "search") {
      removeSearchHistoryEntry(entry.entryId);
      return;
    }

    removeTabClickHistoryEntry(entry.entryId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[96vw] p-4 sm:w-[calc(100vw-2rem)] sm:max-w-4xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t("history")}
          </DialogTitle>
          <DialogDescription>{t("historyDescription")}</DialogDescription>
        </DialogHeader>

        {historyEntries.length ? (
          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1 sm:pr-2">
            {historyEntries.map((entry) => {
              const isSearchEntry = entry.type === "search";

              return (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3 sm:flex-nowrap sm:gap-4 sm:p-4"
                >
                  <div className="w-fit rounded-full bg-background p-2 text-muted-foreground shadow-sm">
                    {isSearchEntry ? (
                      <Search className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="break-words text-sm font-medium text-foreground">
                        {entry.primaryText}
                      </p>
                      <span className="text-xs text-muted-foreground/60">
                        •
                      </span>
                      <p className="break-words text-xs text-muted-foreground">
                        {entry.secondaryText}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveHistoryEntry(entry)}
                      className="h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`${t("remove")} ${isSearchEntry ? t("searchEntry") : t("shortcutEntry")}`}
                      title={t("remove")}
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={18}
                        strokeWidth={2}
                      />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 text-center">
            <History className="mb-3 h-8 w-8 text-muted-foreground/70" />
            <p className="text-sm font-medium text-foreground">
              {t("noHistory")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("historyEmptyDescription")}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
