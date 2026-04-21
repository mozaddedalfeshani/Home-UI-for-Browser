"use client";

import { useEffect, useState } from "react";
import { registerSiteVisit } from "@/lib/analyticsClient";

export function SiteVisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const timer = window.setTimeout(() => {
      void registerSiteVisit().then((nextCount) => {
        if (isActive) {
          setCount(nextCount);
        }
      });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, []);

  if (count === null) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-2 right-20 z-[75] text-[10px] text-muted-foreground/90">
      {count} user visits
    </div>
  );
}
