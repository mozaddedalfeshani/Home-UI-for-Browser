import { PageClient } from "./PageClient";
import { SiteVisitCounter } from "@/components/Home/SiteVisitCounter";

export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <PageClient />
      <SiteVisitCounter />
    </>
  );
}
