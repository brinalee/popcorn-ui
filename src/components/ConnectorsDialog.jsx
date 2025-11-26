// src/components/ConnectorsDialog.jsx
import { useEffect, useRef } from "react";

const CONNECTORS = [
  { id: "google-drive", name: "Google Drive", icon: "📁", description: "Access and search your Google Drive files", connected: false },
  { id: "github", name: "GitHub", icon: "🐙", description: "Connect repositories, issues, and PRs", connected: true },
  { id: "linear", name: "Linear", icon: "🔷", description: "Access issues, projects, and roadmaps", connected: true },
  { id: "notion", name: "Notion", icon: "📝", description: "Search pages, databases, and docs", connected: true },
  { id: "figma", name: "Figma", icon: "🎨", description: "Access designs and design systems", connected: false },
  { id: "slack", name: "Slack", icon: "💬", description: "Search messages and channels", connected: false },
  { id: "jira", name: "Jira", icon: "📋", description: "Connect issues and projects", connected: false },
  { id: "confluence", name: "Confluence", icon: "📖", description: "Search wiki pages and spaces", connected: false },
  { id: "asana", name: "Asana", icon: "🎯", description: "Connect tasks and projects", connected: false },
  { id: "dropbox", name: "Dropbox", icon: "📦", description: "Access files and folders", connected: false },
];

function ConnectorsDialog({ isOpen, onClose, onConnectorClick }) {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="cc-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="cc-modal connectors-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connectors-dialog-title"
      >
        {/* Header */}
        <div className="connectors-header">
          <div>
            <h1 id="connectors-dialog-title" className="connectors-title">
              Your Company Knowledge
            </h1>
            <p className="connectors-subtitle">
              Give your channel access to company knowledge by connecting integrations. You can always change these later.
            </p>
          </div>
          <button
            type="button"
            className="cc-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Connector Grid */}
        <div className="connectors-grid">
          {CONNECTORS.map((connector) => (
            <button
              key={connector.id}
              type="button"
              className={`connector-card ${connector.connected ? "connector-card--connected" : ""}`}
              onClick={() => onConnectorClick?.(connector)}
            >
              <div className="connector-icon">{connector.icon}</div>
              <div className="connector-info">
                <div className="connector-name">{connector.name}</div>
                <div className="connector-description">{connector.description}</div>
              </div>
              <div className={`connector-add-btn ${connector.connected ? "connector-add-btn--connected" : ""}`}>
                {connector.connected ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConnectorsDialog;
