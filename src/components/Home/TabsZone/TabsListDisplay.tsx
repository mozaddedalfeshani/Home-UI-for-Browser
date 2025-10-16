"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTabsStore, Tab } from "@/store/tabsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddTabDialog } from "./AddTabDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getHostname = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
};

const getFaviconUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);
    return `https://www.google.com/s2/favicons?sz=128&domain=${parsed.origin}`;
  } catch {
    return undefined;
  }
};

const getFallbackChar = (title: string) => {
  if (!title) {
    return "?";
  }
  return title.trim().charAt(0).toUpperCase();
};

const getAccent = (source: string) => {
  const hash = Array.from(source).reduce(
    (accumulator, char) => accumulator + char.charCodeAt(0),
    0
  );
  const hue = hash % 360;
  return `hsl(${hue} 70% 45%)`;
};

type DragItem = {
  id: string;
  index: number;
};

const DRAG_TYPE = "shortcut-card";

interface SortableShortcutCardProps {
  tab: Tab;
  index: number;
  moveTab: (fromIndex: number, toIndex: number) => void;
  removeTab: (id: string) => void;
  incrementVisitCount: (id: string) => void;
  autoOrderTabs: boolean;
}

const SortableShortcutCard = ({
  tab,
  index,
  moveTab,
  removeTab,
  incrementVisitCount,
  autoOrderTabs,
}: SortableShortcutCardProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [, drop] = useDrop<DragItem>({
    accept: DRAG_TYPE,
    hover: (item) => {
      if (!ref.current || autoOrderTabs) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveTab(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: () => ({
      id: tab.id,
      index,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !autoOrderTabs,
  });

  if (!autoOrderTabs) {
    drag(drop(ref));
  } else {
    drop(ref);
  }

  const hostname = getHostname(tab.url);
  const accent = getAccent(tab.title || hostname);
  const favicon = getFaviconUrl(tab.url);

  return (
    <div
      ref={ref}
      className="h-full"
      style={{
        opacity: isDragging ? 0.6 : 1,
        cursor: autoOrderTabs ? "default" : isDragging ? "grabbing" : "grab",
      }}>
      <Card className="group relative flex w-28 flex-col items-center gap-3 rounded-3xl border border-border/60 bg-card/70 p-4 text-center shadow-sm transition hover:border-primary/70 hover:shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "group relative flex h-20 w-20 items-center justify-center rounded-full bg-muted/70 p-0 text-foreground transition hover:bg-muted"
              )}>
              <a
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${tab.title || hostname}`}
                onClick={() => incrementVisitCount(tab.id)}>
                <Avatar className="size-full border border-transparent bg-transparent">
                  {favicon ? (
                    <AvatarImage src={favicon} alt={hostname} />
                  ) : null}
                  <AvatarFallback
                    style={{ backgroundColor: accent }}
                    className="text-base text-white">
                    {getFallbackChar(tab.title || hostname)}
                  </AvatarFallback>
                </Avatar>
                <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-1 text-left">
            <p className="text-sm font-medium text-foreground">{tab.title}</p>
            <p className="text-xs text-muted-foreground">{tab.url}</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex w-full flex-col items-center gap-1">
          <p className="w-full truncate text-sm font-medium text-foreground">
            {tab.title}
          </p>
          {/* <p className="w-full truncate text-xs text-muted-foreground">
            {hostname}
          </p> */}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Shortcut options for ${tab.title || hostname}`}
              className="absolute right-2 top-2 rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm transition hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Shortcut options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                removeTab(tab.id);
              }}
              className="flex items-center gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    </div>
  );
};

export const TabsList = () => {
  const [mounted, setMounted] = useState(false);
  const tabs = useTabsStore((state) => state.tabs);
  const removeTab = useTabsStore((state) => state.removeTab);
  const moveTab = useTabsStore((state) => state.moveTab);
  const incrementVisitCount = useTabsStore((state) => state.incrementVisitCount);
  const autoOrderTabs = useSettingsStore((state) => state.autoOrderTabs);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (tabs.length === 0) {
    return (
      <Card className="flex h-36 items-center justify-center border-dashed border-border/60 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Start by adding your first shortcut.
        </p>
      </Card>
    );
  }

  // Sort tabs by visit count if auto ordering is enabled
  const sortedTabs = autoOrderTabs 
    ? [...tabs].sort((a, b) => b.visitCount - a.visitCount)
    : tabs;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AddTabDialog />
      </div>
      <TooltipProvider delayDuration={150}>
        <DndProvider backend={HTML5Backend}>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(7rem,_1fr))] gap-4">
              {sortedTabs.map((tab: Tab, index) => (
                <SortableShortcutCard
                  key={tab.id}
                  tab={tab}
                  index={index}
                  moveTab={moveTab}
                  removeTab={removeTab}
                  incrementVisitCount={incrementVisitCount}
                  autoOrderTabs={autoOrderTabs}
                />
              ))}
            </div>
          </div>
        </DndProvider>
      </TooltipProvider>
    </div>
  );
};
