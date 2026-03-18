import { useParams } from "react-router";
import { RefreshCw } from "lucide-react";
import { useFeed, useRefreshFeed } from "../hooks/useFeeds.js";
import { EntryList } from "../components/entry/EntryList.js";

export function FeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: feed, isLoading } = useFeed(id!);
  const refreshFeed = useRefreshFeed();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 shimmer rounded w-1/3 mb-2" />
          <div className="h-4 shimmer rounded w-1/2 mb-6" />
        </div>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 text-ink-muted">
        フィードが見つかりません
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-ink">
            {feed.title ?? feed.url}
          </h1>
          <p className="text-xs text-ink-muted mt-1.5 font-mono">{feed.url}</p>
        </div>
        <button
          onClick={() => refreshFeed.mutate(feed.id)}
          disabled={refreshFeed.isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm border border-border rounded-lg hover:bg-accent-subtle hover:border-accent/30 hover:text-accent transition-colors"
        >
          <RefreshCw size={14} className={refreshFeed.isPending ? "animate-spin" : ""} />
          更新
        </button>
      </div>

      <EntryList feedId={feed.id} />
    </div>
  );
}
