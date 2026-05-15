import sql from "@/lib/db";
import { incrementLocalVisitCount } from "@/lib/localAnalytics";

const siteVisitPayload = {
  key: "site-homepage",
  tabId: "site-homepage",
  title: "LaunchTab",
  url: null,
  source: "site-load",
} as const;

export const incrementSiteVisitCount = async () => {
  try {
    const rows = await sql`
      INSERT INTO visit_counts (key, tab_id, title, url, source, count, created_at, updated_at)
      VALUES (
        ${siteVisitPayload.key}, ${siteVisitPayload.tabId}, ${siteVisitPayload.title},
        ${siteVisitPayload.url}, ${siteVisitPayload.source}, 1, NOW(), NOW()
      )
      ON CONFLICT (key) DO UPDATE SET
        count = visit_counts.count + 1,
        updated_at = NOW()
      RETURNING count
    `;
    return (rows[0] as { count: number })?.count ?? 0;
  } catch (error) {
    console.error("Failed to increment SSR site visit count", error);
    const fallbackRow = await incrementLocalVisitCount(siteVisitPayload);
    return fallbackRow.count;
  }
};
