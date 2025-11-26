// src/components/ChannelConversation.jsx
import React, { useState, useRef, useEffect } from "react";
import InlineFormattingToolbar from "./InlineFormattingToolbar";
import ActionMenu from "./ActionMenu";

// Parse message content into blocks (text, code, mentions)
function parseMessageContent(content) {
  const lines = content.split("\n");
  const blocks = [];
  let currentText = [];
  let inCode = false;
  let codeLang = undefined;
  let codeLines = [];

  const flushText = () => {
    if (currentText.length) {
      const text = currentText.join("\n");
      blocks.push({ type: "text", text });
      currentText = [];
    }
  };

  for (const line of lines) {
    const fenceMatch = line.match(/^```(\w+)?\s*$/);
    if (fenceMatch) {
      if (!inCode) {
        flushText();
        inCode = true;
        codeLang = fenceMatch[1];
        codeLines = [];
      } else {
        blocks.push({
          type: "code",
          language: codeLang,
          code: codeLines.join("\n"),
        });
        inCode = false;
        codeLang = undefined;
        codeLines = [];
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
    } else {
      currentText.push(line);
    }
  }

  flushText();
  return blocks;
}

// Render text with @mentions and inline code highlighted
function renderTextWithMentions(text) {
  const codePattern = /(`[^`]+`)/g;
  const codeParts = text.split(codePattern);

  return codeParts.map((codePart, codeIndex) => {
    if (codePart.startsWith('`') && codePart.endsWith('`')) {
      const codeContent = codePart.slice(1, -1);
      return (
        <code key={`code-${codeIndex}`} className="inline-code">
          {codeContent}
        </code>
      );
    }

    const mentionParts = codePart.split(/(@\w+)/g);
    return mentionParts.map((part, mentionIndex) => {
      if (part.startsWith('@')) {
        return <span key={`${codeIndex}-${mentionIndex}`} className="mention">{part}</span>;
      }
      return <React.Fragment key={`${codeIndex}-${mentionIndex}`}>{part}</React.Fragment>;
    });
  });
}

// Render message blocks (text + code)
function renderMessageBlocks(content) {
  const blocks = parseMessageContent(content);

  return blocks.map((block, idx) => {
    if (block.type === "text") {
      const trimmedText = block.text.trim();
      if (!trimmedText) return null;

      return (
        <p key={idx} className="message-paragraph">
          {renderTextWithMentions(trimmedText)}
        </p>
      );
    } else if (block.type === "code") {
      return (
        <pre
          key={idx}
          className="message-code-block"
          data-lang={block.language || ""}
        >
          <code>{block.code}</code>
        </pre>
      );
    }
    return null;
  });
}

// Message Group component
function MessageGroup({ msg, currentUserId }) {
  const isUser = msg.authorId === currentUserId;
  const isAI = msg.senderType === "ai" || msg.authorId === "popcorn";

  // Format timestamp
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return timeStr;
    }

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return `${dateStr} at ${timeStr}`;
  };

  // Get avatar content
  const getAvatarContent = () => {
    if (isAI) {
      return "🍿";
    }
    return msg.authorName?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="message-group">
      <div className="message-avatar">
        <div className={`avatar-circle ${isAI ? "ai-avatar" : ""}`}>
          {getAvatarContent()}
        </div>
      </div>
      <div className="message-content">
        <div className="message-meta">
          <span className="message-author">{msg.authorName || "Unknown"}</span>
          <span className="message-time">{formatTimestamp(msg.createdAt)}</span>
        </div>
        <div className={`msg-bubble ${isAI ? "ai-message-text" : ""}`}>
          {renderMessageBlocks(msg.text)}
        </div>
      </div>
    </div>
  );
}

