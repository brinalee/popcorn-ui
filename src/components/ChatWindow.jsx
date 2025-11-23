// src/components/ChatWindow.jsx
import React, { useState } from "react";

function ChatWindow({ channel }) {
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState(channel.messages);

  // Whenever the channel changes, sync local messages:
  React.useEffect(() => {
    setLocalMessages(channel.messages);
    setDraft("");
  }, [channel]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newMessage = {
      id: `${channel.id}-local-${Date.now()}`,
      senderType: "human",
      author: "You",
      initials: "YO",
      avatarColor: "gray",
      isYou: true,
      time: "Just now",
      bubbles: [trimmed]
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setDraft("");
  };

  const iconIsHash = channel.iconType === "hash";

  return (
    <main className="main">
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-bar-title">
          <span
            className={
              "sidebar-icon " + (iconIsHash ? "hash" : "bolt")
            }
          >
            {iconIsHash ? "#" : "⚡"}
          </span>
          <span>{channel.label}</span>
          <span className="top-bar-pill">{channel.pill || "Channel"}</span>
        </div>
      </header>

      {/* Messages */}
      <section className="chat-wrapper">
        <div className="chat-inner">
          {localMessages.map((msg) => (
            <MessageGroup key={msg.id} msg={msg} />
          ))}
        </div>
      </section>

      {/* Composer */}
      <section className="composer-wrapper">
        <div className="composer-inner">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message #${channel.label}`}
          />
          <button disabled={!draft.trim()} onClick={handleSend}>
            Send
          </button>
        </div>
      </section>
    </main>
  );
}

function MessageGroup({ msg }) {
  const isAI = msg.senderType === "ai";

  if (isAI) {
    // AI: no avatar, no name
    return (
      <div className="message-group ai">
        <div style={{ flex: 1 }}>
          {msg.bubbles.map((bubble, idx) => (
            <div key={idx} className="msg-bubble ai">
              {bubble}
            </div>
          ))}
          {msg.time && (
            <div className="msg-meta" style={{ marginTop: 4 }}>
              <span className="msg-time">{msg.time}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Human message: avatar + name + bubbles
  return (
    <div className="message-group">
      <div className="msg-avatar-column">
        <div className={`avatar ${msg.avatarColor || "gray"}`}>
          {msg.initials || "?"}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div className="msg-meta">
          <span className="msg-name">{msg.author || "User"}</span>
          {msg.time && <span className="msg-time">{msg.time}</span>}
        </div>

        {msg.bubbles.map((bubble, idx) => (
          <div
            key={idx}
            className={
              "msg-bubble " + (msg.isYou ? "you" : "user")
            }
          >
            {bubble}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatWindow;
