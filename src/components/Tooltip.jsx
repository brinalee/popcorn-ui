// src/components/Tooltip.jsx
import { useState, useRef } from "react";

function Tooltip({ children, text, variant = "channel" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const buttonRef = useRef(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        left: rect.right,
        top: rect.top + rect.height / 2 - 16
      });
    }
    setIsVisible(true);
  };

  return (
    <div className="tooltip-wrapper">
      <div
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`custom-tooltip custom-tooltip--${variant}`}
          style={{
            '--tooltip-left': `${position.left}px`,
            '--tooltip-top': `${position.top}px`
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
