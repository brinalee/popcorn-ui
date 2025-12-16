// src/utils/kernelData.js
// Data layer for Popcorn Kernels

import { CONNECTORS, CONNECTOR_ICONS, getConnectorStatus, getActivityEvents } from "./companyKnowledgeData";

// ============================================================
// WORKSPACE KERNEL (Single kernel for the whole workspace)
// ============================================================

// The single workspace kernel (simplified model)
let workspaceKernel = {
  id: "workspace-kernel",
  name: "Workspace Kernel",
  sourceIds: ["github", "notion", "linear"], // Currently added sources
};

// Per-channel kernel settings (which sources are enabled per channel)
// sourceScopes: { [sourceId]: { mode: "all" | "selected", selectedIds: string[] } }
let channelKernelSettings = {
  "bug-triaging": {
    kernelEnabled: true,
    disabledSources: [],
    sourceScopes: {
      "github": { mode: "selected", selectedIds: ["repo-1", "repo-2"] },
      "linear": { mode: "all", selectedIds: [] },
      "notion": { mode: "all", selectedIds: [] },
    },
  },
  "daily-updates": {
    kernelEnabled: true,
    disabledSources: [],
    sourceScopes: {},
  },
  "release-notes": {
    kernelEnabled: true,
    disabledSources: [],
    sourceScopes: {
      "github": { mode: "selected", selectedIds: ["repo-1", "repo-5", "repo-6"] },
      "notion": { mode: "selected", selectedIds: ["page-1", "page-5"] },
    },
  },
};

// Get the workspace kernel
export function getWorkspaceKernel() {
  return { ...workspaceKernel };
}

// Update the workspace kernel
export function updateWorkspaceKernel(updates) {
  workspaceKernel = { ...workspaceKernel, ...updates };
  return getWorkspaceKernel();
}

// Get channel-specific kernel settings
export function getChannelKernelSettings(channelId) {
  return channelKernelSettings[channelId] || { kernelEnabled: true, disabledSources: [], sourceScopes: {} };
}

// Get scope for a specific source in a channel
export function getChannelSourceScope(channelId, sourceId) {
  const settings = getChannelKernelSettings(channelId);
  return settings.sourceScopes?.[sourceId] || { mode: "all", selectedIds: [] };
}

// Update scope for a specific source in a channel
export function updateChannelSourceScope(channelId, sourceId, scope) {
  const currentSettings = getChannelKernelSettings(channelId);
  const newSourceScopes = {
    ...currentSettings.sourceScopes,
    [sourceId]: scope,
  };
  channelKernelSettings[channelId] = {
    ...currentSettings,
    sourceScopes: newSourceScopes,
  };
  return channelKernelSettings[channelId];
}

// Update channel-specific kernel settings
export function updateChannelKernelSettings(channelId, settings) {
  channelKernelSettings[channelId] = {
    ...getChannelKernelSettings(channelId),
    ...settings,
  };
  return channelKernelSettings[channelId];
}

// Get sources enabled for a specific channel
export function getChannelSources(channelId) {
  const settings = getChannelKernelSettings(channelId);
  if (!settings.kernelEnabled) return [];

  return workspaceKernel.sourceIds.filter(
    (id) => !settings.disabledSources.includes(id)
  );
}

// Workspace kernel usage data (which channels use which sources)
const workspaceKernelUsage = [
  {
    channelId: "bug-triaging",
    channelName: "#bug-triaging",
    enabledSources: ["github", "linear"],
  },
  {
    channelId: "daily-updates",
    channelName: "#daily-updates",
    enabledSources: ["github", "notion", "linear"],
  },
  {
    channelId: "release-notes",
    channelName: "#release-notes",
    enabledSources: ["github", "notion"],
  },
  {
    channelId: "sev-incidents",
    channelName: "#sev-incidents",
    enabledSources: ["github"],
  },
  {
    channelId: "ai-news",
    channelName: "#ai-news",
    enabledSources: ["notion", "slack"],
  },
];

export function getWorkspaceKernelUsage() {
  return workspaceKernelUsage;
}

// ============================================================
// LEGACY KERNEL SYSTEM (kept for backwards compatibility)
// ============================================================

// Kernel storage (simulates database)
let kernels = [
  {
    id: "kernel-1",
    name: "Engineering Kernel",
    description: "Code, issues, and documentation for the engineering team",
    connectorIds: ["github", "linear", "notion"],
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    createdByName: "Marcus Chen",
    createdByAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    isEnabled: true,
  },
  {
    id: "kernel-2",
    name: "Product Kernel",
    description: "Product specs, roadmaps, and customer feedback",
    connectorIds: ["notion", "linear"],
    createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    createdByName: "Sarah Kim",
    createdByAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    isEnabled: true,
  },
];

// Kernel usage data (which channels/agents use each kernel)
const kernelUsage = {
  "kernel-1": {
    channels: [
      { id: "bug-triaging", name: "#bug-triaging", type: "channel" },
      { id: "daily-updates", name: "#daily-updates", type: "channel" },
      { id: "release-notes", name: "#release-notes", type: "channel" },
      { id: "sev-incidents", name: "#sev-incidents", type: "channel" },
    ],
    agents: [
      { id: "agent-1", name: "Bug Triage Bot", type: "agent" },
      { id: "agent-2", name: "Release Notes Agent", type: "agent" },
    ],
  },
  "kernel-2": {
    channels: [
      { id: "all-kewl", name: "#all-kewl", type: "channel" },
      { id: "ai-news", name: "#ai-news", type: "channel" },
    ],
    agents: [
      { id: "agent-3", name: "Product Updates Bot", type: "agent" },
    ],
  },
};

