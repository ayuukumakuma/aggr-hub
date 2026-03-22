import { useState, useRef, useCallback } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar.js";
import { useFeeds } from "../../hooks/useFeeds.js";

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 256;
const SIDEBAR_COLLAPSED = 56;

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const isDragging = useRef(false);
  const { data: feeds } = useFeeds();

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, e.clientX)));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const feedCount = feeds?.length ?? 0;
  const lastFetched = feeds
    ?.map((f) => f.lastFetchedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <div className="flex h-screen bg-surface text-primary">
      <Sidebar
        feeds={feeds ?? []}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={sidebarCollapsed ? SIDEBAR_COLLAPSED : sidebarWidth}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={`w-px bg-outline shrink-0 hover:bg-primary cursor-col-resize transition-colors duration-150 ease-linear active:bg-primary ${sidebarCollapsed ? "hidden" : "hidden lg:block"}`}
        onMouseDown={handleDragStart}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-5 shrink-0 bg-surface-container-low sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 outline outline-1 outline-primary text-primary rounded-lg hover:bg-primary hover:text-on-primary transition-colors duration-150 ease-linear"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <img src="/favicon.svg" alt="" className="w-5 h-5" />
            <span className="text-sm font-bold font-display text-primary tracking-tight">
              Aggr Hub
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-secondary font-mono">
            <span>{feedCount} feeds</span>
            {lastFetched && (
              <>
                <span className="text-outline">/</span>
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
