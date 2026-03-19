import { useState } from "react";
import { CheckCheck, Circle } from "lucide-react";
import { EntryList } from "../components/entry/EntryList.js";
import { DropdownMenu } from "../components/ui/DropdownMenu.js";
import { useMarkAllRead, useMarkAllUnread } from "../hooks/useEntries.js";
import { useFeeds } from "../hooks/useFeeds.js";

type Filter = "all" | "unread";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "unread", label: "Unread" },
  { value: "all", label: "All" },
];

export function TimelinePage() {
  const [filter, setFilter] = useState<Filter>("unread");
  const { data: feeds } = useFeeds();
  const markAllRead = useMarkAllRead();
  const markAllUnread = useMarkAllUnread();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-[-0.02em] font-display text-primary">
          Timeline
        </h1>
        <div className="flex items-center gap-2">
          <DropdownMenu
            items={[
              {
                label: "Mark All Read",
                icon: <CheckCheck size={14} />,
                onClick: () => markAllRead.mutate(undefined),
                disabled: markAllRead.isPending || markAllUnread.isPending,
              },
              {
                label: "Mark All Unread",
                icon: <Circle size={14} />,
                onClick: () => markAllUnread.mutate(undefined),
                disabled: markAllRead.isPending || markAllUnread.isPending,
              },
            ]}
          />
          <label className="group relative flex items-center w-44 h-9 outline outline-1 outline-primary rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={filter === "all"}
              onChange={() => setFilter(filter === "unread" ? "all" : "unread")}
              className="sr-only"
            />
            <div
              className="absolute inset-0 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                width: `calc(100% / ${FILTERS.length})`,
                transform: `translateX(${FILTERS.findIndex((f) => f.value === filter) * 100}%)`,
              }}
            >
              <div className="w-full h-full bg-primary rounded-xl group-hover:animate-pulse-once" />
            </div>
            {FILTERS.map((f) => (
              <span
                key={f.value}
                className={`relative z-10 flex-1 py-1.5 text-sm text-center transition-colors duration-200 ease-linear select-none ${
                  filter === f.value ? "text-on-primary font-medium" : "text-secondary"
                }`}
              >
                {f.label}
              </span>
            ))}
          </label>
        </div>
      </div>

      <EntryList isRead={filter === "unread" ? "false" : undefined} feeds={feeds} groupByDate />
    </div>
  );
}
