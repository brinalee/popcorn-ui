// src/components/EphemeralChannelEntry.jsx
// Ephemeral sidebar item - looks like regular channel but not yet persisted
// Supports drag-and-drop to convert to persistent channel

import { useSortable } from "@dnd-kit/sortable";
import Tooltip from "./Tooltip";

function EphemeralChannelEntry({ channel, onAdd, onSelect, isSelected }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `ephemeral-${channel.id}`,
    data: {
      type: "ephemeral",
      channelId: channel.id
    }
  });

  const style = {
    opacity: isDragging ? 0.8 : 1,
  };

  const handleClick = (e) => {
    // Don't trigger select if clicking add button
    if (e.target.closest('.sidebar-item-unfollow')) return;
    onSelect?.();
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAdd?.();
  };

  if (!channel) return null;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`sidebar-item ${isSelected ? 'active' : ''} ${isDragging ? 'sidebar-item--dragging' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}
      {...attributes}
      {...listeners}
    >
      <span className={`sidebar-icon ${channel.iconType === 'bolt' ? 'bolt' : 'hash'}`}>
        {channel.iconType === 'bolt' ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 2L4 9h4l-1 5 5-7H8l1-5z" />
          </svg>
        ) : (
          '#'
        )}
      </span>
      <span>{channel.name}</span>
      <Tooltip text="Add to sidebar permanently">
        <button
          type="button"
          className="sidebar-item-unfollow sidebar-item-add"
          aria-label={`Add ${channel.name} to sidebar`}
          onClick={handleAddClick}
        >
          +
        </button>
      </Tooltip>
    </li>
  );
}

export default EphemeralChannelEntry;
