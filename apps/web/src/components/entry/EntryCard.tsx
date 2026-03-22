import { useState, useRef, useEffect } from "react";
import {
  CircleCheck,
  CircleDashed,
  ChevronDown,
  ChevronUp,
  Square,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
} from "lucide-react";
import type { Entry, Feed } from "../../lib/api.js";
import { useToggleRead, useToggleFavorite, useRetrySummary } from "../../hooks/useEntries.js";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";

interface EntryCardProps {
  entry: Entry;
  feedTitle?: string;
  feedType?: Feed["feedType"];
  feedUrl?: string;
  hasSelection?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  hideReadState?: boolean;
}

export function EntryCard({
  entry,
  feedTitle,
  feedType,
  feedUrl,
  hasSelection,
  selected,
  onSelect,
  hideReadState,
}: EntryCardProps) {
  const toggleRead = useToggleRead();
  const toggleFavorite = useToggleFavorite();
  const retrySummary = useRetrySummary();
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const githubOrg =
    feedType === "github-releases" && feedUrl
      ? feedUrl.match(/github\.com\/([^/]+)\//)?.[1]
      : undefined;

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [entry.summary, entry.detailedSummary, entry.contentText, showTranslation]);

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
            {feedType === "github-releases" && feedTitle ? (
              <div>
                <div className="flex items-baseline gap-2">
                  {entry.url ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-primary group-hover:underline transition-colors duration-150 [transition-timing-function:linear]"
                    >
                      {entry.title ?? "Untitled"}
                    </a>
                  ) : (
                    <span className="text-lg text-primary">{entry.title ?? "Untitled"}</span>
                  )}
                  <span className="text-sm text-secondary">{feedTitle}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-secondary mt-0.5">
                  {githubOrg && <span>{githubOrg}</span>}
                  {githubOrg && entry.publishedAt && <span className="text-outline">/</span>}
                  {entry.publishedAt && (
                    <span>
                      {formatDistanceToNow(new Date(entry.publishedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </div>
            ) : null}
            <div
              className={`flex items-center gap-2 flex-wrap ${feedType === "github-releases" && feedTitle ? "hidden" : ""}`}
            >
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
                {feedType !== "github-releases" && feedTitle && <span>{feedTitle}</span>}
                {feedType !== "github-releases" && feedTitle && entry.author && (
                  <span className="text-outline">/</span>
                )}
                {entry.author && <span>{entry.author}</span>}
                {((!feedType || feedType !== "github-releases" ? feedTitle : false) ||
                  entry.author) &&
                  entry.publishedAt && <span className="text-outline">/</span>}
                {entry.publishedAt && (
                  <span>
                    {formatDistanceToNow(new Date(entry.publishedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>

            {entry.summaryStatus === "pending" ? (
              <div className="mt-1 space-y-1.5">
                <div className="h-3 w-48 rounded shimmer" />
                <div className="h-3 w-32 rounded shimmer" />
                <p className="text-[10px] text-secondary/60 uppercase tracking-wider mt-0.5">
                  Generating summary...
                </p>
              </div>
            ) : entry.detailedSummary ? (
              <div className="mt-1">
                {showTranslation ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTranslation(false);
                        setExpanded(false);
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary border border-outline rounded-lg px-3 py-1.5 mb-1 hover:bg-surface-container-high transition-colors duration-150 [transition-timing-function:linear] uppercase tracking-wider"
                    >
                      <ChevronUp size={14} />
                      Hide details
                    </button>
                    <div className="release-summary text-sm text-secondary leading-relaxed">
                      <Markdown
                        allowedElements={[
                          "p",
                          "ul",
                          "ol",
                          "li",
                          "strong",
                          "em",
                          "h2",
                          "h3",
                          "h4",
                          "code",
                          "pre",
                        ]}
                        unwrapDisallowed
                      >
                        {entry.detailedSummary}
                      </Markdown>
                    </div>
                  </>
                ) : entry.summary ? (
                  <div className="relative group/summary">
                    <p className="text-sm text-secondary leading-relaxed animate-appear transition-[filter] duration-150 [transition-timing-function:linear] group-hover/summary:blur-[2px]">
                      {entry.summary}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTranslation(true);
                        setExpanded(true);
                      }}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/summary:opacity-100 transition-opacity duration-150 [transition-timing-function:linear]"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-medium text-on-primary bg-primary rounded-lg px-4 py-2 uppercase tracking-wider shadow-md">
                        <ChevronDown size={14} />
                        Show details
                      </span>
                    </button>
                  </div>
                ) : null}
                {entry.summaryStatus === "failed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      retrySummary.mutate(entry.id);
                    }}
                    className="flex items-center gap-1.5 text-xs text-secondary border border-outline rounded-lg px-3 py-1.5 mt-1.5 hover:text-primary hover:bg-surface-container-high transition-colors duration-150 [transition-timing-function:linear] uppercase tracking-wider"
                  >
                    <RotateCcw size={12} />
                    Retry summary
                  </button>
                )}
              </div>
            ) : entry.summary ? (
              <p className="text-sm text-secondary mt-1 leading-relaxed animate-appear">
                {entry.summary}
              </p>
            ) : (
              <div className="mt-1">
                {entry.contentText && (
                  <p className="text-sm text-secondary line-clamp-2 leading-relaxed">
                    {entry.contentText}
                  </p>
                )}
                {entry.summaryStatus === "failed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      retrySummary.mutate(entry.id);
                    }}
                    className="flex items-center gap-1.5 text-xs text-secondary border border-outline rounded-lg px-3 py-1.5 mt-1.5 hover:text-primary hover:bg-surface-container-high transition-colors duration-150 [transition-timing-function:linear] uppercase tracking-wider"
                  >
                    <RotateCcw size={12} />
                    Retry summary
                  </button>
                )}
              </div>
            )}
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
