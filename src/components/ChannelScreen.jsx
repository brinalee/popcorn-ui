// src/components/ChannelScreen.jsx
import { useParams, useNavigate } from "react-router-dom";
import { channels, dms } from "../mockData";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

function ChannelScreen() {
  const { channelId, threadId } = useParams();
  const navigate = useNavigate();

  const activeChannel =
    channels.find((c) => c.id === channelId) || channels[0];

  const handleSelectChannel = (newChannelId) => {
    navigate(`/channel/${newChannelId}`);
  };

  return (
    <>
      <Sidebar
        channels={channels}
        dms={dms}
        activeChannelId={channelId}
        onSelectChannel={handleSelectChannel}
      />
      <ChatWindow channel={activeChannel} threadId={threadId} />
    </>
  );
}

export default ChannelScreen;