// Get all kernels
export function getKernels() {
  return kernels.map(kernel => ({
    ...kernel,
    connectors: getKernelConnectors(kernel.id),
    usage: getKernelUsageCounts(kernel.id),
    health: getKernelHealth(kernel.id),
  }));
}

// Get a single kernel by ID
export function getKernelById(kernelId) {
  const kernel = kernels.find(k => k.id === kernelId);
  if (!kernel) return null;

  return {
    ...kernel,
    connectors: getKernelConnectors(kernelId),
    usage: getKernelUsageCounts(kernelId),
    health: getKernelHealth(kernelId),
  };
}

// Get connectors for a kernel (with full details)
export function getKernelConnectors(kernelId) {
  const kernel = kernels.find(k => k.id === kernelId);
  if (!kernel) return [];

  const statuses = getConnectorStatus();

  return kernel.connectorIds.map(connectorId => {
    const connector = CONNECTORS.find(c => c.id === connectorId);
    const status = statuses[connectorId];

    return {
      ...connector,
      icon: CONNECTOR_ICONS[connectorId],
      connected: !!status?.connected,
      status: status?.status || "disconnected",
      lastSync: status?.lastSync,
      errorMessage: status?.errorMessage,
    };
  });
}

// Get usage counts for a kernel
export function getKernelUsageCounts(kernelId) {
  const usage = kernelUsage[kernelId] || { channels: [], agents: [] };
  return {
    channels: usage.channels.length,
    agents: usage.agents.length,
  };
}

// Get detailed usage for a kernel
export function getKernelUsage(kernelId) {
  return kernelUsage[kernelId] || { channels: [], agents: [] };
}

// Get health status for a kernel
export function getKernelHealth(kernelId) {
  const connectors = getKernelConnectors(kernelId);
  const hasError = connectors.some(c => c.status === "error");
  const hasWarning = connectors.some(c => c.status === "warning");

  if (hasError) return "error";
  if (hasWarning) return "warning";
  return "healthy";
}

// Get activity events filtered by kernel
export function getKernelActivity(kernelId) {
  const kernel = kernels.find(k => k.id === kernelId);
  if (!kernel) return [];

  const allEvents = getActivityEvents();
  return allEvents.filter(event =>
    kernel.connectorIds.includes(event.connectorId)
  );
}

// Check if any kernels exist (for onboarding trigger)
export function hasAnyKernels() {
  return kernels.length > 0;
}

// Get summary stats
export function getKernelsSummary() {
  const allKernels = getKernels();
  const allConnectorIds = new Set();
  let totalChannels = 0;
  let totalAgents = 0;
  let errorCount = 0;

  allKernels.forEach(kernel => {
    kernel.connectorIds.forEach(id => allConnectorIds.add(id));
    totalChannels += kernel.usage.channels;
    totalAgents += kernel.usage.agents;
    if (kernel.health === "error") errorCount++;
  });

  return {
    kernelCount: allKernels.length,
    connectorCount: allConnectorIds.size,
    channelCount: totalChannels,
    agentCount: totalAgents,
    errorCount,
    health: errorCount > 0 ? "error" : "healthy",
  };
}

// Create a new kernel
export function createKernel(name, description, connectorIds) {
  const newKernel = {
    id: `kernel-${Date.now()}`,
    name,
    description: description || "",
    connectorIds: connectorIds || [],
    createdAt: new Date().toISOString(),
    createdByName: "You",
    createdByAvatar: null,
    isEnabled: true,
  };

  kernels = [...kernels, newKernel];
  kernelUsage[newKernel.id] = { channels: [], agents: [] };

  return newKernel;
}

// Update a kernel
export function updateKernel(kernelId, updates) {
  kernels = kernels.map(kernel =>
    kernel.id === kernelId ? { ...kernel, ...updates } : kernel
  );
  return getKernelById(kernelId);
}

// Toggle kernel enabled state
export function toggleKernel(kernelId) {
  kernels = kernels.map(kernel =>
    kernel.id === kernelId ? { ...kernel, isEnabled: !kernel.isEnabled } : kernel
  );
  return getKernelById(kernelId);
}

// Delete a kernel
export function deleteKernel(kernelId) {
  kernels = kernels.filter(k => k.id !== kernelId);
  delete kernelUsage[kernelId];
}

// Get all available connectors (for adding to kernel)
export function getAvailableConnectors() {
  const statuses = getConnectorStatus();

  return CONNECTORS.map(connector => ({
    ...connector,
    icon: CONNECTOR_ICONS[connector.id],
    connected: !!statuses[connector.id]?.connected,
    status: statuses[connector.id]?.status || "available",
  }));
}

// Add connector to kernel
export function addConnectorToKernel(kernelId, connectorId) {
  kernels = kernels.map(kernel => {
    if (kernel.id === kernelId && !kernel.connectorIds.includes(connectorId)) {
      return { ...kernel, connectorIds: [...kernel.connectorIds, connectorId] };
    }
    return kernel;
  });
  return getKernelById(kernelId);
}

// Remove connector from kernel
export function removeConnectorFromKernel(kernelId, connectorId) {
  kernels = kernels.map(kernel => {
    if (kernel.id === kernelId) {
      return { ...kernel, connectorIds: kernel.connectorIds.filter(id => id !== connectorId) };
    }
    return kernel;
  });
  return getKernelById(kernelId);
}

// Format relative time (reuse pattern)
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

// Re-export CONNECTOR_ICONS for use in components
export { CONNECTOR_ICONS };
