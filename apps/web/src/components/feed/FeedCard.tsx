import { Link } from "react-router";
import { Rss, GitBranch, RefreshCw, Trash2 } from "lucide-react";
import type { Feed } from "../../lib/api.js";
import { useDeleteFeed, useRefreshFeed } from "../../hooks/useFeeds.js";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface FeedCardProps {
  feed: Feed;
}

export function FeedCard({ feed }: FeedCardProps) {
  const deleteFeed = useDeleteFeed();
  const refreshFeed = useRefreshFeed();

  const isChangelog = feed.feedType === "changelog";

  return (
    <div className="group bg-surface-1 rounded-lg p-5 border border-border hover:border-border-strong transition-colors">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/feeds/${feed.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isChangelog ? "bg-emerald-50" : "bg-accent-subtle"
              }`}
            >
              {isChangelog ? (
                <GitBranch size={16} className="text-changelog" />
              ) : (
                <Rss size={16} className="text-accent" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate text-ink">{feed.title ?? feed.url}</h3>
                <span
                  className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded ${
                    isChangelog ? "bg-emerald-50 text-changelog" : "bg-accent-subtle text-accent"
                  }`}
                >
                  {feed.feedType}
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5 truncate font-mono">{feed.url}</p>
            </div>
          </div>
          {feed.lastFetchedAt && (
            <p className="text-xs text-ink-muted mt-2 ml-12">
              最終取得:{" "}
              {formatDistanceToNow(new Date(feed.lastFetchedAt), {
                addSuffix: true,
                locale: ja,
              })}
            </p>
          )}
        </Link>

        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => refreshFeed.mutate(feed.id)}
            disabled={refreshFeed.isPending}
            className="p-2 hover:bg-accent-subtle hover:text-accent rounded-lg transition-colors"
            title="更新"
          >
            <RefreshCw size={14} className={refreshFeed.isPending ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              if (confirm("このフィードを削除しますか？")) {
                deleteFeed.mutate(feed.id);
              }
            }}
            className="p-2 hover:bg-red-50 text-destructive rounded-lg transition-colors"
            title="削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
