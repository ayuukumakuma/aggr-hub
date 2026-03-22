import { useState, useRef, useEffect } from "react";
import {
  CircleCheck,
  CircleDashed,
  ChevronDown,
  ChevronUp,
  Square,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import type { Entry, Feed } from "../../lib/api.js";
import { useToggleRead, useToggleFavorite } from "../../hooks/useEntries.js";
import { formatDistanceToNow } from "date-fns";

interface EntryCardProps {
  entry: Entry;
  feedTitle?: string;
  feedType?: Feed["feedType"];
  hasSelection?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  hideReadState?: boolean;
}

export function EntryCard({
  entry,
  feedTitle,
  feedType,
  hasSelection,
  selected,
  onSelect,
  hideReadState,
}: EntryCardProps) {
  const toggleRead = useToggleRead();
  const toggleFavorite = useToggleFavorite();
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

  const actionBtnClass =
    "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] whitespace-nowrap text-secondary hover:text-primary hover:bg-surface-container rounded-lg opacity-0 group-hover:animate-slide-in-right";

  return (
    <div
      className={`relative group flex items-start gap-2 ${hasSelection ? "cursor-pointer" : ""}`}
      onClick={hasSelection ? () => onSelect?.(entry.id) : undefined}
    >
      {hasSelection ? (
        <div className="flex items-center pt-3 pl-1 shrink-0">
          <div
            className={`w-4 h-4 outline outline-1 outline-outline flex items-center justify-center transition-colors duration-150 [transition-timing-function:linear] ${
              selected ? "bg-primary outline-primary" : ""
            }`}
          >
            {selected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-on-primary"
                />
              </svg>
            )}
          </div>
        </div>
      ) : (
        <div className="absolute right-full top-1/2 -translate-y-1/2 z-10 pr-1 pointer-events-none group-hover:pointer-events-auto flex flex-col gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(entry.id);
            }}
            className={actionBtnClass}
            title="Select"
          >
            <Square size={18} />
            Select
          </button>
          {!hideReadState && (
            <button
              onClick={() => toggleRead.mutate({ id: entry.id, isRead: !entry.isRead })}
              className={`${actionBtnClass} group-hover:[animation-delay:60ms]`}
              title={entry.isRead ? "Mark unread" : "Mark read"}
            >
              {entry.isRead ? <CircleDashed size={18} /> : <CircleCheck size={18} />}
              {entry.isRead ? "Mark unread" : "Mark read"}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite.mutate({ id: entry.id, isFavorite: !entry.isFavorite });
            }}
            className={`${actionBtnClass} ${hideReadState ? "group-hover:[animation-delay:60ms]" : "group-hover:[animation-delay:120ms]"}`}
            title={entry.isFavorite ? "Unfavorite" : "Favorite"}
          >
            {entry.isFavorite ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            {entry.isFavorite ? "Unfavorite" : "Favorite"}
          </button>
        </div>
      )}
      <div
        className={`flex-1 min-w-0 bg-surface-container-lowest outline outline-1 rounded-xl py-3 px-3 transition-all duration-150 [transition-timing-function:linear] group-hover:bg-surface-container ${
          selected ? "outline-primary" : "outline-outline"
        } ${!hideReadState && entry.isRead ? "opacity-40" : ""} ${hasSelection && !selected ? "brightness-95 opacity-60" : ""} ${hasSelection ? "pointer-events-none" : ""}`}
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
                  className="font-medium text-primary group-hover:underline transition-colors duration-150 [transition-timing-function:linear]"
                >
                  {entry.title ?? "Untitled"}
                </a>
              ) : (
                <span className="font-medium text-primary">{entry.title ?? "Untitled"}</span>
              )}
              <div className="flex items-center gap-1.5 ml-auto text-xs text-secondary">
                {feedTitle && <span>{feedTitle}</span>}
                {feedTitle && entry.author && <span className="text-outline">/</span>}
                {entry.author && <span>{entry.author}</span>}
                {(feedTitle || entry.author) && entry.publishedAt && (
                  <span className="text-outline">/</span>
                )}
                {entry.publishedAt && (
                  <span>
                    {formatDistanceToNow(new Date(entry.publishedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>

            {entry.summary ? (
              <p className="text-sm text-secondary mt-1 leading-relaxed">{entry.summary}</p>
            ) : entry.contentText ? (
              <p className="text-sm text-secondary mt-1 line-clamp-2 leading-relaxed">
                {entry.contentText}
              </p>
            ) : null}
          </div>

          {entry.ogImageUrl && !imgError && feedType !== "github-releases" && (
            <a
              href={entry.url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 self-center"
            >
              <img
                src={entry.ogImageUrl}
                alt=""
                className="w-60 h-32 object-contain self-center"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            </a>
          )}
        </div>
        {(isOverflowing || expanded) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-0.5 text-[10px] text-secondary mt-1 hover:underline hover:text-primary uppercase tracking-wider"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} />
                Close
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Show more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
