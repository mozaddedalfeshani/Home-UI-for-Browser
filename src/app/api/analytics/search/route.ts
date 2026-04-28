import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { getRedisClient } from "@/lib/redis";
import {
  getLocalSearchCount,
  incrementLocalSearchCount,
} from "@/lib/localAnalytics";

export const runtime = "nodejs";

type SearchBody = {
  query?: string;
  searchEngine?: string;
};

const SEARCH_SUGGESTION_LIMIT = 6;
const SEARCH_SUGGESTION_CACHE_TTL_SECONDS = 600;
const SEARCH_API_HEADER = "x-home-ui-request";
const SEARCH_API_HEADER_VALUE = "search-analytics";
const SEARCH_API_RATE_LIMIT_WINDOW_SECONDS = 60;
const SEARCH_API_RATE_LIMITS = {
  read: 120,
  write: 60,
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSearchSuggestionCacheKey = (normalizedQuery: string) =>
  `search:suggestions:v1:${normalizedQuery}`;

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
};

const isSameOriginRequest = (request: Request) => {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (
    fetchSite &&
    ["same-origin", "same-site", "none"].includes(fetchSite)
  ) {
    return true;
  }

  if (origin) {
    return origin === requestUrl.origin;
  }

  if (referer) {
    try {
      return new URL(referer).origin === requestUrl.origin;
    } catch {
      return false;
    }
  }

  return process.env.NODE_ENV !== "production";
};

const validateSearchApiRequest = (request: Request) => {
  const requestHeader = request.headers.get(SEARCH_API_HEADER);

  if (requestHeader !== SEARCH_API_HEADER_VALUE || !isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return null;
};

const enforceSearchApiRateLimit = async (
  request: Request,
  scope: "read" | "write",
) => {
  const redis = await getRedisClient();

  if (!redis) {
    return null;
  }

  const key = `rate:search-api:${scope}:${getClientIp(request)}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, SEARCH_API_RATE_LIMIT_WINDOW_SECONDS);
    }

    if (count > SEARCH_API_RATE_LIMITS[scope]) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429 },
      );
    }
  } catch (error) {
    console.error("Failed to enforce search API rate limit", error);
  }

  return null;
};

const getCachedSearchSuggestions = async (normalizedQuery: string) => {
  const redis = await getRedisClient();

  if (!redis) {
    return null;
  }

  try {
    const cachedValue = await redis.get(
      getSearchSuggestionCacheKey(normalizedQuery),
    );

    if (!cachedValue) {
      return null;
    }

    const parsedValue = JSON.parse(cachedValue);

    if (!Array.isArray(parsedValue)) {
      return null;
    }

    return parsedValue.filter(
      (value): value is string => typeof value === "string",
    );
  } catch (error) {
    console.error("Failed to read search suggestions from Redis", error);
    return null;
  }
};

const setCachedSearchSuggestions = async (
  normalizedQuery: string,
  suggestions: string[],
) => {
  const redis = await getRedisClient();

  if (!redis) {
    return;
  }

  try {
    await redis.setEx(
      getSearchSuggestionCacheKey(normalizedQuery),
      SEARCH_SUGGESTION_CACHE_TTL_SECONDS,
      JSON.stringify(suggestions),
    );
  } catch (error) {
    console.error("Failed to cache search suggestions in Redis", error);
  }
};

export async function POST(request: Request) {
  let query = "";
  let normalizedQuery = "";
  let searchEngine: string | null = null;

  try {
    const guardResponse = validateSearchApiRequest(request);

    if (guardResponse) {
      return guardResponse;
    }

    const rateLimitResponse = await enforceSearchApiRateLimit(
      request,
      "write",
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = (await request.json()) as SearchBody;
    query = body.query?.trim() ?? "";
    searchEngine = body.searchEngine ?? null;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 },
      );
    }

    normalizedQuery = query.toLowerCase();
    const db = await getMongoDb();
    const searchCollection = db.collection("search_queries");

    const writeResult = await searchCollection.updateOne(
      { normalizedQuery },
      {
        $setOnInsert: {
          query,
          normalizedQuery,
          searchEngine,
          count: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
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
      duplicate: writeResult.matchedCount > 0,
      data: row,
    });
  } catch (error) {
    console.error("Failed to save search analytics", error);
    const existingFallbackRow = await getLocalSearchCount(normalizedQuery);

    if (existingFallbackRow) {
      return NextResponse.json({
        success: true,
        source: "local",
        duplicate: true,
        data: {
          query: existingFallbackRow.query,
          normalizedQuery: existingFallbackRow.normalizedQuery,
          count: existingFallbackRow.count,
        },
        error: "MongoDB save failed. Read local duplicate instead.",
      });
    }

    const fallbackRow = await incrementLocalSearchCount({
      query,
      normalizedQuery,
      searchEngine,
    });

    return NextResponse.json({
      success: true,
      source: "local",
      duplicate: false,
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
  const guardResponse = validateSearchApiRequest(request);

  if (guardResponse) {
    return guardResponse;
  }

  const rateLimitResponse = await enforceSearchApiRateLimit(request, "read");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  const shouldReturnSuggestions = searchParams.get("suggestions") === "1";

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

    if (shouldReturnSuggestions) {
      const cachedSuggestions =
        await getCachedSearchSuggestions(normalizedQuery);

      if (cachedSuggestions) {
        return NextResponse.json({
          success: true,
          source: "redis",
          data: cachedSuggestions,
        });
      }

      const rows = await searchCollection
        .find(
          {
            normalizedQuery: {
              $regex: escapeRegex(normalizedQuery),
              $options: "i",
            },
          },
          { projection: { _id: 0, query: 1 } },
        )
        .sort({ updatedAt: -1 })
        .limit(SEARCH_SUGGESTION_LIMIT)
        .toArray();
      const suggestions = rows
        .map((row) => row.query)
        .filter((value): value is string => typeof value === "string");

      void setCachedSearchSuggestions(normalizedQuery, suggestions);

      return NextResponse.json({
        success: true,
        source: "mongodb",
        data: suggestions,
      });
    }

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

    if (shouldReturnSuggestions) {
      return NextResponse.json({
        success: true,
        source: "local",
        data: [],
        error: "MongoDB read failed. No local suggestions available.",
      });
    }

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
