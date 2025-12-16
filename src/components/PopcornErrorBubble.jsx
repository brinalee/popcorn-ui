// src/components/PopcornErrorBubble.jsx
// Error state bubble with retry option

function PopcornErrorBubble({ errorMessage, onRetry }) {
  return (
    <div className="popcorn-error-bubble">
      <svg
        className="error-icon"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
      >
        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M9 5v4M9 12v.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="error-text">
        {errorMessage || "Popcorn couldn't complete this message."}
      </span>
      <button type="button" onClick={onRetry}>
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
        Try again
      </button>
    </div>
  );
}

export default PopcornErrorBubble;
