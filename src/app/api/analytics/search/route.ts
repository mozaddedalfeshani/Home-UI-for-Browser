import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import {
  getLocalSearchCount,
  incrementLocalSearchCount,
} from "@/lib/localAnalytics";

export const runtime = "nodejs";

type SearchBody = {
  query?: string;
  searchEngine?: string;
};

export async function POST(request: Request) {
  let query = "";
  let normalizedQuery = "";
  let searchEngine: string | null = null;

  try {
    const body = (await request.json()) as SearchBody;
    query = body.query?.trim() ?? "";
    searchEngine = body.searchEngine ?? null;

    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    normalizedQuery = query.toLowerCase();
    const db = await getMongoDb();
    const searchCollection = db.collection("search_queries");

    await searchCollection.updateOne(
      { normalizedQuery },
      {
        $inc: { count: 1 },
        $set: {
          query,
          normalizedQuery,
          searchEngine,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    const row = await searchCollection.findOne(
      { normalizedQuery },
      { projection: { _id: 0, query: 1, normalizedQuery: 1, count: 1 } },
    );

    return NextResponse.json({
      success: true,
      source: "mongodb",
      data: row,
    });
  } catch (error) {
    console.error("Failed to save search analytics", error);
    const fallbackRow = await incrementLocalSearchCount({
      query,
      normalizedQuery,
      searchEngine,
    });

    return NextResponse.json({
      success: true,
      source: "local",
      data: {
        query: fallbackRow.query,
        normalizedQuery: fallbackRow.normalizedQuery,
        count: fallbackRow.count,
      },
      error: "MongoDB save failed. Saved locally instead.",
    });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter `query` is required." },
      { status: 400 },
    );
  }

  const normalizedQuery = query.toLowerCase();

  try {
    const db = await getMongoDb();
    const searchCollection = db.collection("search_queries");

    const row = await searchCollection.findOne(
      { normalizedQuery },
      { projection: { _id: 0, query: 1, normalizedQuery: 1, count: 1 } },
    );

    return NextResponse.json({
      success: true,
      source: "mongodb",
      data: {
        query,
        normalizedQuery,
        count: row?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Failed to fetch search analytics", error);
    const fallbackRow = await getLocalSearchCount(normalizedQuery);

    return NextResponse.json({
      success: true,
      source: "local",
      data: {
        query: fallbackRow?.query ?? query,
        normalizedQuery,
        count: fallbackRow?.count ?? 0,
      },
      error: "MongoDB read failed. Read local fallback instead.",
    });
  }
}
