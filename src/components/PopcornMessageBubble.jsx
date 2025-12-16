// src/components/PopcornMessageBubble.jsx
// Main wrapper component that renders appropriate state UI
// Simplified: No GENERATING state - we skip streaming entirely

import { GenerationState } from "../hooks/usePopcornGeneration";
import PopcornThinkingIndicator from "./PopcornThinkingIndicator";
import PopcornErrorBubble from "./PopcornErrorBubble";

// Regenerate icon - Nucleo outline "play-rotate-clockwise"
const RegenerateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <path
      d="M16.25 3.25L15.71 6.25C14.627 3.61 12.031 1.75 9 1.75C4.996 1.75 1.75 5 1.75 9C1.75 13 4.996 16.25 9 16.25C12.9365 16.25 16.1404 13.1087 16.2472 9.20166"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.652 8.56989L8.00102 6.43988C7.66802 6.24998 7.24902 6.48984 7.24902 6.86994V11.1299C7.24902 11.5199 7.66802 11.7599 8.00102 11.56L11.652 9.42999C11.983 9.23989 11.983 8.75999 11.652 8.56989Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function PopcornMessageBubble({ message, onStop, onRetry }) {
  if (!message) return null;

  switch (message.state) {
    case GenerationState.THINKING:
      return (
        <PopcornThinkingIndicator
          currentVerbIndex={message.currentVerbIndex}
          onStop={onStop}
        />
      );

    case GenerationState.STOPPED:
      // Stopped state - show "Stopped." with Retry button
      return (
        <div className="popcorn-stopped-row">
          {/* Popcorn Avatar */}
          <div className="popcorn-thinking-avatar">
            <div className="popcorn-avatar-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="var(--accent-yellow)" opacity="0.5" />
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

          <span className="popcorn-stopped-text">Stopped.</span>

          <button type="button" className="popcorn-retry-btn" onClick={onRetry}>
            <RegenerateIcon />
            Retry
          </button>
        </div>
      );

    case GenerationState.ERROR:
      return (
        <PopcornErrorBubble
          errorMessage={message.errorMessage}
          onRetry={onRetry}
        />
      );

    case GenerationState.GENERATING:
      // We no longer use this state - skip streaming
      // Fall through to return null (shouldn't happen in new flow)
      return null;

    case GenerationState.COMPLETED:
      // Completed state is handled by replacing with a real message
      return null;

    default:
      return null;
  }
}

export default PopcornMessageBubble;
