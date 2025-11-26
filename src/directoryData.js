// src/directoryData.js
// Master directory of ALL channels and DMs available in the product

export const channelDirectory = [
  // Currently followed channels (from mockData.js)
  { id: "sev-incidents", label: "sev-incidents", iconType: "hash" },
  { id: "ai-news", label: "ai-news", iconType: "bolt" },
  { id: "all-kewl", label: "all-kewl", iconType: "hash" },
  { id: "bug-triaging", label: "bug-triaging", iconType: "bolt" },
  { id: "daily-updates", label: "daily-updates", iconType: "bolt" },
  { id: "release-notes", label: "release-notes", iconType: "bolt" },
  { id: "service-health", label: "service-health", iconType: "bolt" },

  // Additional unfollowed channels
  { id: "design-reviews", label: "design-reviews", iconType: "hash" },
  { id: "infrastructure", label: "infrastructure", iconType: "bolt" },
  { id: "marketing", label: "marketing", iconType: "hash" },
  { id: "customer-feedback", label: "customer-feedback", iconType: "hash" },
  { id: "team-events", label: "team-events", iconType: "hash" },
  { id: "engineering", label: "engineering", iconType: "bolt" },
  { id: "product-updates", label: "product-updates", iconType: "bolt" },
  { id: "onboarding", label: "onboarding", iconType: "hash" },
  { id: "security-alerts", label: "security-alerts", iconType: "bolt" },
  { id: "sales", label: "sales", iconType: "hash" },
  { id: "support", label: "support", iconType: "hash" },
  { id: "random", label: "random", iconType: "hash" },
];

export const dmDirectory = [
  // Currently followed DMs (from mockData.js)
  {
    id: "dm-1",
    name: "Marcus, Alex",
    initials: "M",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=60",
    status: "online"
  },
  {
    id: "dm-2",
    name: "Emma, Marcus, Chris, Taylor",
    initials: "E",
    avatarColor: "green",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    status: "online"
  },
  {
    id: "dm-3",
    name: "Jordan",
    initials: "J",
    avatarColor: "red",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    status: "online"
  },
  {
    id: "dm-4",
    name: "Chris",
    initials: "C",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    status: "away"
  },

  // Additional unfollowed DMs
  {
    id: "dm-5",
    name: "Sarah",
    initials: "S",
    avatarColor: "blue",
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    status: "online"
  },
  {
    id: "dm-6",
    name: "Dev Team",
    initials: "D",
    avatarColor: "purple",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
    status: "online"
  },
  {
    id: "dm-7",
    name: "Product Squad",
    initials: "P",
    avatarColor: "orange",
    avatarUrl: "https://i.pravatar.cc/150?img=30",
    status: "away"
  },
  {
    id: "dm-8",
    name: "Taylor",
    initials: "T",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=35",
    status: "online"
  },
  {
    id: "dm-9",
    name: "Design Team",
    initials: "D",
    avatarColor: "pink",
    avatarUrl: "https://i.pravatar.cc/150?img=40",
    status: "away"
  },
  {
    id: "dm-10",
    name: "Alex",
    initials: "A",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=45",
    status: "online"
  },
];
