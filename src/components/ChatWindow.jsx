// src/components/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";

function ChatWindow({ channel }) {
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState(channel.messages);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const textareaRef = useRef(null);
  const chatWrapperRef = useRef(null);
  const attachMenuRef = useRef(null);
  const addButtonRef = useRef(null);

  // Scroll chat to bottom
  const scrollToBottom = (smooth = false) => {
    const chatWrapper = chatWrapperRef.current;
    if (chatWrapper) {
      if (smooth) {
        chatWrapper.scrollTo({
          top: chatWrapper.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
      }
    }
  };

  // Whenever the channel changes, sync local messages and scroll to bottom:
  useEffect(() => {
    setLocalMessages(channel.messages);
    setDraft("");
    // Use setTimeout to ensure DOM has updated
    setTimeout(scrollToBottom, 0);
  }, [channel]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Adjust height when draft changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [draft]);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target)
      ) {
        setIsAttachMenuOpen(false);
      }
    };

    if (isAttachMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAttachMenuOpen]);

  // Detect scroll position and show/hide scroll-to-bottom button
  useEffect(() => {
    const el = chatWrapperRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      const threshold = 40; // px

      if (distanceFromBottom > threshold) {
        setShowScrollDown(true);
      } else {
        setShowScrollDown(false);
      }
    };

    // Fire once to set initial state
    handleScroll();

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [localMessages]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'pm' : 'am';
    const timestamp = `${hours}:${minutes}${ampm}`;

    const newMessage = {
      id: `${channel.id}-local-${Date.now()}`,
      senderType: "human",
      author: "You",
      initials: "YO",
      avatarColor: "gray",
      avatarUrl: "https://i.pravatar.cc/150?img=68",
      isYou: true,
      time: timestamp,
      bubbles: [trimmed]
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setDraft("");
  };

  const toggleAttachMenu = () => {
    setIsAttachMenuOpen((prev) => !prev);
  };

  const handleAttachOption = (option) => {
    console.log('Attachment option selected:', option);
    setIsAttachMenuOpen(false);
    // TODO: Implement attachment functionality
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
        </div>
      </header>

      {/* Messages */}
      <section className="chat-wrapper" ref={chatWrapperRef}>
        <div className="chat-inner">
          {localMessages.map((msg, index) => {
            const prevMsg = index > 0 ? localMessages[index - 1] : null;
            const isContinuation = prevMsg &&
              prevMsg.author === msg.author &&
              prevMsg.senderType === msg.senderType;
            return (
              <MessageGroup
                key={msg.id}
                msg={msg}
                isContinuation={isContinuation}
              />
            );
          })}
        </div>
      </section>

      {/* Composer */}
      <section className="composer-wrapper">
        <div className="composer-inner">
          <div className="composer-textarea-wrapper">
            <button
              ref={addButtonRef}
              className={"add-button" + (isAttachMenuOpen ? " active" : "")}
              onClick={toggleAttachMenu}
            >
              <span className="add-button-icon">+</span>
            </button>

            {isAttachMenuOpen && (
              <div className="attach-menu" ref={attachMenuRef}>
                <button
                  className="attach-menu-item"
                  onClick={() => handleAttachOption('file')}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 3h7l5 5v13H7z"
                      stroke="#6366F1"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 3v5h5"
                      stroke="#6366F1"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>File</span>
                </button>

                <button
                  className="attach-menu-item"
                  onClick={() => handleAttachOption('photos')}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="4"
                      y="5"
                      width="16"
                      height="14"
                      rx="2.5"
                      ry="2.5"
                      stroke="#22C55E"
                      strokeWidth="1.7"
                    />
                    <circle cx="9" cy="10" r="1.7" fill="#22C55E" />
                    <path
                      d="M7 17l3.5-3 2.5 2 3-3 3 4"
                      stroke="#22C55E"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Photos</span>
                </button>

                <button
                  className="attach-menu-item"
                  onClick={() => handleAttachOption('camera')}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3.5"
                      y="7"
                      width="17"
                      height="12"
                      rx="3"
                      ry="3"
                      stroke="#0EA5E9"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M9 7l1-2h4l1 2"
                      stroke="#0EA5E9"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="3.2"
                      stroke="#0EA5E9"
                      strokeWidth="1.7"
                    />
                    <circle cx="12" cy="13" r="1.2" fill="#0EA5E9" />
                  </svg>
                  <span>Camera</span>
                </button>

                <button
                  className="attach-menu-item"
                  onClick={() => handleAttachOption('gif')}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="4"
                      y="6"
                      width="16"
                      height="12"
                      rx="3"
                      ry="3"
                      stroke="#F97316"
                      strokeWidth="1.7"
                    />
                    <text
                      x="7"
                      y="15"
                      fontSize="7"
                      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                      fill="#F97316"
                    >
                      GIF
                    </text>
                  </svg>
                  <span>GIF</span>
                </button>

                <button
                  className="attach-menu-item"
                  onClick={() => handleAttachOption('emoji')}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#EAB308"
                      strokeWidth="1.7"
                    />
                    <circle cx="9" cy="10" r="1.2" fill="#EAB308" />
                    <circle cx="15" cy="10" r="1.2" fill="#EAB308" />
                    <path
                      d="M8 14s1.5 2 4 2 4-2 4-2"
                      stroke="#EAB308"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Emoji</span>
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message #${channel.label}`}
              rows={1}
            />
            <button
              className="send-button"
              disabled={!draft.trim()}
              onClick={handleSend}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 16V4M10 4L4 10M10 4L16 10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Scroll to bottom button */}
      <ScrollToBottomButton
        visible={showScrollDown}
        onClick={() => scrollToBottom(true)}
      />
    </main>
  );
}

// Helper function to parse and style @mentions
function parseMentions(text) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return <span key={index} className="mention">{part}</span>;
    }
    return part;
  });
}

