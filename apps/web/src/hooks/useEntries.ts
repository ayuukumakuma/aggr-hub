import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import type { Entry, PaginatedEntries } from "../lib/api.js";

type EntriesData = {
  pages: PaginatedEntries[];
  pageParams: unknown[];
};

type EntryPatch = Pick<Entry, "id"> & Partial<Pick<Entry, "isRead" | "isFavorite" | "isReadLater">>;

export function useEntries(params?: {
  feedId?: string;
  isRead?: string;
  isFavorite?: string;
  isReadLater?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["entries", params],
    queryFn: ({ pageParam }) => api.entries.list({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    refetchInterval: (query) => {
      const hasPending = query.state.data?.pages.some((page) =>
        page.data.some((entry) => entry.summaryStatus === "pending"),
      );
      return hasPending ? 3000 : false;
    },
  });
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: ["entries", "detail", id],
    queryFn: () => api.entries.get(id),
  });
}

function useEntryMutation<TInput>(mutationFn: (input: TInput) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function updateEntryPages<T>(
  data: T,
  entryId: string,
  patch: Partial<Pick<Entry, "isRead" | "isFavorite" | "isReadLater">>,
): T {
  if (!isEntriesData(data)) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry)),
    })),
  } as T;
}

function isEntriesData(data: unknown): data is EntriesData {
  return typeof data === "object" && data !== null && Array.isArray((data as EntriesData).pages);
}

function useEntryPatchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: EntryPatch) => api.entries.update(id, patch),
    onMutate: async ({ id, ...patch }) => {
      await qc.cancelQueries({ queryKey: ["entries"] });
      const previous = qc.getQueriesData({ queryKey: ["entries"] });
      qc.setQueriesData({ queryKey: ["entries"] }, (data) => updateEntryPages(data, id, patch));
      return { previous };
    },
    onError: (_error, _input, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        qc.setQueryData(queryKey, data);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useToggleFavorite() {
  return useEntryPatchMutation();
}

export function useToggleRead() {
  return useEntryPatchMutation();
}

export function useMarkRead() {
  return useEntryMutation((entryIds: string[]) => api.entries.markRead(entryIds));
}

export function useMarkAllRead() {
  return useEntryMutation((feedId?: string) => api.entries.markAllRead(feedId));
}

export function useMarkUnread() {
  return useEntryMutation((entryIds: string[]) => api.entries.markUnread(entryIds));
}

export function useMarkUnfavorite() {
  return useEntryMutation((entryIds: string[]) => api.entries.markUnfavorite(entryIds));
}

export function useToggleReadLater() {
  return useEntryPatchMutation();
}

export function useMarkUnreadLater() {
  return useEntryMutation((entryIds: string[]) => api.entries.markUnreadLater(entryIds));
}

export function useMarkAllUnread() {
  return useEntryMutation((feedId?: string) => api.entries.markAllUnread(feedId));
}

export function useRetrySummary() {
  return useEntryMutation((id: string) => api.entries.retrySummary(id));
}
