// src/components/FollowDialog.jsx
import { useState, useRef, useEffect } from "react";

function FollowDialog({
  isOpen,
  onClose,
  channels,
  dms,
  followedIds = new Set(),
  onFollowChannel,
  onFollowDM,
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("channels");
  const [sortMode, setSortMode] = useState("lastCreated"); // "lastCreated" | "alphabetical"
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

  // Sort function based on sortMode
  const sortItems = (items, type) => {
    const sorted = [...items];
    if (sortMode === "alphabetical") {
      sorted.sort((a, b) => {
        const nameA = type === "channel" ? a.label : a.name;
        const nameB = type === "channel" ? b.label : b.name;
        return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
      });
    } else {
      // lastCreated - newest first (higher createdAt = more recent)
      sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return sorted;
  };

  const filteredChannels = channels.filter((ch) =>
    ch.label.toLowerCase().includes(normalized)
  );

  const filteredDMs = dms.filter((dm) =>
    dm.name.toLowerCase().includes(normalized)
  );

  // Apply sorting
  const sortedChannels = sortItems(showingSearch ? filteredChannels : channels, "channel");
  const sortedDMs = sortItems(showingSearch ? filteredDMs : dms, "dm");
  const sortedFilteredChannels = sortItems(filteredChannels, "channel");
  const sortedFilteredDMs = sortItems(filteredDMs, "dm");

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

        {/* Tabs and sort - only visible when NOT searching */}
        {!showingSearch && (
          <div className="follow-dialog-controls">
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
            <div className="follow-dialog-sort">
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="follow-dialog-sort-select"
              >
                <option value="lastCreated">Last created</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        )}

        <div className="follow-dialog-body">
          {showingSearch ? (
            <>
              {/* When searching, show both groups stacked */}
              {sortedFilteredChannels.length > 0 && (
                <FollowListSection
                  title="Channels"
                  entries={sortedFilteredChannels}
                  onFollow={onFollowChannel}
                  followedIds={followedIds}
                  type="channel"
                />
              )}
              {sortedFilteredDMs.length > 0 && (
                <FollowListSection
                  title="Direct messages"
                  entries={sortedFilteredDMs}
                  onFollow={onFollowDM}
                  followedIds={followedIds}
                  type="dm"
                />
              )}
              {sortedFilteredChannels.length === 0 && sortedFilteredDMs.length === 0 && (
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
                  entries={sortedChannels}
                  onFollow={onFollowChannel}
                  followedIds={followedIds}
                  type="channel"
                />
              ) : (
                <FollowListSection
                  title="Direct messages"
                  entries={sortedDMs}
                  onFollow={onFollowDM}
                  followedIds={followedIds}
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

function FollowListSection({ title, entries, onFollow, followedIds = new Set(), type }) {
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
        {entries.map((entry) => {
          const isFollowed = followedIds.has(entry.id);

          return (
            <li key={entry.id} className={`follow-list-item ${isFollowed ? "follow-list-item--added" : ""}`}>
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
              {isFollowed ? (
                <span className="follow-list-added-indicator">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added
                </span>
              ) : (
                <button
                  type="button"
                  className="follow-list-follow-btn"
                  onClick={() => onFollow(entry.id)}
                >
                  Add
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FollowDialog;
