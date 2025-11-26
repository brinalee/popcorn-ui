// src/components/InlineFormattingToolbar.jsx
import React from "react";

function InlineFormattingToolbar({
  visible,
  top,
  left,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onCode,
  onLink,
}) {
  if (!visible) return null;

  return (
    <div
      className="inline-formatting-toolbar"
      style={{ top: `${top}px`, left: `${left}px` }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      <button
        type="button"
        onClick={onBold}
        className="ift-btn"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={onItalic}
        className="ift-btn"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={onUnderline}
        className="ift-btn"
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={onStrikethrough}
        className="ift-btn"
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      <button
        type="button"
        onClick={onCode}
        className="ift-btn"
        title="Code"
      >
        {"</>"}
      </button>
      <button
        type="button"
        onClick={onLink}
        className="ift-btn"
        title="Link"
      >
        🔗
      </button>
    </div>
  );
}

export default InlineFormattingToolbar;
