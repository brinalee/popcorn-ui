// src/components/DMDialog.jsx
import { useState } from "react";

function DMDialog({ onClose, onCreate }) {
  const [dmName, setDmName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dmName.trim()) return;
    onCreate(dmName.trim());
    setDmName("");
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
          <h3 className="dialog-title">Create direct message</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <input
              type="text"
              className="dialog-input"
              placeholder="Username or user IDs (comma-separated for group)"
              value={dmName}
              onChange={(e) => setDmName(e.target.value)}
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
              disabled={!dmName.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DMDialog;
