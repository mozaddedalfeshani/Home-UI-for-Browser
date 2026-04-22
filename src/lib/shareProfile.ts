import type {
  ClockPosition,
  ClockStyle,
  LayoutPreset,
  SearchEngine,
  TabsPosition,
  Theme,
} from "@/store/settingsStore";
import type { Language } from "@/constants/languages";

export const SHARE_PROFILE_VERSION = 1;

export interface ShareProfileTab {
  title: string;
  url: string;
  shortcut?: string;
  openInNewWindow?: boolean;
}

export interface ShareProfileSettings {
  theme: Theme;
  language: Language;
  autoOrderTabs: boolean;
  showClock: boolean;
  showRightSidebar: boolean;
  enableLeftSidebarHover: boolean;
  tabsPosition: TabsPosition;
  cardSize: number;
  cardRadius: number;
  clockColor: string;
  showClockGlow: boolean;
  clockFormat: "12h" | "24h";
  showSeconds: boolean;
  searchEngine: SearchEngine;
  layoutPreset: LayoutPreset;
  clockPosition: ClockPosition;
  clockStyle: ClockStyle;
  isDynamicWallpaper: boolean;
  autoFocusSearch: boolean;
}

export interface ShareProfileV1 {
  version: number;
  exportedAt: string;
  tabs: ShareProfileTab[];
  settings: ShareProfileSettings;
}

export const SHARE_SETTINGS_DEFAULTS: ShareProfileSettings = {
  theme: "system",
  language: "bn",
  autoOrderTabs: false,
  showClock: true,
  showRightSidebar: true,
  enableLeftSidebarHover: false,
  tabsPosition: "top",
  cardSize: 5,
  cardRadius: 0.5,
  clockColor: "#ffffff",
  showClockGlow: false,
  clockFormat: "12h",
  showSeconds: false,
  searchEngine: "google",
  layoutPreset: "default",
  clockPosition: "top-center",
  clockStyle: "modern",
  isDynamicWallpaper: true,
  autoFocusSearch: false,
};

const THEME_VALUES: Theme[] = ["light", "dark", "system"];
const LANGUAGE_VALUES: Language[] = ["en", "bn"];
const TABS_POSITION_VALUES: TabsPosition[] = ["top", "center"];
const SEARCH_ENGINE_VALUES: SearchEngine[] = [
  "google",
  "duckduckgo",
  "bing",
  "brave",
];
const LAYOUT_VALUES: LayoutPreset[] = ["default", "compact", "focus"];
const CLOCK_POSITION_VALUES: ClockPosition[] = [
  "top-left",
  "top-center",
  "top-right",
];
const CLOCK_STYLE_VALUES: ClockStyle[] = ["classic", "modern"];
const CLOCK_FORMAT_VALUES: Array<"12h" | "24h"> = ["12h", "24h"];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toEnumValue = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T =>
  typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;

const toBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toNumber = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return clamp(value, min, max);
};

const normalizeUrl = (rawValue: unknown): string | null => {
  if (typeof rawValue !== "string") {
    return null;
  }

  const value = rawValue.trim();
  if (!value) {
    return null;
  }

  const urlCandidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(urlCandidate);
    return parsed.href;
  } catch {
    return null;
  }
};

const sanitizeShortcut = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const shortcut = value.trim();
  if (!shortcut || shortcut.length > 64) {
    return undefined;
  }

  return shortcut;
};

const sanitizeClockColor = (value: unknown): string => {
  if (typeof value !== "string") {
    return SHARE_SETTINGS_DEFAULTS.clockColor;
  }

  const color = value.trim();
  if (!color || color.length > 64) {
    return SHARE_SETTINGS_DEFAULTS.clockColor;
  }

  return color;
};

export const sanitizeShareTabs = (tabs: unknown): ShareProfileTab[] => {
  if (!Array.isArray(tabs)) {
    return [];
  }

  const usedShortcuts = new Set<string>();

  return tabs.reduce<ShareProfileTab[]>((accumulator, candidate) => {
    if (!isObject(candidate)) {
      return accumulator;
    }

    const url = normalizeUrl(candidate.url);
    if (!url) {
      return accumulator;
    }

    const rawTitle =
      typeof candidate.title === "string" ? candidate.title.trim() : "";
    const title =
      rawTitle || new URL(url).hostname.replace(/^www\./, "") || "Shortcut";

    const shortcut = sanitizeShortcut(candidate.shortcut);
    const uniqueShortcut =
      shortcut && !usedShortcuts.has(shortcut.toLowerCase())
        ? shortcut
        : undefined;

    if (uniqueShortcut) {
      usedShortcuts.add(uniqueShortcut.toLowerCase());
    }

    accumulator.push({
      title,
      url,
      shortcut: uniqueShortcut,
      openInNewWindow:
        typeof candidate.openInNewWindow === "boolean"
          ? candidate.openInNewWindow
          : undefined,
    });

    return accumulator;
  }, []);
};

