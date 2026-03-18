import { NavLink } from "react-router";
import { List, Home } from "lucide-react";
import type { Feed } from "../../lib/api.js";
import { FeedTypeIcon, FeedTypeBadge } from "../feed/FeedTypeBadge.js";

interface SidebarProps {
  feeds: Feed[];
  isOpen: boolean;
  onClose: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
    isActive
      ? "bg-accent-subtle text-accent font-semibold border-l-2 border-accent"
      : "text-ink-muted hover:bg-muted hover:text-ink"
  }`;

export function Sidebar({ feeds, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-2 border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight font-serif text-ink">aggr-hub</h1>
          <div className="w-8 h-0.5 bg-accent rounded-full mt-2" />
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <NavLink to="/" end className={navLinkClass} onClick={onClose}>
            <Home size={18} />
            タイムライン
          </NavLink>

          <NavLink to="/feeds" className={navLinkClass} onClick={onClose}>
            <List size={18} />
            フィード管理
          </NavLink>

          <div className="h-px bg-border my-3 mx-3" />

          <div className="px-3 mb-1 text-[10px] font-semibold text-ink-muted uppercase tracking-widest">
            フィード
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
