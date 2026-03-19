import { NavLink } from "react-router";
import { List, Home, Bookmark } from "lucide-react";
import type { Feed } from "../../lib/api.js";
import { FeedTypeIcon, FeedTypeBadge } from "../feed/FeedTypeBadge.js";

interface SidebarProps {
  feeds: Feed[];
  isOpen: boolean;
  onClose: () => void;
  width?: number;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors duration-150 [transition-timing-function:linear] ${
    isActive
      ? "bg-surface-container-high text-primary font-semibold"
      : "text-secondary hover:bg-surface-container hover:text-primary"
  }`;

export function Sidebar({ feeds, isOpen, onClose, width }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-surface-container-low flex flex-col transition-transform duration-150 ease-linear lg:translate-x-0 shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: width ? `${width}px` : undefined }}
      >
        <div className="p-5 bg-surface-container">
          <h1 className="text-2xl font-bold tracking-tight font-display text-primary">Aggr Hub</h1>
          <div className="w-8 h-0.5 bg-accent mt-2" />
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <NavLink to="/" end className={navLinkClass} onClick={onClose}>
            <Home size={18} />
            Timeline
          </NavLink>

          <NavLink to="/feeds" end className={navLinkClass} onClick={onClose}>
            <List size={18} />
            Feeds
          </NavLink>

          <NavLink to="/favorites" end className={navLinkClass} onClick={onClose}>
            <Bookmark size={18} />
            Favorites
          </NavLink>

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
        </nav>
      </aside>
    </>
  );
}
