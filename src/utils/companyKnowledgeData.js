// src/utils/companyKnowledgeData.js
// Shared data layer for Company Knowledge panel and ConnectorsDialog

// Base connector definitions
export const CONNECTORS = [
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "folder",
    description: "Access and search your Google Drive files",
    category: "storage",
    recommended: true
  },
  {
    id: "github",
    name: "GitHub",
    icon: "octopus",
    description: "Connect repositories, issues, and PRs",
    category: "development",
    recommended: true
  },
  {
    id: "linear",
    name: "Linear",
    icon: "diamond",
    description: "Access issues, projects, and roadmaps",
    category: "productivity",
    recommended: true
  },
  {
    id: "notion",
    name: "Notion",
    icon: "memo",
    description: "Search pages, databases, and docs",
    category: "productivity",
    recommended: true
  },
  {
    id: "figma",
    name: "Figma",
    icon: "art",
    description: "Access designs and design systems",
    category: "development",
    recommended: false
  },
  {
    id: "slack",
    name: "Slack",
    icon: "speech",
    description: "Search messages and channels",
    category: "communication",
    recommended: false
  },
  {
    id: "jira",
    name: "Jira",
    icon: "clipboard",
    description: "Connect issues and projects",
    category: "productivity",
    recommended: false
  },
  {
    id: "confluence",
    name: "Confluence",
    icon: "book",
    description: "Search wiki pages and spaces",
    category: "productivity",
    recommended: false
  },
  {
    id: "asana",
    name: "Asana",
    icon: "target",
    description: "Connect tasks and projects",
    category: "productivity",
    recommended: false
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: "package",
    description: "Access files and folders",
    category: "storage",
    recommended: false
  },
];

// Icon mapping to emojis (for prototype) - kept simple for .js file compatibility
export const CONNECTOR_ICONS = {
  "google-drive": "📁",
  "github": "🐙",
  "linear": "🔷",
  "notion": "📝",
  "figma": "🎨",
  "slack": "💬",
  "jira": "📋",
  "confluence": "📖",
  "asana": "🎯",
  "dropbox": "📦",
};

// Branded icon URLs for higher quality display
export const CONNECTOR_ICON_URLS = {
  "google-drive": "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
  "github": "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
  "linear": "https://linear.app/static/favicon-48x48.png",
  "notion": "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  "figma": "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
  "slack": "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
  "jira": "https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png",
  "confluence": "https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png",
  "asana": "https://luna1.co/c9fe32.png",
  "dropbox": "https://cfl.dropboxstatic.com/static/images/logo_catalog/dropbox_logo_glyph_2024_m1.svg",
};

// Connection status (simulates API response)
export function getConnectorStatus() {
  return {
    "github": {
      connected: true,
      status: "healthy",
      lastSync: new Date(Date.now() - 2 * 60000).toISOString(),
      channelCount: 4,
      agentCount: 2,
      connectedAt: "2024-10-15T10:30:00Z",
      connectedByName: "Marcus Chen",
      connectedByAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    },
    "linear": {
      connected: true,
      status: "error",
      lastSync: new Date(Date.now() - 60 * 60000).toISOString(),
      channelCount: 2,
      agentCount: 1,
      connectedAt: "2024-11-01T14:20:00Z",
      connectedByName: "Sarah Kim",
      connectedByAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      errorMessage: "Authentication expired. Please reconnect to continue syncing."
    },
    "notion": {
      connected: true,
      status: "healthy",
      lastSync: new Date(Date.now() - 5 * 60000).toISOString(),
      channelCount: 3,
      agentCount: 1,
      connectedAt: "2024-09-20T09:15:00Z",
      connectedByName: "Alex Rivera",
      connectedByAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    },
  };
}

