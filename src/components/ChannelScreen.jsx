// src/components/ChannelScreen.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { channels as initialChannels, dms } from "../mockData";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import CreateChannelIntentModal from "./CreateChannelIntentModal";
import ChannelSettingsPage from "./ChannelSettingsPage";
import { createChannelFromPrompt, createBlankChannel, createChannelFromTemplate } from "../utils/channelUtils";

const MIN_SIDEBAR_WIDTH = 300;
const HIDE_THRESHOLD = 300;
const HEADER_HEIGHT = 56;

// Helper to generate a new release notes message with different content
function buildRegeneratedReleaseNotes(webhookName) {
  return {
    id: `release-notes-${Date.now()}`,
    senderType: "ai",
    viaWebhook: webhookName,
    timestamp: new Date().toISOString(),
    metadata: {
      type: "release_notes",
      canRetry: true,
      webhookName: webhookName,
      generation: "retry",
      forceNewGroup: true,
    },
    bubbles: [
      `🚀 **v2.4.0** redeployed with updated notes\n\nThis pass focuses on making release notes clearer and more actionable for your team.\n\n**Changes**\n• ✨ Release notes can now be regenerated with a single click\n• 🔁 Retry button added next to react/reply on AI messages\n• 🧷 @webhook mentions now support multiple integrations per channel\n• 📝 Improved formatting for multi-section summaries\n• 🎯 Better change categorization for user vs internal fixes\n\n**Impact**\n• Fewer manual edits needed for release updates\n• Teams can quickly iterate on wording before sharing\n• Clearer separation between user-facing and internal changes\n\n**Non-user facing**\n• Tweaked webhook payload normalizer for better error messages\n• Minor performance tuning in the Markdown renderer`
    ]
  };
}

