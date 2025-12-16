// src/components/Sidebar.jsx
import React, { useState, useRef, useEffect } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { initialSections } from "../sectionsData";
import { channelDirectory, dmDirectory } from "../directoryData";
import CollapsibleSection from "./CollapsibleSection";
import DraggableItem from "./DraggableItem";
import SectionDialog from "./SectionDialog";
import DMDialog from "./DMDialog";
import ContextMenu from "./ContextMenu";
import FollowDialog from "./FollowDialog";
import Tooltip from "./Tooltip";
import SidebarSearchBar from "./SidebarSearchBar";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import KnowledgeKernelScreen from "./KnowledgeKernelScreen";
import EphemeralChannelNotification from "./EphemeralChannelNotification";
import EphemeralChannelEntry from "./EphemeralChannelEntry";
import DeleteSectionDialog from "./DeleteSectionDialog";
import SectionEditDialog from "./SectionEditDialog";
import NotificationBar from "./NotificationBar";

function Sidebar({ channels, dms, activeChannelId, onSelectChannel, onStartCreateChannel }) {
  const [showMenu, setShowMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const isDark = theme === "dark";
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showComposerMenu, setShowComposerMenu] = useState(false);
  const [showCreateDMDialog, setShowCreateDMDialog] = useState(false);
  const [sections, setSections] = useState(initialSections);
  const [ungroupedItemIds, setUngroupedItemIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [moveChannelMenu, setMoveChannelMenu] = useState(null);
  const [notificationsMenu, setNotificationsMenu] = useState(null);
  const [sortSectionMenu, setSortSectionMenu] = useState(null);
  const [showFollowDialog, setShowFollowDialog] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({});
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showKernelScreen, setShowKernelScreen] = useState(false);

  // Ephemeral channel state
  const [ephemeralNotification, setEphemeralNotification] = useState(null);
  const [ephemeralChannel, setEphemeralChannel] = useState(null);

  // Notification bar state - array of notifications
  // Each notification: { id, type: "mention" | "channelCreated", channelId, channelName, message }
  const [notifications, setNotifications] = useState([]);

  // Delete section confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Edit section dialog state
  const [editSection, setEditSection] = useState(null);
  // { sectionId, sectionTitle }

  // Track unread counts per item (for simulated DMs)
  const [unreadCounts, setUnreadCounts] = useState({});

  const composerBtnRef = useRef(null);
  const composerMenuRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Click-outside and Esc to close composer menu
  useEffect(() => {
    if (!showComposerMenu) return;

    function handleClickOutside(event) {
      const target = event.target;
      if (
        composerMenuRef.current &&
        !composerMenuRef.current.contains(target) &&
        composerBtnRef.current &&
        !composerBtnRef.current.contains(target)
      ) {
        setShowComposerMenu(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowComposerMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showComposerMenu]);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
    setShowMenu(false);
  };

  const handleCreateDM = (name) => {
    console.log("Create DM:", name);
    // TODO: Add DM creation logic
  };

  const handleCreateSection = (name) => {
    const newSection = {
      id: `sec-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      title: name,
      sortMode: "manual",
      isCollapsed: false,
      itemIds: [],
      isProtected: false
    };
    setSections([newSection, ...sections]); // Add at top
  };

  const handleToggleSection = (sectionId) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, isCollapsed: !section.isCollapsed }
        : section
    ));
  };

  // ========================================
  // SECTION MANAGEMENT HANDLERS
  // ========================================

  // Rename a section
  const handleRenameSection = (sectionId, newTitle) => {
    const section = sections.find(s => s.id === sectionId);
    if (section?.isProtected) return; // Cannot rename protected sections

    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, title: newTitle } : s
    ));
  };

  // Change sort mode for a section
  const handleChangeSortMode = (sectionId, mode) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, sortMode: mode } : s
    ));
  };

  // Delete section with confirmation
  const handleDeleteSectionConfirm = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || section.isProtected) return;

    setDeleteConfirm({
      sectionId,
      sectionTitle: section.title
    });
    setContextMenu(null);
  };

  // Delete section header only - move items to Uncategorized
  const handleDeleteSectionHeader = () => {
    if (!deleteConfirm) return;

    const section = sections.find(s => s.id === deleteConfirm.sectionId);
    if (!section) {
      setDeleteConfirm(null);
      return;
    }

    const itemsToMove = section.itemIds;

    setSections(prev => {
      // Remove the section
      const withoutDeleted = prev.filter(s => s.id !== deleteConfirm.sectionId);

      // Find uncategorized section
      const uncatIndex = withoutDeleted.findIndex(s => s.id === "uncategorized");

      if (uncatIndex !== -1 && itemsToMove.length > 0) {
        // Add items to existing uncategorized
        withoutDeleted[uncatIndex] = {
          ...withoutDeleted[uncatIndex],
          itemIds: [...itemsToMove, ...withoutDeleted[uncatIndex].itemIds]
        };
      }

      return withoutDeleted;
    });

    setDeleteConfirm(null);

    if (itemsToMove.length > 0) {
      showToast({
        message: "Section removed. Items moved to Uncategorized.",
        type: "info"
      });
    } else {
      showToast({
        message: "Section removed.",
        type: "info"
      });
    }
  };

  // Delete section and all its contents
  const handleDeleteSectionAndContents = () => {
    if (!deleteConfirm) return;

    const section = sections.find(s => s.id === deleteConfirm.sectionId);
    if (!section) {
      setDeleteConfirm(null);
      return;
    }

    const itemCount = section.itemIds.length;

    // Simply remove the section (items are not moved anywhere)
    setSections(prev => prev.filter(s => s.id !== deleteConfirm.sectionId));

    setDeleteConfirm(null);

    showToast({
      message: `Section and ${itemCount} ${itemCount === 1 ? "item" : "items"} deleted.`,
      type: "info"
    });
  };

  // Open section menu (from section header button)
  const handleOpenSectionMenu = (e, section) => {
    handleOpenContextMenu({
      type: "section",
      id: section.id,
      title: section.title,
      x: e.clientX,
      y: e.clientY
    });
  };

  // ========================================
  // SORTING UTILITY
  // ========================================

  // Get sorted item IDs based on section's sortMode
  const getSortedItemIds = (section) => {
    if (!section.sortMode || section.sortMode === "manual") {
      return section.itemIds;
    }

    const items = section.itemIds
      .map(id => getItemById(id))
      .filter(Boolean);

    if (section.sortMode === "abc") {
      items.sort((a, b) => {
        const nameA = a.label || a.name || "";
        const nameB = b.label || b.name || "";
        return nameA.localeCompare(nameB);
      });
    } else if (section.sortMode === "lastMessage") {
      items.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
    }

    return items.map(item => item.id);
  };

  // ========================================
  // EPHEMERAL CHANNEL HANDLERS
  // ========================================

  // Simulate receiving a notification from a channel not in sidebar
  const simulateExternalNotification = (channelId, channelName, preview = "You were mentioned") => {
    // Only show if channel not already in sidebar
    const allItemIds = sections.flatMap(s => s.itemIds);
    if (allItemIds.includes(channelId)) return;

    // Replace any existing ephemeral with new one
    setEphemeralNotification({ id: channelId, name: channelName, preview });
    setEphemeralChannel(null);
  };

  // User clicks notification → show ephemeral entry in sidebar
  const handleOpenEphemeral = () => {
    if (!ephemeralNotification) return;
    setEphemeralChannel({
      id: ephemeralNotification.id,
      name: ephemeralNotification.name,
      iconType: "hash"
    });
    setEphemeralNotification(null);
  };

  // User clicks "+" → add ephemeral to Uncategorized section
  const handleAddEphemeralToSidebar = () => {
    if (!ephemeralChannel) return;

    setSections(prev => {
      // Find uncategorized section
      const uncatIndex = prev.findIndex(s => s.id === "uncategorized");

      if (uncatIndex !== -1) {
        // Add to existing uncategorized
        return prev.map(s =>
          s.id === "uncategorized"
            ? { ...s, itemIds: [ephemeralChannel.id, ...s.itemIds] }
            : s
        );
      }
      // Create uncategorized at top if it doesn't exist
      return [{
        id: "uncategorized",
        title: "Uncategorized",
        sortMode: "manual",
        isCollapsed: false,
        itemIds: [ephemeralChannel.id],
        isProtected: true
      }, ...prev];
    });

    setEphemeralChannel(null);
  };

  // Handle selecting an ephemeral channel
  const handleSelectEphemeralChannel = () => {
    if (ephemeralChannel) {
      onSelectChannel?.(ephemeralChannel.id);
    }
  };

  // Wrapper for channel selection that dismisses ephemeral when navigating away
  const handleChannelSelect = (channelId) => {
    // If selecting a different channel than the ephemeral one, dismiss ephemeral
    if (ephemeralChannel && channelId !== ephemeralChannel.id) {
      setEphemeralChannel(null);
    }
    onSelectChannel?.(channelId);
  };

  // Expose simulateExternalNotification to window for demo purposes
  useEffect(() => {
    window.simulateExternalNotification = simulateExternalNotification;
    return () => {
      delete window.simulateExternalNotification;
    };
  }, [sections]);

  // ========================================
  // NOTIFICATION BAR HANDLERS
  // ========================================

  // Add a notification to the bar
  const addNotification = (type, channelId, channelName, message) => {
    // Check if channel is already in sidebar
    const allItemIds = sections.flatMap(s => s.itemIds);
    if (type === "channelCreated" && allItemIds.includes(channelId)) return;

    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      channelId,
      channelName,
      message
    };

    setNotifications(prev => [...prev, newNotification]);
  };

  // Dismiss a notification
  const handleDismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Handle notification click based on type
  const handleNotificationClick = (notification) => {
    if (notification.type === "mention") {
      // For mentions: show ephemeral sidebar entry
      setEphemeralChannel({
        id: notification.channelId,
        name: notification.channelName,
        iconType: "hash"
      });
      // Remove the notification
      handleDismissNotification(notification.id);
    } else if (notification.type === "channelCreated") {
      // For channelCreated: permanently add to Uncategorized section
      setSections(prev => {
        // Check if already in sidebar
        const alreadyExists = prev.some(s => s.itemIds.includes(notification.channelId));
        if (alreadyExists) return prev;

        // Find uncategorized section
        const uncatIndex = prev.findIndex(s => s.id === "uncategorized");

        if (uncatIndex !== -1) {
          // Add to existing uncategorized
          return prev.map(s =>
            s.id === "uncategorized"
              ? { ...s, itemIds: [notification.channelId, ...s.itemIds] }
              : s
          );
        }
        // Create uncategorized at top if it doesn't exist
        return [{
          id: "uncategorized",
          title: "Uncategorized",
          sortMode: "manual",
          isCollapsed: false,
          itemIds: [notification.channelId],
          isProtected: true
        }, ...prev];
      });
      // Remove the notification
      handleDismissNotification(notification.id);
      // Show toast
      showToast({
        message: `#${notification.channelName} added to sidebar`,
        type: "success"
      });
    }
  };

  // Add channel from notification directly to Uncategorized (via + button)
  const handleAddFromNotification = (notification) => {
    // Add to Uncategorized section
    setSections(prev => {
      // Check if already in sidebar
      const alreadyExists = prev.some(s => s.itemIds.includes(notification.channelId));
      if (alreadyExists) return prev;

      // Find uncategorized section
      const uncatIndex = prev.findIndex(s => s.id === "uncategorized");

      if (uncatIndex !== -1) {
        return prev.map(s =>
          s.id === "uncategorized"
            ? { ...s, itemIds: [notification.channelId, ...s.itemIds] }
            : s
        );
      }
      // Create uncategorized at top if it doesn't exist
      return [{
        id: "uncategorized",
        title: "Uncategorized",
        sortMode: "manual",
        isCollapsed: false,
        itemIds: [notification.channelId],
        isProtected: true
      }, ...prev];
    });

    // Remove the notification
    handleDismissNotification(notification.id);

    // Show toast
    showToast({
      message: `#${notification.channelName} added to sidebar`,
      type: "success"
    });
  };

  // Simulate notification for testing
  const simulateNotificationBar = (type) => {
    if (type === "mention") {
      addNotification(
        "mention",
        "design-reviews",
        "design-reviews",
        "You were mentioned"
      );
    } else if (type === "channelCreated") {
      // Use existing channels from directory that aren't in the sidebar
      const allItemIds = sections.flatMap(s => s.itemIds);
      const availableChannels = ["product-updates", "infrastructure", "marketing", "customer-feedback", "team-events", "engineering", "onboarding", "security-alerts", "sales", "support", "random"];
      const notInSidebar = availableChannels.filter(id => !allItemIds.includes(id));

      if (notInSidebar.length === 0) {
        showToast({ message: "All channels already in sidebar", type: "info" });
        return;
      }

      const channelId = notInSidebar[Math.floor(Math.random() * notInSidebar.length)];
      addNotification(
        "channelCreated",
        channelId,
        channelId,
        "New channel created"
      );
    }
  };

  // Expose simulation function to window for demo
  useEffect(() => {
    window.simulateNotificationBar = simulateNotificationBar;
    return () => {
      delete window.simulateNotificationBar;
    };
  }, [sections]);

  // Simulate a new DM appearing in the sidebar
  const simulateNewDM = () => {
    // Get unfollowed DMs from directory
    const allItemIds = sections.flatMap(s => s.itemIds);
    const unfollowedDMs = dmDirectory.filter(dm => !allItemIds.includes(dm.id));

    if (unfollowedDMs.length === 0) {
      showToast({ message: "All DMs already in sidebar", type: "info" });
      return;
    }

    // Pick a random unfollowed DM
    const dm = unfollowedDMs[Math.floor(Math.random() * unfollowedDMs.length)];
    const messageCount = Math.floor(Math.random() * 5) + 1; // 1-5 messages

    // Add to Uncategorized section
    setSections(prev => {
      const uncatIndex = prev.findIndex(s => s.id === "uncategorized");
      if (uncatIndex !== -1) {
        return prev.map(s =>
          s.id === "uncategorized"
            ? { ...s, itemIds: [dm.id, ...s.itemIds] }
            : s
        );
      }
      return [{
        id: "uncategorized",
        title: "Uncategorized",
        sortMode: "manual",
        isCollapsed: false,
        itemIds: [dm.id],
        isProtected: true
      }, ...prev];
    });

    // Set unread count
    setUnreadCounts(prev => ({ ...prev, [dm.id]: messageCount }));

    showToast({ message: `New DM from ${dm.name}`, type: "info" });
  };

  // Context menu handlers
  const handleOpenContextMenu = (menuState) => {
    setContextMenu(menuState);
    setMoveChannelMenu(null);
    setNotificationsMenu(null);
  };

  const handleMoveChannel = (channelId, targetSectionId) => {
    // Remove channel from all sections and ungrouped
    const newSections = sections.map(s => ({
      ...s,
      itemIds: s.itemIds.filter(id => id !== channelId)
    }));

    const newUngrouped = ungroupedItemIds.filter(id => id !== channelId);

    // Add to target section or ungrouped
    if (targetSectionId === null) {
      setUngroupedItemIds([...newUngrouped, channelId]);
      setSections(newSections);
    } else {
      const targetIndex = newSections.findIndex(s => s.id === targetSectionId);
      if (targetIndex !== -1) {
        newSections[targetIndex].itemIds.push(channelId);
      }
      setSections(newSections);
      setUngroupedItemIds(newUngrouped);
    }
  };

  const handleDeleteSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // Move section's items to ungrouped
    setUngroupedItemIds([...section.itemIds, ...ungroupedItemIds]);

    // Remove section
    setSections(sections.filter(s => s.id !== sectionId));
  };

  // Hide handler - removes item from sidebar
  const handleHideItem = (itemId) => {
    // Remove from all sections
    const newSections = sections.map(s => ({
      ...s,
      itemIds: s.itemIds.filter(id => id !== itemId)
    }));

    // Remove from ungrouped
    const newUngrouped = ungroupedItemIds.filter(id => id !== itemId);

    setSections(newSections);
    setUngroupedItemIds(newUngrouped);

    // Close any open menus
    setContextMenu(null);
    setMoveChannelMenu(null);
  };

  // Get all currently followed item IDs
  const getFollowedIds = () => {
    const followedIds = new Set();

    // Add from ungrouped
    ungroupedItemIds.forEach(id => followedIds.add(id));

    // Add from sections
    sections.forEach(section => {
      section.itemIds.forEach(id => followedIds.add(id));
    });

    return followedIds;
  };

  // Calculate unfollowed channels and DMs
  const followedIds = getFollowedIds();

  const unfollowedChannels = channelDirectory.filter(
    ch => !followedIds.has(ch.id)
  );

  const unfollowedDMs = dmDirectory.filter(
    dm => !followedIds.has(dm.id)
  );

  // Follow a channel - adds to Uncategorized section
  const handleFollowChannel = (channelId) => {
    // Check if already followed
    if (followedIds.has(channelId)) return;

    // Add to Uncategorized section
    setSections(prev => {
      const uncatIndex = prev.findIndex(s => s.id === "uncategorized");
      if (uncatIndex !== -1) {
        return prev.map(s =>
          s.id === "uncategorized"
            ? { ...s, itemIds: [channelId, ...s.itemIds] }
            : s
        );
      }
      // Create uncategorized at top if it doesn't exist
      return [{
        id: "uncategorized",
        title: "Uncategorized",
        sortMode: "manual",
        isCollapsed: false,
        itemIds: [channelId],
        isProtected: true
      }, ...prev];
    });
  };

  // Follow a DM - adds to Uncategorized section
  const handleFollowDM = (dmId) => {
    // Check if already followed
    if (followedIds.has(dmId)) return;

    // Add to Uncategorized section
    setSections(prev => {
      const uncatIndex = prev.findIndex(s => s.id === "uncategorized");
      if (uncatIndex !== -1) {
        return prev.map(s =>
          s.id === "uncategorized"
            ? { ...s, itemIds: [dmId, ...s.itemIds] }
            : s
        );
      }
      // Create uncategorized at top if it doesn't exist
      return [{
        id: "uncategorized",
        title: "Uncategorized",
        sortMode: "manual",
        isCollapsed: false,
        itemIds: [dmId],
        isProtected: true
      }, ...prev];
    });
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) {
      setDropIndicator(null);
      return;
    }

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Item drag
    if (activeType === "item") {
      const overSectionId = overType === "section"
        ? over.id
        : over.data.current?.sectionId;

      if (!overSectionId) {
        setDropIndicator(null);
        return;
      }

      const overSection = sections.find(s => s.id === overSectionId);
      if (!overSection) {
        setDropIndicator(null);
        return;
      }

      let insertIndex;
      if (overType === "section") {
        // Dropping on section header - add to end
        insertIndex = overSection.itemIds.length;
      } else {
        // Dropping on an item
        const overIndex = overSection.itemIds.indexOf(over.id);
        // Determine if we should insert before or after based on drag direction
        const isBelow = event.delta.y > 0;
        insertIndex = isBelow ? overIndex + 1 : overIndex;
      }

      setDropIndicator({
        type: "item",
        targetSectionId: overSectionId,
        index: insertIndex,
      });
      return;
    }

    // Section drag
    if (activeType === "section") {
      let targetSectionId = over.id;

      // If over an item, find its parent section
      if (overType === "item") {
        targetSectionId = over.data.current?.sectionId;
      }

      const overIndex = sections.findIndex(s => s.id === targetSectionId);
      if (overIndex === -1) {
        setDropIndicator(null);
        return;
      }

      // Determine if we should insert before or after
      const isBelow = event.delta.y > 0;
      const insertIndex = isBelow ? overIndex + 1 : overIndex;

      setDropIndicator({
        type: "section",
        index: insertIndex,
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setDropIndicator(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData) return;

    const activeType = activeData.type;
    const overType = overData?.type;

    // EPHEMERAL → SECTION (convert to persistent)
    if (activeType === "ephemeral" && ephemeralChannel) {
      // Find target section
      let targetSectionId = over.id;
      if (overType === "item") {
        targetSectionId = overData.sectionId;
      } else if (overType === "section") {
        targetSectionId = over.id;
      }

      // Add ephemeral channel to the target section
      if (targetSectionId) {
        setSections(prev => prev.map(s =>
          s.id === targetSectionId
            ? { ...s, itemIds: [ephemeralChannel.id, ...s.itemIds] }
            : s
        ));
        setEphemeralChannel(null);
      }
      return;
    }

    // SECTION → SECTION reordering
    if (activeType === "section") {
      // Prevent dragging Uncategorized section
      if (active.id === "uncategorized") return;

      let targetSectionId = over.id;

      // If over an item, find its parent section
      if (overType === "item") {
        targetSectionId = overData.sectionId;
      }

      const oldIndex = sections.findIndex(s => s.id === active.id);
      let newIndex = sections.findIndex(s => s.id === targetSectionId);

      if (oldIndex === -1 || newIndex === -1) return;

      // Don't allow moving to position 0 (Uncategorized must stay at top)
      if (newIndex === 0) newIndex = 1;

      // Adjust index if dragging down
      const finalIndex = oldIndex < newIndex ? newIndex : newIndex;

      setSections(arrayMove(sections, oldIndex, finalIndex));
      return;
    }

    // ITEM → ITEM / ITEM → SECTION (reassign section + order)
    if (activeType === "item") {
      const activeSectionId = activeData.sectionId;
      const overSectionId = overType === "section" ? over.id : overData?.sectionId;

      if (!activeSectionId || !overSectionId) return;

      setSections((prevSections) => {
        // Find source and destination sections
        const activeSection = prevSections.find(s => s.id === activeSectionId);
        const overSection = prevSections.find(s => s.id === overSectionId);

        if (!activeSection || !overSection) return prevSections;

        const activeIndex = activeSection.itemIds.indexOf(active.id);

        // Calculate insertion index
        let insertIndex;
        if (overType === "section") {
          // Dropping on section header - add at the end
          insertIndex = overSection.itemIds.length;
        } else {
          // Dropping on an item
          const overIndex = overSection.itemIds.indexOf(over.id);
          if (overIndex === -1) return prevSections;

          // Use the same logic as handleDragOver for consistency
          insertIndex = overIndex;
        }

        // Moving within same section
        if (activeSectionId === overSectionId) {
          const newItemIds = arrayMove(activeSection.itemIds, activeIndex, insertIndex);
          return prevSections.map(section =>
            section.id === activeSectionId
              ? { ...section, itemIds: newItemIds }
              : section
          );
        }

        // Moving between different sections
        const newActiveItems = activeSection.itemIds.filter(id => id !== active.id);
        const newOverItems = [...overSection.itemIds];

        // If target section has non-manual sort mode, just add to end
        if (overSection.sortMode && overSection.sortMode !== "manual") {
          newOverItems.push(active.id);
        } else {
          newOverItems.splice(insertIndex, 0, active.id);
        }

        return prevSections.map(section => {
          if (section.id === activeSectionId) {
            return { ...section, itemIds: newActiveItems };
          }
          if (section.id === overSectionId) {
            return { ...section, itemIds: newOverItems };
          }
          return section;
        });
      });
    }
  };

  // Helper to get item by ID
  const getItemById = (itemId) => {
    // First check the props (currently followed items with full data)
    const channel = channels.find(c => c.id === itemId);
    if (channel) return { ...channel, type: "channel" };
    const dm = dms.find(d => d.id === itemId);
    if (dm) return { ...dm, type: "dm" };

    // Fall back to directory (for newly followed items)
    const dirChannel = channelDirectory.find(c => c.id === itemId);
    if (dirChannel) return { ...dirChannel, type: "channel" };
    const dirDM = dmDirectory.find(d => d.id === itemId);
    if (dirDM) return { ...dirDM, type: "dm", preview: "" }; // DMs from directory may not have preview

    return null;
  };

  // Helper to check if item matches search query
  const itemMatchesSearch = (item, query) => {
    if (!query) return true; // Show all items when no search query
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    if (item.type === "channel") {
      return item.label.toLowerCase().includes(normalizedQuery);
    } else if (item.type === "dm") {
      return item.name.toLowerCase().includes(normalizedQuery);
    }
    return false;
  };

  // Generate context menu items based on type
  const getContextMenuItems = () => {
    if (!contextMenu) return [];

    if (contextMenu.type === "channel") {
      return [
        {
          key: "view-settings",
          label: "View channel settings",
          onClick: () => console.log("View settings", contextMenu.id)
        },
        {
          key: "edit-notifications",
          label: "Edit notifications",
          submenu: true
        },
        {
          key: "move-channel",
          label: "Move",
          submenu: true
        },
        { key: "sep-1", isSeparator: true },
        {
          key: "delete",
          label: "Delete",
          danger: true,
          onClick: () => console.log("Delete channel", contextMenu.id)
        },
        {
          key: "unfollow",
          label: "Hide",
          onClick: () => console.log("Hide", contextMenu.id)
        }
      ];
    }

    if (contextMenu.type === "dm") {
      // Check if it's a group DM (name contains comma = multiple people)
      const isGroupDM = contextMenu.label && contextMenu.label.includes(",");

      const items = [
        {
          key: "view-conv-settings",
          label: "View DM settings",
          onClick: () => console.log("View DM settings", contextMenu.id)
        }
      ];

      // Only show "Edit notifications" for group DMs
      if (isGroupDM) {
        items.push({
          key: "edit-notifications",
          label: "Edit notifications",
          submenu: true
        });
      }

      items.push(
        { key: "sep-1", isSeparator: true },
        {
          key: "unfollow-dm",
          label: "Hide",
          onClick: () => console.log("Hide DM", contextMenu.id)
        }
      );

      return items;
    }

    if (contextMenu.type === "section") {
      const section = sections.find(s => s.id === contextMenu.id);
      const isProtected = section?.isProtected;

      const items = [];

      if (!isProtected) {
        items.push({
          key: "edit-section",
          label: "Edit section",
          onClick: () => {
            setEditSection({
              sectionId: contextMenu.id,
              sectionTitle: section.title
            });
            setContextMenu(null);
          }
        });
      }

      items.push({
        key: "sort-section",
        label: "Sort section",
        submenu: true
      });

      if (!isProtected) {
        items.push({
          key: "delete-section",
          label: "Delete section",
          danger: true,
          onClick: () => handleDeleteSectionConfirm(contextMenu.id)
        });
      }

      items.push(
        { key: "sep-1", isSeparator: true },
        {
          key: "create-section",
          label: "Create section",
          onClick: () => setShowCreateDialog(true)
        },
        {
          key: "create-channel",
          label: "Create channel",
          onClick: () => onStartCreateChannel && onStartCreateChannel()
        },
        {
          key: "create-dm",
          label: "Create direct message",
          onClick: () => setShowCreateDMDialog(true)
        }
      );

      return items;
    }

    return [];
  };

  // Generate move channel submenu items
  const getMoveChannelItems = () => {
    const items = [
      {
        key: "no-section",
        label: "No section",
        onClick: () => handleMoveChannel(moveChannelMenu.channelId, null)
      },
      { key: "sep-sections", isSeparator: true }
    ];

    sections.forEach(section => {
      items.push({
        key: section.id,
        label: section.title,
        onClick: () => handleMoveChannel(moveChannelMenu.channelId, section.id)
      });
    });

    items.push({ key: "sep-end", isSeparator: true });
    items.push({
      key: "create-section",
      label: "Create new section…",
      onClick: () => {
        setShowCreateDialog(true);
        // TODO: After section is created, move channel to it
      }
    });

    return items;
  };

  // Generate notification submenu items
  const getNotificationItems = () => {
    const itemId = notificationsMenu?.itemId;
    const currentSetting = notificationSettings[itemId] || "all-messages";

    const checkmark = "✓";

    return [
      {
        key: "all-messages",
        label: "All messages and threads you follow",
        icon: currentSetting === "all-messages" ? checkmark : null,
        onClick: () => {
          setNotificationSettings(prev => ({ ...prev, [itemId]: "all-messages" }));
          console.log("Set notifications: all messages", itemId);
        }
      },
      {
        key: "mentions-only",
        label: "Only @mentions",
        icon: currentSetting === "mentions-only" ? checkmark : null,
        onClick: () => {
          setNotificationSettings(prev => ({ ...prev, [itemId]: "mentions-only" }));
          console.log("Set notifications: mentions only", itemId);
        }
      },
      {
        key: "none",
        label: "None",
        icon: currentSetting === "none" ? checkmark : null,
        onClick: () => {
          setNotificationSettings(prev => ({ ...prev, [itemId]: "none" }));
          console.log("Set notifications: none", itemId);
        }
      }
    ];
  };

  // Generate sort section submenu items
  const getSortSectionItems = () => {
    const sectionId = sortSectionMenu?.sectionId;
    const section = sections.find(s => s.id === sectionId);
    const currentMode = section?.sortMode || "manual";

    return [
      {
        key: "abc",
        label: "ABC",
        selected: currentMode === "abc",
        onClick: () => {
          handleChangeSortMode(sectionId, "abc");
          setSortSectionMenu(null);
          setContextMenu(null);
        }
      },
      {
        key: "lastMessage",
        label: "Newest message",
        selected: currentMode === "lastMessage",
        onClick: () => {
          handleChangeSortMode(sectionId, "lastMessage");
          setSortSectionMenu(null);
          setContextMenu(null);
        }
      },
      {
        key: "manual",
        label: "Custom",
        selected: currentMode === "manual",
        onClick: () => {
          handleChangeSortMode(sectionId, "manual");
          setSortSectionMenu(null);
          setContextMenu(null);
        }
      }
    ];
  };

  // Render a channel item
  const renderChannelItem = (channel, sectionId) => (
    <DraggableItem key={channel.id} id={channel.id} sectionId={sectionId}>
      <li
        className={
          "sidebar-item" +
          (channel.id === activeChannelId ? " active" : "")
        }
        onClick={() => handleChannelSelect(channel.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          handleOpenContextMenu({
            type: "channel",
            id: channel.id,
            label: channel.label,
            x: e.clientX,
            y: e.clientY
          });
        }}
      >
        <span
          className={
            "sidebar-icon " +
            (channel.iconType === "hash" ? "hash" : "bolt")
          }
        >
          {channel.iconType === "hash" ? (
            "#"
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 2L4 9h4l-1 5 5-7H8l1-5z" />
            </svg>
          )}
        </span>
        <span>{channel.label}</span>
        <Tooltip text="Hide channel.
@mentions still notify you.">
          <button
            type="button"
            className="sidebar-item-unfollow"
            aria-label={`Hide ${channel.label}`}
            onClick={(e) => {
              e.stopPropagation();
              handleHideItem(channel.id);
            }}
          >
            ×
          </button>
        </Tooltip>
      </li>
    </DraggableItem>
  );

  // Render a DM item
  const renderDMItem = (dm, sectionId) => {
    const isGroupDM = dm.name.includes(',');
    const unreadCount = unreadCounts[dm.id] || 0;

    return (
      <DraggableItem key={dm.id} id={dm.id} sectionId={sectionId}>
        <div
          className={`dm-item ${unreadCount > 0 ? "dm-item--unread" : ""}`}
          onClick={() => {
            // Clear unread when clicked
            if (unreadCount > 0) {
              setUnreadCounts(prev => {
                const next = { ...prev };
                delete next[dm.id];
                return next;
              });
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            handleOpenContextMenu({
              type: "dm",
              id: dm.id,
              label: dm.name,
              x: e.clientX,
              y: e.clientY
            });
          }}
        >
          {isGroupDM ? (
            <div className="avatar avatar-group-icon">
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="12" fill="#E5E7EB" />
                <path
                  d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
                  fill="#6B7280"
                />
                <path
                  d="M15 10C16.1046 10 17 9.10457 17 8C17 6.89543 16.1046 6 15 6C13.8954 6 13 6.89543 13 8C13 9.10457 13.8954 10 15 10Z"
                  fill="#6B7280"
                />
                <path
                  d="M9 11C6.79086 11 5 12.7909 5 15V16C5 16.5523 5.44772 17 6 17H12C12.5523 17 13 16.5523 13 16V15C13 12.7909 11.2091 11 9 11Z"
                  fill="#6B7280"
                />
                <path
                  d="M15 11C14.0681 11 13.2088 11.2922 12.5039 11.7859C13.4225 12.6185 14 13.8228 14 15V16C14 16.3506 13.9398 16.6872 13.8293 17H18C18.5523 17 19 16.5523 19 16V15C19 12.7909 17.2091 11 15 11Z"
                  fill="#6B7280"
                />
              </svg>
            </div>
          ) : (
            <div className={`avatar ${dm.avatarColor}`}>
              {dm.avatarUrl ? (
                <img src={dm.avatarUrl} alt={dm.name} />
              ) : (
                dm.initials
              )}
              <div
                className={
                  "status-dot " + (dm.status === "online" ? "" : "away")
                }
              />
            </div>
          )}
          <div className="dm-text">
            <div className="dm-name">{dm.name}</div>
            <div className="dm-preview">{dm.preview}</div>
          </div>

          {/* Unread badge - positioned on right */}
          {unreadCount > 0 ? (
            <span className="dm-unread-badge">{unreadCount}</span>
          ) : (
            <Tooltip text="Hide DM. New messages
will bring it back." variant="dm">
              <button
                type="button"
                className="sidebar-item-unfollow"
                aria-label={`Hide ${dm.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHideItem(dm.id);
                }}
              >
                ×
              </button>
            </Tooltip>
          )}
        </div>
      </DraggableItem>
    );
  };

  // Compute ungrouped channel IDs: all channels not in any section
  const allSectionChannelIds = sections.flatMap(s => s.itemIds);
  const computedUngroupedChannelIds = channels
    .map(c => c.id)
    .filter(id => !allSectionChannelIds.includes(id));

  // Combine manually ungrouped items with computed ungrouped channels
  const actualUngroupedIds = [...new Set([...ungroupedItemIds, ...computedUngroupedChannelIds])];

  return (
    <aside className="sidebar">
      {/* Workspace name with badge */}
      <div className="workspace-header-sidebar">
        <div className="workspace-info">
          <span className="workspace-name">Kewl</span>
          <span className="workspace-badge">9+</span>
        </div>

        <div className="workspace-header-actions">
          {/* Composer pencil button */}
          <button
            ref={composerBtnRef}
            type="button"
            className="workspace-icon-btn composer-btn"
            aria-haspopup="menu"
            aria-expanded={showComposerMenu}
            aria-label="New…"
            onClick={() => setShowComposerMenu(!showComposerMenu)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M5 17.5L6.5 13l7.8-7.8a1.5 1.5 0 012.1 0l1.4 1.4a1.5 1.5 0 010 2.1L10 16.5 5 17.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 20h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Kebab menu button */}
          <button
            type="button"
            className="workspace-menu-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>

          {/* Composer menu dropdown */}
          {showComposerMenu && (
            <div
              ref={composerMenuRef}
              className="composer-menu-dropdown"
              role="menu"
            >
              <button
                type="button"
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  onStartCreateChannel && onStartCreateChannel();
                  setShowComposerMenu(false);
                }}
              >
                <span className="menu-icon">#</span>
                <span className="menu-label">Create channel</span>
              </button>

              <button
                type="button"
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setShowCreateDMDialog(true);
                  setShowComposerMenu(false);
                }}
              >
                <span className="menu-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="menu-label">Create direct message</span>
              </button>

              <button
                type="button"
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setShowCreateDialog(true);
                  setShowComposerMenu(false);
                }}
              >
                <span className="menu-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <line
                      x1="3"
                      y1="9"
                      x2="21"
                      y2="9"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                <span className="menu-label">Create section</span>
              </button>
            </div>
          )}

          {/* Kebab menu dropdown */}
          {showMenu && (
            <div className="workspace-menu-dropdown">
              <button
                className="menu-item"
                onClick={() => {
                  setShowKernelScreen(true);
                  setShowMenu(false);
                }}
              >
                <span className="menu-item-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                    <circle cx="12" cy="4" r="2" fill="currentColor" />
                    <circle cx="12" cy="20" r="2" fill="currentColor" />
                    <circle cx="4" cy="12" r="2" fill="currentColor" />
                    <circle cx="20" cy="12" r="2" fill="currentColor" />
                    <circle cx="6.34" cy="6.34" r="1.5" fill="currentColor" />
                    <circle cx="17.66" cy="6.34" r="1.5" fill="currentColor" />
                    <circle cx="6.34" cy="17.66" r="1.5" fill="currentColor" />
                    <circle cx="17.66" cy="17.66" r="1.5" fill="currentColor" />
                  </svg>
                </span>
                <span className="menu-item-label">Setup your Kernel...</span>
              </button>
              <button
                className="menu-item menu-item--toggle"
                onClick={toggleTheme}
              >
                <span className="menu-item-icon">🌙</span>
                <span className="menu-item-label">Dark mode</span>
                <span className={`menu-toggle ${isDark ? "menu-toggle--on" : ""}`}>
                  <span className="menu-toggle-track">
                    <span className="menu-toggle-thumb"></span>
                  </span>
                </span>
              </button>
              <div className="menu-separator" />
              <div className="menu-section-label">Demo triggers</div>
              <button
                className="menu-item"
                onClick={() => {
                  simulateNotificationBar("mention");
                  setShowMenu(false);
                }}
              >
                <span className="menu-item-icon">@</span>
                <span className="menu-item-label">Simulate @mention</span>
              </button>
              <button
                className="menu-item"
                onClick={() => {
                  simulateNotificationBar("channelCreated");
                  setShowMenu(false);
                }}
              >
                <span className="menu-item-icon">#</span>
                <span className="menu-item-label">Simulate new channel</span>
              </button>
              <button
                className="menu-item"
                onClick={() => {
                  simulateNewDM();
                  setShowMenu(false);
                }}
              >
                <span className="menu-item-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="menu-item-label">Simulate new DM</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Bar - at top of sidebar */}
      <NotificationBar
        notifications={notifications}
        onAddToSidebar={handleAddFromNotification}
        onDismiss={handleDismissNotification}
      />

      {/* Search bar */}
      <SidebarSearchBar
        value={sidebarSearch}
        onChange={setSidebarSearch}
      />

      {/* Fixed "+ Add to sidebar" button - not draggable */}
      <button
        className="follow-channel-button"
        onClick={() => setShowFollowDialog(true)}
      >
        <span className="follow-channel-plus">+</span>
        <span className="follow-channel-text">Add to sidebar</span>
      </button>

      {/* Ungrouped items (no section header) */}
      {actualUngroupedIds.length > 0 && (
        <div className="sidebar-ungrouped-items">
          {actualUngroupedIds
            .map((itemId) => getItemById(itemId))
            .filter((item) => item && itemMatchesSearch(item, sidebarSearch))
            .map((item) => {
              if (item.type === "channel") {
                return renderChannelItem(item, null);
              } else if (item.type === "dm") {
                return renderDMItem(item, null);
              }
              return null;
            })}
        </div>
      )}

      {/* Ephemeral Notification Banner */}
      {ephemeralNotification && (
        <EphemeralChannelNotification
          channel={ephemeralNotification}
          onOpen={handleOpenEphemeral}
        />
      )}

      {/* Sections with drag and drop */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Ephemeral Channel Entry (above sections, inside DndContext for drag support) */}
        {ephemeralChannel && (
          <EphemeralChannelEntry
            channel={ephemeralChannel}
            onAdd={handleAddEphemeralToSidebar}
            onSelect={handleSelectEphemeralChannel}
            isSelected={activeChannelId === ephemeralChannel.id}
          />
        )}

        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="sidebar-sections">
            {sections.map((section, sectionIndex) => {
              // Get sorted item IDs for this section
              const sortedIds = getSortedItemIds(section);

              return (
                <React.Fragment key={section.id}>
                  {/* Drop line before this section */}
                  {dropIndicator &&
                    dropIndicator.type === "section" &&
                    dropIndicator.index === sectionIndex && (
                      <div className="sidebar-drop-line sidebar-drop-line--section" />
                    )}

                  <CollapsibleSection
                    section={section}
                    onToggle={() => handleToggleSection(section.id)}
                    dropIndicator={dropIndicator}
                    onContextMenu={(e, section) => {
                      handleOpenContextMenu({
                        type: "section",
                        id: section.id,
                        title: section.title,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onChangeSortMode={handleChangeSortMode}
                    onOpenMenu={handleOpenSectionMenu}
                    sortedItemIds={sortedIds}
                  >
                    {sortedIds
                      .map((itemId) => getItemById(itemId))
                      .filter((item) => item && itemMatchesSearch(item, sidebarSearch))
                      .map((item) => {
                        if (item.type === "channel") {
                          return renderChannelItem(item, section.id);
                        } else if (item.type === "dm") {
                          return renderDMItem(item, section.id);
                        }
                        return null;
                      })}
                  </CollapsibleSection>
                </React.Fragment>
              );
            })}

            {/* Drop line at the end of all sections */}
            {dropIndicator &&
              dropIndicator.type === "section" &&
              dropIndicator.index === sections.length && (
                <div className="sidebar-drop-line sidebar-drop-line--section" />
              )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Create section dialog */}
      {showCreateDialog && (
        <SectionDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreateSection}
        />
      )}

      {/* Create DM dialog */}
      {showCreateDMDialog && (
        <DMDialog
          onClose={() => setShowCreateDMDialog(false)}
          onCreate={handleCreateDM}
        />
      )}

      {/* Delete section confirmation dialog */}
      <DeleteSectionDialog
        isOpen={!!deleteConfirm}
        sectionTitle={deleteConfirm?.sectionTitle || ""}
        itemCount={sections.find(s => s.id === deleteConfirm?.sectionId)?.itemIds?.length || 0}
        onDeleteHeader={handleDeleteSectionHeader}
        onDeleteAll={handleDeleteSectionAndContents}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Edit section dialog */}
      <SectionEditDialog
        isOpen={!!editSection}
        sectionTitle={editSection?.sectionTitle || ""}
        onSave={(newTitle) => {
          if (editSection) {
            handleRenameSection(editSection.sectionId, newTitle);
          }
          setEditSection(null);
        }}
        onCancel={() => setEditSection(null)}
      />

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => {
            setContextMenu(null);
            setMoveChannelMenu(null);
            setNotificationsMenu(null);
          }}
          onOpenSubmenu={(item, rect) => {
            if (item.key === "move-channel" && contextMenu.type === "channel") {
              setMoveChannelMenu({
                channelId: contextMenu.id,
                anchorRect: rect
              });
              setNotificationsMenu(null);
              setSortSectionMenu(null);
            } else if (item.key === "edit-notifications") {
              setNotificationsMenu({
                itemId: contextMenu.id,
                anchorRect: rect
              });
              setMoveChannelMenu(null);
              setSortSectionMenu(null);
            } else if (item.key === "sort-section" && contextMenu.type === "section") {
              setSortSectionMenu({
                sectionId: contextMenu.id,
                anchorRect: rect
              });
              setMoveChannelMenu(null);
              setNotificationsMenu(null);
            }
          }}
          onCloseSubmenu={() => {
            setMoveChannelMenu(null);
            setNotificationsMenu(null);
            setSortSectionMenu(null);
          }}
        />
      )}

      {/* Move channel submenu */}
      {moveChannelMenu && (
        <ContextMenu
          x={moveChannelMenu.anchorRect ? moveChannelMenu.anchorRect.right + 4 : 0}
          y={moveChannelMenu.anchorRect ? moveChannelMenu.anchorRect.top : 0}
          items={getMoveChannelItems()}
          onClose={() => setMoveChannelMenu(null)}
        />
      )}

      {/* Notifications submenu */}
      {notificationsMenu && (
        <ContextMenu
          x={notificationsMenu.anchorRect ? notificationsMenu.anchorRect.right + 4 : 0}
          y={notificationsMenu.anchorRect ? notificationsMenu.anchorRect.top : 0}
          items={getNotificationItems()}
          onClose={() => setNotificationsMenu(null)}
        />
      )}

      {/* Sort section submenu */}
      {sortSectionMenu && (
        <ContextMenu
          x={sortSectionMenu.anchorRect ? sortSectionMenu.anchorRect.right + 4 : 0}
          y={sortSectionMenu.anchorRect ? sortSectionMenu.anchorRect.top : 0}
          items={getSortSectionItems()}
          onClose={() => setSortSectionMenu(null)}
        />
      )}

      {/* Follow dialog */}
      <FollowDialog
        isOpen={showFollowDialog}
        onClose={() => setShowFollowDialog(false)}
        channels={channelDirectory}
        dms={dmDirectory}
        followedIds={followedIds}
        onFollowChannel={handleFollowChannel}
        onFollowDM={handleFollowDM}
      />

      {/* Knowledge Kernel configuration screen */}
      <KnowledgeKernelScreen
        isOpen={showKernelScreen}
        onClose={() => setShowKernelScreen(false)}
      />
      </aside>
  );
}

export default Sidebar;
