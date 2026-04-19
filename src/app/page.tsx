import { Suspense } from "react";
import { PageClient } from "./PageClient";
import { incrementSiteVisitCount } from "@/lib/siteVisit.server";

async function VisitorCount() {
  const count = await incrementSiteVisitCount();
  return (
    <div className="pointer-events-none fixed bottom-2 right-20 z-[75] text-[10px] text-muted-foreground/90">
      {count} user visites
    </div>
  );
}

export default function Home() {
  return (
    <>
      <PageClient />
      <Suspense fallback={null}>
        <VisitorCount />
      </Suspense>
    </>
  );
}
