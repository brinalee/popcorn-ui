// src/components/Sidebar.jsx
import React from "react";

function Sidebar({ channels, dms, activeChannelId, onSelectChannel }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header-row">
        <h2 className="sidebar-section-title">Follow channel</h2>
        <button className="sidebar-add-button">+</button>
      </div>

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
              {channel.iconType === "hash" ? "#" : "⚡"}
            </span>
            <span>{channel.label}</span>
          </li>
        ))}
      </ul>

      <h2 className="sidebar-section-title" style={{ marginBottom: 8 }}>
        Direct message
      </h2>

      <div>
        {dms.map((dm, index) => (
          <div
            key={dm.id}
            className={"dm-item" + (index === 1 ? " active" : "")}
          >
            <div className={`avatar ${dm.avatarColor}`}>
              {dm.initials}
              <div
                className={
                  "status-dot " + (dm.status === "online" ? "" : "away")
                }
              />
            </div>
            <div className="dm-text">
              <div className="dm-name">{dm.name}</div>
              <div className="dm-preview">{dm.preview}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