// Get connectors with merged status for UI
export function getConnectorsWithStatus() {
  const statuses = getConnectorStatus();
  return CONNECTORS.map(connector => ({
    ...connector,
    icon: CONNECTOR_ICONS[connector.id],
    connected: !!statuses[connector.id]?.connected,
    status: statuses[connector.id]?.status || "disconnected",
    lastSync: statuses[connector.id]?.lastSync,
    channelCount: statuses[connector.id]?.channelCount || 0,
    agentCount: statuses[connector.id]?.agentCount || 0,
    connectedAt: statuses[connector.id]?.connectedAt,
    connectedByName: statuses[connector.id]?.connectedByName,
    connectedByAvatar: statuses[connector.id]?.connectedByAvatar,
    errorMessage: statuses[connector.id]?.errorMessage,
  }));
}

// Get summary stats
export function getKnowledgeSummary() {
  const connectors = getConnectorsWithStatus();
  const connected = connectors.filter(c => c.connected);
  const withErrors = connected.filter(c => c.status === "error");
  const totalChannels = connected.reduce((sum, c) => sum + c.channelCount, 0);

  let healthStatus = "healthy";
  if (withErrors.length > 0) {
    healthStatus = "error";
  } else if (connected.some(c => c.status === "warning")) {
    healthStatus = "warning";
  }

  return {
    connectedCount: connected.length,
    totalChannels,
    healthStatus,
    errorCount: withErrors.length,
  };
}

// Channel access data per connector
const CHANNEL_ACCESS_DATA = {
  "github": [
    { channelId: "bug-triaging", channelName: "#bug-triaging", channelType: "public", permission: "read_write", lastActivity: new Date(Date.now() - 2 * 60000).toISOString() },
    { channelId: "daily-updates", channelName: "#daily-updates", channelType: "public", permission: "read", lastActivity: new Date(Date.now() - 30 * 60000).toISOString() },
    { channelId: "release-notes", channelName: "#release-notes", channelType: "public", permission: "read_write", lastActivity: new Date(Date.now() - 2 * 3600000).toISOString() },
    { channelId: "sev-incidents", channelName: "#sev-incidents", channelType: "private", permission: "read", lastActivity: new Date(Date.now() - 24 * 3600000).toISOString() },
  ],
  "linear": [
    { channelId: "bug-triaging", channelName: "#bug-triaging", channelType: "public", permission: "read_write", lastActivity: new Date(Date.now() - 60 * 60000).toISOString() },
    { channelId: "ai-news", channelName: "#ai-news", channelType: "public", permission: "read", lastActivity: new Date(Date.now() - 4 * 3600000).toISOString() },
  ],
  "notion": [
    { channelId: "all-kewl", channelName: "#all-kewl", channelType: "public", permission: "read", lastActivity: new Date(Date.now() - 5 * 60000).toISOString() },
    { channelId: "ai-news", channelName: "#ai-news", channelType: "public", permission: "read_write", lastActivity: new Date(Date.now() - 15 * 60000).toISOString() },
    { channelId: "daily-updates", channelName: "#daily-updates", channelType: "public", permission: "read", lastActivity: new Date(Date.now() - 3 * 3600000).toISOString() },
  ],
};

export function getChannelAccess(connectorId) {
  return CHANNEL_ACCESS_DATA[connectorId] || [];
}

// All available channels for the "Add channel" flow
export const AVAILABLE_CHANNELS = [
  { id: "bug-triaging", name: "#bug-triaging", type: "public" },
  { id: "daily-updates", name: "#daily-updates", type: "public" },
  { id: "release-notes", name: "#release-notes", type: "public" },
  { id: "sev-incidents", name: "#sev-incidents", type: "private" },
  { id: "all-kewl", name: "#all-kewl", type: "public" },
  { id: "ai-news", name: "#ai-news", type: "public" },
  { id: "service-health", name: "#service-health", type: "public" },
];

