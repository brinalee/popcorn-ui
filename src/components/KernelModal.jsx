// src/components/KernelModal.jsx
// Modal with Sources + Where Used tabs for Knowledge Kernel

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { channels } from "../mockData";
import {
  getWorkspaceKernel,
  updateWorkspaceKernel,
} from "../utils/kernelData";

// Source definitions
const SOURCES = [
  { id: "github", name: "GitHub", icon: "🐙", description: "Code & PRs" },
  { id: "notion", name: "Notion", icon: "📝", description: "Docs & knowledge" },
  { id: "linear", name: "Linear", icon: "🔷", description: "Issues & tasks" },
  { id: "figma", name: "Figma", icon: "🎨", description: "Design files" },
  { id: "trello", name: "Trello", icon: "📋", description: "Boards & cards" },
  { id: "asana", name: "Asana", icon: "🎯", description: "Projects & tasks" },
  { id: "google-drive", name: "Google Drive", icon: "📁", description: "Files & docs" },
];

function KernelModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const [activeTab, setActiveTab] = useState("sources");
  const [selectedSources, setSelectedSources] = useState([]);

  // Load current kernel state when opening
  useEffect(() => {
    if (isOpen) {
      const kernel = getWorkspaceKernel();
      setSelectedSources(kernel.sourceIds || []);
    }
  }, [isOpen]);

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

  const handleToggleSource = (sourceId) => {
    let newSources;
    if (selectedSources.includes(sourceId)) {
      newSources = selectedSources.filter((id) => id !== sourceId);
    } else {
      newSources = [...selectedSources, sourceId];
    }
    setSelectedSources(newSources);
    updateWorkspaceKernel({ sourceIds: newSources });
  };

  // Get channels that use this kernel (those with managerName set)
  const channelsUsingKernel = channels.filter((ch) => ch.managerName);

  // Pill icons for the kernel preview
  const pillIcons = selectedSources
    .slice(0, 5)
    .map((id) => SOURCES.find((s) => s.id === id)?.icon)
    .filter(Boolean);

  return createPortal(
    <div
      ref={overlayRef}
      className="kk-screen-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="kk-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <header className="kk-modal-header">
          <h2 className="kk-modal-title">Knowledge Kernel</h2>
          <button
            type="button"
            className="kk-modal-close"
            aria-label="Close"
            onClick={onClose}
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
        </header>

        {/* Tabs */}
        <div className="kk-modal-tabs">
          <button
            type="button"
            className={`kk-modal-tab ${activeTab === "sources" ? "kk-modal-tab--active" : ""}`}
            onClick={() => setActiveTab("sources")}
          >
            Sources
          </button>
          <button
            type="button"
            className={`kk-modal-tab ${activeTab === "usage" ? "kk-modal-tab--active" : ""}`}
            onClick={() => setActiveTab("usage")}
          >
            Where Used
          </button>
        </div>

        {/* Body */}
        <div className="kk-modal-body">
          {activeTab === "sources" && (
            <div className="kk-sources-tab">
              {/* Kernel pill preview */}
              <div className="kk-pill-section" style={{ marginBottom: "20px" }}>
                <div
                  className={`kk-pill-preview ${selectedSources.length > 0 ? "kk-pill-preview--active" : ""}`}
                >
                  <span className="kk-pill-icons">
                    {pillIcons.length === 0 ? (
                      <span className="kk-pill-placeholder">?</span>
                    ) : (
                      pillIcons.map((icon, i) => (
                        <span key={i} className="kk-pill-icon">
                          {icon}
                        </span>
                      ))
                    )}
                  </span>
                  <span className="kk-pill-name">Workspace Kernel</span>
                </div>
                <p className="kk-pill-count">
                  {selectedSources.length === 0
                    ? "No sources added yet."
                    : selectedSources.length === 1
                    ? "1 source added to this Kernel."
                    : `${selectedSources.length} sources added to this Kernel.`}
                </p>
              </div>

              {/* Source list */}
              {SOURCES.map((source) => {
                const isAdded = selectedSources.includes(source.id);
                return (
                  <div key={source.id} className="kk-source-row">
                    <span className="kk-source-row-icon">{source.icon}</span>
                    <div className="kk-source-row-info">
                      <span className="kk-source-row-name">{source.name}</span>
                      <span className="kk-source-row-desc">{source.description}</span>
                    </div>
                    <button
                      type="button"
                      className={`kk-toggle ${isAdded ? "kk-toggle--on" : ""}`}
                      onClick={() => handleToggleSource(source.id)}
                      aria-pressed={isAdded}
                    >
                      <span className="kk-toggle-track">
                        <span className="kk-toggle-thumb"></span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "usage" && (
            <div className="kk-usage-tab">
              {/* Channels section */}
              <div className="kk-usage-section">
                <h3 className="kk-usage-group-title">
                  Channels ({channelsUsingKernel.length})
                </h3>
                <div className="kk-usage-rows">
                  {channelsUsingKernel.map((ch) => (
                    <div key={ch.id} className="kk-usage-row">
                      <span className="kk-usage-row-icon">
                        {ch.iconType === "bolt" ? "⚡" : "#"}
                      </span>
                      <span className="kk-usage-row-name">{ch.label}</span>
                      <span className="kk-usage-row-role">Channel Manager</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DMs section */}
              <div className="kk-usage-section">
                <h3 className="kk-usage-group-title">DMs (1)</h3>
                <div className="kk-usage-rows">
                  <div className="kk-usage-row">
                    <span className="kk-usage-row-icon">💬</span>
                    <span className="kk-usage-row-name">DM with Popcorn</span>
                    <span className="kk-usage-row-role">Your Kernel</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default KernelModal;
