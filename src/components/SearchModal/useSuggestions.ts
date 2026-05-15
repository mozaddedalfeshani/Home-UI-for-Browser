"use client";

import { useMemo } from "react";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useTabsStore } from "@/store/tabsStore";
import { useTranslation, Language } from "@/constants/languages";
import { isUrl } from "./utils";
import { SuggestionItem } from "./types";

interface UseSuggestionsOptions {
  query: string;
  apiSuggestions: string[];
  language: Language;
}

export interface SuggestionsResult {
  allItems: SuggestionItem[];
  localCount: number;
  inlineValue: string | null;
  inlineIsHistory: boolean;
  inlineSuffix: string;
}

export function useSuggestions({
  query,
  apiSuggestions,
  language,
}: UseSuggestionsOptions): SuggestionsResult {
  const historyEntries = useSearchHistoryStore((s) => s.entries);
  const tabs = useTabsStore((s) => s.tabs);
  const t = useTranslation(language);
  const normalizedQuery = query.trim().toLowerCase();

  return useMemo(() => {
    if (!normalizedQuery) {
      const tabItems: SuggestionItem[] = tabs.slice(0, 6).map((tab) => ({
        id: `tab-${tab.id}`,
        type: "tab" as const,
        tabId: tab.id,
        label: tab.title,
        sublabel: tab.url,
        value: tab.url,
        openInNewWindow: tab.openInNewWindow,
      }));
      return {
        allItems: tabItems,
        localCount: tabItems.length,
        inlineValue: null,
        inlineIsHistory: false,
        inlineSuffix: "",
      };
    }

    // Local history matches
    const historyItems: SuggestionItem[] = historyEntries
      .filter((e) => e.normalizedValue.includes(normalizedQuery))
      .slice(0, 5)
      .map((e) => ({
        id: `history-${e.id}`,
        type: "history" as const,
        label: e.value,
        sublabel: isUrl(e.value) ? "History" : t("searchHistory"),
        value: e.value,
      }));

    // Local tabs not already in history
    const tabItems: SuggestionItem[] = tabs
      .filter((tab) =>
        [tab.title, tab.url, tab.shortcut]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(normalizedQuery)),
      )
      .filter((tab) => !historyItems.some((h) => h.value === tab.url))
      .slice(0, 3)
      .map((tab) => ({
        id: `tab-${tab.id}`,
        type: "tab" as const,
        tabId: tab.id,
        label: tab.title,
        sublabel: tab.url,
        value: tab.url,
        openInNewWindow: tab.openInNewWindow,
      }));

    const localItems = [...historyItems, ...tabItems];
    const localValueSet = new Set(localItems.map((i) => i.label.toLowerCase()));

    // API suggestions below local
    const apiItems: SuggestionItem[] = apiSuggestions
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => s.toLowerCase() !== normalizedQuery)
      .filter((s) => !localValueSet.has(s.toLowerCase()))
      .slice(0, 5)
      .map((s) => ({
        id: `api-${s.toLowerCase()}`,
        type: "api" as const,
        label: s,
        value: s,
      }));

    const allItems = [...localItems, ...apiItems].slice(0, 9);

    // Inline completion: history first, then API fallback
    const historyInline =
      historyEntries.find(
        (e) =>
          e.normalizedValue.startsWith(normalizedQuery) &&
          e.normalizedValue !== normalizedQuery,
      ) ?? null;

    const apiInline = !historyInline
      ? (apiSuggestions.find((s) => {
          const lower = s.trim().toLowerCase();
          return lower.startsWith(normalizedQuery) && lower !== normalizedQuery;
        }) ?? null)
      : null;

    const inlineValue = historyInline?.value ?? apiInline ?? null;
    const inlineIsHistory = !!historyInline;
    const inlineSuffix = inlineValue
      ? inlineValue.slice(query.trim().length)
      : "";

    return {
      allItems,
      localCount: localItems.length,
      inlineValue,
      inlineIsHistory,
      inlineSuffix,
    };
  }, [normalizedQuery, historyEntries, tabs, apiSuggestions, t, query]);
}
