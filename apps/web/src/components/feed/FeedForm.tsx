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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest outline outline-1 outline-outline rounded-xl w-full max-w-md p-6 animate-appear">
        <h2 className="text-xl font-bold font-display text-primary mb-4 uppercase tracking-tight">
          フィードを追加
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-[10px] font-semibold text-secondary mb-1.5 uppercase tracking-widest">
            フィード URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/feed.xml"
            className="w-full py-2.5 bg-transparent border-0 border-b-2 border-outline focus:outline-none focus:border-accent placeholder:text-secondary/40 transition-colors duration-150 [transition-timing-function:linear]"
            required
            autoFocus
          />
          <p className="text-xs text-secondary mt-1.5">RSS/Atom フィード URL</p>

          {createFeed.isError && (
            <p className="text-sm text-destructive mt-2">{createFeed.error.message}</p>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm hover:bg-surface-container transition-colors duration-150 [transition-timing-function:linear] text-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={createFeed.isPending}
              className="px-4 py-2.5 text-sm font-medium bg-primary text-on-primary hover:bg-on-primary hover:text-primary hover:outline hover:outline-2 hover:outline-primary transition-colors duration-150 [transition-timing-function:linear] disabled:opacity-50"
            >
              {createFeed.isPending ? "追加中..." : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
