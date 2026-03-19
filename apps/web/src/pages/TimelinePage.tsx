import { useState } from "react";
import { EntryList } from "../components/entry/EntryList.js";
import { useFeeds } from "../hooks/useFeeds.js";

type Filter = "all" | "unread";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "unread", label: "未読" },
  { value: "all", label: "すべて" },
];

export function TimelinePage() {
  const [filter, setFilter] = useState<Filter>("unread");
  const { data: feeds } = useFeeds();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-[-0.02em] font-display text-primary">
          タイムライン
        </h1>
        <div className="flex gap-0 bg-surface-container p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3.5 py-1.5 text-sm transition-colors duration-150 [transition-timing-function:linear] ${
                filter === f.value
                  ? "bg-primary text-on-primary font-medium"
                  : "text-secondary hover:text-primary"
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
