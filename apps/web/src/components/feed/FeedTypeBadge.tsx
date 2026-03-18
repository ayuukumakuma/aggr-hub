import { Rss, GitBranch } from "lucide-react";
import type { Feed } from "../../lib/api.js";

type FeedType = Feed["feedType"];

interface FeedTypeIconProps {
  type: FeedType;
  size?: number;
}

export function FeedTypeIcon({ type, size = 16 }: FeedTypeIconProps) {
  return type === "changelog" ? (
    <GitBranch size={size} className="text-changelog" />
  ) : (
    <Rss size={size} className="text-accent" />
  );
}

interface FeedTypeBadgeProps {
  type: FeedType;
}

export function FeedTypeBadge({ type }: FeedTypeBadgeProps) {
  const isChangelog = type === "changelog";
  return (
    <span
      className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded ${
        isChangelog ? "bg-emerald-50 text-changelog" : "bg-accent-subtle text-accent"
      }`}
    >
      {type}
    </span>
  );
}
