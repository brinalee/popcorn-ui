// src/components/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactionBar from "./ReactionBar";
import EmojiPickerPanel from "./EmojiPickerPanel";
import ReactionPill from "./ReactionPill";
import ReplySummaryRow from "./ReplySummaryRow";
import { threads } from "../mockData";

// Attachment type definition
// type Attachment = {
//   id: string;
//   file: File;
//   name: string;
//   type: string;
//   size: number;
//   previewUrl?: string;
// };

// Helper function to format timestamp with date
function formatTimestamp(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'pm' : 'am';

  return `${month} ${day}, ${hours}:${minutes}${ampm}`;
}

// AttachmentTile component
function AttachmentTile({ attachment, onRemove }) {
  const isImage = attachment.previewUrl && attachment.type.startsWith("image/");

  return (
    <div className="attachment-tile">
      <div className="attachment-thumb-wrapper">
        {isImage ? (
          <img
            src={attachment.previewUrl}
            alt={attachment.name}
            className="attachment-thumb"
          />
        ) : (
          <div className="attachment-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 3h7l5 5v13H7z" stroke="#6b7280" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3v5h5" stroke="#6b7280" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <button
          type="button"
          className="attachment-remove-btn"
          aria-label="Remove attachment"
          onClick={onRemove}
        >
          ×
        </button>
      </div>
      <div className="attachment-name" title={attachment.name}>
        {attachment.name}
      </div>
    </div>
  );
}

function ChatWindow({ channel, threadId = null }) {
  const navigate = useNavigate();
  const { channelId } = useParams();

  // Determine if we're in thread mode and get the appropriate messages
  let thread = threadId ? threads.find(t => t.id === threadId) : null;

  // If thread doesn't exist but we have a threadId, create an empty thread dynamically
  // This handles the case where Reply was clicked on a message without an existing thread
  if (threadId && !thread) {
    // Extract rootMessageId from threadId (format: "thread-{messageId}")
    const rootMessageId = threadId.replace('thread-', '');
    thread = {
      id: threadId,
      channelId: channelId,
      rootMessageId: rootMessageId,
      messages: [] // Empty replies for now
    };
  }

  const rootMessage = thread ? channel.messages.find(m => m.id === thread.rootMessageId) : null;
  const displayMessages = thread
    ? (rootMessage ? [rootMessage, ...thread.messages] : thread.messages)
    : channel.messages;

  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState(displayMessages);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isFormattingOn, setIsFormattingOn] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [composerHeight, setComposerHeight] = useState(100);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeReactionBubbleId, setActiveReactionBubbleId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chipReactionBarMessageId, setChipReactionBarMessageId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const reactionBarRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const reactButtonRefs = useRef({});
  const chipReactButtonRefs = useRef({});
  const chipReactionBarRef = useRef(null);
  const chatWrapperRef = useRef(null);
  const attachMenuRef = useRef(null);
  const addButtonRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
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

  // Whenever the channel or thread changes, sync local messages and scroll to bottom:
  useEffect(() => {
    setLocalMessages(displayMessages);
    setDraft("");
    setUserHasScrolled(false);
    // Reset scroll time so auto-scroll works immediately
    lastUserScrollTimeRef.current = 0;
    // Use setTimeout to ensure DOM has updated
    setTimeout(scrollToBottom, 0);
  }, [channel, threadId]);

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
    // Allow sending if there's text OR attachments
    if (!trimmed && attachments.length === 0) return;

    const now = new Date();

    const newMessage = {
      id: `${channel.id}-local-${Date.now()}`,
      senderType: "human",
      author: "You",
      initials: "YO",
      avatarColor: "gray",
      avatarUrl: "https://i.pravatar.cc/150?img=68",
      isYou: true,
      timestamp: now.toISOString(),
      bubbles: trimmed ? [trimmed] : [],
      attachments: attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        previewUrl: att.previewUrl
      }))
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setDraft("");

    // Clean up preview URLs
    attachments.forEach((att) => {
      if (att.previewUrl) {
        URL.revokeObjectURL(att.previewUrl);
      }
    });
    setAttachments([]);

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

  // File selection handler
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      })),
    ]);

    // Reset input so same file can be picked again
    e.target.value = "";
  };

  // Open file picker function
  const openFilePicker = (accept) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = accept || "";
    fileInputRef.current.click();
  };

  const handleAttachOption = (option) => {
    setIsAttachMenuOpen(false);

    if (option === 'file') {
      openFilePicker(); // Any file
    } else if (option === 'photos') {
      openFilePicker('image/*'); // Images only
    } else {
      console.log('Attachment option selected:', option);
      // Keep other options (GIF, Emoji) as they are
    }
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

  const handleReplyClick = (messageId) => {
    // Find the message to check if it has an existing thread
    const message = localMessages.find(m => m.id === messageId);

    if (message?.replySummary?.threadId) {
      // Navigate to existing thread
      navigate(`/channel/${channelId}/thread/${message.replySummary.threadId}`);
    } else {
      // Create new thread - in a real app, this would create thread via API
      // For now, navigate to a new thread ID and let the system handle it
      const newThreadId = `thread-${messageId}`;
      navigate(`/channel/${channelId}/thread/${newThreadId}`);
    }
  };

  // Handle click outside and Escape key for reaction menus
  useEffect(() => {
    if (!activeReactionBubbleId && !showEmojiPicker && !chipReactionBarMessageId) return;

    function handleClickOutside(event) {
      const target = event.target;
      const activeReactButton = reactButtonRefs.current[activeReactionBubbleId];
      const activeChipButton = chipReactButtonRefs.current[chipReactionBarMessageId];

      // Check if click is inside any inline reaction UI elements
      const clickInsideInlineUI = (
        (reactionBarRef.current && reactionBarRef.current.contains(target)) ||
        (emojiPickerRef.current && emojiPickerRef.current.contains(target)) ||
        (activeReactButton && activeReactButton.contains(target))
      );

      // Check if click is inside any chip reaction UI elements
      const clickInsideChipUI = (
        (chipReactionBarRef.current && chipReactionBarRef.current.contains(target)) ||
        (activeChipButton && activeChipButton.contains(target))
      );

      // Close inline reaction UI if active and click is outside
      if (activeReactionBubbleId && !clickInsideInlineUI) {
        setActiveReactionBubbleId(null);
        setShowEmojiPicker(false);
      }

      // Close chip reaction UI if active and click is outside
      if (chipReactionBarMessageId && !clickInsideChipUI) {
        setChipReactionBarMessageId(null);
        setShowEmojiPicker(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (showEmojiPicker && chipReactionBarMessageId) {
          setShowEmojiPicker(false);
        } else if (showEmojiPicker && activeReactionBubbleId) {
          setShowEmojiPicker(false);
        } else if (activeReactionBubbleId) {
          setActiveReactionBubbleId(null);
        } else if (chipReactionBarMessageId) {
          setChipReactionBarMessageId(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeReactionBubbleId, showEmojiPicker, chipReactionBarMessageId]);

  const iconIsHash = channel.iconType === "hash";

  const handleBackToChannel = () => {
    navigate(`/channel/${channelId}`);
  };

  return (
    <main className="main">
      {/* Top bar */}
      <header className="top-bar">
        {threadId ? (
          <div className="top-bar-title">
            <button
              type="button"
              className="top-bar-back-button"
              onClick={handleBackToChannel}
              aria-label="Back to channel"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span
              className={
                "sidebar-icon " + (iconIsHash ? "hash" : "bolt")
              }
            >
              {iconIsHash ? "#" : "⚡"}
            </span>
            <span>{channel.label}</span>
            <span className="top-bar-breadcrumb-separator">›</span>
            <span className="top-bar-breadcrumb-thread">Thread</span>
          </div>
        ) : (
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
        )}
      </header>

      {/* Messages */}
      <section className="chat-wrapper" ref={chatWrapperRef}>
        <div className="chat-inner">
          {localMessages.map((msg, index) => {
            const prevMsg = index > 0 ? localMessages[index - 1] : null;
            const isContinuation = prevMsg &&
              prevMsg.author === msg.author &&
              prevMsg.senderType === msg.senderType;
            const isThreadRoot = threadId && index === 0;
            const replyCount = thread?.messages?.length || 0;

            return (
              <React.Fragment key={msg.id}>
                {isThreadRoot && (
                  <div className="thread-root-container">
                    <MessageGroup
                      msg={msg}
                      isContinuation={isContinuation}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      activeReactionBubbleId={activeReactionBubbleId}
                      setActiveReactionBubbleId={setActiveReactionBubbleId}
                      showEmojiPicker={showEmojiPicker}
                      setShowEmojiPicker={setShowEmojiPicker}
                      onReaction={handleReaction}
                      onReplyClick={handleReplyClick}
                      reactButtonRefs={reactButtonRefs}
                      reactionBarRef={reactionBarRef}
                      emojiPickerRef={emojiPickerRef}
                      chipReactionBarMessageId={chipReactionBarMessageId}
                      setChipReactionBarMessageId={setChipReactionBarMessageId}
                      chipReactButtonRefs={chipReactButtonRefs}
                      chipReactionBarRef={chipReactionBarRef}
                      isThreadRoot={isThreadRoot}
                      hideReplySummary={!!threadId}
                    />
                    <div className="thread-divider">
                      <div className="thread-divider-text">
                        {replyCount === 0 ? 'No replies yet' : replyCount === 1 ? '1 reply' : `${replyCount} replies`}
                      </div>
                    </div>
                  </div>
                )}
                {!isThreadRoot && (
                  <MessageGroup
                    msg={msg}
                    isContinuation={isContinuation}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    activeReactionBubbleId={activeReactionBubbleId}
                    setActiveReactionBubbleId={setActiveReactionBubbleId}
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    onReaction={handleReaction}
                    onReplyClick={handleReplyClick}
                    reactButtonRefs={reactButtonRefs}
                    reactionBarRef={reactionBarRef}
                    emojiPickerRef={emojiPickerRef}
                    chipReactionBarMessageId={chipReactionBarMessageId}
                    setChipReactionBarMessageId={setChipReactionBarMessageId}
                    chipReactButtonRefs={chipReactButtonRefs}
                    chipReactionBarRef={chipReactionBarRef}
                    isThreadRoot={isThreadRoot}
                    hideReplySummary={!!threadId}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* Composer */}
      <section className="composer-wrapper">
        <div className="composer-inner">
          {/* Attachments row */}
          {attachments.length > 0 && (
            <div className="composer-attachments-row">
              {attachments.map((att) => (
                <AttachmentTile
                  key={att.id}
                  attachment={att}
                  onRemove={() =>
                    setAttachments((prev) =>
                      prev.filter((a) => a.id !== att.id)
                    )
                  }
                />
              ))}
            </div>
          )}

          <div className="composer-textarea-wrapper" ref={composerRef}>
            <button
              ref={addButtonRef}
              className={"add-button" + (isAttachMenuOpen ? " active" : "") + (isFormattingOn ? " formatting-active" : "")}
              onClick={toggleAttachMenu}
            >
              <span className="add-button-icon">+</span>
            </button>

            <ActionMenu
              items={[
                {
                  key: 'file',
                  label: 'File',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 3h7l5 5v13H7z" stroke="#6366F1" strokeWidth="1.7" strokeLinejoin="round" />
                      <path d="M14 3v5h5" stroke="#6366F1" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  ),
                  onClick: () => handleAttachOption('file')
                },
                {
                  key: 'photos',
                  label: 'Photos',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5" width="16" height="14" rx="2.5" ry="2.5" stroke="#22C55E" strokeWidth="1.7" />
                      <circle cx="9" cy="10" r="1.7" fill="#22C55E" />
                      <path d="M7 17l3.5-3 2.5 2 3-3 3 4" stroke="#22C55E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  onClick: () => handleAttachOption('photos')
                },
                {
                  key: 'gif',
                  label: 'GIF',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="6" width="16" height="12" rx="3" ry="3" stroke="#F97316" strokeWidth="1.7" />
                      <text x="7" y="15" fontSize="7" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fill="#F97316">GIF</text>
                    </svg>
                  ),
                  onClick: () => handleAttachOption('gif')
                },
                {
                  key: 'emoji',
                  label: 'Emoji',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#EAB308" strokeWidth="1.7" />
                      <circle cx="9" cy="10" r="1.2" fill="#EAB308" />
                      <circle cx="15" cy="10" r="1.2" fill="#EAB308" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#EAB308" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  ),
                  onClick: () => handleAttachOption('emoji')
                },
                {
                  key: 'formatting',
                  label: isFormattingOn ? "✓ Formatting" : "Formatting",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="#8B5CF6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  onClick: toggleFormatting
                }
              ]}
              isOpen={isAttachMenuOpen}
              onClose={() => setIsAttachMenuOpen(false)}
              anchorRef={addButtonRef}
              position={{ bottom: 'calc(100% - 15px)', left: '12px' }}
            />

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
              disabled={!draft.trim() && attachments.length === 0}
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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
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

// Shared ActionMenu component for all dropdown menus
function ActionMenu({ items, isOpen, onClose, anchorRef, position }) {
  const menuRef = useRef(null);

  // Close menu on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      const target = event.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(target)
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
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="menu-card"
      role="menu"
      style={position}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="menu-item"
          role="menuitem"
          onClick={item.onClick}
        >
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// More menu component for message actions
function MoreMenu({ messageId, isOwn, isOpen, onToggle, onClose }) {
  const chevronRef = useRef(null);

  // Menu item icon/label data
  const replyIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 12l5-4v3h2.5C16.4 11 18 12.4 18 14.5V17"
        fill="none"
        stroke="#2563eb"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const replyPrivateIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 12l4.5-3.5V12h2.2c1.7 0 3.3 1.4 3.3 3.2V17"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="13.5"
        y="14"
        width="5"
        height="4"
        rx="1"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.4"
      />
      <path
        d="M15 14v-1a1.5 1.5 0 013 0v1"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );

  const popcorn2Icon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 9h8l-1.2 9H9.2L8 9z"
        fill="none"
        stroke="#f97316"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 9l-.6 9M12 9v9M14 9l.6 9"
        fill="none"
        stroke="#f97316"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M9 8a2 2 0 013-1.5A2 2 0 0115 8"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );

  const copyIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="9"
        y="9"
        width="9"
        height="9"
        rx="1.7"
        fill="none"
        stroke="#0f766e"
        strokeWidth="1.7"
      />
      <rect
        x="6"
        y="6"
        width="9"
        height="9"
        rx="1.7"
        fill="none"
        stroke="#0f766e"
        strokeWidth="1.7"
        opacity="0.7"
      />
    </svg>
  );

  const forwardIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7l6 5-6 5"
        fill="none"
        stroke="#059669"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const deleteIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6h6l-.5 13H9.5L9 6z"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 6h8M10 6l.5-2h3L14 6"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 9.5v6M13 9.5v6"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );

  const linkIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const editIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Handle action click
  const handleAction = (actionKey) => {
    console.log(`Action: ${actionKey} on message: ${messageId}`);
    onClose();
  };

  // Menu items based on ownership with onClick handlers
  const menuItems = isOwn
    ? [
        { key: "edit", label: "Edit", icon: editIcon, onClick: () => handleAction("edit") },
        { key: "copy", label: "Copy text", icon: copyIcon, onClick: () => handleAction("copy") },
        { key: "copy-link", label: "Copy link", icon: linkIcon, onClick: () => handleAction("copy-link") },
        { key: "popcorn2", label: "Popcorn to...", icon: popcorn2Icon, onClick: () => handleAction("popcorn2") },
        { key: "delete", label: "Delete", icon: deleteIcon, onClick: () => handleAction("delete") },
      ]
    : [
        { key: "reply", label: "Reply", icon: replyIcon, onClick: () => handleAction("reply") },
        { key: "reply-private", label: "Reply privately", icon: replyPrivateIcon, onClick: () => handleAction("reply-private") },
        { key: "copy", label: "Copy text", icon: copyIcon, onClick: () => handleAction("copy") },
        { key: "copy-link", label: "Copy link", icon: linkIcon, onClick: () => handleAction("copy-link") },
        { key: "popcorn2", label: "Popcorn to...", icon: popcorn2Icon, onClick: () => handleAction("popcorn2") },
      ];

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

      <ActionMenu
        items={menuItems}
        isOpen={isOpen}
        onClose={onClose}
        anchorRef={chevronRef}
        position={{ top: 'calc(100% + 6px)', right: 0 }}
      />
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
  onReplyClick,
  reactButtonRefs,
  reactionBarRef,
  emojiPickerRef,
  chipReactionBarMessageId,
  setChipReactionBarMessageId,
  chipReactButtonRefs,
  chipReactionBarRef,
  isThreadRoot = false,
  hideReplySummary = false
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
              {(msg.timestamp || msg.time) && (
                <span className="msg-time">
                  {msg.timestamp ? formatTimestamp(msg.timestamp) : msg.time}
                </span>
              )}
            </div>
          )}

          {msg.bubbles.map((bubble, idx) => {
            const isLastBubble = idx === msg.bubbles.length - 1;
            const bubbleId = `${msg.id}-${idx}`;
            const isMenuOpen = openMenuId === bubbleId;
            const bubbleReactions = msg.reactions?.[idx] || [];
            return (
              <div key={idx} className="message-bubble-container">
                <div className="message-bubble-row">
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

                      {activeReactionBubbleId === bubbleId && showEmojiPicker && !chipReactionBarMessageId && (
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
                      onClick={() => onReplyClick(msg.id)}
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

                {/* Reaction chips below bubble row */}
                {bubbleReactions.length > 0 && (
                  <div className="message-reactions-row">
                    <ReactionPill
                      reactions={bubbleReactions}
                      onToggle={(emoji) => onReaction(bubbleId, emoji)}
                    />

                    {/* Add reaction chip at the end */}
                    <div className="reaction-anchor reaction-anchor--chip">
                      <button
                        ref={(el) => {
                          if (el) chipReactButtonRefs.current[bubbleId] = el;
                        }}
                        type="button"
                        className="message-reaction-add-btn"
                        aria-label="Add reaction"
                        onClick={() => {
                          setShowEmojiPicker(false);
                          setActiveReactionBubbleId(null);
                          setChipReactionBarMessageId(
                            chipReactionBarMessageId === bubbleId ? null : bubbleId
                          );
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <circle cx="9.5" cy="10" r="0.9" fill="currentColor" />
                          <circle cx="14.5" cy="10" r="0.9" fill="currentColor" />
                          <path
                            d="M9 14c.5 1 1.6 1.6 3 1.6s2.5-.6 3-1.6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="message-tooltip">Add reaction</span>
                      </button>

                      {chipReactionBarMessageId === bubbleId && !showEmojiPicker && (
                        <div ref={chipReactionBarRef}>
                          <ReactionBar
                            onSelect={(emoji) => {
                              onReaction(bubbleId, emoji);
                              setChipReactionBarMessageId(null);
                            }}
                            onOpenPicker={() => {
                              setActiveReactionBubbleId(null);
                              setShowEmojiPicker(true);
                            }}
                          />
                        </div>
                      )}

                      {chipReactionBarMessageId === bubbleId && showEmojiPicker && (
                        <div ref={chipReactionBarRef}>
                          <EmojiPickerPanel
                            onSelect={(emoji) => {
                              onReaction(bubbleId, emoji);
                              setChipReactionBarMessageId(null);
                              setShowEmojiPicker(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {bubbleReactions.length === 0 && (
                  <ReactionPill
                    reactions={bubbleReactions}
                    onToggle={(emoji) => onReaction(bubbleId, emoji)}
                  />
                )}
              </div>
            );
          })}
          {msg.replySummary && !hideReplySummary && <ReplySummaryRow replySummary={msg.replySummary} />}
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
              <span className="msg-name">@popcorn</span>
              {(msg.timestamp || msg.time) && (
                <span className="msg-time">
                  {msg.timestamp ? formatTimestamp(msg.timestamp) : msg.time}
                </span>
              )}
            </div>
          )}

          {msg.bubbles.map((bubble, idx) => {
            const isLastBubble = idx === msg.bubbles.length - 1;
            const bubbleId = `${msg.id}-${idx}`;
            const bubbleReactions = msg.reactions?.[idx] || [];
            return (
              <div key={idx} className="message-bubble-container">
                <div className="ai-message-text">
                  {parseMentions(bubble)}
                </div>

                {/* Reaction chips above inline actions */}
                {bubbleReactions.length > 0 && (
                  <div className="message-reactions-row">
                    <ReactionPill
                      reactions={bubbleReactions}
                      onToggle={(emoji) => onReaction(bubbleId, emoji)}
                    />

                    {/* Add reaction chip at the end */}
                    <div className="reaction-anchor reaction-anchor--chip">
                      <button
                        ref={(el) => {
                          if (el) chipReactButtonRefs.current[bubbleId] = el;
                        }}
                        type="button"
                        className="message-reaction-add-btn"
                        aria-label="Add reaction"
                        onClick={() => {
                          setShowEmojiPicker(false);
                          setActiveReactionBubbleId(null);
                          setChipReactionBarMessageId(
                            chipReactionBarMessageId === bubbleId ? null : bubbleId
                          );
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <circle cx="9.5" cy="10" r="0.9" fill="currentColor" />
                          <circle cx="14.5" cy="10" r="0.9" fill="currentColor" />
                          <path
                            d="M9 14c.5 1 1.6 1.6 3 1.6s2.5-.6 3-1.6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="message-tooltip">Add reaction</span>
                      </button>

                      {chipReactionBarMessageId === bubbleId && !showEmojiPicker && (
                        <div ref={chipReactionBarRef}>
                          <ReactionBar
                            onSelect={(emoji) => {
                              onReaction(bubbleId, emoji);
                              setChipReactionBarMessageId(null);
                            }}
                            onOpenPicker={() => {
                              setActiveReactionBubbleId(null);
                              setShowEmojiPicker(true);
                            }}
                          />
                        </div>
                      )}

                      {chipReactionBarMessageId === bubbleId && showEmojiPicker && (
                        <div ref={chipReactionBarRef}>
                          <EmojiPickerPanel
                            onSelect={(emoji) => {
                              onReaction(bubbleId, emoji);
                              setChipReactionBarMessageId(null);
                              setShowEmojiPicker(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {bubbleReactions.length === 0 && (
                  <ReactionPill
                    reactions={bubbleReactions}
                    onToggle={(emoji) => onReaction(bubbleId, emoji)}
                  />
                )}

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

                      {activeReactionBubbleId === bubbleId && showEmojiPicker && !chipReactionBarMessageId && (
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
                      onClick={() => onReplyClick(msg.id)}
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
          {msg.replySummary && !hideReplySummary && <ReplySummaryRow replySummary={msg.replySummary} />}
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
            {(msg.timestamp || msg.time) && (
              <span className="msg-time">
                {msg.timestamp ? formatTimestamp(msg.timestamp) : msg.time}
              </span>
            )}
          </div>
        )}

        {msg.bubbles.map((bubble, idx) => {
          const isLastBubble = idx === msg.bubbles.length - 1;
          const bubbleId = `${msg.id}-${idx}`;
          const isMenuOpen = openMenuId === bubbleId;
          const bubbleReactions = msg.reactions?.[idx] || [];
          return (
            <div key={idx} className="message-bubble-container">
              <div className="message-bubble-row">
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
                    onClick={() => onReplyClick(msg.id)}
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

              {/* Reply button for "You" messages */}
              {isLastBubble && msg.isYou && (
                <div className="message-inline-actions">
                  <button
                    type="button"
                    className="message-inline-action-btn"
                    aria-label="Reply"
                    onClick={() => onReplyClick(msg.id)}
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

              {/* Reaction chips below bubble row */}
              {bubbleReactions.length > 0 && (
                <div className="message-reactions-row">
                  <ReactionPill
                    reactions={bubbleReactions}
                    onToggle={(emoji) => onReaction(bubbleId, emoji)}
                  />

                  {/* Add reaction chip at the end */}
                  <div className="reaction-anchor reaction-anchor--chip">
                    <button
                      ref={(el) => {
                        if (el) chipReactButtonRefs.current[bubbleId] = el;
                      }}
                      type="button"
                      className="message-reaction-add-btn"
                      aria-label="Add reaction"
                      onClick={() => {
                        setShowEmojiPicker(false);
                        setActiveReactionBubbleId(null);
                        setChipReactionBarMessageId(
                          chipReactionBarMessageId === bubbleId ? null : bubbleId
                        );
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <circle cx="9.5" cy="10" r="0.9" fill="currentColor" />
                        <circle cx="14.5" cy="10" r="0.9" fill="currentColor" />
                        <path
                          d="M9 14c.5 1 1.6 1.6 3 1.6s2.5-.6 3-1.6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>

                    {chipReactionBarMessageId === bubbleId && !showEmojiPicker && (
                      <div ref={chipReactionBarRef}>
                        <ReactionBar
                          onSelect={(emoji) => {
                            onReaction(bubbleId, emoji);
                            setChipReactionBarMessageId(null);
                          }}
                          onOpenPicker={() => {
                            setChipReactionBarMessageId(null);
                            setActiveReactionBubbleId(bubbleId);
                            setShowEmojiPicker(true);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {bubbleReactions.length === 0 && (
                <ReactionPill
                  reactions={bubbleReactions}
                  onToggle={(emoji) => onReaction(bubbleId, emoji)}
                />
              )}
            </div>
          );
        })}
        {msg.replySummary && !hideReplySummary && <ReplySummaryRow replySummary={msg.replySummary} />}
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
