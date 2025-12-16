// src/utils/kernelScopeData.js
// Mock data for granular scope control in kernel sources

// Mock repository data for GitHub
export const GITHUB_REPOSITORIES = [
  { id: "repo-1", name: "acme/frontend", isPrivate: false, language: "TypeScript" },
  { id: "repo-2", name: "acme/backend", isPrivate: false, language: "Python" },
  { id: "repo-3", name: "acme/mobile-app", isPrivate: true, language: "Swift" },
  { id: "repo-4", name: "acme/infrastructure", isPrivate: true, language: "Terraform" },
  { id: "repo-5", name: "acme/design-system", isPrivate: false, language: "TypeScript" },
  { id: "repo-6", name: "acme/docs", isPrivate: false, language: "MDX" },
  { id: "repo-7", name: "acme/analytics", isPrivate: true, language: "Python" },
  { id: "repo-8", name: "acme/shared-libs", isPrivate: false, language: "TypeScript" },
];

// Mock project/team data for Linear
export const LINEAR_PROJECTS = [
  { id: "proj-1", name: "Bug Triage", teamName: "Engineering", icon: "bug" },
  { id: "proj-2", name: "Q4 Roadmap", teamName: "Product", icon: "roadmap" },
  { id: "proj-3", name: "Mobile v2.0", teamName: "Mobile", icon: "phone" },
  { id: "proj-4", name: "Design System", teamName: "Design", icon: "palette" },
  { id: "proj-5", name: "Infrastructure", teamName: "Platform", icon: "server" },
  { id: "proj-6", name: "Customer Feedback", teamName: "Product", icon: "chat" },
];

// Mock workspace/page data for Notion
export const NOTION_PAGES = [
  { id: "page-1", name: "Engineering Wiki", type: "workspace" },
  { id: "page-2", name: "Product Specs", type: "database" },
  { id: "page-3", name: "Team Handbook", type: "page" },
  { id: "page-4", name: "Meeting Notes", type: "database" },
  { id: "page-5", name: "API Documentation", type: "page" },
  { id: "page-6", name: "Onboarding Guide", type: "page" },
];

// Mock files/folders for Google Drive
export const GOOGLE_DRIVE_FILES = [
  { id: "drive-1", name: "Engineering Shared", type: "folder" },
  { id: "drive-2", name: "Product Documents", type: "folder" },
  { id: "drive-3", name: "Design Assets", type: "folder" },
  { id: "drive-4", name: "Company Wiki", type: "folder" },
];

// Mock design files for Figma
export const FIGMA_FILES = [
  { id: "figma-1", name: "Design System", type: "file" },
  { id: "figma-2", name: "Product Mockups", type: "project" },
  { id: "figma-3", name: "Marketing Assets", type: "project" },
];

// Get resources for a specific source
export function getSourceResources(sourceId) {
  const resourceMap = {
    "github": GITHUB_REPOSITORIES,
    "linear": LINEAR_PROJECTS,
    "notion": NOTION_PAGES,
    "google-drive": GOOGLE_DRIVE_FILES,
    "figma": FIGMA_FILES,
  };
  return resourceMap[sourceId] || [];
}

// Get display config for resource type labels
export function getResourceConfig(sourceId) {
  const configs = {
    "github": {
      singularLabel: "repo",
      pluralLabel: "repos",
      searchPlaceholder: "Search repositories...",
    },
    "linear": {
      singularLabel: "project",
      pluralLabel: "projects",
      searchPlaceholder: "Search projects...",
    },
    "notion": {
      singularLabel: "page",
      pluralLabel: "pages",
      searchPlaceholder: "Search pages...",
    },
    "google-drive": {
      singularLabel: "folder",
      pluralLabel: "folders",
      searchPlaceholder: "Search folders...",
    },
    "figma": {
      singularLabel: "file",
      pluralLabel: "files",
      searchPlaceholder: "Search files...",
    },
  };
  return configs[sourceId] || { singularLabel: "item", pluralLabel: "items", searchPlaceholder: "Search..." };
}

// Get secondary info to display for each resource type
export function getResourceSecondaryInfo(sourceId, resource) {
  switch (sourceId) {
    case "github":
      return resource.isPrivate ? "Private" : "Public";
    case "linear":
      return resource.teamName;
    case "notion":
      return resource.type;
    case "google-drive":
      return resource.type;
    case "figma":
      return resource.type;
    default:
      return null;
  }
}
