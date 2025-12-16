// src/components/DeleteSectionDialog.jsx
// Dialog for deleting a section with two options:
// 1. Remove header only (move items to Uncategorized)
// 2. Delete section and all contents

import { useEffect } from "react";

function DeleteSectionDialog({
  isOpen,
  sectionTitle,
  itemCount,
  onDeleteHeader,
  onDeleteAll,
  onCancel
}) {
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

  return (
    <div
      className="dialog-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-section-dialog-title"
    >
      <div className="dialog-content delete-section-dialog">
        <div className="dialog-header">
          <h3 id="delete-section-dialog-title" className="dialog-title">
            Delete "{sectionTitle}"
          </h3>
        </div>
        <div className="dialog-body">
          <p className="delete-section-message">
            This section contains {itemCount} {itemCount === 1 ? "item" : "items"}. What would you like to do?
          </p>

          <div className="delete-section-options">
            <button
              type="button"
              className="delete-section-option"
              onClick={onDeleteHeader}
            >
              <div className="delete-option-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <div className="delete-option-content">
                <div className="delete-option-title">Remove section header</div>
                <div className="delete-option-description">
                  Keep items and move them to Uncategorized
                </div>
              </div>
            </button>

            <button
              type="button"
              className="delete-section-option delete-section-option--danger"
              onClick={onDeleteAll}
            >
              <div className="delete-option-icon delete-option-icon--danger">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </div>
              <div className="delete-option-content">
                <div className="delete-option-title">Delete section and contents</div>
                <div className="delete-option-description">
                  Permanently remove section and all {itemCount} {itemCount === 1 ? "item" : "items"}
                </div>
              </div>
            </button>
          </div>
        </div>
        <div className="dialog-footer">
          <button
            type="button"
            className="dialog-button dialog-button--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteSectionDialog;
