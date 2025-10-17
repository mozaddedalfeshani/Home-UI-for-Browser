"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Trash2, Pencil, Keyboard } from "lucide-react";
import Link from "next/link";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTabsStore, Tab } from "@/store/tabsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddTabDialog } from "./AddTabDialog";
import { EditTabDialog } from "./EditTabDialog";
import { ShortcutDialog } from "./ShortcutDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  cardSize: number;
  cardRadius: number;
}

const SortableShortcutCard = ({
  tab,
  index,
  moveTab,
  removeTab,
  incrementVisitCount,
  autoOrderTabs,
  cardSize,
  cardRadius,
}: SortableShortcutCardProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const language = useSettingsStore((state) => state.language);
  const t = useTranslation(language);

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={tab.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${tab.title || hostname || 'shortcut'}`}
            onClick={() => incrementVisitCount(tab.id)}
            className="block [&:hover]:cursor-pointer"
            style={{ textDecoration: 'none' }}>
            <Card 
              className="group relative flex flex-col items-center justify-center gap-2 border border-border/60 bg-card/70 backdrop-blur-sm p-3 text-center shadow-sm transition hover:border-primary/70 hover:shadow-lg cursor-pointer"
              style={{ 
                width: `${cardSize}rem`,
                height: `${cardSize}rem`,
                borderRadius: `${cardRadius}rem`
              }}
            >
              <div
                className="group relative flex items-center justify-center rounded-full bg-muted/70 p-0 text-foreground transition hover:bg-muted"
                style={{ 
                  height: `${Math.min(cardSize * 0.5, cardSize - 2)}rem`, 
                  width: `${Math.min(cardSize * 0.5, cardSize - 2)}rem` 
                }}>
                <Avatar 
                  className="border border-transparent bg-transparent"
                  style={{ 
                    height: `${Math.min(cardSize * 0.5, cardSize - 2)}rem`, 
                    width: `${Math.min(cardSize * 0.5, cardSize - 2)}rem` 
                  }}
                >
                  {favicon ? (
                    <AvatarImage src={favicon} alt={hostname} />
                  ) : null}
                  <AvatarFallback
                    style={{ 
                      backgroundColor: accent,
                      fontSize: `${Math.max(0.5, cardSize * 0.12)}rem`
                    }}
                    className="text-white">
                    {getFallbackChar(tab.title || hostname)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex w-full flex-col items-center gap-1 px-1">
                <p 
                  className="w-full truncate font-medium text-foreground leading-tight"
                  style={{ fontSize: `${Math.max(0.5, cardSize * 0.1)}rem` }}
                >
                  {tab.title}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Shortcut options for ${tab.title || hostname}`}
                    className="absolute right-1 top-0 rounded-full  text-muted-foreground opacity-0  transition hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-2 w-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                 
                  <EditTabDialog tab={tab}>
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  </EditTabDialog>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      removeTab(tab.id);
                    }}
                    className="flex items-center gap-2 text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                  <ShortcutDialog tab={tab}>
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <Keyboard className="h-4 w-4 mr-2" />
                      {t("keyboardShortcut")}
                    </DropdownMenuItem>
                  </ShortcutDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-1 text-left">
          <p className="text-sm font-medium text-foreground">{tab.title}</p>
          <p className="text-xs text-muted-foreground">{tab.url}</p>
          {tab.shortcut && (
            <p className="text-xs text-primary font-medium">
              {t("shortcut")}: {tab.shortcut}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export const TabsList = () => {
  const [mounted, setMounted] = useState(false);
  const tabs = useTabsStore((state) => state.tabs);
  const removeTab = useTabsStore((state) => state.removeTab);
  const moveTab = useTabsStore((state) => state.moveTab);
  const incrementVisitCount = useTabsStore((state) => state.incrementVisitCount);
  const { autoOrderTabs, cardSize, cardRadius, language } = useSettingsStore();
  const t = useTranslation(language);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (tabs.length === 0) {
    return (
      <div className="h-full flex flex-col p-6 overflow-y-auto ">
        <div className="flex justify-end mb-6">
          <AddTabDialog />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="flex h-36 items-center justify-center border-dashed border-border/60 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {t("startByAddingFirstShortcut")}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Sort tabs by visit count if auto ordering is enabled
  const sortedTabs = autoOrderTabs 
    ? [...tabs].sort((a, b) => b.visitCount - a.visitCount)
    : tabs;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-end mb-6">
        <AddTabDialog />
      </div>
      <TooltipProvider delayDuration={150}>
        <DndProvider backend={HTML5Backend}>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
            <div 
              className="grid gap-4"
              style={{ 
                gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize}rem, 1fr))`,
                '--card-size': `${cardSize}rem`
              } as React.CSSProperties}
            >
              {sortedTabs.map((tab: Tab, index) => (
                <SortableShortcutCard
                  key={tab.id}
                  tab={tab}
                  index={index}
                  moveTab={moveTab}
                  removeTab={removeTab}
                  incrementVisitCount={incrementVisitCount}
                  autoOrderTabs={autoOrderTabs}
                  cardSize={cardSize}
                  cardRadius={cardRadius}
                />
              ))}
            </div>
          </div>
        </DndProvider>
      </TooltipProvider>
     <p className="text-sm text-muted-foreground text-center"> Made by <Link href="https://imurad.pages.dev/" target="_blank" rel="noopener noreferrer">Murad</Link></p>
    </div>
  );
};
