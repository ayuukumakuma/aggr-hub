import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";

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
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["feeds"] });
      await qc.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useDeleteFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.feeds.delete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["feeds"] });
      await qc.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useRefreshFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.feeds.refresh(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
      await qc.invalidateQueries({ queryKey: ["feeds"] });
    },
  });
}
