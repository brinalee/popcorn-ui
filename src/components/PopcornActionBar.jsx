// src/components/PopcornActionBar.jsx
// Action bar with Stop and Regenerate buttons for AI generation

function PopcornActionBar({ onStop, onRetry, showStop = true }) {
  return (
    <div className="popcorn-action-bar">
      {showStop && (
        <button
          type="button"
          className="popcorn-action-btn popcorn-action-btn--stop"
          onClick={onStop}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" />
          </svg>
          Stop
        </button>
      )}
      <button
        type="button"
        className="popcorn-action-btn popcorn-action-btn--retry"
        onClick={onRetry}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M10 6a4 4 0 01-7.5 2M2 6a4 4 0 017.5-2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10 3v3h-3M2 9V6h3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Regenerate
      </button>
    </div>
  );
}

export default PopcornActionBar;
