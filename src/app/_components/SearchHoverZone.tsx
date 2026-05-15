"use client";

interface SearchHoverZoneProps {
  onEnter: () => void;
}

export function SearchHoverZone({ onEnter }: SearchHoverZoneProps) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 h-16 w-64 z-40 cursor-pointer"
      onMouseEnter={onEnter}
    />
  );
}
