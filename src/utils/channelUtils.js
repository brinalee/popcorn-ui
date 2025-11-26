// src/utils/channelUtils.js

let channelCounter = 1;

const baseNames = [
  "daily-updates",
  "team-hub",
  "incidents-help",
  "shipping-log",
  "experiments",
];

export function generateFakeChannelName(prompt = "") {
  const trimmed = prompt.toLowerCase();

  // Context-aware channel naming based on prompt
  if (trimmed.includes("bug") || trimmed.includes("incident") || trimmed.includes("triage")) {
    channelCounter += 1;
    return `bug-triage-${channelCounter}`;
  }
  if (trimmed.includes("daily") || trimmed.includes("update") || trimmed.includes("standup")) {
    channelCounter += 1;
    return `daily-updates-${channelCounter}`;
  }
  if (trimmed.includes("deploy") || trimmed.includes("github") || trimmed.includes("ship")) {
    channelCounter += 1;
    return `deploy-updates-${channelCounter}`;
  }

  // Default behavior: cycle through base names
  const base = baseNames[(channelCounter - 1) % baseNames.length];
  const suffix = Math.ceil(channelCounter / baseNames.length);
  channelCounter += 1;
  return suffix > 1 ? `${base}-${suffix}` : base;
}

export function createChannelFromPrompt(prompt) {
  const id = `channel-${Date.now()}-${channelCounter}`;
  const name = generateFakeChannelName(prompt);

  return {
    id,
    iconType: "hash",
    label: name,
    name,
    isPrivate: false,
    instructions: prompt.trim(),
    allowMentions: true,
    autoChime: false,
    webhooks: [],
    members: [],
  };
}

export function createBlankChannel() {
  const id = `channel-${Date.now()}-${channelCounter}`;
  const name = generateFakeChannelName();

  return {
    id,
    iconType: "hash",
    label: name,
    name,
    isPrivate: false,
    instructions: "Use this channel to coordinate work, share updates, and let Popcorn summarize activity when you need it.",
    allowMentions: true,
    autoChime: false,
    webhooks: [],
    members: [],
  };
}

export function createChannelFromTemplate(templateData) {
  const id = `channel-${Date.now()}-${channelCounter}`;
  const { slug, name, instructions } = templateData;

  channelCounter += 1;

  return {
    id,
    iconType: "hash",
    label: slug || name,
    name: slug || name,
    isPrivate: false,
    instructions: instructions || "",
    allowMentions: true,
    autoChime: false,
    webhooks: [],
    members: [],
  };
}
