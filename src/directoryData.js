// src/directoryData.js
// Master directory of ALL channels and DMs available in the product

const now = Date.now();
const day = 86400000; // milliseconds in a day

export const channelDirectory = [
  // Currently followed channels (from mockData.js)
  { id: "sev-incidents", label: "sev-incidents", iconType: "hash", lastMessageAt: now - 1800000, createdAt: now - 30 * day },
  { id: "ai-news", label: "ai-news", iconType: "bolt", lastMessageAt: now - 300000, createdAt: now - 7 * day },
  { id: "all-kewl", label: "all-kewl", iconType: "hash", lastMessageAt: now - 7200000, createdAt: now - 90 * day },
  { id: "bug-triaging", label: "bug-triaging", iconType: "bolt", lastMessageAt: now - 900000, createdAt: now - 60 * day },
  { id: "daily-updates", label: "daily-updates", iconType: "bolt", lastMessageAt: now - 3600000, createdAt: now - 120 * day },
  { id: "release-notes", label: "release-notes", iconType: "bolt", lastMessageAt: now - 86400000, createdAt: now - 2 * day },
  { id: "service-health", label: "service-health", iconType: "bolt", lastMessageAt: now - 600000, createdAt: now - 45 * day },

  // Additional unfollowed channels
  { id: "design-reviews", label: "design-reviews", iconType: "hash", lastMessageAt: now - 5400000, createdAt: now - 14 * day },
  { id: "infrastructure", label: "infrastructure", iconType: "bolt", lastMessageAt: now - 10800000, createdAt: now - 180 * day },
  { id: "marketing", label: "marketing", iconType: "hash", lastMessageAt: now - 14400000, createdAt: now - 200 * day },
  { id: "customer-feedback", label: "customer-feedback", iconType: "hash", lastMessageAt: now - 21600000, createdAt: now - 21 * day },
  { id: "team-events", label: "team-events", iconType: "hash", lastMessageAt: now - 172800000, createdAt: now - 365 * day },
  { id: "engineering", label: "engineering", iconType: "bolt", lastMessageAt: now - 1200000, createdAt: now - 400 * day },
  { id: "product-updates", label: "product-updates", iconType: "bolt", lastMessageAt: now - 43200000, createdAt: now - 1 * day },
  { id: "onboarding", label: "onboarding", iconType: "hash", lastMessageAt: now - 259200000, createdAt: now - 300 * day },
  { id: "security-alerts", label: "security-alerts", iconType: "bolt", lastMessageAt: now - 120000, createdAt: now - 3 * day },
  { id: "sales", label: "sales", iconType: "hash", lastMessageAt: now - 28800000, createdAt: now - 150 * day },
  { id: "support", label: "support", iconType: "hash", lastMessageAt: now - 2400000, createdAt: now - 100 * day },
  { id: "random", label: "random", iconType: "hash", lastMessageAt: now - 60000, createdAt: now - 500 * day },
];

export const dmDirectory = [
  // Currently followed DMs (from mockData.js)
  {
    id: "dm-1",
    name: "Marcus, Alex",
    initials: "M",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=60",
    status: "online",
    lastMessageAt: now - 180000,
    createdAt: now - 14 * day
  },
  {
    id: "dm-2",
    name: "Emma, Marcus, Chris, Taylor",
    initials: "E",
    avatarColor: "green",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    status: "online",
    lastMessageAt: now - 3600000,
    createdAt: now - 30 * day
  },
  {
    id: "dm-3",
    name: "Jordan",
    initials: "J",
    avatarColor: "red",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    status: "online",
    lastMessageAt: now - 7200000,
    createdAt: now - 60 * day
  },
  {
    id: "dm-4",
    name: "Chris",
    initials: "C",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    status: "away",
    lastMessageAt: now - 600000,
    createdAt: now - 7 * day
  },

  // Additional unfollowed DMs
  {
    id: "dm-5",
    name: "Sarah",
    initials: "S",
    avatarColor: "blue",
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    status: "online",
    lastMessageAt: now - 1800000,
    createdAt: now - 3 * day
  },
  {
    id: "dm-6",
    name: "Dev Team",
    initials: "D",
    avatarColor: "purple",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
    status: "online",
    lastMessageAt: now - 300000,
    createdAt: now - 1 * day
  },
  {
    id: "dm-7",
    name: "Product Squad",
    initials: "P",
    avatarColor: "orange",
    avatarUrl: "https://i.pravatar.cc/150?img=30",
    status: "away",
    lastMessageAt: now - 14400000,
    createdAt: now - 45 * day
  },
  {
    id: "dm-8",
    name: "Taylor",
    initials: "T",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=35",
    status: "online",
    lastMessageAt: now - 43200000,
    createdAt: now - 90 * day
  },
  {
    id: "dm-9",
    name: "Design Team",
    initials: "D",
    avatarColor: "pink",
    avatarUrl: "https://i.pravatar.cc/150?img=40",
    status: "away",
    lastMessageAt: now - 86400000,
    createdAt: now - 21 * day
  },
  {
    id: "dm-10",
    name: "Alex",
    initials: "A",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=45",
    status: "online",
    lastMessageAt: now - 120000,
    createdAt: now - 2 * day
  },
];
