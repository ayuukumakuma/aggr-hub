import { useParams, useNavigate } from "react-router";
import { CheckCheck, Circle, RefreshCw, Trash2 } from "lucide-react";
import { useFeed, useRefreshFeed, useDeleteFeed } from "../hooks/useFeeds.js";
import { useMarkAllRead, useMarkAllUnread } from "../hooks/useEntries.js";
import { EntryList } from "../components/entry/EntryList.js";
import { DropdownMenu } from "../components/ui/DropdownMenu.js";

export function FeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: feed, isLoading } = useFeed(id!);
  const refreshFeed = useRefreshFeed();
  const deleteFeed = useDeleteFeed();
  const markAllRead = useMarkAllRead();
  const markAllUnread = useMarkAllUnread();

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
    return <div className="max-w-3xl mx-auto text-center py-12 text-secondary">Feed not found</div>;
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
          <DropdownMenu
            items={[
              {
                label: "Mark All Read",
                icon: <CheckCheck size={14} />,
                onClick: () => markAllRead.mutate(feed.id),
                disabled: markAllRead.isPending || markAllUnread.isPending,
              },
              {
                label: "Mark All Unread",
                icon: <Circle size={14} />,
                onClick: () => markAllUnread.mutate(feed.id),
                disabled: markAllRead.isPending || markAllUnread.isPending,
              },
              {
                label: "Refresh",
                icon: (
                  <RefreshCw size={14} className={refreshFeed.isPending ? "animate-spin" : ""} />
                ),
                onClick: () => refreshFeed.mutate(feed.id),
                disabled: refreshFeed.isPending,
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                onClick: () => {
                  if (confirm("Delete this feed?")) {
                    deleteFeed.mutate(feed.id, { onSuccess: () => navigate("/feeds") });
                  }
                },
                variant: "destructive",
                disabled: deleteFeed.isPending,
              },
            ]}
          />
        </div>
      </div>

      <EntryList feedId={feed.id} />
    </div>
  );
}
