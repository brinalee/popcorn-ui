// src/components/CreateChannelIntentModal.jsx
import { useState } from "react";

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
    shortPrompt: 'Post a team update covering "What We Finished", "What We\'re Working On Now", "What\'s Coming Next" every weekday at 09:00 PST.',
    defaultChannelSlug: "daily-updates",
    settingsInstructions: `Post a daily team update every weekday at 09:00 PST. Pull information from company knowledge only.

**Format:**
• Title: === Team Update (Nov 18, 2025 – Nov 19, 2025) ===
• Three sections: "What We Finished", "What We're Working On Now", "What's Coming Next"
• 5-8 bullets per section max

**Style:**
• Focus on outcomes and impact, not commit logs
• Use plain language, not tool jargon
• Hide URLs behind descriptive link text
• Attribute work to person/team (e.g., "– Alex")

**Sections:**
• What We Finished – Shipped work, user impact, perf wins, reliability improvements
• What We're Working On Now – Active work this week with context on why it matters
• What's Coming Next – Upcoming launches, migrations, experiments`
  },
  "bug-triage": {
    id: "bug-triage",
    label: "Triage bugs",
    shortPrompt: "Triage every message that reports a bug or provides feedback into Linear.",
    defaultChannelSlug: "bug-triage",
    settingsInstructions: "Triage every message that reports a bug or provides feedback into Linear."
  },
  "release-notes": {
    id: "release-notes",
    label: "Post release notes",
    shortPrompt: "Post release notes here whenever a deployed-build GitHub Action hits this webhook.",
    defaultChannelSlug: "release-notes",
    settingsInstructions: "Post release notes here whenever a deployed-build GitHub Action hits this webhook."
  }
};

const TEMPLATE_PROMPTS = Object.values(CHANNEL_TEMPLATES);

function CreateChannelIntentModal({ onCancel, onCreateFromPrompt, onCreateBlank, onCreateFromTemplate }) {
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const hasText = prompt.trim().length > 0;

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

  const handleCreateClick = () => {
    if (selectedTemplateId && CHANNEL_TEMPLATES[selectedTemplateId]) {
      // User clicked a template - use the full template data
      const template = CHANNEL_TEMPLATES[selectedTemplateId];
      onCreateFromTemplate({
        slug: template.defaultChannelSlug,
        name: template.defaultChannelSlug,
        instructions: template.settingsInstructions,
        templateId: template.id
      });
    } else if (hasText) {
      // User typed custom text - use the custom prompt
      onCreateFromPrompt(prompt);
    } else {
      // Empty - create blank channel
      onCreateBlank();
    }
  };

  return (
    <div className="cc-modal-overlay" onClick={onCancel}>
      <div
        className="cc-modal"
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
        </div>

        {/* Footer with Create channel button */}
        <div className="cc-modal-footer">
          <button
            type="button"
            className="cc-primary-btn"
            onClick={handleCreateClick}
          >
            <span key={hasText ? "with-text" : "blank"} className="cc-btn-text-fade">
              {hasText ? "Create channel" : "Create blank channel"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateChannelIntentModal;