export const sanitizeShareSettings = (
  settings: unknown,
): ShareProfileSettings => {
  if (!isObject(settings)) {
    return { ...SHARE_SETTINGS_DEFAULTS };
  }

  return {
    theme: toEnumValue(
      settings.theme,
      THEME_VALUES,
      SHARE_SETTINGS_DEFAULTS.theme,
    ),
    language: toEnumValue(
      settings.language,
      LANGUAGE_VALUES,
      SHARE_SETTINGS_DEFAULTS.language,
    ),
    autoOrderTabs: toBoolean(
      settings.autoOrderTabs,
      SHARE_SETTINGS_DEFAULTS.autoOrderTabs,
    ),
    showClock: toBoolean(settings.showClock, SHARE_SETTINGS_DEFAULTS.showClock),
    showRightSidebar: toBoolean(
      settings.showRightSidebar,
      SHARE_SETTINGS_DEFAULTS.showRightSidebar,
    ),
    enableLeftSidebarHover: toBoolean(
      settings.enableLeftSidebarHover,
      SHARE_SETTINGS_DEFAULTS.enableLeftSidebarHover,
    ),
    tabsPosition: toEnumValue(
      settings.tabsPosition,
      TABS_POSITION_VALUES,
      SHARE_SETTINGS_DEFAULTS.tabsPosition,
    ),
    cardSize: toNumber(
      settings.cardSize,
      SHARE_SETTINGS_DEFAULTS.cardSize,
      5,
      10,
    ),
    cardRadius: toNumber(
      settings.cardRadius,
      SHARE_SETTINGS_DEFAULTS.cardRadius,
      0.5,
      3,
    ),
    clockColor: sanitizeClockColor(settings.clockColor),
    showClockGlow: toBoolean(
      settings.showClockGlow,
      SHARE_SETTINGS_DEFAULTS.showClockGlow,
    ),
    clockFormat: toEnumValue(
      settings.clockFormat,
      CLOCK_FORMAT_VALUES,
      SHARE_SETTINGS_DEFAULTS.clockFormat,
    ),
    showSeconds: toBoolean(
      settings.showSeconds,
      SHARE_SETTINGS_DEFAULTS.showSeconds,
    ),
    searchEngine: toEnumValue(
      settings.searchEngine,
      SEARCH_ENGINE_VALUES,
      SHARE_SETTINGS_DEFAULTS.searchEngine,
    ),
    layoutPreset: toEnumValue(
      settings.layoutPreset,
      LAYOUT_VALUES,
      SHARE_SETTINGS_DEFAULTS.layoutPreset,
    ),
    clockPosition: toEnumValue(
      settings.clockPosition,
      CLOCK_POSITION_VALUES,
      SHARE_SETTINGS_DEFAULTS.clockPosition,
    ),
    clockStyle: toEnumValue(
      settings.clockStyle,
      CLOCK_STYLE_VALUES,
      SHARE_SETTINGS_DEFAULTS.clockStyle,
    ),
    isDynamicWallpaper: toBoolean(
      settings.isDynamicWallpaper,
      SHARE_SETTINGS_DEFAULTS.isDynamicWallpaper,
    ),
    autoFocusSearch: toBoolean(
      settings.autoFocusSearch,
      SHARE_SETTINGS_DEFAULTS.autoFocusSearch,
    ),
  };
};

export const createShareProfile = (
  tabs: ShareProfileTab[],
  settings: ShareProfileSettings,
): ShareProfileV1 => ({
  version: SHARE_PROFILE_VERSION,
  exportedAt: new Date().toISOString(),
  tabs,
  settings,
});

export const parseShareProfile = (
  payload: unknown,
): { data: ShareProfileV1 | null; error?: string } => {
  if (!isObject(payload)) {
    return { data: null, error: "Profile must be an object." };
  }

  const hasTabs = "tabs" in payload;
  const hasSettings = "settings" in payload;

  if (!hasTabs && !hasSettings) {
    return {
      data: null,
      error: "Profile does not include tabs or settings.",
    };
  }

  const tabs = sanitizeShareTabs(payload.tabs);
  const settings = sanitizeShareSettings(payload.settings);

  return {
    data: {
      version: SHARE_PROFILE_VERSION,
      exportedAt:
        typeof payload.exportedAt === "string"
          ? payload.exportedAt
          : new Date().toISOString(),
      tabs,
      settings,
    },
  };
};
