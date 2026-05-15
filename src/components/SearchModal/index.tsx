"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContentBottom,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useTabsStore } from "@/store/tabsStore";
import { useTabClickHistoryStore } from "@/store/tabClickHistoryStore";
import { trackSearch, trackVisit } from "@/lib/analyticsClient";
import { isUrl } from "./utils";
import { useSuggestions } from "./useSuggestions";
import { SuggestionList } from "./SuggestionList";
import { SuggestionItem } from "./types";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openRequest: { id: number; seedText: string };
  onInputReady?: () => void;
}

const SearchModal = ({
  open,
  onOpenChange,
  openRequest,
  onInputReady,
}: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAppliedRequestIdRef = useRef(0);

  const { searchEngine, language } = useSettingsStore();
  const addSearchHistoryEntry = useSearchHistoryStore(
    (s) => s.addSearchHistoryEntry,
  );
  const addTabClickHistoryEntry = useTabClickHistoryStore(
    (s) => s.addTabClickHistoryEntry,
  );
  const tabs = useTabsStore((s) => s.tabs);
  const incrementVisitCount = useTabsStore((s) => s.incrementVisitCount);
  const t = useTranslation(language);

  const { allItems, localCount, inlineValue, inlineIsHistory, inlineSuffix } =
    useSuggestions({
      query,
      apiSuggestions,
      language,
    });

  // Focus management
  useEffect(() => {
    const handleFocus = () => {
      if (open && inputRef.current) inputRef.current.focus();
    };
    if (open && inputRef.current) {
      inputRef.current.focus();
      onInputReady?.();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [open, onInputReady]);

  // Seed text from open request
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(-1);
      return;
    }
    if (
      openRequest.id === 0 ||
      lastAppliedRequestIdRef.current === openRequest.id
    )
      return;
    lastAppliedRequestIdRef.current = openRequest.id;
    setQuery(openRequest.seedText);
    setActiveIndex(-1);
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      const pos = openRequest.seedText.length;
      inputRef.current.setSelectionRange(pos, pos);
      onInputReady?.();
    });
  }, [open, openRequest, onInputReady]);

  // Reset active index on query change
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Browser-style: when history inline completion is active, show the completion
  // as a real text selection in the input (typed part normal, completion = selected)
  const isHistoryComplete = inlineIsHistory && !!inlineValue;
  useLayoutEffect(() => {
    if (!isHistoryComplete || !inputRef.current) return;
    const el = inputRef.current;
    const start = query.length;
    const end = inlineValue!.length;
    if (el.selectionStart !== start || el.selectionEnd !== end) {
      el.setSelectionRange(start, end);
    }
  });

  // Fetch API suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (!open || !trimmed) {
      setApiSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/analytics/search?query=${encodeURIComponent(trimmed)}&suggestions=1`,
          {
            headers: { "x-home-ui-request": "search-analytics" },
            signal: controller.signal,
          },
        );
        if (!res.ok) {
          setApiSuggestions([]);
          return;
        }
        const payload = (await res.json()) as { data?: string[] };
        setApiSuggestions(payload.data ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setApiSuggestions([]);
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [open, query]);

  const getSearchUrl = (text: string) => {
    const q = encodeURIComponent(text);
    if (searchEngine === "duckduckgo") return `https://duckduckgo.com/?q=${q}`;
    if (searchEngine === "bing") return `https://www.bing.com/search?q=${q}`;
    if (searchEngine === "brave")
      return `https://search.brave.com/search?q=${q}`;
    return `https://www.google.com/search?q=${q}`;
  };

  const handleSearchValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    addSearchHistoryEntry(trimmed);
    onOpenChange(false);

    if (isUrl(trimmed)) {
      window.location.href =
        trimmed.startsWith("http://") || trimmed.startsWith("https://")
          ? trimmed
          : `https://${trimmed}`;
    } else {
      trackSearch(trimmed, searchEngine);
      window.location.href = getSearchUrl(trimmed);
    }
  };

  const handleSuggestionSelect = (item: SuggestionItem) => {
    if (item.type === "tab") {
      onOpenChange(false);
      const matchingTab = tabs.find((tab) => tab.id === item.tabId);
      if (matchingTab) {
        addSearchHistoryEntry(matchingTab.url);
        addTabClickHistoryEntry({
          id: matchingTab.id,
          title: matchingTab.title,
          url: matchingTab.url,
        });
        incrementVisitCount(matchingTab.id);
        trackVisit({
          tabId: matchingTab.id,
          title: matchingTab.title,
          url: matchingTab.url,
          source: "search-suggestion",
        });
      }
      if (item.openInNewWindow) {
        window.open(item.value, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = item.value;
      }
      return;
    }
    handleSearchValue(item.value);
  };

  const acceptInlineCompletion = () => {
    if (!inlineValue) return false;
    setQuery(inlineValue);
    setActiveIndex(-1);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(
        inlineValue.length,
        inlineValue.length,
      );
    });
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      if (!allItems.length) return;
      e.preventDefault();
      setActiveIndex((i) => (i < 0 ? 0 : Math.min(i + 1, allItems.length - 1)));
    } else if (e.key === "ArrowUp") {
      if (!allItems.length) return;
      e.preventDefault();
      setActiveIndex((i) => (i < 0 ? allItems.length - 1 : Math.max(i - 1, 0)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const active = activeIndex >= 0 ? allItems[activeIndex] : undefined;
      if (active) {
        handleSuggestionSelect(active);
        return;
      }
      // History inline completion → navigate directly on Enter
      if (inlineValue && inlineIsHistory) {
        handleSearchValue(inlineValue);
        return;
      }
      handleSearchValue(query);
    } else if (e.key === "Tab" || e.key === "ArrowRight") {
      if (acceptInlineCompletion()) e.preventDefault();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  const providerLabel =
    searchEngine === "duckduckgo"
      ? t("duckduckgo")
      : searchEngine === "bing"
        ? t("bing")
        : searchEngine === "brave"
          ? t("brave")
          : t("google");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentBottom className="w-full border-0 bg-transparent p-4 shadow-none sm:bottom-8 sm:max-w-2xl">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="mx-auto w-full max-w-2xl">
          <div className="relative rounded-full border border-border/50 bg-background/92 backdrop-blur-md">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            />

            {/* API suggestion ghost text — history uses real input selection instead */}
            {inlineSuffix && !isHistoryComplete && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex h-14 items-center overflow-hidden whitespace-pre rounded-full pl-12 pr-16 text-base"
              >
                <span className="invisible">{query}</span>
                <span className="text-muted-foreground/45">{inlineSuffix}</span>
              </div>
            )}

            <Input
              ref={inputRef}
              placeholder={`${t("search")} ${providerLabel} or enter a URL...`}
              value={isHistoryComplete ? inlineValue! : query}
              onChange={(e) => {
                if (isHistoryComplete) {
                  // User typed/deleted over the selection — extract typed portion
                  const cursorPos =
                    e.target.selectionStart ?? e.target.value.length;
                  setQuery(e.target.value.slice(0, cursorPos));
                } else {
                  setQuery(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              className="relative h-14 rounded-full border-0 bg-transparent pl-12 pr-16 text-base shadow-none focus-visible:ring-0"
            />

            <Button
              type="button"
              size="sm"
              onClick={() =>
                handleSearchValue(isHistoryComplete ? inlineValue! : query)
              }
              aria-label={`Search with ${providerLabel}`}
              className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border border-border/50 bg-background/90 p-0 text-muted-foreground shadow-none hover:bg-accent hover:text-foreground"
              disabled={!query.trim()}
            >
              <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={2} />
            </Button>
          </div>

          <SuggestionList
            items={allItems}
            localCount={localCount}
            activeIndex={activeIndex}
            query={query}
            onHover={setActiveIndex}
            onSelect={handleSuggestionSelect}
          />
        </div>
      </DialogContentBottom>
    </Dialog>
  );
};

export default SearchModal;
