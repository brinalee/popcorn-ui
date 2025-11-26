// src/components/SectionDialog.jsx
import { useState } from "react";

function SectionDialog({ onClose, onCreate }) {
  const [sectionName, setSectionName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sectionName.trim()) return;
    onCreate(sectionName.trim());
    setSectionName("");
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h3 className="dialog-title">Create section</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <input
              type="text"
              className="dialog-input"
              placeholder="Section name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="dialog-footer">
            <button
              type="button"
              className="dialog-button dialog-button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dialog-button dialog-button--primary"
              disabled={!sectionName.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SectionDialog;
