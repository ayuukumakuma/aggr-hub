import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import type { Entry } from "../../lib/api.js";
import { useToggleRead, useRegenerateSummary } from "../../hooks/useEntries.js";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface EntryCardProps {
  entry: Entry;
  feedTitle?: string;
}

export function EntryCard({ entry, feedTitle }: EntryCardProps) {
  const toggleRead = useToggleRead();
  const regenerate = useRegenerateSummary();
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [entry.summary, entry.contentText]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`group flex-1 min-w-0 border border-border rounded-lg py-3 px-3 transition-colors hover:bg-muted/50 ${
          entry.isRead ? "opacity-50" : "border-l-2 border-l-accent"
        }`}
      >
        <div
          ref={contentRef}
          className={`flex items-start gap-3 ${expanded ? "" : "h-36 overflow-hidden"}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {entry.url ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink group-hover:text-accent transition-colors"
                >
                  {entry.title ?? "Untitled"}
                </a>
              ) : (
                <span className="font-medium text-ink">{entry.title ?? "Untitled"}</span>
              )}
              <div className="flex items-center gap-1.5 ml-auto text-xs text-ink-muted">
                {feedTitle && <span>{feedTitle}</span>}
                {feedTitle && entry.author && (
                  <span className="w-1 h-1 rounded-full bg-border-strong" />
                )}
                {entry.author && <span>{entry.author}</span>}
                {(feedTitle || entry.author) && entry.publishedAt && (
                  <span className="w-1 h-1 rounded-full bg-border-strong" />
                )}
                {entry.publishedAt && (
                  <span>
                    {formatDistanceToNow(new Date(entry.publishedAt), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                )}
              </div>
            </div>

            {entry.summary ? (
              <p className="text-sm text-ink-muted mt-1 leading-relaxed">{entry.summary}</p>
            ) : entry.contentText ? (
              <p className="text-sm text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                {entry.contentText}
              </p>
            ) : null}
          </div>

          {entry.ogImageUrl && !imgError && (
            <img
              src={entry.ogImageUrl}
              alt=""
              className="shrink-0 w-60 h-32 rounded object-contain self-center"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        {(isOverflowing || expanded) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-0.5 text-xs text-accent mt-1 hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} />
                閉じる
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                もっと見る
              </>
            )}
          </button>
        )}
      </div>

      <div className="shrink-0 flex flex-col gap-1">
        <button
          onClick={() => regenerate.mutate(entry.id)}
          disabled={regenerate.isPending}
          className="p-2.5 rounded-lg border border-border text-ink-muted hover:border-accent hover:text-accent transition-colors"
          title="要約を再生成"
        >
          <RefreshCw size={24} className={regenerate.isPending ? "animate-spin" : ""} />
        </button>

        <button
          onClick={() => toggleRead.mutate({ id: entry.id, isRead: !entry.isRead })}
          className={`p-2.5 rounded-lg border transition-colors ${
            entry.isRead
              ? "border-border text-ink-muted hover:border-accent hover:text-accent"
              : "border-accent/30 bg-accent-subtle text-accent hover:bg-accent/10"
          }`}
          title={entry.isRead ? "未読にする" : "既読にする"}
        >
          {entry.isRead ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </div>
    </div>
  );
}
