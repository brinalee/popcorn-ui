// src/components/MockChannelView.jsx
// Mock channel view shown when clicking a mention notification
// Displays the channel with a "You were mentioned" context

function MockChannelView({ channel, onAddToSidebar, onClose }) {
  if (!channel) return null;

  return (
    <div className="mock-channel-view">
      <div className="mock-channel-header">
        <div className="mock-channel-title">
          <span className="mock-channel-icon">#</span>
          <span className="mock-channel-name">{channel.name}</span>
        </div>
        <div className="mock-channel-actions">
          <button
            type="button"
            className="mock-channel-add-btn"
            onClick={onAddToSidebar}
          >
            + Add to sidebar
          </button>
          <button
            type="button"
            className="mock-channel-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div className="mock-channel-banner">
        <div className="mock-channel-banner-icon">@</div>
        <div className="mock-channel-banner-text">
          <strong>You were mentioned</strong> in this channel
        </div>
      </div>

      <div className="mock-channel-content">
        <div className="mock-message mock-message--context">
          <div className="mock-message-avatar">
            <div className="avatar avatar-teal">JD</div>
          </div>
          <div className="mock-message-body">
            <div className="mock-message-header">
              <span className="mock-message-author">Jane Doe</span>
              <span className="mock-message-time">2 minutes ago</span>
            </div>
            <div className="mock-message-text">
              Hey <span className="mock-mention">@you</span>, can you take a look at this when you get a chance?
            </div>
          </div>
        </div>

        <div className="mock-message">
          <div className="mock-message-avatar">
            <div className="avatar avatar-blue">AS</div>
          </div>
          <div className="mock-message-body">
            <div className="mock-message-header">
              <span className="mock-message-author">Alex Smith</span>
              <span className="mock-message-time">1 minute ago</span>
            </div>
            <div className="mock-message-text">
              I think we should wait for their input before proceeding.
            </div>
          </div>
        </div>
      </div>

      <div className="mock-channel-composer">
        <input
          type="text"
          className="mock-composer-input"
          placeholder={`Message #${channel.name}`}
          disabled
        />
      </div>
    </div>
  );
}

export default MockChannelView;
