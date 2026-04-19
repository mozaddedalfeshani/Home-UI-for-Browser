import { unstable_noStore as noStore } from "next/cache";
import { PageClient } from "./PageClient";
import { incrementSiteVisitCount } from "@/lib/siteVisit.server";

export default async function Home() {
  noStore();

  const siteVisitCount = await incrementSiteVisitCount();

  return (
    <>
      <PageClient />
      <div className="pointer-events-none fixed bottom-2 right-20 z-[75] text-[10px] text-muted-foreground/90">
        {siteVisitCount} user visites
      </div>
    </>
  );
}
