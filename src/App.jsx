// src/App.jsx
import { useState } from "react";
import "./App.css";
import { channels, dms } from "./mockData";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Header from "./components/Header";

function App() {
  const [activeChannelId, setActiveChannelId] = useState("bug-triaging");
  const [activeSection, setActiveSection] = useState("chats"); // "chats" | "app"

  const activeChannel =
    channels.find((c) => c.id === activeChannelId) || channels[0];

  return (
    <div className="app-shell">
      <Header
        activeSection={activeSection}
        onChangeSection={setActiveSection}
      />

      <div className="app-root">
        {activeSection === "chats" ? (
          <>
            <Sidebar
              channels={channels}
              dms={dms}
              activeChannelId={activeChannelId}
              onSelectChannel={setActiveChannelId}
            />
            <ChatWindow channel={activeChannel} />
          </>
        ) : (
          // Simple placeholder for App Platform
          <div className="app-platform-placeholder">
            <h2>App Platform</h2>
            <p>
              This is a placeholder view for your App Platform. You can wire in
              whatever UI you want here later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
