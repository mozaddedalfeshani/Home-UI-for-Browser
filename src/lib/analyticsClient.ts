export type VisitPayload = {
  tabId?: string;
  title?: string;
  url?: string;
  source?: string;
};

const postJson = async (path: string, payload: unknown) => {
  try {
    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Ignore analytics errors so UX is never blocked.
  }
};

export const trackVisit = (payload: VisitPayload) => {
  void postJson("/api/analytics/visit", payload);
};

export const trackSearch = (query: string, searchEngine: string) => {
  void postJson("/api/analytics/search", { query, searchEngine });
};

type VisitResponse = {
  success?: boolean;
  data?: {
    count?: number;
  };
};

export const registerSiteVisit = async () => {
  try {
    const response = await fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tabId: "site-homepage",
        title: "Home UI",
        url: typeof window !== "undefined" ? window.location.origin : null,
        source: "site-load",
      }),
      keepalive: true,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as VisitResponse;
    return payload.data?.count ?? null;
  } catch {
    return null;
  }
};
