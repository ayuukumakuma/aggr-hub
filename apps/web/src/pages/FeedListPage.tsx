import { useState } from "react";
import { Plus, Rss } from "lucide-react";
import { useFeeds } from "../hooks/useFeeds.js";
import { FeedCard } from "../components/feed/FeedCard.js";
import { FeedForm } from "../components/feed/FeedForm.js";

export function FeedListPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: feeds, isLoading } = useFeeds();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-[-0.02em] font-display text-primary">Feeds</h1>
        <button
          onClick={() => setShowForm(true)}
          className="group inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl outline outline-1 outline-primary text-primary hover:bg-primary hover:text-on-primary transition-colors duration-150 [transition-timing-function:linear]"
        >
          <Plus
            size={16}
            className="transition-transform duration-200 ease-linear group-hover:rotate-90"
          />
          Add
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest outline outline-1 outline-outline rounded-xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 shimmer" />
                <div className="flex-1">
                  <div className="h-4 shimmer w-1/2 mb-2" />
                  <div className="h-3 shimmer w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : feeds?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 animate-appear">
          <div className="w-14 h-14 bg-surface-container flex items-center justify-center mb-4">
            <Rss size={24} className="text-secondary" />
          </div>
          <p className="text-secondary font-medium">No feeds registered yet</p>
          <p className="text-sm text-secondary/60 mt-1 text-center max-w-xs">
            You can add RSS/Atom feed URLs
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-sm rounded-xl outline outline-1 outline-primary text-primary px-4 py-2 hover:bg-primary hover:text-on-primary transition-colors duration-150 [transition-timing-function:linear]"
          >
            Add your first feed
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {feeds?.map((feed) => (
            <FeedCard key={feed.id} feed={feed} />
          ))}
        </div>
      )}

      {showForm && <FeedForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
