"use client";

import { cn } from "@/lib/utils";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50 group"
    >
      <span className="text-sm text-foreground/90 group-hover:text-foreground">
        {label}
      </span>
      <div
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors shrink-0",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </div>
    </button>
  );
}
