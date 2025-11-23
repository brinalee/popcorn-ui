// src/components/Sidebar.jsx
import React, { useState } from "react";

function Sidebar({ channels, dms, activeChannelId, onSelectChannel }) {
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState("light");

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    setShowMenu(false);
    // You can add logic here to actually change the theme
    console.log("Theme changed to:", newTheme);
  };

  return (
    <aside className="sidebar">
      {/* Workspace name with badge */}
      <div className="workspace-header-sidebar">
        <div className="workspace-info">
          <span className="workspace-name">Kewl</span>
          <span className="workspace-badge">9+</span>
        </div>
        <button
          className="workspace-menu-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          ⋮
        </button>

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

      <button className="follow-channel-button">
        <span className="follow-channel-plus">+</span>
        <span className="follow-channel-text">Follow channel</span>
      </button>

      <ul className="sidebar-list">
        {channels.map((channel) => (
          <li
            key={channel.id}
            className={
              "sidebar-item" +
              (channel.id === activeChannelId ? " active" : "")
            }
            onClick={() => onSelectChannel(channel.id)}
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
          </li>
        ))}
      </ul>

      <button className="follow-channel-button">
        <span className="follow-channel-plus">+</span>
        <span className="follow-channel-text">Direct message</span>
      </button>

      <div className="dm-list">
        {dms.map((dm) => {
          const isGroupDM = dm.name.includes(',');

          return (
            <div
              key={dm.id}
              className="dm-item"
            >
              {isGroupDM ? (
                // Group DM: Group icon, no status indicator
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
                // Single person DM: Single avatar with status indicator
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
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
