// src/components/Header.jsx
import React, { useState } from "react";

const mockAlerts = [
  {
    id: "a1",
    context: "Thread in #linear-app",
    actor: "ben g",
    snippet: "And unanswered questions",
    meta: "24 mins ago"
  },
  {
    id: "a2",
    context: "#linear-app",
    actor: "ben g",
    snippet: "@everyone linear webhook for our team",
    meta: "33 mins ago"
  },
  {
    id: "a3",
    context: "ben g",
    actor: "ben g",
    snippet:
      "yeah i shut down the macos automatic build because it just breaks down at the testflight st...",
    meta: "33 mins ago"
  },
  {
    id: "a4",
    context: "sang",
    actor: "sang",
    snippet: "Do you want to move to a retro Macintosh look?",
    meta: "1:41 PM"
  },
  {
    id: "a5",
    context: "Thread in ben g",
    actor: "ben g",
    snippet: "yeah i always miss them in notion",
    meta: "1:11 PM"
  },
  {
    id: "a6",
    context: "New activity in #test-goals-agent",
    actor: "ben g",
    snippet: '@everyone test-goals-agent { "notion_doc_urls": [ "https://www.notio...',
    meta: "Yesterday"
  }
];

function Header({ activeSection, onChangeSection }) {
  const [showAlerts, setShowAlerts] = useState(false);

  const handleWorkspaceClick = () => {
    setShowAlerts((open) => !open);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Channel name with incident badge */}
        <button
          className="workspace-button"
          type="button"
          onClick={handleWorkspaceClick}
        >
          <span className="workspace-name"># sev-incidents</span>
          <span className="workspace-badge">LIVE INCIDENT</span>
        </button>

        {/* Incident description */}
        <div className="incident-description">
          Production SEV: billing 500s spike · Region: us-west-2
        </div>

        {/* Tabs (optional, removed for cleaner incident view) */}
        {/*
        <nav className="header-tabs">
          <button
            type="button"
            className={
              "header-tab" + (activeSection === "chats" ? " active" : "")
            }
            onClick={() => onChangeSection("chats")}
          >
            Chats
          </button>
          <button
            type="button"
            className={
              "header-tab" + (activeSection === "app" ? " active" : "")
            }
            onClick={() => onChangeSection("app")}
          >
            App Platform
          </button>
        </nav>
        */}
      </div>

      {/* Right side could hold icons later */}
      <div className="header-right" />

      {/* Alerts popover */}
      {showAlerts && (
        <div className="alerts-popover">
          <div className="alerts-header">Alerts</div>
          <div className="alerts-list">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className="alert-avatar" />
                <div className="alert-main">
                  <div className="alert-context-row">
                    <span className="alert-context">{alert.context}</span>
                    <span className="alert-meta">{alert.meta}</span>
                  </div>
                  <div className="alert-actor">{alert.actor}</div>
                  <div className="alert-snippet">{alert.snippet}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
