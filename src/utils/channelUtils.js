// src/utils/channelUtils.js

let channelCounter = 1;

const WEBHOOK_MODE_DEFAULTS = {
  raw: "",
  message: "Post the webhook payload as a message to this channel.",
  markdown: "Format the webhook payload as a clean markdown message.",
  summarize: "Summarize the webhook payload into key points.",
  custom: "",
};

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
  const { slug, name, instructions, initialWebhooks = [], getSettingsInstructions } = templateData;

  channelCounter += 1;

  // Create webhooks with generated IDs
  const webhooks = initialWebhooks.map((wh, index) => ({
    id: `webhook-${id}-${index}`,
    name: wh.name,
    mode: wh.mode || "summarize",
    url: `https://api.popcorn.dev/webhooks/${id}-${index}`,
    createdAt: new Date().toISOString(),
    customCommand: WEBHOOK_MODE_DEFAULTS[wh.mode] || "",
  }));

  // Generate instructions with webhook IDs if dynamic function provided
  let finalInstructions = instructions || "";
  if (getSettingsInstructions) {
    // For webhook templates, pass the first webhook ID
    // For non-webhook templates (like bug-triage), call with no args
    if (webhooks.length > 0) {
      finalInstructions = getSettingsInstructions(webhooks[0].id);
    } else {
      finalInstructions = getSettingsInstructions();
    }
  }

  return {
    id,
    iconType: "hash",
    label: slug || name,
    name: slug || name,
    templateId: templateData.templateId || null,
    hasSeededReleaseNotesDemo: false,
    isPrivate: templateData.isPrivate || false,
    instructions: finalInstructions,
    allowMentions: true,
    autoChime: false,
    webhooks,
    members: templateData.memberIds || [],
    messages: [],
  };
}
