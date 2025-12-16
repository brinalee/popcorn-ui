// src/sectionsData.js

export const initialSections = [
  {
    id: "uncategorized",
    title: "Uncategorized",
    sortMode: "manual",
    isCollapsed: false,
    itemIds: [],
    isProtected: true  // Cannot delete/rename, always stays at top
  },
  {
    id: "sec-channels",
    title: "Company",
    sortMode: "manual",
    isCollapsed: false,
    itemIds: ["ai-news", "all-kewl", "bug-triaging", "release-notes"],
    isProtected: false
  },
  {
    id: "sec-other-channels",
    title: "Eng-related",
    sortMode: "manual",
    isCollapsed: false,
    itemIds: ["sev-incidents", "daily-updates", "service-health"],
    isProtected: false
  },
  {
    id: "sec-direct-messages",
    title: "Messages",
    sortMode: "manual",
    isCollapsed: false,
    itemIds: ["dm-1", "dm-2", "dm-3", "dm-4"],
    isProtected: false
  }
];
