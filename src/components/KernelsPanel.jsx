// src/components/KernelsPanel.jsx
// Main panel for managing Popcorn Kernels (replaces CompanyKnowledgeModal)

import { useState, useRef, useEffect } from "react";
import KernelPill from "./KernelPill";
import {
  getKernels,
  getKernelById,
  getKernelConnectors,
  getKernelUsage,
  getKernelActivity,
  getKernelsSummary,
  toggleKernel,
  deleteKernel,
  removeConnectorFromKernel,
  formatRelativeTime,
  CONNECTOR_ICONS,
} from "../utils/kernelData";
import { groupEventsByDay } from "../utils/companyKnowledgeData";

function KernelsPanel({ isOpen, onClose, onCreateKernel }) {
  const overlayRef = useRef(null);
  const [selectedKernelId, setSelectedKernelId] = useState(null);
  const [kernelsData, setKernelsData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load kernels data
  useEffect(() => {
    if (isOpen) {
      setKernelsData(getKernels());
    }
  }, [isOpen, refreshKey]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (selectedKernelId) {
          setSelectedKernelId(null);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, selectedKernelId]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedKernelId(null);
      setRefreshKey((k) => k + 1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const summary = getKernelsSummary();

  const handleToggleKernel = (kernelId) => {
    toggleKernel(kernelId);
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteKernel = (kernelId) => {
    deleteKernel(kernelId);
    setSelectedKernelId(null);
    setRefreshKey((k) => k + 1);
  };

  const handleRemoveConnector = (kernelId, connectorId) => {
    removeConnectorFromKernel(kernelId, connectorId);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div
      ref={overlayRef}
      className="kernel-panel-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="kernel-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kernel-panel-title"
      >
        {/* Header */}
        <header className="kernel-panel-header">
          <div className="kernel-header-content">
            <h1 id="kernel-panel-title" className="kernel-panel-title">
              Kernels & Knowledge
            </h1>
            <div className="kernel-header-stats">
              <span className="kernel-stat">
                {summary.kernelCount} Kernel{summary.kernelCount !== 1 ? "s" : ""}
              </span>
              <span className="kernel-stat-divider">·</span>
              <span className="kernel-stat">
                {summary.connectorCount} connected app{summary.connectorCount !== 1 ? "s" : ""}
              </span>
              <span className="kernel-stat-divider">·</span>
              <span className="kernel-stat">
                {summary.channelCount} channel{summary.channelCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="kernel-header-actions">
            <button
              type="button"
              className="kernel-btn kernel-btn--primary"
              onClick={onCreateKernel}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create Kernel
            </button>
            <button
              type="button"
              className="kernel-panel-close"
              aria-label="Close"
              onClick={onClose}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Health Banner */}
        {summary.health !== "healthy" && (
          <div className="kernel-health-banner kernel-health-banner--error">
            <span className="kernel-health-indicator" />
            <span className="kernel-health-text">
              {summary.errorCount} Kernel{summary.errorCount !== 1 ? "s" : ""} need{summary.errorCount === 1 ? "s" : ""} attention
            </span>
          </div>
        )}

        {/* Body */}
        <div className="kernel-panel-body">
          {/* Detail Panel */}
          {selectedKernelId && (
            <KernelDetailView
              kernelId={selectedKernelId}
              onBack={() => setSelectedKernelId(null)}
              onToggle={() => handleToggleKernel(selectedKernelId)}
              onDelete={() => handleDeleteKernel(selectedKernelId)}
              onRemoveConnector={(connectorId) => handleRemoveConnector(selectedKernelId, connectorId)}
            />
          )}

          {/* Kernel List */}
          {!selectedKernelId && (
            <>
              {kernelsData.length === 0 ? (
                <div className="kernel-empty-state">
                  <div className="kernel-empty-illustration">
                    <span className="kernel-empty-icon">🍿</span>
                  </div>
                  <h3 className="kernel-empty-title">No Kernels yet</h3>
                  <p className="kernel-empty-description">
                    Create your first Kernel to give Popcorn access to your team's knowledge sources.
                  </p>
                  <button
                    className="kernel-btn kernel-btn--primary kernel-btn--large"
                    onClick={onCreateKernel}
                  >
                    Create your first Kernel
                  </button>
                </div>
              ) : (
                <div className="kernel-list">
                  {kernelsData.map((kernel) => (
                    <KernelCard
                      key={kernel.id}
                      kernel={kernel}
                      onManage={() => setSelectedKernelId(kernel.id)}
                      onToggle={() => handleToggleKernel(kernel.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Kernel Card Component
function KernelCard({ kernel, onManage, onToggle }) {
  const hasIssue = kernel.health === "error" || kernel.health === "warning";

  return (
    <div
      className={`kernel-card ${!kernel.isEnabled ? "kernel-card--disabled" : ""} ${hasIssue ? "kernel-card--issue" : ""}`}
    >
      <div className="kernel-card-header">
        <KernelPill
          kernel={kernel}
          size="md"
          showHealth={true}
        />
        {!kernel.isEnabled && (
          <span className="kernel-card-status-badge">Off</span>
        )}
      </div>

      {kernel.description && (
        <p className="kernel-card-description">{kernel.description}</p>
      )}

      <div className="kernel-card-meta">
        <div className="kernel-card-usage">
          {kernel.usage.channels > 0 && (
            <span className="kernel-usage-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M2 6h8M2 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {kernel.usage.channels} channel{kernel.usage.channels !== 1 ? "s" : ""}
            </span>
          )}
          {kernel.usage.agents > 0 && (
            <span className="kernel-usage-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 10c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {kernel.usage.agents} agent{kernel.usage.agents !== 1 ? "s" : ""}
            </span>
          )}
          {kernel.usage.channels === 0 && kernel.usage.agents === 0 && (
            <span className="kernel-usage-badge kernel-usage-badge--empty">
              Not in use
            </span>
          )}
        </div>

        <span className="kernel-card-creator">
          Created by {kernel.createdByName}
        </span>
      </div>

      {hasIssue && (
        <div className="kernel-card-alert">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 4v3m0 3h.01M13 7A6 6 0 1 1 1 7a6 6 0 0 1 12 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Some connectors need attention</span>
        </div>
      )}

      <div className="kernel-card-actions">
        <button className="kernel-btn kernel-btn--secondary" onClick={onManage}>
          Manage Kernel
        </button>
        <button
          className={`kernel-toggle ${kernel.isEnabled ? "kernel-toggle--on" : ""}`}
          onClick={onToggle}
          title={kernel.isEnabled ? "Turn off" : "Turn on"}
        >
          <span className="kernel-toggle-track">
            <span className="kernel-toggle-thumb" />
          </span>
        </button>
      </div>
    </div>
  );
}

// Kernel Detail View Component
function KernelDetailView({ kernelId, onBack, onToggle, onDelete, onRemoveConnector }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const kernel = getKernelById(kernelId);
  const connectors = getKernelConnectors(kernelId);
  const usage = getKernelUsage(kernelId);
  const activity = getKernelActivity(kernelId);
  const groupedActivity = groupEventsByDay(activity.slice(0, 20));

  if (!kernel) {
    return (
      <div className="kernel-detail-error">
        <p>Kernel not found</p>
        <button className="kernel-btn kernel-btn--secondary" onClick={onBack}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="kernel-detail">
      {/* Back button */}
      <button className="kernel-detail-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Kernels
      </button>

      {/* Header */}
      <div className="kernel-detail-header">
        <div className="kernel-detail-pill-wrapper">
          <KernelPill kernel={kernel} size="lg" showHealth={true} />
        </div>
        <div className="kernel-detail-info">
          <p className="kernel-detail-description">
            {kernel.description || "No description"}
          </p>
          <p className="kernel-detail-meta">
            Created by {kernel.createdByName} · {formatRelativeTime(kernel.createdAt)}
          </p>
        </div>
        <div className="kernel-detail-actions">
          <button
            className={`kernel-toggle kernel-toggle--large ${kernel.isEnabled ? "kernel-toggle--on" : ""}`}
            onClick={onToggle}
          >
            <span className="kernel-toggle-track">
              <span className="kernel-toggle-thumb" />
            </span>
            <span className="kernel-toggle-label">
              {kernel.isEnabled ? "On" : "Off"}
            </span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="kernel-detail-tabs">
        <button
          className={`kernel-detail-tab ${activeSection === "overview" ? "kernel-detail-tab--active" : ""}`}
          onClick={() => setActiveSection("overview")}
        >
          Connectors
          <span className="kernel-detail-tab-count">{connectors.length}</span>
        </button>
        <button
          className={`kernel-detail-tab ${activeSection === "usage" ? "kernel-detail-tab--active" : ""}`}
          onClick={() => setActiveSection("usage")}
        >
          Usage
          <span className="kernel-detail-tab-count">
            {usage.channels.length + usage.agents.length}
          </span>
        </button>
        <button
          className={`kernel-detail-tab ${activeSection === "activity" ? "kernel-detail-tab--active" : ""}`}
          onClick={() => setActiveSection("activity")}
        >
          Activity
        </button>
      </div>

      {/* Section Content */}
      <div className="kernel-detail-content">
        {/* Connectors Section */}
        {activeSection === "overview" && (
          <div className="kernel-connectors-section">
            {connectors.length === 0 ? (
              <div className="kernel-empty-state kernel-empty-state--small">
                <p className="kernel-empty-description">
                  This Kernel has no connectors. Add some to give Popcorn knowledge to work with.
                </p>
              </div>
            ) : (
              <div className="kernel-connectors-list">
                {connectors.map((connector) => (
                  <div
                    key={connector.id}
                    className={`kernel-connector-row ${connector.status === "error" ? "kernel-connector-row--error" : ""}`}
                  >
                    <span className="kernel-connector-icon">{connector.icon}</span>
                    <div className="kernel-connector-info">
                      <span className="kernel-connector-name">{connector.name}</span>
                      <span className="kernel-connector-status">
                        {connector.status === "error" ? (
                          <span className="kernel-connector-error">
                            {connector.errorMessage || "Connection error"}
                          </span>
                        ) : connector.lastSync ? (
                          `Synced ${formatRelativeTime(connector.lastSync)}`
                        ) : (
                          "Connected"
                        )}
                      </span>
                    </div>
                    <div className="kernel-connector-actions">
                      {connector.status === "error" && (
                        <button className="kernel-btn kernel-btn--small kernel-btn--warning">
                          Reconnect
                        </button>
                      )}
                      <button
                        className="kernel-btn kernel-btn--icon"
                        onClick={() => onRemoveConnector(connector.id)}
                        title="Remove from Kernel"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="kernel-btn kernel-btn--ghost kernel-btn--add">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add connector
            </button>
          </div>
        )}

        {/* Usage Section */}
        {activeSection === "usage" && (
          <div className="kernel-usage-section">
            {usage.channels.length === 0 && usage.agents.length === 0 ? (
              <div className="kernel-empty-state kernel-empty-state--small">
                <p className="kernel-empty-description">
                  This Kernel isn't being used anywhere yet. Drop it into a channel or agent to get started.
                </p>
              </div>
            ) : (
              <>
                {/* Channels */}
                {usage.channels.length > 0 && (
                  <div className="kernel-usage-group">
                    <h4 className="kernel-usage-group-title">
                      Channels
                      <span className="kernel-usage-group-count">{usage.channels.length}</span>
                    </h4>
                    <div className="kernel-usage-list">
                      {usage.channels.map((item) => (
                        <div key={item.id} className="kernel-usage-item">
                          <span className="kernel-usage-item-icon">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M5 1v12M9 1v12M1 5h12M1 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </span>
                          <span className="kernel-usage-item-name">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agents */}
                {usage.agents.length > 0 && (
                  <div className="kernel-usage-group">
                    <h4 className="kernel-usage-group-title">
                      Agents
                      <span className="kernel-usage-group-count">{usage.agents.length}</span>
                    </h4>
                    <div className="kernel-usage-list">
                      {usage.agents.map((item) => (
                        <div key={item.id} className="kernel-usage-item">
                          <span className="kernel-usage-item-icon">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </span>
                          <span className="kernel-usage-item-name">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Activity Section */}
        {activeSection === "activity" && (
          <div className="kernel-activity-section">
            {groupedActivity.length === 0 ? (
              <div className="kernel-empty-state kernel-empty-state--small">
                <p className="kernel-empty-description">
                  No activity for this Kernel yet. Activity will appear here as Popcorn uses this Kernel.
                </p>
              </div>
            ) : (
              <div className="kernel-activity-list">
                {groupedActivity.map((group) => (
                  <div key={group.label} className="kernel-activity-group">
                    <div className="kernel-activity-day-label">{group.label}</div>
                    {group.items.map((event) => (
                      <div
                        key={event.id}
                        className={`kernel-activity-item kernel-activity-item--${event.status}`}
                      >
                        <span className="kernel-activity-status" />
                        <div className="kernel-activity-content">
                          <span className="kernel-activity-title">{event.title}</span>
                          <span className="kernel-activity-subtitle">{event.description}</span>
                        </div>
                        <div className="kernel-activity-meta">
                          <span className="kernel-activity-connector">
                            {CONNECTOR_ICONS[event.connectorId]}
                          </span>
                          <span className="kernel-activity-time">
                            {formatRelativeTime(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with danger zone */}
      <div className="kernel-detail-footer">
        {showDeleteConfirm ? (
          <div className="kernel-delete-confirm">
            <p className="kernel-delete-warning">
              This will remove the Kernel from all channels and agents. This cannot be undone.
            </p>
            <div className="kernel-delete-actions">
              <button
                className="kernel-btn kernel-btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="kernel-btn kernel-btn--danger"
                onClick={onDelete}
              >
                Delete Kernel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="kernel-btn kernel-btn--ghost kernel-btn--danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete this Kernel
          </button>
        )}
      </div>
    </div>
  );
}

export default KernelsPanel;
