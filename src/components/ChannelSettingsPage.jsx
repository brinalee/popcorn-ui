// src/components/ChannelSettingsPage.jsx
import { useState, useRef, useEffect } from "react";
import SettingsChatWithPopcorn from "./SettingsChatWithPopcorn";

// Default instructions for each webhook mode
const WEBHOOK_MODE_DEFAULTS = {
  "as-is": "Post the webhook payload as-is into this channel, without any AI processing.",
  "markdown": "Turn the webhook payload into a clean, markdown-formatted message that's easy for humans to read in this channel.",
  "summarize": "Look at the last 5 webhook events and post a short, concise summary of what changed.",
  "enrich": "For each webhook payload, look up additional context (for example related issues, services, or customers) and include that context in the message.",
  "translate": "Translate the resulting message into Spanish before posting it in this channel.",
  "silent": "Don't post a visible message. Quietly add this webhook's information to the channel's background context so Popcorn can use it later.",
  "custom": "", // leave blank; user will provide their own instruction
};

// Display metadata for each webhook mode
const WEBHOOK_MODE_DISPLAY = [
  {
    mode: "as-is",
    label: "Raw",
    subtitle: "Use the webhook exactly as received.",
  },
  {
    mode: "markdown",
    label: "Message",
    subtitle: "Turn the payload into a readable markdown message.",
  },
  {
    mode: "summarize",
    label: "Summary",
    subtitle: "Combine recent pings into a short digest.",
  },
  {
    mode: "enrich",
    label: "Context",
    subtitle: "Add extra details or related information.",
  },
  {
    mode: "translate",
    label: "Translate",
    subtitle: "Convert the message into another language.",
  },
  {
    mode: "silent",
    label: "Silent",
    subtitle: "Update channel context quietly, no visible post.",
  },
  {
    mode: "custom",
    label: "Custom",
    subtitle: "Write your own rule for this webhook.",
  },
];

// Helper function to get display data for a mode
const getWebhookModeDisplay = (mode) => {
  return WEBHOOK_MODE_DISPLAY.find((m) => m.mode === mode) || WEBHOOK_MODE_DISPLAY[0];
};

