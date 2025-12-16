// src/components/CreateChannelIntentModal.jsx
import { useState } from "react";

// Mock members for step 2
const mockMembers = [
  { id: "u1", name: "Alex Martinez", initials: "A", avatarColor: "gray", avatarUrl: "https://i.pravatar.cc/150?img=45", status: "online" },
  { id: "u2", name: "Emma Rodriguez", initials: "E", avatarColor: "green", avatarUrl: "https://i.pravatar.cc/150?img=47", status: "online" },
  { id: "u3", name: "Jordan Smith", initials: "J", avatarColor: "red", avatarUrl: "https://i.pravatar.cc/150?img=15", status: "online" },
  { id: "u4", name: "Chris Johnson", initials: "C", avatarColor: "gray", avatarUrl: "https://i.pravatar.cc/150?img=14", status: "away" },
  { id: "u5", name: "Sarah Williams", initials: "S", avatarColor: "blue", avatarUrl: "https://i.pravatar.cc/150?img=20", status: "online" },
  { id: "u6", name: "Taylor Brown", initials: "T", avatarColor: "purple", avatarUrl: "https://i.pravatar.cc/150?img=35", status: "online" },
  { id: "u7", name: "Morgan Davis", initials: "M", avatarColor: "pink", avatarUrl: "https://i.pravatar.cc/150?img=25", status: "away" },
  { id: "u8", name: "Marcus Chen", initials: "M", avatarColor: "orange", avatarUrl: "https://i.pravatar.cc/150?img=60", status: "online" },
];

// Spark icon component for modal header
const SparkIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="M12 3l1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 15l0.8 2.2L9 18l-2.2 0.8L6 21l-0.8-2.2L3 18l2.2-0.8L6 15zM18 11l0.9 2.3L21 14l-2.1 0.7L18 17l-0.9-2.3L15 14l2.1-0.7L18 11z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CHANNEL_TEMPLATES = {
  "daily-updates": {
    id: "daily-updates",
    label: "Create daily team updates",
    shortPrompt: 'Post a team update every weekday at 09:00 PST.',
    defaultChannelSlug: "daily-updates",
    settingsInstructions: `Post a daily team update to this channel every weekday at 09:00 PST.

The update should give the team a clear, concise picture of what changed, what people are working on now, and what is coming next.

Pull information from company knowledge only. That includes the codebase, issues, docs, deploy history, and any other tools that have been connected for this team. Only include work that is relevant to this channel's team.

Time window and title:
Each update should cover roughly the previous workday, using a rolling window from the previous update to now. Start the message with a title line in this format, using real dates for the period being summarized:
=== Team Update (Nov 18, 2025 – Nov 19, 2025) ===

Sections:
Organize every update into three sections, in this order: "What We Finished", "What We're Working On Now", and "What's Coming Next".

Bullet rules:
For each section, aim for about five to eight bullets at most. Focus on outcomes and impact, not low level change logs or raw commit messages. Use clear, plain language instead of tool-specific jargon whenever possible. If you need to reference a URL, hide it behind descriptive link text when you generate the markdown message. Attribute each item to the person or team that did the work by naming them at the end of the line, for example "– Alex" or "– Mobile team".

Formatting:
The final message posted in the channel should be markdown, with the title line, a blank line, then each section name followed by its bullets. These instructions are the source of truth for how this channel should behave, but users may edit this text if they want to customize sources, time windows, or formatting.`
  },
  "bug-triage": {
    id: "bug-triage",
    label: "Triage bugs",
    shortPrompt: "Triage every message that reports a bug or provides feedback into Linear.",
    defaultChannelSlug: "bug-triaging",
    getSettingsInstructions: () => `Treat every new message in this channel as a potential bug report or product feedback and triage it into Linear.

Use data from [[knowledge:company]] (issues, projects, and labels) to keep everything in sync.

When a new message is posted

- Assume the message is either a bug report or product feedback.
- Extract:
  - A concise title
  - A short summary
  - Clear steps to reproduce or a description of the feedback
  - Any expected vs. actual behaviour mentioned
- Attach all links, screenshots, and files from the message.

De-duplicating with existing Linear issues

- Before creating a new issue, search existing Linear issues for similar bugs or feedback.
- If you find a likely match:
  - Prefer updating or linking to the existing issue instead of creating a new one.
  - Add a comment summarising the new report and link back to this channel message.
- If there are multiple close matches, pick the best one and ignore the rest.

If it's clearly new

- Create a new Linear issue in the appropriate team / project for this channel.
- Set the assignee to the original message author when possible; otherwise leave unassigned.
- Use the channel message as the primary source of truth:
  - Include the original message text verbatim in the issue description.
  - Embed or link to all relevant screenshots, logs, and files.
  - Link back to this channel thread for full context.

Ongoing conversation in the channel

- If teammates reply with more details (logs, screenshots, clarifications):
  - Append those details as comments on the same Linear issue.
  - Avoid rewriting user messages; quote or link to them where possible.
- Do not invent extra steps or requirements; only use information actually provided in this channel.

What counts as a bug vs. feedback

- Bug: Something that used to work but broke, behaves unexpectedly, or blocks a user.
- Feedback / feature: Suggestions, UX polish, or "it would be nice if…" ideas.
- If unsure, treat it as feedback and still create or link to an issue.

These instructions are the source of truth for how this channel should triage into Linear. Users may edit this text to customise projects, labels, or assignment rules.`,
    settingsInstructions: "Triage bugs into Linear."
  },
  "release-notes": {
    id: "release-notes",
    label: "Post release notes",
    shortPrompt: "Post release notes to this channel whenever this webhook receives an event.",
    defaultChannelSlug: "release-notes",
    initialWebhooks: [
      {
        name: "Release event",
        mode: "markdown"
      }
    ],
    getSettingsInstructions: (webhookId) => `Post release notes to this channel whenever [[webhook:${webhookId}]] receives an event.

The goal is to give the team a clear, readable summary of what shipped in each deploy.

Pull details from [[webhook:${webhookId}]] and [[knowledge:company]] as needed. Focus on the changes that matter to people reading this channel.

When a new deploy webhook arrives:

- Treat the webhook as the source of truth for which commit / build / environment was deployed.
- Look up relevant context from [[knowledge:company]] (e.g. linked PRs, issues, specs, or docs).
- Turn the raw payload into a short, well-formatted changelog message in Markdown.

Suggested structure for each release note:

- Summary – 1–2 sentence high-level description of the release.
- Changes – Bulleted list of notable changes (features, bug fixes, migrations).
- Impact – What users or teams should expect (new behavior, performance, reliability).
- Rollbacks / Known issues (optional) – Anything that didn't ship as expected or might need attention.

Formatting guidelines:

- Keep the whole message scannable and friendly; avoid dumping raw JSON or log lines.
- Group changes by area / product when helpful (e.g. "Web", "API", "Admin", "Billing").
- Hide raw URLs behind descriptive links.
- Attribute work when useful, e.g. "– @alex, @shipping-team".`,
    settingsInstructions: "Post release notes here whenever a deployed-build GitHub Action hits this webhook."
  }
};