// Attachment tile component (simplified)
function AttachmentTile({ attachment, onRemove }) {
  return (
    <div className="attachment-tile">
      <span className="attachment-tile-name">{attachment.name}</span>
      <button
        type="button"
        className="attachment-tile-remove"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}

/**
 * ChannelConversation - Reusable chat UI component
 *
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.currentUserId - ID of the current user
 * @param {Function} props.onSendMessage - Callback when sending a message
 * @param {string} props.placeholder - Composer placeholder text
 */
function ChannelConversation({ messages, currentUserId, onSendMessage, placeholder = "Message..." }) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  const chatWrapperRef = useRef(null);
  const textareaRef = useRef(null);
  const composerRef = useRef(null);
  const addButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatWrapperRef.current) {
      chatWrapperRef.current.scrollTop = chatWrapperRef.current.scrollHeight;
    }
  }, [messages]);

  // Text selection detection for inline formatting toolbar
  const updateToolbarFromSelection = () => {
    const editor = textareaRef.current;
    const container = composerRef.current;
    if (!editor || !container) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setToolbarVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);

    if (
      selection.isCollapsed ||
      !editor.contains(range.commonAncestorContainer)
    ) {
      setToolbarVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      setToolbarVisible(false);
      return;
    }

    const top = rect.top - containerRect.top - 45;
    const left = rect.left - containerRect.left + rect.width / 2;

    setToolbarPos({ top: Math.max(top, 0), left });
    setToolbarVisible(true);
  };

  // Formatting handlers
  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    updateToolbarFromSelection();
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      updateToolbarFromSelection();
    }
  };

  // Send message
  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed && attachments.length === 0) return;

    onSendMessage(trimmed);
    setDraft("");
    setAttachments([]);

    // Clear the contentEditable
    if (textareaRef.current) {
      textareaRef.current.textContent = "";
    }
  };

  // Attach menu handlers
  const toggleAttachMenu = () => {
    setIsAttachMenuOpen(!isAttachMenuOpen);
  };

  const handleAttachOption = (type) => {
    setIsAttachMenuOpen(false);
    if (type === 'file' || type === 'photos') {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      id: `${Date.now()}_${file.name}`,
      name: file.name,
      type: file.type,
      file,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  return (
    <div className="channel-conversation">
      {/* Messages */}
      <section className="chat-wrapper" ref={chatWrapperRef}>
        <div className="chat-inner">
          {messages.map((msg) => (
            <MessageGroup
              key={msg.id}
              msg={msg}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </section>

      {/* Composer */}
      <section className="composer-wrapper">
        <div className="composer-inner">
          <div className="composer-textarea-wrapper" ref={composerRef}>
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
                }
              ]}
              isOpen={isAttachMenuOpen}
              onClose={() => setIsAttachMenuOpen(false)}
              anchorRef={addButtonRef}
              position={{ bottom: 'calc(100% - 15px)', left: '12px' }}
            />

            <div className="composer-field">
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

              <div className="composer-input-area">
                <button
                  ref={addButtonRef}
                  className={"add-button" + (isAttachMenuOpen ? " active" : "")}
                  onClick={toggleAttachMenu}
                >
                  <span className="add-button-icon">+</span>
                </button>

                <div
                  ref={textareaRef}
                  className="composer-field"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setDraft(e.currentTarget.textContent || "")}
                  onMouseUp={updateToolbarFromSelection}
                  onKeyUp={updateToolbarFromSelection}
                  onBlur={() => setTimeout(() => setToolbarVisible(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, text);
                  }}
                  data-placeholder={placeholder}
                  style={{
                    minHeight: '20px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                />

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

              {/* Inline formatting toolbar */}
              <InlineFormattingToolbar
                visible={toolbarVisible}
                top={toolbarPos.top}
                left={toolbarPos.left}
                onBold={() => handleFormat('bold')}
                onItalic={() => handleFormat('italic')}
                onUnderline={() => handleFormat('underline')}
                onStrikethrough={() => handleFormat('strikeThrough')}
                onCode={() => handleFormat('formatBlock')}
                onLink={handleLink}
              />
            </div>
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
    </div>
  );
}

export default ChannelConversation;
