// src/components/ActionMenu.jsx
import { useRef, useEffect } from "react";

// Shared ActionMenu component for all dropdown menus
function ActionMenu({ items, isOpen, onClose, anchorRef, position }) {
  const menuRef = useRef(null);

  // Close menu on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      const target = event.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="menu-card"
      role="menu"
      style={position}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="menu-item"
          role="menuitem"
          onClick={item.onClick}
        >
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ActionMenu;
