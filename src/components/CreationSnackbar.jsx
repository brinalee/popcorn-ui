// src/components/CreationSnackbar.jsx
// Persistent snackbar for channel creation loading states

import { useState, useEffect } from "react";
import { CreationState } from "../hooks/useChannelCreation";

function CreationSnackbar({
  state,
  loadingMessage,
  elapsedSeconds = 0,
  onRetry,
  onCancel,
}) {
  const [visible, setVisible] = useState(true);

  // Auto-hide on success after 3 seconds
  useEffect(() => {
    if (state === CreationState.SUCCESS) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
    setVisible(true);
  }, [state]);

  if (!visible) return null;

  return (
    <div className={`creation-snackbar creation-snackbar--${state}`}>
      {/* Loading State */}
      {state === CreationState.LOADING && (
        <>
          <div className="snackbar-spinner" />
          <div className="snackbar-content">
            <span className="snackbar-message">{loadingMessage}</span>
            <span className="snackbar-subtext">
              {elapsedSeconds > 0 ? `${elapsedSeconds}s elapsed` : "This may take a few moments."}
            </span>
          </div>
        </>
      )}

      {/* Success State */}
      {state === CreationState.SUCCESS && (
        <>
          <svg className="snackbar-icon snackbar-icon--success" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M6 10l3 3 5-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="snackbar-message">Your channel is ready!</span>
        </>
      )}

      {/* Error State */}
      {state === CreationState.ERROR && (
        <>
          <svg className="snackbar-icon snackbar-icon--error" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10 6v5M10 14h.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="snackbar-content">
            <span className="snackbar-message">Popcorn couldn't create your channel.</span>
          </div>
          <div className="snackbar-actions">
            <button type="button" className="snackbar-btn snackbar-btn--primary" onClick={onRetry}>
              Retry
            </button>
            <button type="button" className="snackbar-btn snackbar-btn--secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CreationSnackbar;