// Activity events
const ACTIVITY_EVENTS = [
  {
    id: "evt-1",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    connectorId: "github",
    connectorName: "GitHub",
    channelId: "bug-triaging",
    channelName: "#bug-triaging",
    action: "fetch",
    title: "Fetched new issues",
    description: "Fetched 3 new issues from acme/frontend repository",
    status: "success",
    details: { issueCount: 3, repo: "acme/frontend" }
  },
  {
    id: "evt-2",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    connectorId: "linear",
    connectorName: "Linear",
    channelId: "bug-triaging",
    channelName: "#bug-triaging",
    action: "sync",
    title: "Sync failed",
    description: "Authentication expired. Token needs to be refreshed.",
    status: "error",
    details: { error: "Token expired", errorCode: "AUTH_EXPIRED" }
  },
  {
    id: "evt-3",
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    connectorId: "notion",
    connectorName: "Notion",
    channelId: "all-kewl",
    channelName: "#all-kewl",
    action: "index",
    title: "Pages indexed",
    description: "Indexed 12 new pages from Engineering Wiki workspace",
    status: "success",
    details: { pageCount: 12, workspace: "Engineering Wiki" }
  },
  {
    id: "evt-4",
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    connectorId: "github",
    connectorName: "GitHub",
    channelId: "release-notes",
    channelName: "#release-notes",
    action: "fetch",
    title: "Fetched PR details",
    description: "Fetched details for PR #1234: Feature/dark-mode",
    status: "success",
    details: { prNumber: 1234, repo: "acme/backend", prTitle: "Feature/dark-mode" }
  },
  {
    id: "evt-5",
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    connectorId: "notion",
    connectorName: "Notion",
    channelId: "ai-news",
    channelName: "#ai-news",
    action: "search",
    title: "Search completed",
    description: "Searched for 'API documentation' across 45 pages",
    status: "success",
    details: { query: "API documentation", pagesSearched: 45, resultsFound: 8 }
  },
  {
    id: "evt-6",
    timestamp: new Date(Date.now() - 28 * 3600000).toISOString(),
    connectorId: "github",
    connectorName: "GitHub",
    channelId: "sev-incidents",
    channelName: "#sev-incidents",
    action: "webhook",
    title: "Webhook received",
    description: "Processed deployment event from GitHub Actions",
    status: "success",
    details: { event: "deployment", environment: "production" }
  },
  {
    id: "evt-7",
    timestamp: new Date(Date.now() - 50 * 3600000).toISOString(),
    connectorId: "linear",
    connectorName: "Linear",
    channelId: "bug-triaging",
    channelName: "#bug-triaging",
    action: "sync",
    title: "Issues synced",
    description: "Synced 24 issues from the Bug Triage project",
    status: "success",
    details: { issueCount: 24, project: "Bug Triage" }
  },
];

export function getActivityEvents(filters = {}) {
  let filtered = [...ACTIVITY_EVENTS];

  if (filters.connectorId) {
    filtered = filtered.filter(e => e.connectorId === filters.connectorId);
  }
  if (filters.channelId) {
    filtered = filtered.filter(e => e.channelId === filters.channelId);
  }
  if (filters.status) {
    filtered = filtered.filter(e => e.status === filters.status);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return filtered;
}

// Group events by day for display
export function groupEventsByDay(events) {
  const groups = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  events.forEach(event => {
    const eventDate = new Date(event.timestamp).toDateString();
    let label;
    if (eventDate === today) {
      label = "Today";
    } else if (eventDate === yesterday) {
      label = "Yesterday";
    } else {
      const date = new Date(event.timestamp);
      label = date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(event);
  });

  // Convert to array and maintain order
  const orderedLabels = Object.keys(groups).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;
    return 0;
  });

  return orderedLabels.map(label => ({ label, items: groups[label] }));
}

// Format relative time
export function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Category definitions for directory
export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "productivity", label: "Productivity" },
  { id: "development", label: "Development" },
  { id: "storage", label: "Storage" },
  { id: "communication", label: "Communication" },
];
