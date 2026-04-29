"use client";

import { useEffect } from "react";
import { useTabsStore } from "@/store/tabsStore";
import { useTabClickHistoryStore } from "@/store/tabClickHistoryStore";
import {
  buildShortcutString,
  isTypingTriggerEvent,
} from "@/lib/keyboardShortcuts";
import { trackVisit } from "@/lib/analyticsClient";

interface UseKeyboardShortcutsProps {
  onSearchModalOpen?: (initialQuery?: string) => void;
  onAIModalOpen?: () => void;
  isAuthenticated?: boolean;
}

export const useKeyboardShortcuts = ({
  onSearchModalOpen,
  onAIModalOpen,
  isAuthenticated = false,
}: UseKeyboardShortcutsProps = {}) => {
  const getTabByShortcut = useTabsStore((state) => state.getTabByShortcut);
  const incrementVisitCount = useTabsStore(
    (state) => state.incrementVisitCount,
  );
  const addTabClickHistoryEntry = useTabClickHistoryStore(
    (state) => state.addTabClickHistoryEntry,
  );
  void isAuthenticated;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInputField =
        tagName === "input" ||
        tagName === "textarea" ||
        target.contentEditable === "true";

      const isCmdOrCtrl = event.ctrlKey || event.metaKey;
      const isPlainSlash =
        event.key === "/" &&
        !isInputField &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.metaKey;
      const isComboSlash =
        event.key === "/" && isCmdOrCtrl && !event.altKey && !event.shiftKey;

      if (isComboSlash) {
        event.preventDefault();
        event.stopPropagation();
        onAIModalOpen?.();
        return;
      }

      if (isPlainSlash) {
        event.preventDefault();
        event.stopPropagation();
        onSearchModalOpen?.();
        return;
      }

      if (isInputField) {
        return;
      }

      if (isTypingTriggerEvent(event)) {
        event.preventDefault();
        event.stopPropagation();
        onSearchModalOpen?.(event.key === " " ? " " : event.key);
        return;
      }

      const shortcutString = buildShortcutString(event);
      if (!shortcutString) {
        return;
      }

      const tab = getTabByShortcut(shortcutString);
      if (tab) {
        event.preventDefault();
        event.stopPropagation();
        addTabClickHistoryEntry({
          id: tab.id,
          title: tab.title,
          url: tab.url,
        });
        incrementVisitCount(tab.id);
        trackVisit({
          tabId: tab.id,
          title: tab.title,
          url: tab.url,
          source: "keyboard-shortcut",
        });

        if (tab.openInNewWindow) {
          window.open(tab.url, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = tab.url;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    addTabClickHistoryEntry,
    getTabByShortcut,
    incrementVisitCount,
    onAIModalOpen,
    onSearchModalOpen,
  ]);
};
