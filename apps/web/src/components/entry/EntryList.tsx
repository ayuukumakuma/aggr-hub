import { useEffect, useRef, useCallback, useMemo } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { EntryCard } from "./EntryCard.js";
import { useEntries } from "../../hooks/useEntries.js";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ja } from "date-fns/locale";
import type { Feed } from "../../lib/api.js";

interface EntryListProps {
  feedId?: string;
  isRead?: string;
  feeds?: Feed[];
  groupByDate?: boolean;
}

function formatDateLabel(dateStr: string): string {
  if (dateStr === "unknown") return "日付不明";
  const date = parseISO(dateStr);
  if (isToday(date)) return "今日";
  if (isYesterday(date)) return "昨日";
  return format(date, "M月d日 (E)", { locale: ja });
}

export function EntryList({ feedId, isRead, feeds, groupByDate }: EntryListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useEntries({
    feedId,
    isRead,
  });

  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

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
          <div key={i} className="border-b border-border py-3 px-2">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full shimmer" />
              <div className="flex-1">
                <div className="h-4 shimmer rounded w-3/4 mb-2" />
                <div className="h-3 shimmer rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4">
          <Inbox size={24} className="text-ink-muted" />
        </div>
        <p className="text-ink-muted font-medium">エントリがありません</p>
        <p className="text-sm text-ink-muted/60 mt-1 text-center max-w-xs">
          サイドバーの「フィード管理」からRSS/Changelogフィードを追加すると、ここにタイムラインが表示されます
        </p>
      </div>
    );
  }

  if (grouped) {
    return (
      <div>
        {grouped.map((group) => (
          <div key={group.dateKey}>
            <div className="flex items-center gap-3 py-3">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap">
                {group.label}
              </span>
              <hr className="flex-1 border-border" />
              <span className="text-xs text-ink-muted font-mono">{group.entries.length}</span>
            </div>
            <div className="space-y-2">
              {group.entries.map((entry, i) => (
                <div
                  key={entry.id}
                  className="animate-slide-up"
                  style={i < 5 ? { animationDelay: `${i * 50}ms` } : undefined}
                >
                  <EntryCard
                    entry={entry}
                    feedTitle={feedMap.get(entry.feedId)?.title ?? undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={observerRef} className="h-4" />
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 py-4 text-ink-muted text-sm">
            <Loader2 size={16} className="animate-spin" />
            読み込み中...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allEntries.map((entry, i) => (
        <div
          key={entry.id}
          className="animate-slide-up"
          style={i < 5 ? { animationDelay: `${i * 50}ms` } : undefined}
        >
          <EntryCard entry={entry} feedTitle={feedMap.get(entry.feedId)?.title ?? undefined} />
        </div>
      ))}
      <div ref={observerRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-4 text-ink-muted text-sm">
          <Loader2 size={16} className="animate-spin" />
          読み込み中...
        </div>
      )}
    </div>
  );
}
