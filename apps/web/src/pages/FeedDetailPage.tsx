import { useParams, useNavigate } from "react-router";
import { RefreshCw, Trash2 } from "lucide-react";
import { useFeed, useRefreshFeed, useDeleteFeed } from "../hooks/useFeeds.js";
import { EntryList } from "../components/entry/EntryList.js";

export function FeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: feed, isLoading } = useFeed(id!);
  const refreshFeed = useRefreshFeed();
  const deleteFeed = useDeleteFeed();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 shimmer w-1/3 mb-2" />
          <div className="h-4 shimmer w-1/2 mb-6" />
        </div>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 text-secondary">
        フィードが見つかりません
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-[-0.02em] font-display text-primary">
            {feed.title ?? feed.url}
          </h1>
          <p className="text-xs text-secondary mt-1.5 font-mono">{feed.url}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshFeed.mutate(feed.id)}
            disabled={refreshFeed.isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm outline outline-1 outline-outline rounded-xl hover:bg-surface-container-high hover:text-primary transition-colors duration-150 [transition-timing-function:linear]"
          >
            <RefreshCw size={14} className={refreshFeed.isPending ? "animate-spin" : ""} />
            更新
          </button>
          <button
            onClick={() => {
              if (confirm("このフィードを削除しますか？")) {
                deleteFeed.mutate(feed.id, { onSuccess: () => navigate("/feeds") });
              }
            }}
            disabled={deleteFeed.isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm outline outline-1 outline-outline rounded-xl text-destructive hover:bg-surface-container-high transition-colors duration-150 [transition-timing-function:linear]"
          >
            <Trash2 size={14} />
            削除
          </button>
        </div>
      </div>

      <EntryList feedId={feed.id} />
    </div>
  );
}
