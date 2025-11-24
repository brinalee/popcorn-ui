// src/components/ReplySummaryRow.jsx
import { useNavigate, useParams } from "react-router-dom";

function ReplySummaryRow({ replySummary }) {
  const navigate = useNavigate();
  const { channelId } = useParams();

  if (!replySummary) return null;

  const handleClick = () => {
    navigate(`/channel/${channelId}/thread/${replySummary.threadId}`);
  };

  const formatTime = (isoTimestamp) => {
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <button
      type="button"
      className="reply-summary"
      onClick={handleClick}
      aria-label={`View ${replySummary.replyCount} ${replySummary.replyCount === 1 ? 'reply' : 'replies'}`}
    >
      <div className="reply-summary-text">
        <span className="reply-summary-count">
          {replySummary.replyCount} {replySummary.replyCount === 1 ? 'reply' : 'replies'}
        </span>
        <span className="reply-summary-time">
          {formatTime(replySummary.lastReplyAt)}
        </span>
      </div>
    </button>
  );
}

export default ReplySummaryRow;
