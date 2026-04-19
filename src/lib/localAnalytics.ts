import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type AnalyticsStore = {
  searchQueries: Record<
    string,
    {
      query: string;
      normalizedQuery: string;
      count: number;
      searchEngine: string | null;
      createdAt: string;
      updatedAt: string;
    }
  >;
  visitCounts: Record<
    string,
    {
      key: string;
      tabId: string | null;
      title: string | null;
      url: string | null;
      source: string | null;
      count: number;
      createdAt: string;
      updatedAt: string;
    }
  >;
};

const analyticsFilePath = path.join(process.cwd(), "data", "analytics.json");

const createEmptyStore = (): AnalyticsStore => ({
  searchQueries: {},
  visitCounts: {},
});

const ensureStore = async () => {
  await mkdir(path.dirname(analyticsFilePath), { recursive: true });

  try {
    const content = await readFile(analyticsFilePath, "utf-8");
    return JSON.parse(content) as AnalyticsStore;
  } catch {
    const emptyStore = createEmptyStore();
    await writeFile(
      analyticsFilePath,
      JSON.stringify(emptyStore, null, 2),
      "utf-8",
    );
    return emptyStore;
  }
};

const saveStore = async (store: AnalyticsStore) => {
  await writeFile(analyticsFilePath, JSON.stringify(store, null, 2), "utf-8");
};

export const incrementLocalSearchCount = async ({
  query,
  normalizedQuery,
  searchEngine,
}: {
  query: string;
  normalizedQuery: string;
  searchEngine: string | null;
}) => {
  const store = await ensureStore();
  const existing =
    store.searchQueries[normalizedQuery] ??
    ({
      query,
      normalizedQuery,
      count: 0,
      searchEngine,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies AnalyticsStore["searchQueries"][string]);

  existing.query = query;
  existing.searchEngine = searchEngine;
  existing.count += 1;
  existing.updatedAt = new Date().toISOString();
  store.searchQueries[normalizedQuery] = existing;

  await saveStore(store);
  return existing;
};

export const getLocalSearchCount = async (normalizedQuery: string) => {
  const store = await ensureStore();
  return store.searchQueries[normalizedQuery] ?? null;
};

export const incrementLocalVisitCount = async ({
  key,
  tabId,
  title,
  url,
  source,
}: {
  key: string;
  tabId: string | null;
  title: string | null;
  url: string | null;
  source: string | null;
}) => {
  const store = await ensureStore();
  const existing =
    store.visitCounts[key] ??
    ({
      key,
      tabId,
      title,
      url,
      source,
      count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies AnalyticsStore["visitCounts"][string]);

  existing.tabId = tabId;
  existing.title = title;
  existing.url = url;
  existing.source = source;
  existing.count += 1;
  existing.updatedAt = new Date().toISOString();
  store.visitCounts[key] = existing;

  await saveStore(store);
  return existing;
};

export const getLocalVisitCount = async (key: string) => {
  const store = await ensureStore();
  return store.visitCounts[key] ?? null;
};
