import { Rss } from "lucide-react";
import type { Feed } from "../../lib/api.js";

type FeedType = Feed["feedType"];

interface FeedTypeIconProps {
  type: FeedType;
  size?: number;
}

export function FeedTypeIcon({ type: _type, size = 16 }: FeedTypeIconProps) {
  return <Rss size={size} className="text-primary" />;
}

interface FeedTypeBadgeProps {
  type: FeedType;
}

export function FeedTypeBadge({ type }: FeedTypeBadgeProps) {
  return (
    <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 bg-surface-container-high text-primary uppercase">
      {type}
    </span>
  );
}
