"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ExternalLink, SearchCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
    const urlPattern = /\.(com|org|net|io|dev|app|co|edu|gov|mil|int|biz|info|name|pro|aero|coop|museum|travel|jobs|mobi|asia|cat|tel|post|xxx|arpa|root|local|onion|bit|example|invalid|test|localhost)(\.[a-z]{2,})?(\/.*)?$/i;
    return urlPattern.test(input);
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
      // It's a search query - search on Google
      const encodedQuery = encodeURIComponent(query);
      url = `https://www.google.com/search?q=${encodedQuery}`;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full top-20 p-0">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search Google or enter a URL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-12 h-12 text-base"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSearch}
            className="absolute right-2 top-2 h-8 w-8 p-0"
            disabled={!query.trim()}
          >
            <SearchCheck />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
