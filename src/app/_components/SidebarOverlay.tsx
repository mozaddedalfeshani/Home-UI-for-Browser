"use client";

import { cn } from "@/lib/utils";
import Notepad from "@/components/Notepad";

interface SidebarOverlayProps {
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function SidebarOverlay({
  isVisible,
  onMouseEnter,
  onMouseLeave,
}: SidebarOverlayProps) {
  return (
    <>
      {!isVisible && (
        <div
          className="fixed right-0 top-0 bottom-0 w-8 z-40 cursor-w-resize"
          onMouseEnter={onMouseEnter}
        />
      )}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 w-80 md:w-96 z-50 transform transition-all duration-500 ease-out",
          isVisible ? "translate-x-0" : "translate-x-full",
        )}
        onMouseLeave={onMouseLeave}
      >
        <Notepad />
      </div>
    </>
  );
}
