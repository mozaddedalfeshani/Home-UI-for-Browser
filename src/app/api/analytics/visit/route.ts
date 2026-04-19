import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import {
  getLocalVisitCount,
  incrementLocalVisitCount,
} from "@/lib/localAnalytics";

export const runtime = "nodejs";

type VisitBody = {
  tabId?: string;
  title?: string;
  url?: string;
  source?: string;
};

export async function POST(request: Request) {
  let tabId: string | undefined;
  let url: string | undefined;
  let key = "unknown";
  let title: string | null = null;
  let source: string | null = null;

  try {
    const body = (await request.json()) as VisitBody;
    tabId = body.tabId?.trim();
    url = body.url?.trim();
    title = body.title ?? null;
    source = body.source ?? null;

    if (!tabId && !url) {
      return NextResponse.json(
        { error: "tabId or url is required." },
        { status: 400 },
      );
    }

    key = tabId || url || "unknown";

    const db = await getMongoDb();
    const visitsCollection = db.collection("visit_counts");

    await visitsCollection.updateOne(
      { key },
      {
        $inc: { count: 1 },
        $set: {
          key,
          tabId: tabId ?? null,
          title,
          url: url ?? null,
          source,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    const row = await visitsCollection.findOne(
      { key },
      { projection: { _id: 0, key: 1, tabId: 1, count: 1 } },
    );

    return NextResponse.json({
      success: true,
      source: "mongodb",
      data: row,
    });
  } catch (error) {
    console.error("Failed to save visit analytics", error);
    const fallbackRow = await incrementLocalVisitCount({
      key,
      tabId: tabId ?? null,
      title,
      url: url ?? null,
      source,
    });

    return NextResponse.json({
      success: true,
      source: "local",
      data: {
        key,
        tabId: fallbackRow.tabId,
        url: fallbackRow.url,
        count: fallbackRow.count,
      },
      error: "MongoDB save failed. Saved locally instead.",
    });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tabId = searchParams.get("tabId")?.trim();
  const url = searchParams.get("url")?.trim();

  if (!tabId && !url) {
    return NextResponse.json(
      { error: "Query parameter `tabId` or `url` is required." },
      { status: 400 },
    );
  }

  const key = tabId || url || "unknown";

  try {
    const db = await getMongoDb();
    const visitsCollection = db.collection("visit_counts");
    const row = await visitsCollection.findOne(
      { key },
      { projection: { _id: 0, key: 1, tabId: 1, url: 1, count: 1 } },
    );

    return NextResponse.json({
      success: true,
      source: "homeui",
      data: {
        key,
        tabId: tabId ?? null,
        url: url ?? null,
        count: row?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Failed to fetch visit analytics", error);
    const fallbackRow = await getLocalVisitCount(key);

    return NextResponse.json({
      success: true,
      source: "local",
      data: {
        key,
        tabId: fallbackRow?.tabId ?? tabId ?? null,
        url: fallbackRow?.url ?? url ?? null,
        count: fallbackRow?.count ?? 0,
      },
      error: "MongoDB read failed. Read local fallback instead.",
    });
  }
}
