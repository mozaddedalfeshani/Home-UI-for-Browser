"use client";

const MODIFIER_KEYS = new Set(["Control", "Alt", "Shift", "Meta"]);

export const isMacPlatform = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
};

export const getPrimaryModifierLabel = () => {
  return isMacPlatform() ? "Cmd" : "Ctrl";
};

export const isModifierOnlyKey = (key: string) => {
  return MODIFIER_KEYS.has(key);
};

export const normalizeKeyName = (key: string) => {
  if (key === " ") {
    return "Space";
  }

  if (key.length === 1) {
    return key.toLowerCase();
  }

  return key;
};

export const buildShortcutString = (event: KeyboardEvent) => {
  const modifiers: string[] = [];

  if (event.metaKey) {
    modifiers.push("Cmd");
  }
  if (event.ctrlKey) {
    modifiers.push("Ctrl");
  }
  if (event.altKey) {
    modifiers.push("Alt");
  }
  if (event.shiftKey) {
    modifiers.push("Shift");
  }

  if (isModifierOnlyKey(event.key)) {
    return null;
  }

  return [...modifiers, normalizeKeyName(event.key)].join("+");
};

export const hasPrimaryModifier = (shortcut: string) => {
  return shortcut.split("+").includes(getPrimaryModifierLabel());
};

export const isReservedShortcut = (shortcut: string) => {
  const parts = shortcut.split("+");
  const key = parts.at(-1)?.toLowerCase();
  const hasCopyPasteModifier = parts.includes("Cmd") || parts.includes("Ctrl");

  return hasCopyPasteModifier && (key === "c" || key === "v");
};

export const migrateShortcutToPrimaryModifier = (shortcut?: string) => {
  if (!shortcut) {
    return shortcut;
  }

  if (hasPrimaryModifier(shortcut)) {
    return shortcut;
  }

  return `${getPrimaryModifierLabel()}+${shortcut}`;
};

export const isTypingTriggerEvent = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

  if (isModifierOnlyKey(event.key)) {
    return false;
  }

  return event.key.length === 1 || event.key === " ";
};
