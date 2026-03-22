import { useCallback, useMemo, useState } from "react";
import { BookmarkX, CircleCheck, CircleDashed, Inbox, Loader2, X } from "lucide-react";
import { EntryCard } from "./EntryCard.js";
import {
  useEntries,
  useMarkRead,
  useMarkUnread,
  useMarkUnfavorite,
} from "../../hooks/useEntries.js";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver.js";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import type { Feed, Entry } from "../../lib/api.js";

interface EntryListProps {
  feedId?: string;
  isRead?: string;
  isFavorite?: string;
  feeds?: Feed[];
  groupByDate?: boolean;
  hideReadState?: boolean;
}

function formatDateLabel(dateStr: string): string {
  if (dateStr === "unknown") return "Unknown date";
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d (EEE)");
}

function AnimatedEntryCard({
  entry,
  index,
  feedTitle,
  feedType,
  feedUrl,
  hasSelection,
  selected,
  onSelect,
  hideReadState,
}: {
  entry: Entry;
  index: number;
  feedTitle?: string;
  feedType?: Feed["feedType"];
  feedUrl?: string;
  hasSelection?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  hideReadState?: boolean;
}) {
  return (
    <div
      className="animate-appear"
      style={index < 5 ? { animationDelay: `${index * 50}ms` } : undefined}
    >
      <EntryCard
        entry={entry}
        feedTitle={feedTitle}
        feedType={feedType}
        feedUrl={feedUrl}
        hasSelection={hasSelection}
        selected={selected}
        onSelect={onSelect}
        hideReadState={hideReadState}
      />
    </div>
  );
}

function PaginationFooter({ isFetchingNextPage }: { isFetchingNextPage: boolean }) {
  if (!isFetchingNextPage) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-secondary text-sm">
      <Loader2 size={16} className="animate-spin" />
      Loading...
    </div>
  );
}

export function EntryList({
  feedId,
  isRead,
  isFavorite,
  feeds,
  groupByDate,
  hideReadState,
}: EntryListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useEntries({
    feedId,
    isRead,
    isFavorite,
  });
  const markRead = useMarkRead();
  const markUnread = useMarkUnread();
  const markUnfavorite = useMarkUnfavorite();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const hasSelection = selectedIds.size > 0;

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkAction = useCallback(
    (mutate: (ids: string[], options: { onSuccess: () => void }) => void) => {
      mutate([...selectedIds], { onSuccess: () => setSelectedIds(new Set()) });
    },
    [selectedIds],
  );

  const onIntersect = useCallback(() => void fetchNextPage(), [fetchNextPage]);
  const observerRef = useIntersectionObserver(
    onIntersect,
    hasNextPage === true && !isFetchingNextPage,
  );

  const feedMap = useMemo(() => new Map(feeds?.map((f) => [f.id, f])), [feeds]);
  const allEntries = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const grouped = useMemo(() => {
    if (!groupByDate) return null;
    const groups: { label: string; dateKey: string; entries: typeof allEntries }[] = [];
    let currentKey = "";
    for (const entry of allEntries) {
      const key = entry.publishedAt ? format(parseISO(entry.publishedAt), "yyyy-MM-dd") : "unknown";
      if (key !== currentKey) {
        currentKey = key;
        groups.push({ label: formatDateLabel(key), dateKey: key, entries: [] });
      }
      groups.at(-1)!.entries.push(entry);
    }
    return groups;
  }, [allEntries, groupByDate]);

  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="py-3 px-2">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 shimmer" />
              <div className="flex-1">
                <div className="h-4 shimmer w-3/4 mb-2" />
                <div className="h-3 shimmer w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-appear">
        <div className="w-14 h-14 bg-surface-container flex items-center justify-center mb-4">
          <Inbox size={24} className="text-secondary" />
        </div>
        <p className="text-secondary font-medium">No entries</p>
        <p className="text-sm text-secondary/60 mt-1 text-center max-w-xs">
          Add RSS feeds from "Feeds" in the sidebar to see your timeline here
        </p>
      </div>
    );
  }

  const isPending = markRead.isPending || markUnread.isPending || markUnfavorite.isPending;

  const barBtnClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-on-primary hover:text-primary disabled:opacity-40 transition-colors duration-150 [transition-timing-function:linear]";

  const floatingBar = (hasSelection || isPending) && (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-primary text-on-primary outline outline-2 outline-primary rounded-xl">
      <span className="text-sm font-mono">{selectedIds.size} selected</span>
      <div className="w-px h-5 bg-on-primary/30" />
      {hideReadState ? (
        <button
          onClick={() => handleBulkAction(markUnfavorite.mutate)}
          disabled={isPending}
          className={barBtnClass}
        >
          <BookmarkX size={14} />
          Unfavorite
        </button>
      ) : (
        <>
          <button
            onClick={() => handleBulkAction(markRead.mutate)}
            disabled={isPending}
            className={barBtnClass}
          >
            <CircleCheck size={14} />
            Read
          </button>
          <button
            onClick={() => handleBulkAction(markUnread.mutate)}
            disabled={isPending}
            className={barBtnClass}
          >
            <CircleDashed size={14} />
            Unread
          </button>
        </>
      )}
      <div className="w-px h-5 bg-on-primary/30" />
      <button onClick={() => setSelectedIds(new Set())} className={barBtnClass}>
        <X size={14} />
        Clear
      </button>
    </div>
  );

  if (grouped) {
    return (
      <div className={hasSelection ? "pb-20" : ""}>
        {grouped.map((group) => (
          <div key={group.dateKey}>
            <div className="flex items-center gap-3 py-3">
              <span className="text-xs font-semibold text-secondary uppercase tracking-widest whitespace-nowrap font-display">
                {group.label}
              </span>
              <div className="flex-1" />
              <span className="text-xs text-secondary font-mono">{group.entries.length}</span>
            </div>
            <div className="space-y-2">
              {group.entries.map((entry, i) => (
                <AnimatedEntryCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  feedTitle={feedMap.get(entry.feedId)?.title ?? undefined}
                  feedType={feedMap.get(entry.feedId)?.feedType}
                  feedUrl={feedMap.get(entry.feedId)?.url}
                  hasSelection={hasSelection}
                  selected={selectedIds.has(entry.id)}
                  onSelect={handleSelect}
                  hideReadState={hideReadState}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={observerRef} className="h-4" />
        <PaginationFooter isFetchingNextPage={isFetchingNextPage} />
        {floatingBar}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${hasSelection ? "pb-20" : ""}`}>
      {allEntries.map((entry, i) => (
        <AnimatedEntryCard
          key={entry.id}
          entry={entry}
          index={i}
          feedTitle={feedMap.get(entry.feedId)?.title ?? undefined}
          feedType={feedMap.get(entry.feedId)?.feedType}
          hasSelection={hasSelection}
          selected={selectedIds.has(entry.id)}
          onSelect={handleSelect}
          hideReadState={hideReadState}
        />
      ))}
      <div ref={observerRef} className="h-4" />
      <PaginationFooter isFetchingNextPage={isFetchingNextPage} />
      {floatingBar}
    </div>
  );
}
