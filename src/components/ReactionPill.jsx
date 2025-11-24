// src/components/ReactionPill.jsx
import React, { useMemo } from "react";

function ReactionPill({ reactions, onToggle }) {
  const aggregated = useMemo(() => {
    if (!reactions || reactions.length === 0) {
      return [];
    }

    // Count reactions by emoji
    const counts = new Map();
    reactions.forEach((r) => {
      counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1);
    });

    // Convert to array and sort by count (most used first)
    return Array.from(counts.entries())
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count);
  }, [reactions]);

  if (aggregated.length === 0) {
    return null;
  }

  return (
    <div className="message-reactions-row">
      {aggregated.map((item) => (
        <button
          key={item.emoji}
          type="button"
          className="message-reaction-chip"
          onClick={() => onToggle(item.emoji)}
          aria-label={`${item.emoji} ${item.count} reaction${item.count !== 1 ? 's' : ''}`}
        >
          <span className="message-reaction-chip-emoji">
            {item.emoji}
          </span>
          <span className="message-reaction-chip-count">
            {item.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export default ReactionPill;
