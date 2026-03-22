import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";

export function useEntries(params?: { feedId?: string; isRead?: string; isFavorite?: string }) {
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

export function useToggleFavorite() {
  return useEntryMutation(({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
    api.entries.update(id, { isFavorite }),
  );
}

export function useToggleRead() {
  return useEntryMutation(({ id, isRead }: { id: string; isRead: boolean }) =>
    api.entries.update(id, { isRead }),
  );
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

export function useMarkAllUnread() {
  return useEntryMutation((feedId?: string) => api.entries.markAllUnread(feedId));
}

export function useRetrySummary() {
  return useEntryMutation((id: string) => api.entries.retrySummary(id));
}
