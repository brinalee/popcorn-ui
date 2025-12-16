// src/components/NotificationBar.jsx
// Red notification banner at top of sidebar for mention and channel creation notifications

function NotificationRow({ notification, onDismiss, onAdd }) {
  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd?.(notification);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    onDismiss?.(notification.id);
  };

  return (
    <div className="notification-row">
      <div className="notification-row-content">
        <span className="notification-channel-name">#{notification.channelName}</span>
        <span className="notification-message">{notification.message}</span>
      </div>
      <button
        type="button"
        className="notification-action-btn notification-add-btn"
        onClick={handleAdd}
        aria-label="Add to sidebar"
        title="Add to sidebar"
      >
        +
      </button>
      <button
        type="button"
        className="notification-action-btn notification-dismiss-btn"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        title="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

function NotificationBar({ notifications, onAddToSidebar, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="notification-bar">
      {notifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          onAdd={onAddToSidebar}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

export default NotificationBar;