function MessageGroup({ msg, isContinuation }) {
  const isAI = msg.senderType === "ai";
  const isAgent = msg.senderType === "agent";

  // Agent message: special green box styling
  if (isAgent) {
    return (
      <div className="message-group agent">
        <div className="msg-avatar-column">
          {!isContinuation && (
            <div className={`avatar ${msg.avatarColor || "green"}`}>
              {msg.avatarUrl ? (
                <img src={msg.avatarUrl} alt={msg.author || "Agent"} />
              ) : (
                msg.initials || "A"
              )}
            </div>
          )}
        </div>

        <div className="msg-content">
          {!isContinuation && (
            <div className="msg-meta">
              <span className="msg-name">{msg.author || "Agent"}</span>
              {msg.time && <span className="msg-time">{msg.time}</span>}
            </div>
          )}

          {msg.bubbles.map((bubble, idx) => (
            <div key={idx} className="msg-bubble agent">
              <div className="agent-label">{msg.agentLabel || "XML AGENT"}</div>
              {parseMentions(bubble)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // AI message: clean styling without avatar
  if (isAI) {
    return (
      <div className="message-group ai">
        <div className="msg-avatar-column">
          {/* No avatar for AI */}
        </div>

        <div className="msg-content">
          {!isContinuation && (
            <div className="msg-meta">
              {msg.time && <span className="msg-time">{msg.time}</span>}
            </div>
          )}

          {msg.bubbles.map((bubble, idx) => (
            <div key={idx} className="ai-message-text">
              {parseMentions(bubble)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Human message: avatar + name + bubbles
  return (
    <div className="message-group">
      <div className="msg-avatar-column">
        {!isContinuation && (
          <div className={`avatar ${msg.avatarColor || "gray"}`}>
            {msg.avatarUrl ? (
              <img src={msg.avatarUrl} alt={msg.author || "User"} />
            ) : (
              msg.initials || "?"
            )}
          </div>
        )}
      </div>

      <div className="msg-content">
        {!isContinuation && (
          <div className="msg-meta">
            <span className="msg-name">{msg.author || "User"}</span>
            {msg.time && <span className="msg-time">{msg.time}</span>}
          </div>
        )}

        {msg.bubbles.map((bubble, idx) => (
          <div
            key={idx}
            className={
              "msg-bubble " + (msg.isYou ? "you" : "user")
            }
          >
            {parseMentions(bubble)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Scroll to bottom indicator button
function ScrollToBottomButton({ visible, onClick }) {
  return (
    <button
      type="button"
      className={`scroll-down-indicator ${
        visible ? "scroll-down-indicator--visible" : ""
      }`}
      onClick={onClick}
      aria-label="Scroll to latest messages"
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        className="scroll-down-icon"
      >
        <path
          d="M6 10l6 6 6-6"
          fill="none"
          stroke="#4b5563"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default ChatWindow;
