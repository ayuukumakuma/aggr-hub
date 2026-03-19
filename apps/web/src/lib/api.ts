const BASE = "/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface Feed {
  id: string;
  url: string;
  title: string | null;
  siteUrl: string | null;
  feedType: "rss" | "atom";
  description: string | null;
  iconUrl: string | null;
  lastFetchedAt: string | null;
  fetchIntervalMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  feedId: string;
  title: string | null;
  url: string | null;
  contentHtml: string | null;
  contentText: string | null;
  author: string | null;
  publishedAt: string | null;
  isRead: boolean;
  isFavorite: boolean;
  guid: string;
  ogImageUrl: string | null;
  summary: string | null;
  createdAt: string;
}

export interface PaginatedEntries {
  data: Entry[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const api = {
  feeds: {
    list: () => request<Feed[]>("/feeds"),
    get: (id: string) => request<Feed>(`/feeds/${id}`),
    create: (url: string) =>
      request<Feed>("/feeds", {
        method: "POST",
        body: JSON.stringify({ url }),
      }),
    update: (
      id: string,
      data: Partial<Pick<Feed, "title" | "fetchIntervalMinutes" | "isActive">>,
    ) =>
      request<Feed>(`/feeds/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<{ success: boolean }>(`/feeds/${id}`, { method: "DELETE" }),
    refresh: (id: string) =>
      request<{ success: boolean }>(`/feeds/${id}/refresh`, { method: "POST" }),
  },
  entries: {
    list: (params?: {
      feedId?: string;
      isRead?: string;
      isFavorite?: string;
      cursor?: string;
      limit?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.feedId) searchParams.set("feedId", params.feedId);
      if (params?.isRead !== undefined) searchParams.set("isRead", params.isRead);
      if (params?.isFavorite !== undefined) searchParams.set("isFavorite", params.isFavorite);
      if (params?.cursor) searchParams.set("cursor", params.cursor);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const query = searchParams.toString();
      return request<PaginatedEntries>(`/entries${query ? `?${query}` : ""}`);
    },
    get: (id: string) => request<Entry>(`/entries/${id}`),
    update: (id: string, data: { isRead?: boolean; isFavorite?: boolean }) =>
      request<Entry>(`/entries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    markRead: (entryIds: string[]) =>
      request<{ success: boolean }>("/entries/mark-read", {
        method: "POST",
        body: JSON.stringify({ entryIds }),
      }),
    markAllRead: (feedId?: string) =>
      request<{ success: boolean }>("/entries/mark-all-read", {
        method: "POST",
        body: JSON.stringify({ feedId }),
      }),
    markUnread: (entryIds: string[]) =>
      request<{ success: boolean }>("/entries/mark-unread", {
        method: "POST",
        body: JSON.stringify({ entryIds }),
      }),
    markAllUnread: (feedId?: string) =>
      request<{ success: boolean }>("/entries/mark-all-unread", {
        method: "POST",
        body: JSON.stringify({ feedId }),
      }),
    markUnfavorite: (entryIds: string[]) =>
      request<{ success: boolean }>("/entries/mark-unfavorite", {
        method: "POST",
        body: JSON.stringify({ entryIds }),
      }),
  },
};
