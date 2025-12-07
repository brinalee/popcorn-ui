// src/components/KernelOnboardingModal.jsx
// Multi-step onboarding wizard for creating a Popcorn Kernel

import { useState, useRef, useEffect } from "react";
import { KernelPillBuilding, KernelPillEmpty } from "./KernelPill";
import { getAvailableConnectors, createKernel, CONNECTOR_ICONS } from "../utils/kernelData";

function KernelOnboardingModal({ isOpen, onClose, onComplete }) {
  const overlayRef = useRef(null);
  const [step, setStep] = useState(1);
  const [kernelName, setKernelName] = useState("Team Kernel");
  const [selectedConnectors, setSelectedConnectors] = useState([]);
  const [lastAddedConnector, setLastAddedConnector] = useState(null);

  const connectors = getAvailableConnectors();

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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setKernelName("Team Kernel");
      setSelectedConnectors([]);
      setLastAddedConnector(null);
    }
  }, [isOpen]);

  // Clear animation flag after delay
  useEffect(() => {
    if (lastAddedConnector) {
      const timer = setTimeout(() => setLastAddedConnector(null), 400);
      return () => clearTimeout(timer);
    }
  }, [lastAddedConnector]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleToggleConnector = (connectorId) => {
    if (selectedConnectors.includes(connectorId)) {
      setSelectedConnectors(selectedConnectors.filter(id => id !== connectorId));
    } else {
      setSelectedConnectors([...selectedConnectors, connectorId]);
      setLastAddedConnector(connectorId);
    }
  };

  const handleFinish = () => {
    const newKernel = createKernel(kernelName, "", selectedConnectors);
    setStep(4);
    if (onComplete) {
      // Delay to show completion screen
      setTimeout(() => onComplete(newKernel), 0);
    }
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="kernel-onboarding-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="kernel-onboarding-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="kernel-onboarding-step kernel-onboarding-step--welcome">
            <div className="kernel-onboarding-illustration">
              <div className="kernel-illustration-pill">
                <span className="kernel-illustration-icons">
                  <span className="kernel-illustration-icon pop-1">🐙</span>
                  <span className="kernel-illustration-icon pop-2">🔷</span>
                  <span className="kernel-illustration-icon pop-3">📝</span>
                </span>
                <span className="kernel-illustration-name">Your Kernel</span>
              </div>
              <div className="kernel-illustration-sparkles">
                <span className="sparkle sparkle-1">✨</span>
                <span className="sparkle sparkle-2">✨</span>
                <span className="sparkle sparkle-3">✨</span>
              </div>
            </div>

            <h1 className="kernel-onboarding-title">
              Create your first Popcorn Kernel
            </h1>

            <p className="kernel-onboarding-subtitle">
              A Kernel is a reusable bundle of knowledge. Connect the apps Popcorn
              can learn from, then drop this Kernel into any channel or agent so
              it knows what it's allowed to use.
            </p>

            <p className="kernel-onboarding-encouragement">
              The more you feed this Kernel, the smarter Popcorn gets for your team.
            </p>

            <div className="kernel-onboarding-actions">
              <button
                className="kernel-btn kernel-btn--primary kernel-btn--large"
                onClick={() => setStep(2)}
              >
                Build my Kernel
              </button>
              <button
                className="kernel-btn kernel-btn--ghost"
                onClick={onClose}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="kernel-onboarding-step kernel-onboarding-step--name">
            <div className="kernel-onboarding-header">
              <button
                className="kernel-onboarding-back"
                onClick={() => setStep(1)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <span className="kernel-onboarding-step-indicator">Step 1 of 3</span>
            </div>

            <h2 className="kernel-onboarding-title">Name your Kernel</h2>

            <div className="kernel-onboarding-preview">
              <KernelPillEmpty name={kernelName} size="lg" />
            </div>

            <div className="kernel-onboarding-field">
              <label htmlFor="kernel-name" className="kernel-field-label">
                Kernel name
              </label>
              <input
                id="kernel-name"
                type="text"
                className="kernel-field-input"
                value={kernelName}
                onChange={(e) => setKernelName(e.target.value)}
                placeholder="e.g., Team Kernel, Engineering Kernel"
                autoFocus
              />
            </div>

            <p className="kernel-onboarding-helper">
              This Kernel will travel with you across channels, DMs, and agents.
              Any time you drop this pill in, Popcorn will know it can use the
              sources inside.
            </p>

            <div className="kernel-onboarding-actions">
              <button
                className="kernel-btn kernel-btn--primary"
                onClick={() => setStep(3)}
                disabled={!kernelName.trim()}
              >
                Next: Add sources
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Connectors */}
        {step === 3 && (
          <div className="kernel-onboarding-step kernel-onboarding-step--connectors">
            <div className="kernel-onboarding-header">
              <button
                className="kernel-onboarding-back"
                onClick={() => setStep(2)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <span className="kernel-onboarding-step-indicator">Step 2 of 3</span>
            </div>

            <h2 className="kernel-onboarding-title">Supercharge your Kernel</h2>

            <div className="kernel-onboarding-layout">
              {/* Left: Pill preview */}
              <div className="kernel-onboarding-preview-section">
                <KernelPillBuilding
                  name={kernelName}
                  connectorIds={selectedConnectors}
                  size="lg"
                  animateLastIcon={!!lastAddedConnector}
                />
                <p className="kernel-preview-helper">
                  Every connected app becomes part of this Kernel's knowledge.
                </p>
              </div>

              {/* Right: Connector grid */}
              <div className="kernel-onboarding-connectors">
                <div className="kernel-connectors-grid">
                  {connectors.map((connector) => {
                    const isSelected = selectedConnectors.includes(connector.id);
                    return (
                      <button
                        key={connector.id}
                        className={`kernel-connector-card ${isSelected ? "kernel-connector-card--selected" : ""}`}
                        onClick={() => handleToggleConnector(connector.id)}
                      >
                        <span className="kernel-connector-icon">{connector.icon}</span>
                        <div className="kernel-connector-info">
                          <span className="kernel-connector-name">{connector.name}</span>
                          <span className="kernel-connector-desc">{connector.description}</span>
                        </div>
                        <span className={`kernel-connector-action ${isSelected ? "kernel-connector-action--added" : ""}`}>
                          {isSelected ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 7l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Added
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Add
                            </>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="kernel-onboarding-footer-text">
              You can change these later. For now, just add the sources that
              Popcorn should know about.
            </p>

            <div className="kernel-onboarding-actions">
              <button
                className="kernel-btn kernel-btn--primary"
                onClick={handleFinish}
              >
                Finish Kernel
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {step === 4 && (
          <div className="kernel-onboarding-step kernel-onboarding-step--complete">
            <div className="kernel-onboarding-success">
              <div className="kernel-success-animation">
                <KernelPillBuilding
                  name={kernelName}
                  connectorIds={selectedConnectors}
                  size="lg"
                />
                <div className="kernel-success-glow" />
              </div>
            </div>

            <h2 className="kernel-onboarding-title">Your Kernel is ready!</h2>

            <p className="kernel-onboarding-subtitle">
              Popcorn will use this Kernel wherever you drop it. In channels, DMs,
              and agents, just pick this Kernel and Popcorn will use the knowledge
              inside—only where you say so.
            </p>

            <div className="kernel-onboarding-affordances">
              <div className="kernel-affordance">
                <span className="kernel-affordance-icon">💬</span>
                <span className="kernel-affordance-text">
                  Use this Kernel in channel settings to supercharge team conversations.
                </span>
              </div>
              <div className="kernel-affordance">
                <span className="kernel-affordance-icon">🤖</span>
                <span className="kernel-affordance-text">
                  Use it in agent setup so Popcorn knows which tools it can use.
                </span>
              </div>
              <div className="kernel-affordance">
                <span className="kernel-affordance-icon">⚙️</span>
                <span className="kernel-affordance-text">
                  You can always edit or turn this Kernel off from the Kernels panel.
                </span>
              </div>
            </div>

            <div className="kernel-onboarding-actions">
              <button
                className="kernel-btn kernel-btn--primary kernel-btn--large"
                onClick={handleDone}
              >
                Start using Popcorn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KernelOnboardingModal;
