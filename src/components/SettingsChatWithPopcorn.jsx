// src/components/SettingsChatWithPopcorn.jsx
import { useState } from "react";
import ChannelConversation from "./ChannelConversation";

function SettingsChatWithPopcorn({ channelName }) {
  const [messages, setMessages] = useState([
    {
      id: "m1",
      authorId: "popcorn",
      authorName: "Popcorn",
      senderType: "ai",
      createdAt: new Date().toISOString(),
      text: `Hi! I can help you configure #${channelName}.\n\nTry things like:\n• "Summarize GitHub deploys once a day"\n• "Turn off auto-chime in this channel"\n• "Add a webhook for PagerDuty incidents"`,
    },
    {
      id: "m2",
      authorId: "popcorn",
      authorName: "Popcorn",
      senderType: "ai",
      createdAt: new Date().toISOString(),
      text: "Right now this is just a prototype, but imagine I can update your instructions, webhooks, and notification settings based on this chat.\n\nOnce we connect this to a real backend, you'll be able to configure everything conversationally!",
    },
  ]);

  const [isResponding, setIsResponding] = useState(false);
  const currentUserId = "settings-user";

  const handleSendMessage = (text) => {
    if (!text.trim() || isResponding) return;

    const now = new Date().toISOString();
    const userMsg = {
      id: `user_${Date.now()}`,
      authorId: currentUserId,
      authorName: "You",
      senderType: "human",
      createdAt: now,
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsResponding(true);

    // Mock Popcorn reply after a delay
    setTimeout(() => {
      const reply = {
        id: `popcorn_${Date.now()}`,
        authorId: "popcorn",
        authorName: "Popcorn",
        senderType: "ai",
        createdAt: new Date().toISOString(),
        text: "Got it! In a future version I'd update this channel's settings based on that.\n\nFor now, this is just a demo of what a 'Chat with Popcorn' experience could feel like.",
      };

      setMessages((prev) => [...prev, reply]);
      setIsResponding(false);
    }, 800);
  };

  return (
    <section className="settings-section settings-chat-section">
      <h2 className="settings-section-title">Chat with Popcorn</h2>
      <p className="settings-section-help">
        Ask Popcorn to help you configure this channel. This prototype chat uses
        the same UI as your channels but doesn't yet change real settings.
      </p>

      <div className="settings-chat-conversation">
        <ChannelConversation
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          placeholder={`Ask Popcorn to configure #${channelName}…`}
        />
      </div>
    </section>
  );
}

export default SettingsChatWithPopcorn;
