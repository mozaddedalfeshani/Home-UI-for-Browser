"use client";

import { useEffect, useState } from "react";
import { registerSiteVisit } from "@/lib/analyticsClient";

const VISIT_COUNT_CACHE_KEY = "lt_visit_count";

export function SiteVisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const cached = localStorage.getItem(VISIT_COUNT_CACHE_KEY);
    const cachedNum = cached ? parseInt(cached, 10) : NaN;
    if (!isNaN(cachedNum)) setCount(cachedNum);

    const timer = window.setTimeout(() => {
      void registerSiteVisit().then((nextCount) => {
        if (!isActive) return;
        setCount(nextCount);
        localStorage.setItem(VISIT_COUNT_CACHE_KEY, String(nextCount));
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
