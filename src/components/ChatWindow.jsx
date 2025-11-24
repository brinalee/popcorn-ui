// src/components/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import ReactionBar from "./ReactionBar";
import EmojiPickerPanel from "./EmojiPickerPanel";
import ReactionPill from "./ReactionPill";

function ChatWindow({ channel }) {
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState(channel.messages);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isFormattingOn, setIsFormattingOn] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [composerHeight, setComposerHeight] = useState(100);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeReactionBubbleId, setActiveReactionBubbleId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const reactionBarRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const reactButtonRefs = useRef({});
  const chatWrapperRef = useRef(null);
  const attachMenuRef = useRef(null);
  const addButtonRef = useRef(null);
  const composerRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const lastUserScrollTimeRef = useRef(0);

  // Scroll chat to bottom
  const scrollToBottom = (smooth = false) => {
    const chatWrapper = chatWrapperRef.current;
    if (chatWrapper) {
      isProgrammaticScrollRef.current = true;
      if (smooth) {
        chatWrapper.scrollTo({
          top: chatWrapper.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
      }
      // Clear flag after a short delay to allow scroll event to fire
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 100);
    }
  };

  // Whenever the channel changes, sync local messages and scroll to bottom:
  useEffect(() => {
    setLocalMessages(channel.messages);
    setDraft("");
    setUserHasScrolled(false);
    // Reset scroll time so auto-scroll works immediately
    lastUserScrollTimeRef.current = 0;
    // Use setTimeout to ensure DOM has updated
    setTimeout(scrollToBottom, 0);
  }, [channel]);

  // Scroll to bottom when messages change (only if user was already at bottom)
  useEffect(() => {
    const el = chatWrapperRef.current;
    if (!el) return;

    // Check if we should auto-scroll
    const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
    const scrollCooldown = 2000; // 2 seconds

    // Only auto-scroll if:
    // 1. User hasn't scrolled recently (within cooldown period)
    // 2. User is already at/near bottom
    if (timeSinceLastUserScroll > scrollCooldown) {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceFromBottom < 100) {
        scrollToBottom();
      }
    }
  }, [localMessages]);

  // Auto-resize textarea based on content and measure composer height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Also measure and update composer height after textarea resizes
    setTimeout(() => {
      if (composerRef.current) {
        const height = composerRef.current.offsetHeight;
        setComposerHeight(height);
      }
    }, 0);
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
      // Ignore programmatic scrolls
      if (isProgrammaticScrollRef.current) {
        return;
      }

      // Update last user scroll time
      lastUserScrollTimeRef.current = Date.now();

      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      const threshold = 100; // px - larger threshold for stability

      // Check if user has scrolled away from bottom
      if (distanceFromBottom > threshold) {
        setShowScrollDown(true);
        setUserHasScrolled(true);
      } else {
        // User is at or near bottom
        setShowScrollDown(false);
        setUserHasScrolled(false);
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Measure composer height when formatting toolbar toggles
  useEffect(() => {
    const measureComposerHeight = () => {
      if (composerRef.current) {
        const height = composerRef.current.offsetHeight;
        setComposerHeight(height);
      }
    };

    // Measure immediately
    measureComposerHeight();

    // Measure again after a short delay to account for animation
    const timer = setTimeout(measureComposerHeight, 100);

    return () => clearTimeout(timer);
  }, [isFormattingOn]);

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
    // Reset scroll time so auto-scroll works for user's own message
    lastUserScrollTimeRef.current = 0;
    setUserHasScrolled(false);
  };

  const toggleAttachMenu = () => {
    setIsAttachMenuOpen((prev) => !prev);
  };

  const toggleFormatting = () => {
    setIsFormattingOn((prev) => !prev);
    setIsAttachMenuOpen(false);
  };

  const handleAttachOption = (option) => {
    console.log('Attachment option selected:', option);
    setIsAttachMenuOpen(false);
    // TODO: Implement attachment functionality
  };

  const handleReaction = (bubbleId, emoji) => {
    console.log(`Reaction toggled: ${emoji} on bubble ${bubbleId}`);

    // Extract message ID and bubble index from bubbleId (format: "msgId-index")
    const parts = bubbleId.split('-');
    const bubbleIndex = parseInt(parts[parts.length - 1]);
    const messageId = parts.slice(0, -1).join('-');

    // Update localMessages with reaction toggle
    setLocalMessages((prevMessages) => {
      return prevMessages.map((msg) => {
        if (msg.id !== messageId) return msg;

        // Check if this is an AI message - don't allow reactions
        if (msg.senderType === "ai") {
          console.log("Reactions not allowed on AI messages");
          return msg;
        }

        // Get current reactions for this bubble (immutably)
        const currentReactions = msg.reactions?.[bubbleIndex] || [];

        // Toggle reaction: check if user already reacted with this emoji
        const existingIndex = currentReactions.findIndex(
          (r) => r.emoji === emoji && r.userId === "You"
        );

        let newReactions;
        if (existingIndex >= 0) {
          // User already reacted - remove reaction
          newReactions = currentReactions.filter((_, idx) => idx !== existingIndex);
          console.log(`Removed reaction ${emoji} from bubble ${bubbleIndex}`);
        } else {
          // User hasn't reacted - add reaction
          newReactions = [...currentReactions, { emoji, userId: "You" }];
          console.log(`Added reaction ${emoji} to bubble ${bubbleIndex}`, newReactions);
        }

        return {
          ...msg,
          reactions: {
            ...(msg.reactions || {}),
            [bubbleIndex]: newReactions
          }
        };
      });
    });

    // Close reaction UI
    setActiveReactionBubbleId(null);
    setShowEmojiPicker(false);
  };

  // Handle click outside and Escape key for reaction menus
  useEffect(() => {
    if (!activeReactionBubbleId && !showEmojiPicker) return;

    function handleClickOutside(event) {
      const target = event.target;
      const activeReactButton = reactButtonRefs.current[activeReactionBubbleId];

      if (
        reactionBarRef.current &&
        !reactionBarRef.current.contains(target) &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        activeReactButton &&
        !activeReactButton.contains(target)
      ) {
        setActiveReactionBubbleId(null);
        setShowEmojiPicker(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        } else {
          setActiveReactionBubbleId(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeReactionBubbleId, showEmojiPicker]);

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
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                activeReactionBubbleId={activeReactionBubbleId}
                setActiveReactionBubbleId={setActiveReactionBubbleId}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                onReaction={handleReaction}
                reactButtonRefs={reactButtonRefs}
                reactionBarRef={reactionBarRef}
                emojiPickerRef={emojiPickerRef}
              />
            );
          })}
        </div>
      </section>

      {/* Composer */}
      <section className="composer-wrapper">
        <div className="composer-inner">
          <div className="composer-textarea-wrapper" ref={composerRef}>
            <button
              ref={addButtonRef}
              className={"add-button" + (isAttachMenuOpen ? " active" : "") + (isFormattingOn ? " formatting-active" : "")}
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

                <button
                  className="attach-menu-item"
                  onClick={toggleFormatting}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 7V4h16v3M9 20h6M12 4v16"
                      stroke="#8B5CF6"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{isFormattingOn ? "✓ Formatting" : "Formatting"}</span>
                </button>
              </div>
            )}

            <div className="composer-field">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message #${channel.label}`}
                rows={1}
              />

              {isFormattingOn && <FormattingToolbar />}
            </div>

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
        composerHeight={composerHeight}
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

