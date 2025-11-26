// src/components/ChannelDialog.jsx
import { useState } from "react";

function ChannelDialog({ onClose, onCreate }) {
  const [channelName, setChannelName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    onCreate(channelName.trim());
    setChannelName("");
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
          <h3 className="dialog-title">Create channel</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <input
              type="text"
              className="dialog-input"
              placeholder="Channel name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
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
              disabled={!channelName.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChannelDialog;
