// src/components/Toast.jsx
// Toast notification component

import { useToast } from "../contexts/ToastContext";

function Toast() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => hideToast(toast.id)}
        >
          <div className="toast-content">
            {toast.type === "success" && (
              <svg className="toast-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.5 4.5L6.5 11.5L3 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {toast.type === "error" && (
              <svg className="toast-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 5V8M8 11H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {toast.type === "info" && (
              <svg className="toast-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 7V11M8 5H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className="toast-message">{toast.message}</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              hideToast(toast.id);
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M9 3L3 9M3 3L9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