// More menu component for message actions
function MoreMenu({ messageId, isOwn, isOpen, onToggle, onClose }) {
  const chevronRef = useRef(null);
  const menuRef = useRef(null);

  // Menu items based on ownership
  const menuItems = isOwn
    ? [
        { key: "reply", label: "Reply" },
        { key: "reply-public", label: "Reply publicly" },
        { key: "copy", label: "Copy" },
        { key: "forward", label: "Forward" },
        { key: "delete", label: "Delete" },
      ]
    : [
        { key: "reply", label: "Reply" },
        { key: "reply-public", label: "Reply publicly" },
        { key: "reply-private", label: "Reply privately" },
        { key: "copy", label: "Copy" },
        { key: "forward", label: "Forward" },
      ];

  // Handle action click
  const handleAction = (actionKey) => {
    console.log(`Action: ${actionKey} on message: ${messageId}`);
    onClose();
  };

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      const target = event.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        chevronRef.current &&
        !chevronRef.current.contains(target)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <button
        ref={chevronRef}
        type="button"
        className={
          "message-more-btn" + (isOpen ? " message-more-btn--visible" : "")
        }
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="More options"
        onClick={onToggle}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div ref={menuRef} className="message-more-menu" role="menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className="message-more-menu-item"
              role="menuitem"
              onClick={() => handleAction(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function MessageGroup({
  msg,
  isContinuation,
  openMenuId,
  setOpenMenuId,
  activeReactionBubbleId,
  setActiveReactionBubbleId,
  showEmojiPicker,
  setShowEmojiPicker,
  onReaction,
  reactButtonRefs,
  reactionBarRef,
  emojiPickerRef
}) {
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

          {msg.bubbles.map((bubble, idx) => {
            const isLastBubble = idx === msg.bubbles.length - 1;
            const bubbleId = `${msg.id}-${idx}`;
            const isMenuOpen = openMenuId === bubbleId;
            const bubbleReactions = msg.reactions?.[idx] || [];
            return (
              <div key={idx} className="message-bubble-row">
                <div className="message-bubble-wrapper">
                  <div className="msg-bubble agent">
                    <div className="agent-label">{msg.agentLabel || "XML AGENT"}</div>
                    {parseMentions(bubble)}

                    {/* More menu inside bubble */}
                    <MoreMenu
                      messageId={bubbleId}
                      isOwn={false}
                      isOpen={isMenuOpen}
                      onToggle={() => setOpenMenuId(isMenuOpen ? null : bubbleId)}
                      onClose={() => setOpenMenuId(null)}
                    />
                  </div>

                  {/* Reaction pill */}
                  <ReactionPill reactions={bubbleReactions} />
                </div>

                {/* Hover actions for emoji and reply - only on last bubble */}
                {isLastBubble && (
                  <div className="message-inline-actions">
                    <div className="reaction-anchor">
                      <button
                        ref={(el) => {
                          if (el) reactButtonRefs.current[bubbleId] = el;
                        }}
                        type="button"
                        className="message-inline-action-btn"
                        aria-label="React"
                        onClick={() => {
                          setShowEmojiPicker(false);
                          setActiveReactionBubbleId(
                            activeReactionBubbleId === bubbleId ? null : bubbleId
                          );
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="1.6"
                          />
                          <circle cx="9.5" cy="10" r="0.9" fill="#9ca3af" />
                          <circle cx="14.5" cy="10" r="0.9" fill="#9ca3af" />
                          <path
                            d="M9 14c.5 1 1.6 1.6 3 1.6s2.5-.6 3-1.6"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="message-tooltip">React</span>
                      </button>

                      {activeReactionBubbleId === bubbleId && !showEmojiPicker && (
                        <div ref={reactionBarRef}>
                          <ReactionBar
                            onSelect={(emoji) => onReaction(bubbleId, emoji)}
                            onOpenPicker={() => {
                              setActiveReactionBubbleId(bubbleId);
                              setShowEmojiPicker(true);
                            }}
                          />
                        </div>
                      )}

                      {activeReactionBubbleId === bubbleId && showEmojiPicker && (
                        <div ref={emojiPickerRef}>
                          <EmojiPickerPanel
                            onSelect={(emoji) => onReaction(bubbleId, emoji)}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="message-inline-action-btn"
                      aria-label="Reply"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 12L4 16L8 20"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 16H14C16.7614 16 19 13.7614 19 11C19 8.23858 16.7614 6 14 6H13"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="message-tooltip">Reply</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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

          {msg.bubbles.map((bubble, idx) => {
            const isLastBubble = idx === msg.bubbles.length - 1;
            const bubbleId = `${msg.id}-${idx}`;
            return (
              <div key={idx} className="message-bubble-row ai-bubble-row">
                <div className="ai-message-text">
                  {parseMentions(bubble)}
                </div>

                {/* Hover actions for emoji and reply - only on last bubble */}
                {isLastBubble && (
                  <div className="message-inline-actions">
                    <div className="reaction-anchor">
                      <button
                        ref={(el) => {
                          if (el) reactButtonRefs.current[bubbleId] = el;
                        }}
                        type="button"
                        className="message-inline-action-btn"
                        aria-label="React"
                        onClick={() => {
                          setShowEmojiPicker(false);
                          setActiveReactionBubbleId(
                            activeReactionBubbleId === bubbleId ? null : bubbleId
                          );
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="1.6"
                          />
                          <circle cx="9.5" cy="10" r="0.9" fill="#9ca3af" />
                          <circle cx="14.5" cy="10" r="0.9" fill="#9ca3af" />
                          <path
                            d="M9 14c.5 1 1.6 1.6 3 1.6s2.5-.6 3-1.6"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="message-tooltip">React</span>
                      </button>

                      {activeReactionBubbleId === bubbleId && !showEmojiPicker && (
                        <div ref={reactionBarRef}>
                          <ReactionBar
                            onSelect={(emoji) => onReaction(bubbleId, emoji)}
                            onOpenPicker={() => {
                              setActiveReactionBubbleId(bubbleId);
                              setShowEmojiPicker(true);
                            }}
                          />
                        </div>
                      )}

                      {activeReactionBubbleId === bubbleId && showEmojiPicker && (
                        <div ref={emojiPickerRef}>
                          <EmojiPickerPanel
                            onSelect={(emoji) => onReaction(bubbleId, emoji)}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="message-inline-action-btn"
                      aria-label="Reply"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 12L4 16L8 20"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 16H14C16.7614 16 19 13.7614 19 11C19 8.23858 16.7614 6 14 6H13"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="message-tooltip">Reply</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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

        {msg.bubbles.map((bubble, idx) => {
          const isLastBubble = idx === msg.bubbles.length - 1;
          const bubbleId = `${msg.id}-${idx}`;
          const isMenuOpen = openMenuId === bubbleId;
          const bubbleReactions = msg.reactions?.[idx] || [];
          return (
            <div key={idx} className="message-bubble-row">
              <div className="message-bubble-wrapper">
                <div
                  className={
                    "msg-bubble " + (msg.isYou ? "you" : "user")
                  }
                >
                  {parseMentions(bubble)}

                  {/* More menu inside bubble */}
                  <MoreMenu
                    messageId={bubbleId}
                    isOwn={msg.isYou || false}
                    isOpen={isMenuOpen}
                    onToggle={() => setOpenMenuId(isMenuOpen ? null : bubbleId)}
                    onClose={() => setOpenMenuId(null)}
                  />
                </div>

                {/* Reaction pill */}
                <ReactionPill reactions={bubbleReactions} />
              </div>

              {/* Hover actions for emoji and reply - only on last bubble and not for "You" */}
              {isLastBubble && !msg.isYou && (
                <div className="message-inline-actions">
                  <div className="reaction-anchor">
                    <button
                      ref={(el) => {
                        if (el) reactButtonRefs.current[bubbleId] = el;
                      }}
                      type="button"
                      className="message-inline-action-btn"
                      aria-label="React"
                      onClick={() => {
                        setShowEmojiPicker(false);
                        setActiveReactionBubbleId(
                          activeReactionBubbleId === bubbleId ? null : bubbleId
                        );
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="1.6"
                        />
                        <circle cx="9.5" cy="10" r="0.9" fill="#9ca3af" />
                        <circle cx="14.5" cy="10" r="0.9" fill="#9ca3af" />
                        <path
                          d="M9 14c.5 1 1.6 1.6 3 1.6s2.5-.6 3-1.6"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="message-tooltip">React</span>
                    </button>

                    {activeReactionBubbleId === bubbleId && !showEmojiPicker && (
                      <div ref={reactionBarRef}>
                        <ReactionBar
                          onSelect={(emoji) => onReaction(bubbleId, emoji)}
                          onOpenPicker={() => {
                            setActiveReactionBubbleId(bubbleId);
                            setShowEmojiPicker(true);
                          }}
                        />
                      </div>
                    )}

                    {activeReactionBubbleId === bubbleId && showEmojiPicker && (
                      <div ref={emojiPickerRef}>
                        <EmojiPickerPanel
                          onSelect={(emoji) => onReaction(bubbleId, emoji)}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="message-inline-action-btn"
                    aria-label="Reply"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 12L4 16L8 20"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 16H14C16.7614 16 19 13.7614 19 11C19 8.23858 16.7614 6 14 6H13"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="message-tooltip">Reply</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Scroll to bottom indicator button
function ScrollToBottomButton({ visible, onClick, composerHeight }) {
  // Calculate dynamic bottom position: composer height + 30px padding
  const bottomPosition = composerHeight + 30;

  return (
    <button
      type="button"
      className={`scroll-down-indicator ${
        visible ? "scroll-down-indicator--visible" : ""
      }`}
      onClick={onClick}
      aria-label="Scroll to latest messages"
      style={{ bottom: `${bottomPosition}px` }}
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
          stroke="#9ca3af"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// Formatting toolbar component
function FormattingToolbar() {
  const handleFormat = (type) => {
    console.log('Format:', type);
    // TODO: Implement formatting logic
  };

  return (
    <div className="composer-toolbar">
      <ToolbarButton label="Bold" onClick={() => handleFormat('bold')}>
        <span className="toolbar-text-icon">B</span>
      </ToolbarButton>

      <ToolbarButton label="Italic" onClick={() => handleFormat('italic')}>
        <span className="toolbar-text-icon toolbar-text-icon--italic">I</span>
      </ToolbarButton>

      <ToolbarButton label="Underline" onClick={() => handleFormat('underline')}>
        <span className="toolbar-text-icon toolbar-text-icon--underline">U</span>
      </ToolbarButton>

      <ToolbarButton label="Strikethrough" onClick={() => handleFormat('strike')}>
        <span className="toolbar-text-icon toolbar-text-icon--strike">S</span>
      </ToolbarButton>

      <ToolbarButton label="Link" onClick={() => handleFormat('link')}>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            d="M9.5 14.5L8 16a3 3 0 104.2 4.2l2-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 9.5L16 8a3 3 0 10-4.2-4.2l-2 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Numbered list" onClick={() => handleFormat('ol')}>
        <span className="toolbar-text-icon">1•</span>
      </ToolbarButton>

      <ToolbarButton label="Bulleted list" onClick={() => handleFormat('ul')}>
        <span className="toolbar-text-icon">••</span>
      </ToolbarButton>

      <ToolbarButton label="Inline code" onClick={() => handleFormat('code')}>
        <span className="toolbar-text-icon">{"</>"}</span>
      </ToolbarButton>

      <ToolbarButton label="Code block" onClick={() => handleFormat('codeblock')}>
        <span className="toolbar-text-icon">{"{ }"}</span>
      </ToolbarButton>
    </div>
  );
}

// Individual toolbar button component
function ToolbarButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      className="toolbar-btn"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

export default ChatWindow;
