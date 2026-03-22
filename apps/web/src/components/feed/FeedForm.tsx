import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
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
          Add Feed
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-[10px] font-semibold text-secondary mb-1.5 uppercase tracking-widest">
            Feed URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/feed.xml or GitHub Releases URL"
            className="w-full py-2.5 px-3 bg-transparent rounded-xl outline outline-1 outline-outline focus:outline-accent focus:outline-2 placeholder:text-secondary/40 transition-colors duration-150 [transition-timing-function:linear]"
            required
            autoFocus
          />
          <p className="text-xs text-secondary mt-1.5">RSS/Atom Feed URL or GitHub Releases URL</p>

          {createFeed.isError && (
            <p className="text-sm text-destructive mt-2">{createFeed.error.message}</p>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm outline outline-1 outline-primary text-primary rounded-xl hover:bg-primary hover:text-on-primary transition-colors duration-150 [transition-timing-function:linear]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFeed.isPending}
              className="group inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl bg-accent text-on-primary outline outline-1 outline-accent transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:shadow-lg hover:shadow-accent/30 active:scale-95 disabled:opacity-50"
            >
              <span className="relative w-4 h-4 overflow-hidden">
                <Plus
                  size={16}
                  className="absolute inset-0 transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-0 group-hover:-rotate-180 group-hover:scale-0"
                />
                <ArrowRight
                  size={16}
                  className="absolute inset-0 opacity-0 scale-0 translate-x-[-8px] transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0"
                />
              </span>
              {createFeed.isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
