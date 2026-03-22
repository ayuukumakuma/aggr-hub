import { NavLink } from "react-router";
import { List, Home, Bookmark, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Feed } from "../../lib/api.js";
import { FeedTypeIcon, FeedTypeBadge } from "../feed/FeedTypeBadge.js";

interface SidebarProps {
  feeds: Feed[];
  isOpen: boolean;
  onClose: () => void;
  width?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const getNavLinkClass =
  (collapsed?: boolean) =>
  ({ isActive }: { isActive: boolean }) =>
    `flex items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-3"} py-2.5 text-sm rounded-lg transition-colors duration-150 [transition-timing-function:linear] ${
      isActive
        ? "bg-surface-container-high text-primary font-semibold"
        : "text-secondary hover:bg-surface-container hover:text-primary"
    }`;

export function Sidebar({
  feeds,
  isOpen,
  onClose,
  width,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const navLinkClass = getNavLinkClass(collapsed);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-surface-container-low flex flex-col transition-[transform,width] duration-150 ease-linear lg:translate-x-0 shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: width ? `${width}px` : undefined }}
      >
        <div
          className={`bg-surface-container rounded-b-lg ${collapsed ? "p-4 flex justify-center" : "p-5"}`}
        >
          {collapsed ? (
            <img src="/favicon.svg" alt="Aggr Hub" className="w-6 h-6" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <img src="/favicon.svg" alt="" className="w-7 h-7" />
                <h1 className="text-2xl font-bold tracking-tight font-display text-primary">
                  Aggr Hub
                </h1>
              </div>
              <div className="w-8 h-0.5 bg-accent mt-2" />
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <NavLink to="/" end className={navLinkClass} onClick={onClose}>
            <Home
              size={18}
              className={`shrink-0 transition-transform duration-150 [transition-timing-function:linear] ${collapsed ? "scale-125" : "scale-100"}`}
            />
            {!collapsed && "Timeline"}
          </NavLink>

          <NavLink to="/feeds" end className={navLinkClass} onClick={onClose}>
            <List
              size={18}
              className={`shrink-0 transition-transform duration-150 [transition-timing-function:linear] ${collapsed ? "scale-125" : "scale-100"}`}
            />
            {!collapsed && "Feeds"}
          </NavLink>

          <NavLink to="/favorites" end className={navLinkClass} onClick={onClose}>
            <Bookmark
              size={18}
              className={`shrink-0 transition-transform duration-150 [transition-timing-function:linear] ${collapsed ? "scale-125" : "scale-100"}`}
            />
            {!collapsed && "Favorites"}
          </NavLink>

          {!collapsed && (
            <>
              <div className="h-4" />

              <div className="px-3 mb-1 text-[10px] font-semibold text-secondary uppercase tracking-widest">
                Feeds
              </div>

              {feeds.map((feed) => (
                <NavLink
                  key={feed.id}
                  to={`/feeds/${feed.id}`}
                  className={navLinkClass}
                  onClick={onClose}
                >
                  <span className="shrink-0">
                    <FeedTypeIcon type={feed.feedType} size={14} />
                  </span>
                  <span className="truncate">{feed.title ?? feed.url}</span>
                  <span className="ml-auto">
                    <FeedTypeBadge type={feed.feedType} />
                  </span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className={`hidden lg:flex p-2 ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            className="p-2 text-secondary hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors duration-150 [transition-timing-function:linear]"
            onClick={onToggleCollapse}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}
