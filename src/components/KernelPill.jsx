// src/components/KernelPill.jsx
// Reusable Kernel pill component showing name + connector icons

import { CONNECTOR_ICONS } from "../utils/kernelData";

function KernelPill({
  kernel,
  connectorIds = [],
  name = "",
  size = "md",
  interactive = false,
  selected = false,
  disabled = false,
  showHealth = false,
  onClick,
  className = "",
}) {
  // Get data from kernel object or individual props
  const displayName = kernel?.name || name || "Unnamed Kernel";
  const connectors = kernel?.connectorIds || connectorIds;
  const health = kernel?.health || "healthy";
  const isEnabled = kernel?.isEnabled !== false;

  // Get icons for connectors
  const icons = connectors.slice(0, 4).map(id => CONNECTOR_ICONS[id]).filter(Boolean);
  const moreCount = connectors.length > 4 ? connectors.length - 4 : 0;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(kernel);
    }
  };

  const pillClasses = [
    "kernel-pill",
    `kernel-pill--${size}`,
    interactive && "kernel-pill--interactive",
    selected && "kernel-pill--selected",
    disabled && "kernel-pill--disabled",
    !isEnabled && "kernel-pill--off",
    showHealth && health === "error" && "kernel-pill--error",
    showHealth && health === "warning" && "kernel-pill--warning",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      className={pillClasses}
      onClick={handleClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      onKeyDown={interactive && !disabled ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {/* Connector icons */}
      {icons.length > 0 && (
        <span className="kernel-pill-icons">
          {icons.map((icon, i) => (
            <span key={i} className="kernel-pill-icon">{icon}</span>
          ))}
          {moreCount > 0 && (
            <span className="kernel-pill-more">+{moreCount}</span>
          )}
        </span>
      )}

      {/* Kernel name */}
      <span className="kernel-pill-name">{displayName}</span>

      {/* Health indicator */}
      {showHealth && health !== "healthy" && (
        <span className={`kernel-pill-health kernel-pill-health--${health}`} />
      )}

      {/* Disabled indicator */}
      {!isEnabled && (
        <span className="kernel-pill-status">Off</span>
      )}
    </div>
  );
}

// Empty pill variant for onboarding preview
export function KernelPillEmpty({ name = "Your Kernel", size = "lg" }) {
  return (
    <div className={`kernel-pill kernel-pill--${size} kernel-pill--empty`}>
      <span className="kernel-pill-icons">
        <span className="kernel-pill-icon-placeholder">?</span>
      </span>
      <span className="kernel-pill-name">{name || "Your Kernel"}</span>
    </div>
  );
}

// Building pill variant for onboarding (shows icons being added)
export function KernelPillBuilding({
  name = "Your Kernel",
  connectorIds = [],
  size = "lg",
  animateLastIcon = false,
}) {
  const icons = connectorIds.slice(0, 6).map(id => CONNECTOR_ICONS[id]).filter(Boolean);

  return (
    <div className={`kernel-pill kernel-pill--${size} kernel-pill--building`}>
      {/* Connector icons */}
      <span className="kernel-pill-icons">
        {icons.length === 0 ? (
          <span className="kernel-pill-icon-placeholder">?</span>
        ) : (
          icons.map((icon, i) => (
            <span
              key={i}
              className={`kernel-pill-icon ${animateLastIcon && i === icons.length - 1 ? "kernel-pill-icon--pop" : ""}`}
            >
              {icon}
            </span>
          ))
        )}
      </span>

      {/* Kernel name */}
      <span className="kernel-pill-name">{name || "Your Kernel"}</span>
    </div>
  );
}

export default KernelPill;
