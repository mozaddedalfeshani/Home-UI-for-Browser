"use client";

import { useState, useEffect, useRef } from "react";
import { Search, SearchCheck } from "lucide-react";
import { Dialog, DialogContentBottom, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useTabsStore } from "@/store/tabsStore";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openRequest: {
    id: number;
    seedText: string;
  };
  onInputReady?: () => void;
}

const SearchModal = ({
  open,
  onOpenChange,
  openRequest,
  onInputReady,
}: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAppliedRequestIdRef = useRef(0);
  const { searchEngine, language } = useSettingsStore();
  const historyEntries = useSearchHistoryStore((state) => state.entries);
  const addSearchHistoryEntry = useSearchHistoryStore(
    (state) => state.addSearchHistoryEntry,
  );
  const tabs = useTabsStore((state) => state.tabs);
  const t = useTranslation(language);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      onInputReady?.();
    }
  }, [open, onInputReady]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(-1);
      return;
    }

    if (openRequest.id === 0 || lastAppliedRequestIdRef.current === openRequest.id) {
      return;
    }

    lastAppliedRequestIdRef.current = openRequest.id;
    setQuery(openRequest.seedText);
    setActiveIndex(-1);

    requestAnimationFrame(() => {
      if (!inputRef.current) {
        return;
      }

      inputRef.current.focus();
      const cursorPosition = openRequest.seedText.length;
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      onInputReady?.();
    });
  }, [open, openRequest, onInputReady]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const isUrl = (input: string): boolean => {
    // Check if it starts with http:// or https://
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return true;
    }

    // Check if it contains common domain extensions
    const urlPattern =
      /\.(com|org|net|io|dev|app|co|edu|gov|mil|int|biz|info|name|pro|aero|coop|museum|travel|jobs|mobi|asia|cat|tel|post|xxx|arpa|root|local|onion|bit|example|invalid|test|localhost)(\.[a-z]{2,})?(\/.*)?$/i;
    return urlPattern.test(input);
  };

  const getSearchUrl = (searchText: string) => {
    const encodedQuery = encodeURIComponent(searchText);

    if (searchEngine === "duckduckgo") {
      return `https://duckduckgo.com/?q=${encodedQuery}`;
    }

    if (searchEngine === "bing") {
      return `https://www.bing.com/search?q=${encodedQuery}`;
    }

    if (searchEngine === "brave") {
      return `https://search.brave.com/search?q=${encodedQuery}`;
    }

    return `https://www.google.com/search?q=${encodedQuery}`;
  };

  const handleSearchValue = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    let url: string;

    addSearchHistoryEntry(trimmedValue);

    if (isUrl(trimmedValue)) {
      // It's a URL - add https:// if missing
      if (
        trimmedValue.startsWith("http://") ||
        trimmedValue.startsWith("https://")
      ) {
        url = trimmedValue;
      } else {
        url = `https://${trimmedValue}`;
      }
    } else {
      // It's a search query - use selected search engine
      url = getSearchUrl(trimmedValue);
    }

    // Open in same tab
    onOpenChange(false);
    window.location.href = url;
  };

  const handleSearch = () => {
    handleSearchValue(query);
  };

  const normalizedQuery = query.trim().toLowerCase();

  const suggestionItems = [
    ...tabs
      .filter((tab) => {
        if (!normalizedQuery) {
          return true;
        }

        return [tab.title, tab.url, tab.shortcut]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      })
      .slice(0, 5)
      .map((tab) => ({
        id: `tab-${tab.id}`,
        type: "tab" as const,
        label: tab.title,
        sublabel: tab.url,
        value: tab.url,
        openInNewWindow: tab.openInNewWindow,
      })),
    ...historyEntries
      .filter((entry) => {
        if (!normalizedQuery) {
          return true;
        }

        return entry.normalizedValue.includes(normalizedQuery);
      })
      .filter(
        (entry) =>
          !tabs.some(
            (tab) =>
              tab.url === entry.value ||
              tab.title.trim().toLowerCase() === entry.normalizedValue,
          ),
      )
      .slice(0, 5)
      .map((entry) => ({
        id: `history-${entry.id}`,
        type: "history" as const,
        label: entry.value,
        sublabel: t("searchHistory"),
        value: entry.value,
      })),
  ].slice(0, 6);

  const activeSuggestion =
    activeIndex >= 0 ? suggestionItems[activeIndex] : undefined;

  const handleSuggestionSelect = (suggestion: (typeof suggestionItems)[number]) => {
    if (suggestion.type === "tab") {
      onOpenChange(false);

      if (suggestion.openInNewWindow) {
        window.open(suggestion.value, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = suggestion.value;
      }
      return;
    }

    handleSearchValue(suggestion.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      if (!suggestionItems.length) {
        return;
      }

      e.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex < 0
          ? 0
          : Math.min(currentIndex + 1, suggestionItems.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      if (!suggestionItems.length) {
        return;
      }

      e.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex < 0
          ? suggestionItems.length - 1
          : Math.max(currentIndex - 1, 0),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion) {
        handleSuggestionSelect(activeSuggestion);
        return;
      }

      handleSearch();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
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
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />

            <Input
              ref={inputRef}
              placeholder={`${t("search")} ${providerLabel} or enter a URL...`}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="h-14 rounded-full border border-border/50 bg-background/92 pl-12 pr-16 text-base shadow-none backdrop-blur-md focus-visible:border-primary/40 focus-visible:ring-0"
            />

            <Button
              type="button"
              size="sm"
              onClick={handleSearch}
              aria-label={`Search with ${providerLabel}`}
              className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border border-border/50 bg-background/90 p-0 text-muted-foreground shadow-none hover:bg-accent hover:text-foreground"
              disabled={!query.trim()}>
              <SearchCheck aria-hidden="true" />
            </Button>
          </div>

          {suggestionItems.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-3xl border border-border/40 bg-background/88 p-2 backdrop-blur-md">
              <div className="max-h-64 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  {suggestionItems.map((suggestion, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={suggestion.id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={cn(
                          "w-full rounded-2xl border border-transparent px-4 py-3 text-left text-sm text-foreground/90 transition-colors",
                          isActive
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "hover:border-border/40 hover:bg-accent/40 hover:text-foreground",
                        )}>
                        <span className="block truncate font-medium">{suggestion.label}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {suggestion.sublabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContentBottom>
    </Dialog>
  );
};

export default SearchModal;