function ChannelScreen() {
  const { channelId, threadId } = useParams();
  const navigate = useNavigate();

  // Mutable channels state
  const [channels, setChannels] = useState(initialChannels);

  // View mode state - track if we're showing channel chat or settings
  const [viewMode, setViewMode] = useState("channel"); // "channel" | "channel-settings"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const prevChannelIdRef = useRef(channelId);

  // Sidebar state management
  const [isSidebarSticky, setIsSidebarSticky] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [showAnimation, setShowAnimation] = useState(false);

  const activeChannel =
    channels.find((c) => c.id === channelId) || channels[0];

  const handleSelectChannel = (newChannelId) => {
    setViewMode("channel");
    navigate(`/channel/${newChannelId}`);
  };

  const handleStartCreateChannel = () => {
    prevChannelIdRef.current = channelId;
    setShowCreateModal(true);
  };

  const handleCreateFromPrompt = (prompt) => {
    const newChannel = createChannelFromPrompt(prompt);
    setChannels((prev) => [newChannel, ...prev]);
    setShowCreateModal(false);
    setViewMode("channel-settings");
    navigate(`/channel/${newChannel.id}`);
  };

  const handleCreateBlank = () => {
    const newChannel = createBlankChannel();
    setChannels((prev) => [newChannel, ...prev]);
    setShowCreateModal(false);
    setViewMode("channel-settings");
    navigate(`/channel/${newChannel.id}`);
  };

  const handleCreateFromTemplate = (templateData) => {
    const newChannel = createChannelFromTemplate(templateData);
    setChannels((prev) => [newChannel, ...prev]);
    setShowCreateModal(false);
    setViewMode("channel-settings");
    navigate(`/channel/${newChannel.id}`);
  };

  const handleCancelModal = () => {
    setShowCreateModal(false);
  };

  const handleSaveSettings = (updatedChannel) => {
    let channelToSave = updatedChannel;

    // Seed demo AI message for release-notes template (only once)
    if (updatedChannel.templateId === "release-notes" && !updatedChannel.hasSeededReleaseNotesDemo) {
      const webhookName = updatedChannel.webhooks?.[0]?.name || "Release event";

      const demoMessage = {
        id: `demo-release-${Date.now()}`,
        senderType: "ai",
        viaWebhook: webhookName,
        timestamp: new Date().toISOString(),
        metadata: {
          type: "release_notes",
          canRetry: true,
          webhookName: webhookName,
        },
        bubbles: [
          `🚀 **v2.4.0** deployed to production\n\nBig one! This release introduces automated release notes powered by webhooks, plus a bunch of quality-of-life improvements across the board.\n\n**Changes**\n• ✨ Channels can now auto-generate release notes from CI/CD webhooks\n• 🔗 New @webhook mentions let you reference integrations directly in instructions\n• 📝 Rich text support in channel settings with inline formatting\n• ⚡ Message rendering is now 2x faster on long threads\n• 🎨 Refreshed settings UI with collapsible sections\n\n**Non-user facing**\n• Migrated webhook payload parsing to new validation layer\n• Fixed memory leak in long-running WebSocket connections`
        ]
      };

      channelToSave = {
        ...updatedChannel,
        hasSeededReleaseNotesDemo: true,
        messages: [demoMessage, ...(updatedChannel.messages || [])]
      };
    }

    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelToSave.id ? channelToSave : ch))
    );
    setViewMode("channel");
  };

  const handleCancelSettings = () => {
    setViewMode("channel");
    // Navigate back to the previous channel
    if (prevChannelIdRef.current) {
      navigate(`/channel/${prevChannelIdRef.current}`);
    }
  };

  const handleRetryReleaseNotes = (messageId) => {
    // Find the message in the active channel
    const message = activeChannel?.messages?.find(m => m.id === messageId);
    if (message?.metadata?.type !== "release_notes") return;

    const webhookName = message.metadata?.webhookName || "Release event";

    // 1) Add typing placeholder
    const typingMessage = {
      id: `typing-${Date.now()}`,
      senderType: "ai",
      viaWebhook: webhookName,
      timestamp: new Date().toISOString(),
      metadata: { isTypingPlaceholder: true },
      bubbles: ["_Regenerating release notes..._"]
    };

    setChannels(prev => prev.map(ch =>
      ch.id === channelId
        ? { ...ch, messages: [...(ch.messages || []), typingMessage] }
        : ch
    ));

    // 2) After delay, replace with regenerated message
    setTimeout(() => {
      const newMessage = buildRegeneratedReleaseNotes(webhookName);

      setChannels(prev => prev.map(ch =>
        ch.id === channelId
          ? {
              ...ch,
              messages: (ch.messages || [])
                .filter(m => m.id !== typingMessage.id)
                .concat(newMessage)
            }
          : ch
      ));
    }, 1200);
  };

  const handleDeleteMessage = (messageId) => {
    setChannels(prev => prev.map(ch =>
      ch.id === channelId
        ? { ...ch, messages: (ch.messages || []).filter(m => m.id !== messageId) }
        : ch
    ));
  };

  // Trigger animation when sidebar becomes visible in peek mode
  useEffect(() => {
    if (!isSidebarSticky && isSidebarVisible) {
      // Small delay to ensure DOM is ready before animating
      const timer = setTimeout(() => setShowAnimation(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isSidebarSticky, isSidebarVisible]);

  // Drag-to-resize/hide handler
  const handleSidebarResizeMouseDown = (e) => {
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMove = (ev) => {
      const delta = ev.clientX - startX;
      const newWidth = startWidth + delta;

      if (newWidth <= HIDE_THRESHOLD) {
        // User dragged it offscreen → hide & go to peek mode
        setIsSidebarSticky(false);
        setIsSidebarVisible(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        return;
      }

      setSidebarWidth(Math.max(MIN_SIDEBAR_WIDTH, newWidth));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Toggle sidebar back to sticky mode
  const handleToggleSidebar = () => {
    setIsSidebarSticky(true);
    setIsSidebarVisible(true);
  };

  const isPeekMode = !isSidebarSticky && isSidebarVisible;

  return (
    <div className="app-layout">
      {/* Hover hotzone for peek trigger - only when not sticky */}
      {!isSidebarSticky && (
        <div
          className="sidebar-hotzone"
          onMouseEnter={() => setIsSidebarVisible(true)}
        />
      )}

      {/* Sticky sidebar - traditional docked behavior */}
      {isSidebarSticky && (
        <aside
          className="sidebar sidebar--sticky"
          style={{ width: sidebarWidth }}
        >
          <Sidebar
            channels={channels}
            dms={dms}
            activeChannelId={channelId}
            onSelectChannel={handleSelectChannel}
            onStartCreateChannel={handleStartCreateChannel}
          />

          {/* Resize handle */}
          <div
            className="sidebar-resize-handle"
            onMouseDown={handleSidebarResizeMouseDown}
          />
        </aside>
      )}

      {/* Peek mode overlay + flyout panel */}
      {isPeekMode && (
        <>
          {/* Dark overlay that dims the rest of the UI */}
          <div
            className={`sidebar-overlay ${showAnimation ? "sidebar-overlay--visible" : ""}`}
            onClick={() => setIsSidebarVisible(false)}
          />

          {/* Flyout sidebar panel */}
          <aside
            className={`sidebar-flyout ${showAnimation ? "sidebar-flyout--visible" : ""}`}
            onMouseLeave={() => setIsSidebarVisible(false)}
          >
            <Sidebar
              channels={channels}
              dms={dms}
              activeChannelId={channelId}
              onSelectChannel={handleSelectChannel}
              onStartCreateChannel={handleStartCreateChannel}
            />
          </aside>
        </>
      )}

      {/* Main panel */}
      <main className="app-main">
        {activeChannel && viewMode === "channel-settings" ? (
          <ChannelSettingsPage
            key={activeChannel.id}
            channel={activeChannel}
            onSave={handleSaveSettings}
            onCancel={handleCancelSettings}
          />
        ) : activeChannel ? (
          <ChatWindow
            channel={activeChannel}
            threadId={threadId}
            showSidebarToggle={!isSidebarSticky}
            onToggleSidebar={handleToggleSidebar}
            onRetryReleaseNotes={handleRetryReleaseNotes}
            onDeleteMessage={handleDeleteMessage}
          />
        ) : null}
      </main>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <CreateChannelIntentModal
          onCancel={handleCancelModal}
          onCreateFromPrompt={handleCreateFromPrompt}
          onCreateBlank={handleCreateBlank}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
      )}
    </div>
  );
}

export default ChannelScreen;
