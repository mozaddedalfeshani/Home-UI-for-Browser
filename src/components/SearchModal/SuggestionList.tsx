"use client";

import { Fragment } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Globe02Icon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { isUrl, renderHighlightedMatch } from "./utils";
import { SuggestionItem } from "./types";

interface SuggestionListProps {
  items: SuggestionItem[];
  localCount: number;
  activeIndex: number;
  query: string;
  onHover: (index: number) => void;
  onSelect: (item: SuggestionItem) => void;
}

function getIcon(item: SuggestionItem) {
  if (item.type === "tab") return Globe02Icon;
  if (item.type === "history") return isUrl(item.value) ? Globe02Icon : TimeScheduleIcon;
  return Search01Icon;
}

interface SuggestionRowProps {
  item: SuggestionItem;
  isActive: boolean;
  query: string;
  onHover: () => void;
  onSelect: () => void;
}

function SuggestionRow({ item, isActive, query, onHover, onSelect }: SuggestionRowProps) {
  const icon = getIcon(item);
  const sublabel = "sublabel" in item ? item.sublabel : undefined;

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-2.5 text-left text-sm text-foreground/90 transition-colors",
        isActive
          ? "border-primary/20 bg-primary/10 text-primary"
          : "hover:border-border/40 hover:bg-accent/40 hover:text-foreground",
      )}
    >
      <HugeiconsIcon
        icon={icon}
        size={14}
        strokeWidth={2}
        className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground/50")}
      />
      <div className="min-w-0 flex-1">
        <span className="block truncate font-medium">
          {renderHighlightedMatch(
            item.label,
            query,
            isActive ? "font-semibold text-primary" : "font-semibold text-primary/90",
          )}
        </span>
        {sublabel && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {renderHighlightedMatch(
              sublabel,
              query,
              isActive ? "font-semibold text-primary" : "font-semibold text-primary/80",
            )}
          </span>
        )}
      </div>
    </button>
  );
}

export function SuggestionList({
  items,
  localCount,
  activeIndex,
  query,
  onHover,
  onSelect,
}: SuggestionListProps) {
  if (!items.length) return null;

  const hasApiSection = localCount > 0 && items.length > localCount;

  return (
    <div className="mt-2 overflow-hidden rounded-3xl border border-border/40 bg-background/88 p-2 backdrop-blur-md">
      <div className="max-h-64 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {items.map((item, index) => (
            <Fragment key={item.id}>
              {hasApiSection && index === localCount && (
                <div className="flex items-center gap-2 px-4 py-1">
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40">
                    Web suggestions
                  </span>
                  <div className="h-px flex-1 bg-border/30" />
                </div>
              )}
              <SuggestionRow
                item={item}
                isActive={index === activeIndex}
                query={query}
                onHover={() => onHover(index)}
                onSelect={() => onSelect(item)}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
