import { useState, useRef, useEffect, type ReactNode } from "react";
import { EllipsisVertical, X } from "lucide-react";

interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: MenuItem[];
}

export function DropdownMenu({ items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center justify-center w-9 h-9 rounded-xl outline outline-1 outline-primary text-primary hover:bg-primary hover:text-on-primary transition-colors duration-150 [transition-timing-function:linear]"
      >
        <span
          className={`transition-transform duration-150 [transition-timing-function:linear] ${open ? "rotate-90" : "group-hover:animate-wiggle"}`}
        >
          {open ? <X size={18} /> : <EllipsisVertical size={18} />}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-surface-container-lowest outline outline-1 outline-outline rounded-xl py-1 animate-appear">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-2 px-3.5 py-2 text-sm text-left transition-colors duration-150 [transition-timing-function:linear] disabled:opacity-40 ${
                item.variant === "destructive"
                  ? "bg-surface-container-lowest text-destructive hover:bg-destructive hover:text-on-primary"
                  : "bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
