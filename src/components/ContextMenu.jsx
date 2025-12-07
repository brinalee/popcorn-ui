// src/components/ContextMenu.jsx
import { useRef, useEffect, useLayoutEffect, useState } from "react";

function ContextMenu({ x, y, items, onClose, onOpenSubmenu, onCloseSubmenu }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });

  // Click outside and Escape key handling
  useEffect(() => {
    function handleClickOutside(e) {
      const target = e.target;
      if (ref.current && !ref.current.contains(target)) {
        onClose();
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Viewport clamping
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;

    const { innerWidth, innerHeight } = window;
    const rect = menu.getBoundingClientRect();

    let left = x;
    let top = y;

    // Adjust if menu would go off right edge
    if (left + rect.width > innerWidth) {
      left = innerWidth - rect.width - 8;
    }

    // Adjust if menu would go off bottom edge
    if (top + rect.height > innerHeight) {
      top = innerHeight - rect.height - 8;
    }

    // Ensure menu doesn't go off left or top edges
    if (left < 8) left = 8;
    if (top < 8) top = 8;

    setPos({ left, top });
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="sidebar-context-menu menu-card"
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        zIndex: 100
      }}
      role="menu"
    >
      {items.map((item) => {
        if (item.isSeparator) {
          return <div key={item.key} className="menu-separator" />;
        }

        return (
          <button
            key={item.key}
            type="button"
            className={`menu-item${item.danger ? " menu-item--danger" : ""}${item.selected ? " menu-item--selected" : ""}`}
            role="menuitem"
            onMouseEnter={(e) => {
              if (item.submenu && onOpenSubmenu) {
                const rect = e.currentTarget.getBoundingClientRect();
                onOpenSubmenu(item, rect);
              } else if (onCloseSubmenu) {
                onCloseSubmenu();
              }
            }}
            onClick={(e) => {
              if (item.submenu && onOpenSubmenu) {
                const rect = e.currentTarget.getBoundingClientRect();
                onOpenSubmenu(item, rect);
              } else if (item.onClick) {
                item.onClick();
                onClose();
              }
            }}
          >
            {item.icon && <span className="menu-icon">{item.icon}</span>}
            <span className="menu-label">{item.label}</span>
            {item.selected && <span className="menu-checkmark">✓</span>}
            {item.submenu && <span className="menu-submenu-chevron">›</span>}
          </button>
        );
      })}
    </div>
  );
}

export default ContextMenu;