function ChannelSettingsPage({ channel, onSave, onCancel }) {
  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Form state
  const [name, setName] = useState(channel?.name || "");
  const [isPrivate, setIsPrivate] = useState(channel?.isPrivate || false);
  const [instructions, setInstructions] = useState(channel?.instructions || "");
  const [allowMentions, setAllowMentions] = useState(channel?.allowMentions ?? true);
  const [autoChime, setAutoChime] = useState(channel?.autoChime ?? false);
  const [webhooks, setWebhooks] = useState(channel?.webhooks || []);

  // Webhook mode dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const maxNameLength = 24;
  const remaining = maxNameLength - name.length;
  const nameTooLong = remaining < 0;
  const canSave = !nameTooLong && name.trim().length > 0;

  // Webhook management functions
  const handleAddWebhook = () => {
    const id = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const mockNames = ["GitHub deploys", "PagerDuty incidents", "CI failures", "App logs"];
    const name = mockNames[webhooks.length % mockNames.length];
    const now = new Date().toISOString();

    const newWebhook = {
      id,
      name,
      url: `https://hooks.kewl.dev/mock/${id}`,
      mode: "summarize",
      createdAt: now,
      customCommand: WEBHOOK_MODE_DEFAULTS["summarize"],
    };

    setWebhooks([...webhooks, newWebhook]);
  };

  const formatCreatedAt = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  const handleUpdateWebhook = (id, patch) => {
    setWebhooks(webhooks.map((wh) => (wh.id === id ? { ...wh, ...patch } : wh)));
  };

  const handleDeleteWebhook = (id) => {
    setWebhooks(webhooks.filter((wh) => wh.id !== id));
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      // Optional: Add toast notification
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSave = () => {
    if (!canSave || !channel) return;

    const updatedChannel = {
      ...channel,
      name: name.trim(),
      label: name.trim(),
      isPrivate,
      instructions,
      allowMentions,
      autoChime,
      webhooks,
    };

    onSave(updatedChannel);
  };

  // WebhookModeDropdown component
  function WebhookModeDropdown({ webhook }) {
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const isOpen = openDropdownId === webhook.id;
    const currentModeDisplay = getWebhookModeDisplay(webhook.mode);

    // Handle click outside and Escape key
    useEffect(() => {
      if (!isOpen) return;

      function handleClickOutside(event) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)
        ) {
          setOpenDropdownId(null);
        }
      }

      function handleKeyDown(event) {
        if (event.key === "Escape") {
          setOpenDropdownId(null);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    const handleModeSelect = (mode) => {
      handleUpdateWebhook(webhook.id, {
        mode: mode,
        customCommand:
          mode === "custom" ? (webhook.customCommand || "") : WEBHOOK_MODE_DEFAULTS[mode],
      });
      setOpenDropdownId(null);
    };

    return (
      <div className="webhook-mode-dropdown">
        <button
          ref={buttonRef}
          type="button"
          className="webhook-mode-trigger"
          onClick={() => setOpenDropdownId(isOpen ? null : webhook.id)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="webhook-mode-trigger-label">{currentModeDisplay.label}</span>
          <svg
            className="webhook-mode-trigger-arrow"
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {isOpen && (
          <div ref={dropdownRef} className="webhook-mode-menu" role="listbox">
            {WEBHOOK_MODE_DISPLAY.map((option) => {
              const isSelected = option.mode === webhook.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  className={
                    "webhook-mode-option" +
                    (isSelected ? " webhook-mode-option--selected" : "")
                  }
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleModeSelect(option.mode)}
                >
                  <div className="webhook-mode-option-content">
                    <span className="webhook-mode-option-label">{option.label}</span>
                    <span className="webhook-mode-option-subtitle">{option.subtitle}</span>
                  </div>
                  {isSelected && (
                    <svg
                      className="webhook-mode-option-check"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3333 4L6 11.3333L2.66666 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="channel-settings-page">
      {/* Header */}
      <header className="channel-settings-header">
        <div>
          <h1 className="channel-settings-title">Channel settings</h1>
          <p className="channel-settings-subtitle">
            Configure how Popcorn works in this channel.
          </p>
        </div>
        <div className="channel-settings-actions">
          <button type="button" className="cc-secondary-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="cc-primary-btn"
            disabled={!canSave}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="channel-settings-tabs">
        <button
          type="button"
          className={
            "channel-settings-tab" +
            (activeTab === "overview" ? " channel-settings-tab--active" : "")
          }
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={
            "channel-settings-tab" +
            (activeTab === "members" ? " channel-settings-tab--active" : "")
          }
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>
        <button
          type="button"
          className={
            "channel-settings-tab" +
            (activeTab === "connectors" ? " channel-settings-tab--active" : "")
          }
          onClick={() => setActiveTab("connectors")}
        >
          Connectors
        </button>
        <button
          type="button"
          className={
            "channel-settings-tab" +
            (activeTab === "chat" ? " channel-settings-tab--active" : "")
          }
          onClick={() => setActiveTab("chat")}
        >
          Chat with Popcorn
        </button>
      </div>

      {/* Body */}
      <div className="channel-settings-body">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="settings-tab-content">
            {/* Channel name */}
            <div className="cc-field-group">
              <label className="cc-field-label">Channel name</label>
              <div className="cc-field-input-row">
                <div className="cc-channel-name-prefix">#</div>
                <input
                  className={
                    "cc-text-input cc-channel-name-input" +
                    (nameTooLong ? " cc-text-input--error" : "")
                  }
                  value={name}
                  maxLength={40}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bug-triaging, daily-updates..."
                />
                <div
                  className={
                    "cc-char-counter" + (nameTooLong ? " cc-char-counter--error" : "")
                  }
                >
                  {remaining}/24
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="cc-field-group">
              <label className="cc-field-label">Instructions</label>
              <textarea
                className="cc-textarea"
                rows={12}
                placeholder="Example:&#10;When someone reports a bug in this channel, capture the details and turn it into a Linear issue.&#10;If there's already a similar open issue, link to it and add a comment instead of creating a duplicate.&#10;&#10;Keep everything in sync with Notion and post updates here when statuses change.&#10;&#10;Use the Webhook to bring external events into this channel and let Popcorn summarize changes."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Checkboxes */}
            <div className="cc-checkbox-group">
              <label className="cc-checkbox-row">
                <input
                  type="checkbox"
                  checked={allowMentions}
                  onChange={(e) => setAllowMentions(e.target.checked)}
                />
                <div>
                  <div className="cc-checkbox-label">Allow @popcorn mentions</div>
                  <div className="cc-checkbox-subtitle">
                    Team members can mention Popcorn for help.
                  </div>
                </div>
              </label>

              <label className="cc-checkbox-row">
                <input
                  type="checkbox"
                  checked={autoChime}
                  onChange={(e) => setAutoChime(e.target.checked)}
                />
                <div>
                  <div className="cc-checkbox-label">Auto-chime mode</div>
                  <div className="cc-checkbox-subtitle">
                    Let Popcorn automatically jump in when it can help.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="settings-tab-content">
            <div className="cc-field-group">
              <div className="cc-field-label-row">
                <label className="cc-field-label">Privacy</label>
                <div className="cc-visibility-pills">
                  <button
                    type="button"
                    className={
                      "cc-pill-toggle" + (!isPrivate ? " cc-pill-toggle--active" : "")
                    }
                    onClick={() => setIsPrivate(false)}
                  >
                    Public channel
                  </button>
                  <button
                    type="button"
                    className={
                      "cc-pill-toggle" + (isPrivate ? " cc-pill-toggle--active" : "")
                    }
                    onClick={() => setIsPrivate(true)}
                  >
                    Private channel
                  </button>
                </div>
              </div>
              <p className="cc-field-help">
                {isPrivate
                  ? "Only specific members can access this channel."
                  : "Anyone in your workspace can access this channel."}
              </p>
            </div>

            {isPrivate && (
              <div className="cc-field-group">
                <div className="cc-field-label">Channel members</div>
                <p className="cc-field-help">
                  Add or remove members who can access this private channel.
                </p>
                <div className="members-placeholder">
                  <p>Member management coming soon</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Connectors Tab */}
        {activeTab === "connectors" && (
          <div className="settings-tab-content">
            <section className="settings-section">
              <h2 className="settings-section-title">Webhooks</h2>
              <p className="settings-section-help">
                Optionally connect external tools (PagerDuty, Linear, GitHub, etc.) by posting events into this channel.
              </p>

              <div className="webhook-header-row">
                <button
                  type="button"
                  className="cc-btn-secondary"
                  onClick={handleAddWebhook}
                >
                  New webhook
                </button>
              </div>

              <div className="webhook-list">
                {webhooks.length === 0 && (
                  <p className="webhook-empty">
                    No webhooks yet. Click <strong>New webhook</strong> to get started.
                  </p>
                )}

                {webhooks.map((wh) => (
                  <div key={wh.id} className="webhook-card">
                    {/* Top row: Name + Mode */}
                    <div className="webhook-top-row">
                      <div className="webhook-field">
                        <label className="cc-field-label">Name</label>
                        <input
                          className="cc-text-input"
                          value={wh.name}
                          onChange={(e) => handleUpdateWebhook(wh.id, { name: e.target.value })}
                        />
                      </div>

                      <div className="webhook-field">
                        <label className="cc-field-label">Mode</label>
                        <WebhookModeDropdown webhook={wh} />
                      </div>
                    </div>

                    {/* Instructions input - visible for all modes */}
                    <div className="webhook-row">
                      <label className="cc-field-label">Instructions</label>
                      <textarea
                        className="cc-textarea"
                        rows={6}
                        placeholder="Describe how Popcorn should handle this webhook…"
                        value={wh.customCommand || ""}
                        onChange={(e) =>
                          handleUpdateWebhook(wh.id, { customCommand: e.target.value })
                        }
                      />
                    </div>

                    {/* Bottom row: created-at on left, buttons on right */}
                    <div className="webhook-bottom-row">
                      <div className="webhook-created-at">
                        Created {formatCreatedAt(wh.createdAt)}
                      </div>

                      <div className="webhook-bottom-right">
                        <button
                          type="button"
                          className="cc-btn-secondary"
                          onClick={() => handleCopyUrl(wh.url)}
                        >
                          Copy webhook URL
                        </button>

                        <button
                          type="button"
                          className="cc-btn-danger"
                          onClick={() => handleDeleteWebhook(wh.id)}
                        >
                          Delete webhook
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="settings-tab-content">
            <SettingsChatWithPopcorn channelName={channel?.name || "this channel"} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChannelSettingsPage;
