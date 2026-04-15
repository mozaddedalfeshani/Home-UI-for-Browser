"use client";

import { useState, useEffect, useRef } from "react";
import { Search, SearchCheck } from "lucide-react";
import { Dialog, DialogContentBottom, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

const SearchModal = ({
  open,
  onOpenChange,
  initialQuery = "",
}: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchEngine, language } = useSettingsStore();
  const historyEntries = useSearchHistoryStore((state) => state.entries);
  const addSearchHistoryEntry = useSearchHistoryStore(
    (state) => state.addSearchHistoryEntry,
  );
  const t = useTranslation(language);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setActiveIndex(-1);
      return;
    }

    setQuery("");
    setActiveIndex(-1);
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (inputRef.current) {
      const nextCursorPosition = inputRef.current.value.length;
      inputRef.current.setSelectionRange(nextCursorPosition, nextCursorPosition);
    }
  }, [open, query]);

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

  const visibleHistoryEntries = historyEntries.filter((entry) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    return entry.normalizedValue.includes(normalizedQuery);
  }).slice(0, 5);

  const activeSuggestion =
    activeIndex >= 0 ? visibleHistoryEntries[activeIndex] : undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      if (!visibleHistoryEntries.length) {
        return;
      }

      e.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex < 0
          ? 0
          : Math.min(currentIndex + 1, visibleHistoryEntries.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      if (!visibleHistoryEntries.length) {
        return;
      }

      e.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex < 0
          ? visibleHistoryEntries.length - 1
          : Math.max(currentIndex - 1, 0),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion) {
        handleSearchValue(activeSuggestion.value);
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
      <DialogContentBottom className="w-full p-0 overflow-hidden rounded-t-2xl border-border/60 bg-background/95 backdrop-blur-xl sm:bottom-8 sm:max-w-2xl sm:rounded-2xl">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="p-4 sm:p-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              ref={inputRef}
              placeholder={`${t("search")} ${providerLabel} or enter a URL...`}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-32 h-12 text-base"
            />

            <Button
              type="button"
              size="sm"
              onClick={handleSearch}
              aria-label={`Search with ${providerLabel}`}
              className="absolute right-2 top-2 h-8 w-8 p-0"
              disabled={!query.trim()}>
              <SearchCheck aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto">
            {visibleHistoryEntries.length > 0 && (
              <div className="flex flex-col gap-1">
                {visibleHistoryEntries.map((entry, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSearchValue(entry.value)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}>
                      <span className="block truncate">{entry.value}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContentBottom>
    </Dialog>
  );
};

export default SearchModal;
