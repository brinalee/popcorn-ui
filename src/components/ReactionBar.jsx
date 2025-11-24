// src/components/ReactionBar.jsx
import React from "react";

const QUICK_EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "👍"];

function ReactionBar({ onSelect, onOpenPicker }) {
  return (
    <div className="reaction-bar">
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="reaction-bar-emoji"
          onClick={() => onSelect(emoji)}
        >
          <span>{emoji}</span>
        </button>
      ))}

      <button
        type="button"
        className="reaction-bar-emoji reaction-bar-plus"
        onClick={onOpenPicker}
        aria-label="More reactions"
      >
        +
      </button>
    </div>
  );
}

export default ReactionBar;
