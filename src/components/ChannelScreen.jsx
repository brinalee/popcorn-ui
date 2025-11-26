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
    setChannels((prev) =>
      prev.map((ch) => (ch.id === updatedChannel.id ? updatedChannel : ch))
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
