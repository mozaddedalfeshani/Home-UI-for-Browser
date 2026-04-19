import { getMongoDb } from "@/lib/mongodb";
import { incrementLocalVisitCount } from "@/lib/localAnalytics";

const siteVisitPayload = {
  key: "site-homepage",
  tabId: "site-homepage",
  title: "Home UI",
  url: null,
  source: "site-load",
} as const;

export const incrementSiteVisitCount = async () => {
  try {
    const db = await getMongoDb();
    const visitsCollection = db.collection("visit_counts");

    await visitsCollection.updateOne(
      { key: siteVisitPayload.key },
      {
        $inc: { count: 1 },
        $set: {
          key: siteVisitPayload.key,
          tabId: siteVisitPayload.tabId,
          title: siteVisitPayload.title,
          url: siteVisitPayload.url,
          source: siteVisitPayload.source,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    const row = await visitsCollection.findOne(
      { key: siteVisitPayload.key },
      { projection: { _id: 0, count: 1 } },
    );

    return row?.count ?? 0;
  } catch (error) {
    console.error("Failed to increment SSR site visit count", error);

    const fallbackRow = await incrementLocalVisitCount(siteVisitPayload);
    return fallbackRow.count;
  }
};
