// src/components/KnowledgeKernelScreen.jsx
// Main Knowledge Kernel configuration screen

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CONNECTORS, CONNECTOR_ICONS, CONNECTOR_ICON_URLS } from "../utils/companyKnowledgeData";
import {
  getWorkspaceKernel,
  updateWorkspaceKernel,
  getKernelUsage,
  getWorkspaceKernelUsage,
} from "../utils/kernelData";

function KnowledgeKernelScreen({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const [selectedSources, setSelectedSources] = useState([]);
  const [lastAddedSource, setLastAddedSource] = useState(null);
  const [activeTab, setActiveTab] = useState("sources"); // "sources" or "usages"

  // Ref to track current selectedSources for use in effects
  const selectedSourcesRef = useRef(selectedSources);
  selectedSourcesRef.current = selectedSources;

  // Save and close helper
  const saveAndClose = () => {
    updateWorkspaceKernel({ sourceIds: selectedSourcesRef.current });
    onClose();
  };

  // Load current kernel state when opening
  useEffect(() => {
    if (isOpen) {
      const kernel = getWorkspaceKernel();
      setSelectedSources(kernel.sourceIds || []);
      setLastAddedSource(null);
    }
  }, [isOpen]);

  // Clear animation flag after delay
  useEffect(() => {
    if (lastAddedSource) {
      const timer = setTimeout(() => setLastAddedSource(null), 400);
      return () => clearTimeout(timer);
    }
  }, [lastAddedSource]);

  // Close on Escape key - saves before closing
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        updateWorkspaceKernel({ sourceIds: selectedSourcesRef.current });
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      saveAndClose();
    }
  };

  const handleToggleSource = (sourceId) => {
    if (selectedSources.includes(sourceId)) {
      // Remove source
      setSelectedSources(selectedSources.filter((id) => id !== sourceId));
    } else {
      // Add source
      setSelectedSources([...selectedSources, sourceId]);
      setLastAddedSource(sourceId);
    }
  };

  // Dynamic count text
  const getCountText = () => {
    const count = selectedSources.length;
    if (count === 0) return "No sources added yet.";
    if (count === 1) return "1 source added to this Kernel.";
    return `${count} sources added to this Kernel.`;
  };

  // Get icon URLs for the pill preview
  const pillIconUrls = selectedSources
    .slice(0, 6)
    .map((id) => ({ id, url: CONNECTOR_ICON_URLS[id] }))
    .filter((item) => item.url);

  return createPortal(
    <div
      ref={overlayRef}
      className="kk-screen-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="kk-screen"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kk-screen-title"
      >
        {/* Close Button */}
        <button
          type="button"
          className="kk-screen-close"
          aria-label="Close"
          onClick={saveAndClose}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Header */}
        <header className="kk-screen-header">
          <div className="kk-header-content">
            {/* Pill Preview Section */}
            <div className="kk-pill-section">
              <div
                className={`kk-pill-preview ${selectedSources.length > 0 ? "kk-pill-preview--active" : ""}`}
              >
                <span className="kk-pill-name">Your Kernel</span>
                <span className="kk-pill-icons">
                  {pillIconUrls.length > 0 &&
                    pillIconUrls.map((item, i) => (
                      <span
                        key={item.id}
                        className={`kk-pill-icon ${lastAddedSource && i === pillIconUrls.length - 1 ? "kk-pill-icon--pop" : ""}`}
                      >
                        <img src={item.url} alt="" width="16" height="16" />
                      </span>
                    ))
                  }
                </span>
              </div>
              <p className="kk-pill-count">{getCountText()}</p>
            </div>

            {/* Title and Description */}
            <div className="kk-header-text">
              <h1 id="kk-screen-title" className="kk-screen-title">
                Set up your Kernel
              </h1>
              <p className="kk-screen-description">
                Control Popcorn's access in one secure place so it can support you and your team with the right context everywhere you work.
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="kk-modal-tabs">
          <button
            type="button"
            className={`kk-modal-tab ${activeTab === "sources" ? "kk-modal-tab--active" : ""}`}
            onClick={() => setActiveTab("sources")}
          >
            Available sources
          </button>
          <button
            type="button"
            className={`kk-modal-tab ${activeTab === "usages" ? "kk-modal-tab--active" : ""}`}
            onClick={() => setActiveTab("usages")}
          >
            Kernel Usages
          </button>
        </div>

        {/* Tab Content */}
        <div className="kk-screen-body">
          {/* Sources Tab */}
          {activeTab === "sources" && (
            <div className="connectors-grid">
              {CONNECTORS.map((connector) => {
                const isAdded = selectedSources.includes(connector.id);
                return (
                  <button
                    key={connector.id}
                    type="button"
                    className={`connector-card ${isAdded ? "connector-card--connected" : ""}`}
                    onClick={() => handleToggleSource(connector.id)}
                  >
                    <div className="connector-icon">
                      <img
                        src={CONNECTOR_ICON_URLS[connector.id]}
                        alt={connector.name}
                        width="24"
                        height="24"
                      />
                    </div>
                    <div className="connector-info">
                      <div className="connector-name">{connector.name}</div>
                    </div>
                    <div className={`connector-add-btn ${isAdded ? "connector-add-btn--connected" : ""}`}>
                      {isAdded ? (
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
                );
              })}
            </div>
          )}

          {/* Usages Tab */}
          {activeTab === "usages" && (
            <div className="kk-usages-content">
              {getWorkspaceKernelUsage().map((channel) => (
                <div key={channel.channelId} className="kk-channel-usage-row">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="kk-channel-icon">
                    <path d="M5.5 3.5L4 12.5M12 3.5L10.5 12.5M3 6H13.5M2.5 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="kk-channel-usage-name">{channel.channelName}</span>
                  <div className="kk-channel-usage-sources">
                    {channel.enabledSources.map((sourceId) => {
                      const connector = CONNECTORS.find(c => c.id === sourceId);
                      if (!connector) return null;
                      return (
                        <span key={sourceId} className="kk-channel-source-pill">
                          <img
                            src={CONNECTOR_ICON_URLS[sourceId]}
                            alt=""
                            width="14"
                            height="14"
                          />
                          <span>{connector.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}

export default KnowledgeKernelScreen;
