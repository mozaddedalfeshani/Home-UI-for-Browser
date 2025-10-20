"use client";

import { useEffect } from "react";
import { useTabsStore } from "@/store/tabsStore";

interface UseKeyboardShortcutsProps {
  onSearchModalOpen?: () => void;
}

export const useKeyboardShortcuts = ({ onSearchModalOpen }: UseKeyboardShortcutsProps = {}) => {
  const getTabByShortcut = useTabsStore((state) => state.getTabByShortcut);

  useEffect(() => {
    console.log("Keyboard shortcuts hook initialized");
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField = target.tagName.toLowerCase() === 'input' || 
                          target.tagName.toLowerCase() === 'textarea' ||
                          target.contentEditable === 'true';

      // Handle "/" key for search modal (only when not in input fields)
      if (event.key === "/" && !isInputField && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        onSearchModalOpen?.();
        return;
      }

      // Build the shortcut string from the current key combination
      const modifiers = [];
      if (event.ctrlKey) modifiers.push("Ctrl");
      if (event.altKey) modifiers.push("Alt");
      if (event.shiftKey) modifiers.push("Shift");
      if (event.metaKey) modifiers.push("Meta");

      // Don't trigger on modifier-only presses
      if (event.key === "Control" || event.key === "Alt" || event.key === "Shift" || event.key === "Meta") {
        return;
      }

      const key = event.key === " " ? "Space" : event.key;
      const shortcutString = [...modifiers, key].join("+");
      
      console.log("Key pressed:", event.key, "Modifiers:", modifiers, "Shortcut string:", shortcutString);

      // Check if this shortcut matches any tab
      const tab = getTabByShortcut(shortcutString);
      console.log("Found tab for shortcut:", tab);
      
      if (tab) {
        console.log("Opening tab:", tab.title, "URL:", tab.url);
        event.preventDefault();
        event.stopPropagation();
        
        // Open the tab URL
        if (tab.openInNewWindow) {
          window.open(tab.url, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = tab.url;
        }
      }
    };

    // Add the event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [getTabByShortcut, onSearchModalOpen]);
};
