import { Link } from "react-router";
import { RefreshCw, Trash2 } from "lucide-react";
import type { Feed } from "../../lib/api.js";
import { useDeleteFeed, useRefreshFeed } from "../../hooks/useFeeds.js";
import { FeedTypeIcon, FeedTypeBadge } from "./FeedTypeBadge.js";
import { formatDistanceToNow } from "date-fns";

interface FeedCardProps {
  feed: Feed;
}

export function FeedCard({ feed }: FeedCardProps) {
  const deleteFeed = useDeleteFeed();
  const refreshFeed = useRefreshFeed();

  return (
    <div className="group bg-surface-container-lowest outline outline-1 outline-outline rounded-xl p-5 hover:bg-surface-container transition-colors duration-150 [transition-timing-function:linear]">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/feeds/${feed.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-surface-container-high">
              <FeedTypeIcon type={feed.feedType} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate text-primary">{feed.title ?? feed.url}</h3>
                <FeedTypeBadge type={feed.feedType} />
              </div>
              <p className="text-xs text-secondary mt-0.5 truncate font-mono">{feed.url}</p>
            </div>
          </div>
          {feed.lastFetchedAt && (
            <p className="text-xs text-secondary mt-2 ml-12">
              Last fetched:{" "}
              {formatDistanceToNow(new Date(feed.lastFetchedAt), {
                addSuffix: true,
              })}
            </p>
          )}
        </Link>

        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 [transition-timing-function:linear]">
          <button
            onClick={() => refreshFeed.mutate(feed.id)}
            disabled={refreshFeed.isPending}
            className="p-2 outline outline-1 outline-primary text-primary rounded-lg hover:bg-primary hover:text-on-primary transition-colors duration-150 [transition-timing-function:linear]"
            title="Refresh"
          >
            <RefreshCw size={14} className={refreshFeed.isPending ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this feed?")) {
                deleteFeed.mutate(feed.id);
              }
            }}
            className="p-2 outline outline-1 outline-destructive text-destructive rounded-lg hover:bg-destructive hover:text-on-primary transition-colors duration-150 [transition-timing-function:linear]"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
