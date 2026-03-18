import { useState } from "react";
import { EntryList } from "../components/entry/EntryList.js";
import { useFeeds } from "../hooks/useFeeds.js";

type Filter = "all" | "unread";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "unread", label: "未読" },
];

export function TimelinePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: feeds } = useFeeds();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-serif text-ink">タイムライン</h1>
        <div className="flex gap-1 bg-surface-2 rounded-lg p-1 border border-border">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3.5 py-1.5 text-sm rounded transition-colors ${
                filter === f.value
                  ? "bg-ink text-white font-medium"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <EntryList isRead={filter === "unread" ? "false" : undefined} feeds={feeds} groupByDate />
    </div>
  );
}
