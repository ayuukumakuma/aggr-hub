import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";

export function useEntries(params?: { feedId?: string; isRead?: string }) {
  return useInfiniteQuery({
    queryKey: ["entries", params],
    queryFn: ({ pageParam }) => api.entries.list({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: ["entries", "detail", id],
    queryFn: () => api.entries.get(id),
  });
}

export function useToggleRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      api.entries.update(id, { isRead }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryIds: string[]) => api.entries.markRead(entryIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useRegenerateSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.entries.regenerateSummary(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}
