import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";

function invalidateFeedAndEntries(qc: QueryClient) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: ["feeds"] }),
    qc.invalidateQueries({ queryKey: ["entries"] }),
  ]);
}

export function useFeeds() {
  return useQuery({
    queryKey: ["feeds"],
    queryFn: api.feeds.list,
  });
}

export function useFeed(id: string) {
  return useQuery({
    queryKey: ["feeds", id],
    queryFn: () => api.feeds.get(id),
  });
}

export function useCreateFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => api.feeds.create(url),
    onSuccess: () => invalidateFeedAndEntries(qc),
  });
}

export function useDeleteFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.feeds.delete(id),
    onSuccess: () => invalidateFeedAndEntries(qc),
  });
}

export function useRefreshFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.feeds.refresh(id),
    onSuccess: () => invalidateFeedAndEntries(qc),
  });
}
