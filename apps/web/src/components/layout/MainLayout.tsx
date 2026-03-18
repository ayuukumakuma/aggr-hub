import { useState } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar.js";
import { useFeeds } from "../../hooks/useFeeds.js";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: feeds } = useFeeds();

  const feedCount = feeds?.length ?? 0;
  const lastFetched = feeds
    ?.map((f) => f.lastFetchedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <div className="flex h-screen bg-surface-0 text-ink">
      <Sidebar feeds={feeds ?? []} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-5 shrink-0 bg-surface-1 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-bold font-serif text-ink tracking-tight">aggr-hub</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-ink-muted font-mono">
            <span>{feedCount} feeds</span>
            {lastFetched && (
              <>
                <span className="w-1 h-1 rounded-full bg-border-strong" />
                <span>
                  last sync{" "}
                  {new Date(lastFetched).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
