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
        <h1 className="text-3xl font-bold tracking-tight font-serif text-ink">フィード管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-ink text-white rounded-lg hover:bg-ink-light active:scale-[0.98] transition-all"
        >
          <Plus size={16} />
          追加
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-1 rounded-lg p-5 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg shimmer" />
                <div className="flex-1">
                  <div className="h-4 shimmer rounded w-1/2 mb-2" />
                  <div className="h-3 shimmer rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : feeds?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4">
            <Rss size={24} className="text-ink-muted" />
          </div>
          <p className="text-ink-muted font-medium">フィードがまだ登録されていません</p>
          <p className="text-sm text-ink-muted/60 mt-1 text-center max-w-xs">
            RSS/Atom フィード URL を登録できます
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover active:scale-[0.98] transition-all"
          >
            最初のフィードを追加
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {feeds?.map((feed) => (
            <FeedCard key={feed.id} feed={feed} />
          ))}
        </div>
      )}

      {showForm && <FeedForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
