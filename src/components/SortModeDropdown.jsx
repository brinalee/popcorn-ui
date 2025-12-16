// src/components/SortModeDropdown.jsx
// Compact dropdown for selecting section sort mode

import { useState, useRef, useEffect } from "react";

const SORT_MODES = [
  { value: "abc", label: "ABC", icon: "↓A" },
  { value: "lastMessage", label: "Recent", icon: "⏱" },
  { value: "manual", label: "Custom", icon: "⋮⋮" }
];

function SortModeDropdown({ mode, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const current = SORT_MODES.find(m => m.value === mode) || SORT_MODES[2];

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (e, value) => {
    e.stopPropagation();
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="sort-mode-dropdown" ref={ref}>
      <button
        type="button"
        className="sort-mode-trigger"
        onClick={handleToggle}
        disabled={disabled}
        title={`Sort: ${current.label}`}
        aria-label={`Sort mode: ${current.label}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="sort-mode-icon">{current.icon}</span>
      </button>

      {isOpen && (
        <div className="sort-mode-menu" role="listbox">
          {SORT_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              className={`sort-mode-option ${m.value === mode ? "active" : ""}`}
              onClick={(e) => handleSelect(e, m.value)}
              role="option"
              aria-selected={m.value === mode}
            >
              <span className="sort-mode-option-icon">{m.icon}</span>
              <span className="sort-mode-option-label">{m.label}</span>
              {m.value === mode && <span className="sort-mode-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortModeDropdown;
