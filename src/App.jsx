// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import ChannelScreen from "./components/ChannelScreen";

function App() {
  const [activeSection, setActiveSection] = useState("chats"); // "chats" | "app"

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header
          activeSection={activeSection}
          onChangeSection={setActiveSection}
        />

        <div className="app-root">
          {activeSection === "chats" ? (
            <Routes>
              <Route path="/" element={<Navigate to="/channel/bug-triaging" replace />} />
              <Route path="/channel/:channelId" element={<ChannelScreen />} />
              <Route path="/channel/:channelId/thread/:threadId" element={<ChannelScreen />} />
            </Routes>
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
    </BrowserRouter>
  );
}

export default App;
