import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { PageClient } from "./PageClient";
import { incrementSiteVisitCount } from "@/lib/siteVisit.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function VisitorCount() {
  noStore();
  const count = await incrementSiteVisitCount();
  return (
    <div className="pointer-events-none fixed bottom-2 right-20 z-[75] text-[10px] text-muted-foreground/90">
      {count} user visites
    </div>
  );
}

export default function Home() {
  noStore();
  return (
    <>
      <PageClient />
      <Suspense fallback={null}>
        <VisitorCount />
      </Suspense>
    </>
  );
}