const TEMPLATE_PROMPTS = Object.values(CHANNEL_TEMPLATES);

function CreateChannelIntentModal({ onCancel, onCreateFromPrompt, onCreateBlank, onCreateFromTemplate }) {
  // Step 1 state
  const [step, setStep] = useState(1); // 1 = intent, 2 = add members
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isBlankChannel, setIsBlankChannel] = useState(false);

  // Step 2 state
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");

  const hasText = prompt.trim().length > 0;

  // Derive channel name from template or prompt
  const deriveChannelName = () => {
    if (selectedTemplateId && CHANNEL_TEMPLATES[selectedTemplateId]) {
      return CHANNEL_TEMPLATES[selectedTemplateId].defaultChannelSlug;
    }
    // Simple slug from first few words of prompt
    if (hasText) {
      return prompt.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).slice(0, 3).join("-") || "new-channel";
    }
    return "new-channel";
  };

  const handleTemplateClick = (template) => {
    setPrompt(template.shortPrompt);
    setSelectedTemplateId(template.id);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    // If user manually edits, clear template selection
    // so we use custom prompt instead of template
    if (selectedTemplateId) {
      const template = CHANNEL_TEMPLATES[selectedTemplateId];
      if (e.target.value !== template.shortPrompt) {
        setSelectedTemplateId(null);
      }
    }
  };

  // Create channel with the given member IDs - closes modal immediately
  const handleCreateWithMembers = (memberIds) => {
    // Close modal immediately and navigate to settings with pendingSetup flag
    if (isBlankChannel) {
      onCreateBlank(isPrivate, memberIds, { pendingSetup: true });
    } else if (selectedTemplateId && CHANNEL_TEMPLATES[selectedTemplateId]) {
      const template = CHANNEL_TEMPLATES[selectedTemplateId];
      onCreateFromTemplate({
        slug: template.defaultChannelSlug,
        name: template.defaultChannelSlug,
        instructions: template.settingsInstructions || "",
        templateId: template.id,
        isPrivate,
        memberIds,
        initialWebhooks: template.initialWebhooks || [],
        getSettingsInstructions: template.getSettingsInstructions || null,
        pendingSetup: true,
      });
    } else if (hasText) {
      onCreateFromPrompt(prompt, isPrivate, memberIds, { pendingSetup: true });
    } else {
      onCreateBlank(isPrivate, memberIds, { pendingSetup: true });
    }
  };

  // Primary button click - either create or go to step 2
  const handlePrimaryClick = () => {
    if (isPrivate && hasText) {
      // Private channel with text - go to add members step
      setStep(2);
    } else if (hasText) {
      // Public channel - create immediately
      handleCreateWithMembers([]);
    }
  };

  // Step 2: Add Members
  if (step === 2) {
    const channelName = deriveChannelName();
    const normalizedSearch = memberSearch.trim().toLowerCase();
    const filteredMembers = mockMembers.filter((m) =>
      m.name.toLowerCase().includes(normalizedSearch)
    );

    const toggleMember = (id) => {
      setSelectedMembers(
        selectedMembers.includes(id)
          ? selectedMembers.filter((m) => m !== id)
          : [...selectedMembers, id]
      );
    };

    const removeMember = (id) => {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    };

    return (
      <div className="cc-modal-overlay" onClick={onCancel}>
        <div
          className="cc-modal create-channel-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="cc-modal-header cc-modal-header--with-title">
            <div>
              <h1 className="cc-modal-title">
                Add people to <span className="cc-lock-channel-name">🔒 {channelName}</span>
              </h1>
            </div>
            <button
              type="button"
              className="cc-icon-button"
              aria-label="Close"
              onClick={onCancel}
            >
              ×
            </button>
          </div>

          <div className="cc-modal-body">
            {/* Selected pills + search input */}
            <div className="cc-member-input-wrapper">
              {selectedMembers.map((id) => {
                const member = mockMembers.find((m) => m.id === id);
                if (!member) return null;
                return (
                  <div key={id} className="cc-member-pill">
                    <div className={`avatar avatar-tiny ${member.avatarColor}`}>
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} />
                      ) : (
                        member.initials
                      )}
                    </div>
                    <span className="cc-member-pill-name">{member.name}</span>
                    <button
                      type="button"
                      className="cc-member-pill-remove"
                      onClick={() => removeMember(id)}
                      aria-label={`Remove ${member.name}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              <input
                className="cc-member-search-input"
                placeholder="Type a name..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* Member list */}
            <ul className="cc-member-list">
              {filteredMembers.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                return (
                  <li
                    key={member.id}
                    className={
                      "cc-member-list-item" +
                      (isSelected ? " cc-member-list-item--selected" : "")
                    }
                    onClick={() => toggleMember(member.id)}
                  >
                    <input
                      type="checkbox"
                      className="cc-member-checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <div className={`avatar avatar-small ${member.avatarColor}`}>
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} />
                      ) : (
                        member.initials
                      )}
                    </div>
                    <div className="cc-member-info">
                      <div className="cc-member-name">{member.name}</div>
                      <div className="cc-member-status">
                        <span
                          className={`cc-status-indicator cc-status-indicator--${member.status}`}
                        />
                        {member.status}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="cc-modal-footer">
            <button
              type="button"
              className="cc-text-btn"
              onClick={() => handleCreateWithMembers([])}
            >
              Skip for now
            </button>
            <button
              type="button"
              className="cc-primary-btn"
              onClick={() => handleCreateWithMembers(selectedMembers)}
            >
              Create channel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Intent
  const primaryLabel = isPrivate ? "Next" : "Create channel";

  return (
    <div className="cc-modal-overlay" onClick={onCancel}>
      <div
        className="cc-modal create-channel-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top-right actions */}
        <div className="cc-modal-header">
          <button
            type="button"
            className="cc-icon-button"
            aria-label="Close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        {/* Center content */}
        <div className="cc-modal-body">
          <h1 className="cc-modal-title">What should your channel do?</h1>

          <div className="cc-modal-template-row">
            {TEMPLATE_PROMPTS.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className="cc-btn-template"
                onClick={() => handleTemplateClick(tpl)}
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <div className={`cc-modal-prompt-card${focused ? " cc-modal-prompt-card--focused" : ""}`}>
            <textarea
              className="cc-modal-textarea"
              placeholder="Describe what you want your channel to do."
              value={prompt}
              onChange={handlePromptChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              rows={6}
            />
          </div>

          {/* Channel visibility toggle */}
          <div className="cc-visibility-row">
            <span className="cc-visibility-icon">
              {isPrivate ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              )}
            </span>
            <span className="cc-visibility-text">
              {isPrivate
                ? "Only selected members will be able to access this channel"
                : "Anyone in your workspace can access this channel"}
            </span>
            <button
              type="button"
              className={`cc-toggle-switch${isPrivate ? " cc-toggle-switch--on" : ""}`}
              onClick={() => setIsPrivate(!isPrivate)}
              role="switch"
              aria-checked={isPrivate}
            >
              <span className="cc-toggle-knob" />
            </button>
          </div>
        </div>

        {/* Footer with Create channel button */}
        <div className="cc-modal-footer">
          <button
            type="button"
            className="cc-text-btn"
            onClick={() => {
              if (isPrivate) {
                setIsBlankChannel(true);
                setStep(2);
              } else {
                onCreateBlank(false, [], { pendingSetup: true });
              }
            }}
          >
            Skip to blank channel
          </button>
          <button
            type="button"
            className="cc-primary-btn"
            onClick={handlePrimaryClick}
            disabled={!hasText}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateChannelIntentModal;
