// src/components/PopcornThinkingIndicator.jsx
// Horizontal thinking row with avatar, animated dots, shimmer verb, and Stop button

import { THINKING_VERBS } from "../hooks/usePopcornGeneration";

// Stop icon component - Nucleo outline "circle-stop"
const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <circle
      cx="9"
      cy="9"
      r="7.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="6.25"
      y="6.25"
      width="5.5"
      height="5.5"
      rx="1"
      ry="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function PopcornThinkingIndicator({
  currentVerbIndex = 0,
  onStop,
}) {
  const verb = THINKING_VERBS[currentVerbIndex] || THINKING_VERBS[0];

  return (
    <div className="popcorn-thinking-row">
      {/* Popcorn Avatar */}
      <div className="popcorn-thinking-avatar">
        <div className="popcorn-avatar-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="var(--accent-yellow)" />
            <circle cx="9" cy="10" r="1.5" fill="var(--bg-primary)" />
            <circle cx="15" cy="10" r="1.5" fill="var(--bg-primary)" />
            <path
              d="M8 15c1.5 2 6.5 2 8 0"
              stroke="var(--bg-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Animation + Verb container */}
      <div className="popcorn-thinking-content">
        {/* Thinking dots animation */}
        <div className="thinking-animation">
          <span className="thinking-dot" />
          <span className="thinking-dot" />
          <span className="thinking-dot" />
        </div>

        {/* Fixed-width verb container with shimmer effect */}
        <div className="thinking-verb-container">
          <span className="thinking-verb">{verb}</span>
        </div>
      </div>

      {/* Stop button - fixed right position */}
      {onStop && (
        <button
          type="button"
          className="popcorn-stop-btn"
          onClick={onStop}
        >
          <StopIcon />
          Stop
        </button>
      )}
    </div>
  );
}

export default PopcornThinkingIndicator;
