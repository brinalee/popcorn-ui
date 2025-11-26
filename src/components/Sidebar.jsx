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

function Sidebar({ channels, dms, activeChannelId, onSelectChannel, onStartCreateChannel }) {
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState("light");
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
  const [showFollowDialog, setShowFollowDialog] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({});
  const [sidebarSearch, setSidebarSearch] = useState("");

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

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    setShowMenu(false);
    console.log("Theme changed to:", newTheme);
  };

  const handleCreateDM = (name) => {
    console.log("Create DM:", name);
    // TODO: Add DM creation logic
  };

  const handleCreateSection = (name) => {
    const newSection = {
      id: `sec-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      title: name,
      isCollapsed: false,
      itemIds: []
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

  // Follow a channel - adds to ungrouped at top
  const handleFollowChannel = (channelId) => {
    // Check if already followed
    if (followedIds.has(channelId)) return;

    // Add to top of ungrouped
    setUngroupedItemIds([channelId, ...ungroupedItemIds]);
  };

  // Follow a DM - adds to ungrouped at top
  const handleFollowDM = (dmId) => {
    // Check if already followed
    if (followedIds.has(dmId)) return;

    // Add to top of ungrouped
    setUngroupedItemIds([dmId, ...ungroupedItemIds]);
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

    // SECTION → SECTION reordering
    if (activeType === "section") {
      let targetSectionId = over.id;

      // If over an item, find its parent section
      if (overType === "item") {
        targetSectionId = overData.sectionId;
      }

      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === targetSectionId);

      if (oldIndex === -1 || newIndex === -1) return;

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
        newOverItems.splice(insertIndex, 0, active.id);

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
      return [
        {
          key: "view-conv-settings",
          label: "View DM settings",
          onClick: () => console.log("View DM settings", contextMenu.id)
        },
        {
          key: "edit-notifications",
          label: "Edit notifications",
          submenu: true
        },
        { key: "sep-1", isSeparator: true },
        {
          key: "unfollow-dm",
          label: "Hide",
          onClick: () => console.log("Hide DM", contextMenu.id)
        }
      ];
    }

    if (contextMenu.type === "section") {
      return [
        {
          key: "edit-section",
          label: "Edit section",
          onClick: () => console.log("Edit section", contextMenu.id)
        },
        {
          key: "delete-section",
          label: "Delete section",
          danger: true,
          onClick: () => handleDeleteSection(contextMenu.id)
        },
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
      ];
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

  // Render a channel item
  const renderChannelItem = (channel, sectionId) => (
    <DraggableItem key={channel.id} id={channel.id} sectionId={sectionId}>
      <li
        className={
          "sidebar-item" +
          (channel.id === activeChannelId ? " active" : "")
        }
        onClick={() => onSelectChannel(channel.id)}
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

    return (
      <DraggableItem key={dm.id} id={dm.id} sectionId={sectionId}>
        <div
          className="dm-item"
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
                onClick={() => toggleTheme("light")}
              >
                {theme === "light" && "✓ "}Light mode
              </button>
              <button
                className="menu-item"
                onClick={() => toggleTheme("dark")}
              >
                {theme === "dark" && "✓ "}Dark mode
              </button>
            </div>
          )}
        </div>
      </div>

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

      {/* Sections with drag and drop */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="sidebar-sections">
            {sections.map((section, sectionIndex) => (
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
                >
                  {section.itemIds
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
            ))}

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
            } else if (item.key === "edit-notifications") {
              setNotificationsMenu({
                itemId: contextMenu.id,
                anchorRect: rect
              });
              setMoveChannelMenu(null);
            }
          }}
          onCloseSubmenu={() => {
            setMoveChannelMenu(null);
            setNotificationsMenu(null);
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

      {/* Follow dialog */}
      <FollowDialog
        isOpen={showFollowDialog}
        onClose={() => setShowFollowDialog(false)}
        channels={unfollowedChannels}
        dms={unfollowedDMs}
        onFollowChannel={handleFollowChannel}
        onFollowDM={handleFollowDM}
      />
    </aside>
  );
}

export default Sidebar;
