"use client";

import { useEffect } from "react";
import { useTabsStore } from "@/store/tabsStore";
import {
  buildShortcutString,
  isTypingTriggerEvent,
} from "@/lib/keyboardShortcuts";

interface UseKeyboardShortcutsProps {
  onSearchModalOpen?: (initialQuery?: string) => void;
}

export const useKeyboardShortcuts = ({ onSearchModalOpen }: UseKeyboardShortcutsProps = {}) => {
  const getTabByShortcut = useTabsStore((state) => state.getTabByShortcut);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInputField =
        tagName === "input" ||
        tagName === "textarea" ||
        target.contentEditable === "true";

      if (
        event.key === "/" &&
        !isInputField &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.metaKey
      ) {
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
  }, [getTabByShortcut, onSearchModalOpen]);
};
