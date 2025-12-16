// src/components/EphemeralChannelNotification.jsx
// Banner shown at top of sidebar when notification arrives from a channel not in sidebar

function EphemeralChannelNotification({ channel, onOpen }) {
  if (!channel) return null;

  const handleClick = (e) => {
    // Prevent click if clicking the add button
    if (e.target.closest('.ephemeral-add-btn')) return;
    onOpen?.();
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onOpen?.();
  };

  return (
    <div
      className="ephemeral-notification"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen?.()}
    >
      <div className="ephemeral-notification-content">
        <span className="ephemeral-channel-name">#{channel.name}</span>
        {channel.preview && (
          <span className="ephemeral-preview">{channel.preview}</span>
        )}
      </div>
      <button
        type="button"
        className="ephemeral-add-btn"
        onClick={handleAddClick}
        aria-label="Open channel"
      >
        +
      </button>
    </div>
  );
}

export default EphemeralChannelNotification;
