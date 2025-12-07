// src/components/CompanyKnowledgeModal.jsx
import { useState, useRef, useEffect } from "react";
import {
  getConnectorsWithStatus,
  getKnowledgeSummary,
  getChannelAccess,
  getActivityEvents,
  groupEventsByDay,
  formatRelativeTime,
  CATEGORIES,
  AVAILABLE_CHANNELS,
} from "../utils/companyKnowledgeData";

function CompanyKnowledgeModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const [activeTab, setActiveTab] = useState("connectors");
  const [selectedConnectorId, setSelectedConnectorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activityFilters, setActivityFilters] = useState({
    connector: "all",
    status: "all",
  });
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Get data
  const connectors = getConnectorsWithStatus();
  const summary = getKnowledgeSummary();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (selectedConnectorId) {
          setSelectedConnectorId(null);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, selectedConnectorId]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("connectors");
      setSelectedConnectorId(null);
      setSearchQuery("");
      setFilterStatus("all");
      setExpandedEventId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Filter connectors
  const filteredConnectors = connectors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "connected" && c.connected) ||
      (filterStatus === "issues" && c.status === "error");
    return matchesSearch && matchesStatus;
  });

  // Filter for directory (not connected)
  const directoryConnectors = connectors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return !c.connected && matchesSearch && matchesCategory;
  });

  // Get activity events
  const activityEvents = getActivityEvents({
    connectorId: activityFilters.connector !== "all" ? activityFilters.connector : null,
    status: activityFilters.status !== "all" ? activityFilters.status : null,
  });
  const groupedEvents = groupEventsByDay(activityEvents);

  // Selected connector for detail view
  const selectedConnector = selectedConnectorId
    ? connectors.find((c) => c.id === selectedConnectorId)
    : null;
  const channelAccess = selectedConnectorId ? getChannelAccess(selectedConnectorId) : [];

  return (
    <div
      ref={overlayRef}
      className="ck-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="ck-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ck-modal-title"
      >
        {/* Header */}
        <header className="ck-modal-header">
          <div className="ck-header-content">
            <h1 id="ck-modal-title" className="ck-modal-title">
              Company Knowledge
            </h1>
            <p className="ck-modal-subtitle">
              Manage your workspace's data sources and integrations
            </p>
          </div>
          <div className="ck-header-badges">
            <span className="ck-badge ck-badge--connected">
              {summary.connectedCount} connected
            </span>
            <span className="ck-badge ck-badge--channels">
              {summary.totalChannels} channels
            </span>
          </div>
          <button
            type="button"
            className="cc-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {/* Health Banner */}
        <div className={`ck-health-banner ck-health-banner--${summary.healthStatus}`}>
          <span className={`ck-health-indicator ck-health-indicator--${summary.healthStatus}`} />
          <span className="ck-health-text">
            {summary.healthStatus === "healthy" && "All connectors healthy"}
            {summary.healthStatus === "warning" && "Some connectors need attention"}
            {summary.healthStatus === "error" && `${summary.errorCount} connector${summary.errorCount > 1 ? "s" : ""} need${summary.errorCount === 1 ? "s" : ""} attention`}
          </span>
          {summary.healthStatus !== "healthy" && (
            <button
              className="ck-health-link"
              onClick={() => {
                setActiveTab("connectors");
                setFilterStatus("issues");
              }}
            >
              View {summary.errorCount > 1 ? "issues" : "issue"}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="ck-tabs">
          <button
            className={`ck-tab ${activeTab === "connectors" ? "ck-tab--active" : ""}`}
            onClick={() => {
              setActiveTab("connectors");
              setSelectedConnectorId(null);
            }}
          >
            Connectors
          </button>
          <button
            className={`ck-tab ${activeTab === "activity" ? "ck-tab--active" : ""}`}
            onClick={() => {
              setActiveTab("activity");
              setSelectedConnectorId(null);
            }}
          >
            Activity
          </button>
          <button
            className={`ck-tab ${activeTab === "directory" ? "ck-tab--active" : ""}`}
            onClick={() => {
              setActiveTab("directory");
              setSelectedConnectorId(null);
            }}
          >
            Directory
          </button>
        </div>

        {/* Body */}
        <div className="ck-modal-body">
          {/* Detail Panel (slides over content) */}
          {selectedConnectorId && selectedConnector && (
            <ConnectorDetailPanel
              connector={selectedConnector}
              channelAccess={channelAccess}
              onBack={() => setSelectedConnectorId(null)}
            />
          )}

          {/* Main content (hidden when detail panel is open) */}
          {!selectedConnectorId && (
            <>
              {/* Connectors Tab */}
              {activeTab === "connectors" && (
                <div className="ck-connectors-section">
                  {/* Search and Filters */}
                  <div className="ck-toolbar">
                    <input
                      type="text"
                      className="ck-search-input"
                      placeholder="Search connectors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="ck-filter-chips">
                      <button
                        className={`ck-filter-chip ${filterStatus === "all" ? "ck-filter-chip--active" : ""}`}
                        onClick={() => setFilterStatus("all")}
                      >
                        All
                      </button>
                      <button
                        className={`ck-filter-chip ${filterStatus === "connected" ? "ck-filter-chip--active" : ""}`}
                        onClick={() => setFilterStatus("connected")}
                      >
                        Connected
                      </button>
                      <button
                        className={`ck-filter-chip ${filterStatus === "issues" ? "ck-filter-chip--active" : ""}`}
                        onClick={() => setFilterStatus("issues")}
                      >
                        Issues
                      </button>
                    </div>
                  </div>

                  {/* Connector Grid */}
                  {filteredConnectors.length === 0 ? (
                    <div className="ck-empty-state">
                      <div className="ck-empty-icon">🔌</div>
                      <h3 className="ck-empty-title">No connectors found</h3>
                      <p className="ck-empty-description">
                        {filterStatus === "issues"
                          ? "No connectors with issues."
                          : "Try adjusting your search or filters."}
                      </p>
                    </div>
                  ) : (
                    <div className="ck-connectors-grid">
                      {filteredConnectors.map((connector) => (
                        <ConnectorCard
                          key={connector.id}
                          connector={connector}
                          onManage={() => setSelectedConnectorId(connector.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className="ck-activity-section">
                  {/* Filters */}
                  <div className="ck-toolbar">
                    <select
                      className="ck-select"
                      value={activityFilters.connector}
                      onChange={(e) =>
                        setActivityFilters((f) => ({ ...f, connector: e.target.value }))
                      }
                    >
                      <option value="all">All connectors</option>
                      {connectors
                        .filter((c) => c.connected)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                    <select
                      className="ck-select"
                      value={activityFilters.status}
                      onChange={(e) =>
                        setActivityFilters((f) => ({ ...f, status: e.target.value }))
                      }
                    >
                      <option value="all">All statuses</option>
                      <option value="success">Success</option>
                      <option value="error">Errors</option>
                    </select>
                  </div>

                  {/* Activity List */}
                  {groupedEvents.length === 0 ? (
                    <div className="ck-empty-state">
                      <div className="ck-empty-icon">📋</div>
                      <h3 className="ck-empty-title">No activity yet</h3>
                      <p className="ck-empty-description">
                        Activity from your connectors will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="ck-activity-list">
                      {groupedEvents.map((group) => (
                        <div key={group.label} className="ck-activity-day-group">
                          <div className="ck-activity-day-label">{group.label}</div>
                          {group.items.map((event) => (
                            <ActivityItem
                              key={event.id}
                              event={event}
                              isExpanded={expandedEventId === event.id}
                              onToggle={() =>
                                setExpandedEventId(
                                  expandedEventId === event.id ? null : event.id
                                )
                              }
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Directory Tab */}
              {activeTab === "directory" && (
                <div className="ck-directory-section">
                  <h3 className="ck-section-title">Add a connector</h3>

                  {/* Search */}
                  <input
                    type="text"
                    className="ck-search-input"
                    placeholder="Search connectors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {/* Category Pills */}
                  <div className="ck-category-pills">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        className={`ck-category-pill ${categoryFilter === cat.id ? "ck-category-pill--active" : ""}`}
                        onClick={() => setCategoryFilter(cat.id)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Directory Grid */}
                  {directoryConnectors.length === 0 ? (
                    <div className="ck-empty-state">
                      <div className="ck-empty-icon">✨</div>
                      <h3 className="ck-empty-title">All connectors added</h3>
                      <p className="ck-empty-description">
                        You've connected all available integrations.
                      </p>
                    </div>
                  ) : (
                    <div className="ck-directory-grid">
                      {directoryConnectors.map((connector) => (
                        <DirectoryCard key={connector.id} connector={connector} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Connector Card Component
function ConnectorCard({ connector, onManage }) {
  const hasError = connector.status === "error";

  return (
    <div className={`ck-connector-card ${hasError ? "ck-connector-card--error" : ""}`}>
      <div className="ck-connector-icon">{connector.icon}</div>
      <div className="ck-connector-body">
        <div className="ck-connector-header">
          <span className="ck-connector-name">{connector.name}</span>
          {connector.connected ? (
            <span className={`ck-status-badge ck-status--${connector.status}`}>
              {hasError ? "Needs attention" : "Connected"}
            </span>
          ) : (
            <span className="ck-status-badge ck-status--disconnected">Not connected</span>
          )}
        </div>
        <p className="ck-connector-description">{connector.description}</p>
        {connector.connected && (
          <div className="ck-connector-meta">
            {connector.channelCount > 0 && (
              <span className="ck-connector-badge">
                {connector.channelCount} channel{connector.channelCount !== 1 ? "s" : ""}
              </span>
            )}
            {connector.agentCount > 0 && (
              <span className="ck-connector-badge">
                {connector.agentCount} agent{connector.agentCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
        {hasError && connector.errorMessage && (
          <div className="ck-error-banner">
            <svg className="ck-error-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 4v3m0 3h.01M13 7A6 6 0 1 1 1 7a6 6 0 0 1 12 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="ck-error-text">{connector.errorMessage}</span>
          </div>
        )}
      </div>
      <div className="ck-connector-actions">
        {connector.connected ? (
          <>
            {hasError && (
              <button className="ck-btn-reauth">Reconnect</button>
            )}
            <button className="ck-btn-manage" onClick={onManage}>
              Manage
            </button>
          </>
        ) : (
          <button className="ck-btn-connect">Connect</button>
        )}
      </div>
    </div>
  );
}

// Directory Card Component
function DirectoryCard({ connector }) {
  return (
    <div className="ck-directory-card">
      <div className="ck-directory-icon">{connector.icon}</div>
      <div className="ck-directory-info">
        <span className="ck-directory-name">{connector.name}</span>
        <span className="ck-directory-desc">{connector.description}</span>
      </div>
      <button className="ck-btn-add">Connect</button>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ event, isExpanded, onToggle }) {
  return (
    <div className={`ck-activity-item ${isExpanded ? "ck-activity-item--expanded" : ""}`}>
      <button className="ck-activity-row" onClick={onToggle}>
        <span className={`ck-activity-status ck-activity-status--${event.status}`} />
        <div className="ck-activity-content">
          <span className="ck-activity-title">{event.title}</span>
          <span className="ck-activity-subtitle">{event.description}</span>
        </div>
        <div className="ck-activity-meta">
          <span className="ck-activity-connector-badge">{event.connectorName}</span>
          {event.channelName && (
            <span className="ck-activity-channel">{event.channelName}</span>
          )}
          <span className="ck-activity-time">{formatRelativeTime(event.timestamp)}</span>
        </div>
        <svg
          className={`ck-activity-chevron ${isExpanded ? "ck-activity-chevron--open" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isExpanded && (
        <div className="ck-activity-details">
          <div className="ck-activity-details-text">
            <strong>Details:</strong>
            <pre>{JSON.stringify(event.details, null, 2)}</pre>
          </div>
          <div className="ck-activity-actions">
            {event.status === "error" && (
              <button className="ck-btn-retry">Retry</button>
            )}
            <button className="ck-btn-copy">Copy details</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Connector Detail Panel Component
function ConnectorDetailPanel({ connector, channelAccess, onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState("all");

  const filteredChannels = channelAccess.filter((ch) => {
    const matchesSearch = ch.channelName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      accessFilter === "all" ||
      (accessFilter === "access" && true) ||
      (accessFilter === "no-access" && false);
    return matchesSearch && matchesFilter;
  });

  // Get channels without access
  const channelsWithAccess = new Set(channelAccess.map(ch => ch.channelId));
  const channelsWithoutAccess = AVAILABLE_CHANNELS.filter(ch => !channelsWithAccess.has(ch.id));

  return (
    <div className="ck-detail-panel">
      {/* Back button */}
      <button className="ck-detail-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to connectors
      </button>

      {/* Connector Header */}
      <div className="ck-detail-header">
        <div className="ck-detail-icon">{connector.icon}</div>
        <div className="ck-detail-info">
          <h2 className="ck-detail-name">{connector.name}</h2>
          <p className="ck-detail-meta">
            Connected by {connector.connectedByName} · Last synced {formatRelativeTime(connector.lastSync)}
          </p>
        </div>
        <div className="ck-detail-actions">
          <button className="ck-btn-disconnect">Disconnect</button>
        </div>
      </div>

      {/* Error Banner (if applicable) */}
      {connector.status === "error" && connector.errorMessage && (
        <div className="ck-detail-error-banner">
          <svg className="ck-error-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 5v3m0 3h.01M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>{connector.errorMessage}</span>
          <button className="ck-btn-reauth">Reconnect</button>
        </div>
      )}

      {/* Channel Access Section */}
      <div className="ck-channel-access-section">
        <div className="ck-channel-header">
          <h3 className="ck-section-title">Channel access</h3>
          <span className="ck-channel-count">{channelAccess.length} channels</span>
        </div>

        {/* Toolbar */}
        <div className="ck-toolbar">
          <input
            type="text"
            className="ck-search-input"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="ck-filter-chips">
            <button
              className={`ck-filter-chip ${accessFilter === "all" ? "ck-filter-chip--active" : ""}`}
              onClick={() => setAccessFilter("all")}
            >
              All
            </button>
            <button
              className={`ck-filter-chip ${accessFilter === "access" ? "ck-filter-chip--active" : ""}`}
              onClick={() => setAccessFilter("access")}
            >
              Has access
            </button>
          </div>
        </div>

        {/* Channel Table */}
        {filteredChannels.length === 0 ? (
          <div className="ck-empty-state ck-empty-state--small">
            <p className="ck-empty-description">No channels have access to this connector.</p>
            <button className="ck-btn-add-channel">Add channel</button>
          </div>
        ) : (
          <div className="ck-channel-table">
            <div className="ck-channel-table-header">
              <span className="ck-channel-col-name">Channel</span>
              <span className="ck-channel-col-permission">Permission</span>
              <span className="ck-channel-col-activity">Last activity</span>
              <span className="ck-channel-col-actions"></span>
            </div>
            {filteredChannels.map((channel) => (
              <div key={channel.channelId} className="ck-channel-row">
                <span className="ck-channel-col-name">
                  <span className="ck-channel-hash">#</span>
                  {channel.channelName.replace("#", "")}
                  {channel.channelType === "private" && (
                    <span className="ck-channel-private-badge">Private</span>
                  )}
                </span>
                <span className="ck-channel-col-permission">
                  <span className={`ck-permission-badge ck-permission-badge--${channel.permission}`}>
                    {channel.permission === "read_write" ? "Read & Write" : "Read only"}
                  </span>
                </span>
                <span className="ck-channel-col-activity">
                  {formatRelativeTime(channel.lastActivity)}
                </span>
                <span className="ck-channel-col-actions">
                  <button className="ck-btn-icon" title="Remove access">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add Channel Button */}
        {channelsWithoutAccess.length > 0 && (
          <button className="ck-btn-add-channel">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add channel
          </button>
        )}
      </div>
    </div>
  );
}

export default CompanyKnowledgeModal;
