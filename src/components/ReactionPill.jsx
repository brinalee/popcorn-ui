// src/components/ReactionPill.jsx
import React, { useMemo } from "react";

function ReactionPill({ reactions }) {
  const aggregated = useMemo(() => {
    if (!reactions || reactions.length === 0) {
      return { items: [], totalCount: 0 };
    }

    // Count reactions by emoji
    const counts = new Map();
    reactions.forEach((r) => {
      counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1);
    });

    // Convert to array and sort by count (most used first)
    const items = Array.from(counts.entries())
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count);

    const totalCount = reactions.length;

    return { items, totalCount };
  }, [reactions]);

  if (aggregated.items.length === 0) {
    return null;
  }

  // Show up to 3 most-used emojis
  const visibleItems = aggregated.items.slice(0, 3);

  return (
    <div className="message-reactions-pill">
      {visibleItems.map((item) => (
        <span key={item.emoji} className="message-reaction-emoji">
          {item.emoji}
        </span>
      ))}
      <span className="message-reaction-count">
        {aggregated.totalCount}
      </span>
    </div>
  );
}

export default ReactionPill;
