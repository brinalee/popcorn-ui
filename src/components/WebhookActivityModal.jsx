// src/components/WebhookActivityModal.jsx
import { useState, useEffect } from "react";
import { getWebhookEvents, formatRelativeTime } from "../utils/webhookActivityData";

function WebhookActivityModal({ webhook, onClose }) {
  const events = getWebhookEvents(webhook.id);
  const [expandedId, setExpandedId] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopyJson = (payload) => {
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
  };

  return (
    <div className="webhook-activity-backdrop" onClick={onClose}>
      <div
        className="webhook-activity-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <header className="webhook-activity-header">
          <div>
            <h1 className="webhook-activity-modal-title">Webhook activity</h1>
            <p className="webhook-activity-subtitle">
              Recent deliveries for <strong>{webhook.name}</strong>
            </p>
          </div>
          <button
            type="button"
            className="webhook-activity-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {/* Body */}
        <div className="webhook-activity-body">
          {events.length === 0 ? (
            <p className="webhook-activity-empty">
              No activity yet. Once this webhook receives events, they'll show
              up here.
            </p>
          ) : (
            <ul className="webhook-activity-list">
              {events.map((event) => (
                <li key={event.id} className="webhook-activity-item">
                  <button
                    type="button"
                    className="webhook-activity-row"
                    onClick={() => toggle(event.id)}
                  >
                    <div className="webhook-activity-main">
                      <span
                        className={`webhook-status-dot webhook-status-${event.status}`}
                      />
                      <div className="webhook-activity-text">
                        <div className="webhook-activity-title">
                          {event.title}
                        </div>
                        <div className="webhook-activity-subtitle-row">
                          {event.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="webhook-activity-meta">
                      <span className="webhook-activity-source">
                        {event.source}
                      </span>
                      <span className="webhook-activity-time">
                        {formatRelativeTime(event.receivedAt)}
                      </span>
                      <span
                        className={`webhook-activity-chevron ${
                          expandedId === event.id ? "open" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </div>
                  </button>

                  {expandedId === event.id && (
                    <div className="webhook-activity-details">
                      <pre className="webhook-activity-json">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                      <div className="webhook-activity-actions">
                        <button
                          type="button"
                          className="cc-btn-secondary"
                          onClick={() => handleCopyJson(event.payload)}
                        >
                          Copy JSON
                        </button>
                        {event.payload?.workflow_job?.html_url && (
                          <a
                            className="webhook-activity-link"
                            href={event.payload.workflow_job.html_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View run in GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default WebhookActivityModal;
