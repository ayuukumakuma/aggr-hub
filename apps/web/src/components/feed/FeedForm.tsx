import { useState } from "react";
import { useCreateFeed } from "../../hooks/useFeeds.js";

interface FeedFormProps {
  onClose: () => void;
}

export function FeedForm({ onClose }: FeedFormProps) {
  const [url, setUrl] = useState("");
  const createFeed = useCreateFeed();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    await createFeed.mutateAsync(url.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-1 rounded-lg shadow-2xl border border-border w-full max-w-md p-6 animate-scale-in">
        <h2 className="text-xl font-bold font-serif text-ink mb-4">フィードを追加</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-ink mb-1.5">フィード URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/feed.xml"
            className="w-full px-3.5 py-2.5 bg-surface-0 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 placeholder:text-ink-muted/40 transition-colors"
            required
            autoFocus
          />
          <p className="text-xs text-ink-muted/60 mt-1.5">
            RSS/Atom フィード URL、GitHub Releases URL、または CHANGELOG.md の URL
          </p>

          {createFeed.isError && (
            <p className="text-sm text-destructive mt-2">{createFeed.error.message}</p>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-ink-muted"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={createFeed.isPending}
              className="px-4 py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {createFeed.isPending ? "追加中..." : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
