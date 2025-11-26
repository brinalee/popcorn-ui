// src/components/FollowDialog.jsx
import { useState, useRef, useEffect } from "react";

function FollowDialog({
  isOpen,
  onClose,
  channels,
  dms,
  onFollowChannel,
  onFollowDM,
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("channels");
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

  const normalized = search.trim().toLowerCase();
  const showingSearch = normalized.length > 0;

  const filteredChannels = channels.filter((ch) =>
    ch.label.toLowerCase().includes(normalized)
  );

  const filteredDMs = dms.filter((dm) =>
    dm.name.toLowerCase().includes(normalized)
  );

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="follow-dialog-overlay"
      onClick={handleOverlayClick}
    >
      <div className="follow-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="follow-dialog-header">
          <h3 className="follow-dialog-title">Add to sidebar</h3>
          <button
            type="button"
            className="follow-dialog-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="follow-dialog-search">
          <input
            type="text"
            placeholder="Search channels and people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Tabs only visible when NOT searching */}
        {!showingSearch && (
          <div className="follow-dialog-tabs">
            <button
              type="button"
              className={
                "follow-tab" +
                (activeTab === "channels" ? " follow-tab--active" : "")
              }
              onClick={() => setActiveTab("channels")}
            >
              Channels
            </button>
            <button
              type="button"
              className={
                "follow-tab" +
                (activeTab === "dms" ? " follow-tab--active" : "")
              }
              onClick={() => setActiveTab("dms")}
            >
              Direct messages
            </button>
          </div>
        )}

        <div className="follow-dialog-body">
          {showingSearch ? (
            <>
              {/* When searching, show both groups stacked */}
              {filteredChannels.length > 0 && (
                <FollowListSection
                  title="Channels"
                  entries={filteredChannels}
                  onFollow={onFollowChannel}
                  type="channel"
                />
              )}
              {filteredDMs.length > 0 && (
                <FollowListSection
                  title="Direct messages"
                  entries={filteredDMs}
                  onFollow={onFollowDM}
                  type="dm"
                />
              )}
              {filteredChannels.length === 0 && filteredDMs.length === 0 && (
                <div className="follow-dialog-empty">
                  No channels or conversations found
                </div>
              )}
            </>
          ) : (
            <>
              {/* When not searching, show based on active tab */}
              {activeTab === "channels" ? (
                <FollowListSection
                  title="Channels"
                  entries={channels}
                  onFollow={onFollowChannel}
                  type="channel"
                />
              ) : (
                <FollowListSection
                  title="Direct messages"
                  entries={dms}
                  onFollow={onFollowDM}
                  type="dm"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FollowListSection({ title, entries, onFollow, type }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="follow-section">
        <div className="follow-section-title">{title}</div>
        <div className="follow-dialog-empty">No items to follow</div>
      </div>
    );
  }

  return (
    <div className="follow-section">
      <div className="follow-section-title">{title}</div>
      <ul className="follow-list">
        {entries.map((entry) => (
          <li key={entry.id} className="follow-list-item">
            <div className="follow-list-item-content">
              {type === "channel" ? (
                <span
                  className={
                    "sidebar-icon " +
                    (entry.iconType === "hash" ? "hash" : "bolt")
                  }
                >
                  {entry.iconType === "hash" ? (
                    "#"
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9 2L4 9h4l-1 5 5-7H8l1-5z" />
                    </svg>
                  )}
                </span>
              ) : (
                <div className={`avatar avatar-small ${entry.avatarColor}`}>
                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt={entry.name} />
                  ) : (
                    entry.initials
                  )}
                </div>
              )}
              <span className="follow-list-label">
                {type === "channel" ? entry.label : entry.name}
              </span>
            </div>
            <button
              type="button"
              className="follow-list-follow-btn"
              onClick={() => onFollow(entry.id)}
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FollowDialog;
