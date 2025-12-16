// src/components/SectionEditDialog.jsx
// Dialog for editing a section name

import { useState, useEffect, useRef } from "react";

function SectionEditDialog({
  isOpen,
  sectionTitle,
  onSave,
  onCancel
}) {
  const [value, setValue] = useState(sectionTitle);
  const inputRef = useRef(null);

  // Reset value when dialog opens with new section
  useEffect(() => {
    if (isOpen) {
      setValue(sectionTitle);
    }
  }, [isOpen, sectionTitle]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && trimmed !== sectionTitle) {
      onSave(trimmed);
    } else {
      onCancel();
    }
  };

  return (
    <div
      className="dialog-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-section-dialog-title"
    >
      <div className="dialog-content edit-section-dialog">
        <div className="dialog-header">
          <h3 id="edit-section-dialog-title" className="dialog-title">
            Edit section
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <label className="edit-section-label" htmlFor="section-name-input">
              Section name
            </label>
            <input
              ref={inputRef}
              id="section-name-input"
              type="text"
              className="dialog-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter section name"
              maxLength={50}
            />
          </div>
          <div className="dialog-footer">
            <button
              type="button"
              className="dialog-button dialog-button--secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dialog-button dialog-button--primary"
              disabled={!value.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SectionEditDialog;
