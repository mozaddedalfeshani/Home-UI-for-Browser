"use client";

import { useState, useEffect, useRef } from "react";
import { Search, SearchCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchEngine, language } = useSettingsStore();
  const t = useTranslation(language);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset query when modal closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

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

  const handleSearch = () => {
    if (!query.trim()) return;

    let url: string;

    if (isUrl(query)) {
      // It's a URL - add https:// if missing
      if (query.startsWith("http://") || query.startsWith("https://")) {
        url = query;
      } else {
        url = `https://${query}`;
      }
    } else {
      // It's a search query - use selected search engine
      url = getSearchUrl(query);
    }

    // Open in new tab
    window.open(url, "_blank", "noopener,noreferrer");

    // Close modal
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
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
      <DialogContent className="sm:max-w-2xl w-full top-20 p-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <span className="absolute right-14 top-3 text-[11px] uppercase tracking-wide text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md border border-border/70">
            {providerLabel}
          </span>

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
            className="absolute right-2 top-2 h-8 w-8 p-0"
            disabled={!query.trim()}>
            <SearchCheck />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
