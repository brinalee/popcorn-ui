// src/components/ChannelSettingsPage.jsx
import { useState, useRef, useEffect } from "react";
import ConnectorsDialog from "./ConnectorsDialog";

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

// Helper function to split instructions around "company knowledge"
const COMPANY_KNOWLEDGE_TOKEN = "company knowledge";

function splitAroundCompanyKnowledge(text) {
  const index = text.toLowerCase().indexOf(COMPANY_KNOWLEDGE_TOKEN);
  if (index === -1) {
    return { before: text, after: "", hasToken: false };
  }
  const before = text.slice(0, index);
  const after = text.slice(index + COMPANY_KNOWLEDGE_TOKEN.length);
  return { before, after, hasToken: true };
}

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

  // Sources dropdown state
  const [isSourcesMenuOpen, setIsSourcesMenuOpen] = useState(false);
  const sourcesMenuRef = useRef(null);
  const sourcesPillRef = useRef(null);

  // Connectors dialog state
  const [isConnectorsDialogOpen, setIsConnectorsDialogOpen] = useState(false);

  const maxNameLength = 80;
  const remaining = maxNameLength - name.length;
  const nameTooLong = remaining < 0;
  const canSave = !nameTooLong && name.trim().length > 0;

  // Sources menu click-outside handling
  useEffect(() => {
    if (!isSourcesMenuOpen) return;

    function handleClickOutside(event) {
      const target = event.target;
      if (
        sourcesMenuRef.current &&
        !sourcesMenuRef.current.contains(target) &&
        sourcesPillRef.current &&
        !sourcesPillRef.current.contains(target)
      ) {
        setIsSourcesMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsSourcesMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSourcesMenuOpen]);

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
          <div className="webhook-mode-trigger-content">
            <span className="webhook-mode-trigger-label">{currentModeDisplay.label}</span>
            {currentModeDisplay.subtitle && (
              <span className="webhook-mode-trigger-subtitle">{currentModeDisplay.subtitle}</span>
            )}
          </div>
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
          <h1 className="channel-settings-title">#{channel?.name || "channel"} settings</h1>
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
            (activeTab === "connectors" ? " channel-settings-tab--active" : "")
          }
          onClick={() => setActiveTab("connectors")}
        >
          Webhooks
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
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bug-triaging, daily-updates..."
                />
                <div
                  className={
                    "cc-char-counter" + (nameTooLong ? " cc-char-counter--error" : "")
                  }
                >
                  {remaining}/80
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="cc-field-group">
              <label className="cc-field-label">Instructions</label>
              {(() => {
                const { before, after, hasToken } = splitAroundCompanyKnowledge(instructions);

                return (
                  <>
                    <div className="cc-instructions-box">
                      {hasToken ? (
                        <p className="cc-instructions-text">
                          <span>{before}</span>
                          <span className="cc-inline-pill-wrapper">
                            <button
                              ref={sourcesPillRef}
                              type="button"
                              className="cc-inline-pill"
                              style={{ fontSize: '16px' }}
                              onClick={() => setIsSourcesMenuOpen(!isSourcesMenuOpen)}
                            >
                              <span className="cc-inline-pill-icon" aria-hidden="true">
                                🏠
                              </span>
                              <span>Brina's Company Knowledge</span>
                            </button>

                            {isSourcesMenuOpen && (
                              <div ref={sourcesMenuRef} className="cc-sources-menu" role="menu">
                                <button className="cc-sources-item" type="button">
                                  <span className="cc-sources-icon">🔷</span>
                                  <span>Linear</span>
                                  <span className="cc-sources-toggle cc-sources-toggle--on">
                                    <span className="cc-toggle-track">
                                      <span className="cc-toggle-thumb"></span>
                                    </span>
                                  </span>
                                </button>
                                <button className="cc-sources-item" type="button">
                                  <span className="cc-sources-icon">🐙</span>
                                  <span>GitHub</span>
                                  <span className="cc-sources-toggle cc-sources-toggle--on">
                                    <span className="cc-toggle-track">
                                      <span className="cc-toggle-thumb"></span>
                                    </span>
                                  </span>
                                </button>
                                <button className="cc-sources-item" type="button">
                                  <span className="cc-sources-icon">📝</span>
                                  <span>Notion</span>
                                  <span className="cc-sources-toggle cc-sources-toggle--on">
                                    <span className="cc-toggle-track">
                                      <span className="cc-toggle-thumb"></span>
                                    </span>
                                  </span>
                                </button>
                                <button className="cc-sources-item" type="button">
                                  <span className="cc-sources-icon">📁</span>
                                  <span>Google Drive</span>
                                  <span className="cc-sources-status">Connect</span>
                                </button>
                                <button className="cc-sources-item" type="button">
                                  <span className="cc-sources-icon">🎨</span>
                                  <span>Figma</span>
                                  <span className="cc-sources-status">Connect</span>
                                </button>
                                <button className="cc-sources-item" type="button">
                                  <span className="cc-sources-icon">📋</span>
                                  <span>Trello</span>
                                  <span className="cc-sources-status">Connect</span>
                                </button>
                                <button
                                  className="cc-sources-item cc-sources-item--more"
                                  type="button"
                                  onClick={() => {
                                    setIsSourcesMenuOpen(false);
                                    setIsConnectorsDialogOpen(true);
                                  }}
                                >
                                  <span className="cc-sources-icon">⋯</span>
                                  <span>Connect more</span>
                                </button>
                              </div>
                            )}
                          </span>
                          <span>{after}</span>
                        </p>
                      ) : (
                        <p className="cc-instructions-text">{instructions}</p>
                      )}
                    </div>
                    <div className="cc-tools-missing" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <span className="cc-tools-missing-text">Some tools are missing</span>
                      <span className="cc-tools-missing-separator"> · </span>
                      <button
                        type="button"
                        className="cc-tools-missing-link"
                        onClick={() => setIsSourcesMenuOpen(!isSourcesMenuOpen)}
                      >
                        Connect
                      </button>
                    </div>
                  </>
                );
              })()}
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
              <p className="settings-section-help" style={{ fontSize: '16px' }}>
                Webhooks give you a simple way to bring data from your external tools into this channel. Create a webhook URL, send it events, and Popcorn will handle the rest.
              </p>

              {webhooks.length === 0 ? (
                <div className="webhook-empty-state">
                  <div className="webhook-empty-illustration">
                    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Equipment desk illustration */}
                      <rect x="60" y="80" width="160" height="70" rx="4" fill="#4a4a4a"/>
                      <rect x="70" y="60" width="140" height="30" rx="2" fill="#5a5a5a"/>
                      {/* Monitor/display */}
                      <rect x="80" y="65" width="40" height="20" rx="2" fill="#3a3a3a"/>
                      <path d="M85 70 L95 80 L105 72 L115 78" stroke="#6366f1" strokeWidth="2" fill="none"/>
                      {/* Knobs and buttons */}
                      <circle cx="140" cy="75" r="6" fill="#3a3a3a"/>
                      <circle cx="155" cy="75" r="4" fill="#6b7280"/>
                      <rect x="165" y="68" width="3" height="14" rx="1" fill="#6b7280"/>
                      <rect x="172" y="70" width="3" height="10" rx="1" fill="#6b7280"/>
                      <rect x="179" y="66" width="3" height="18" rx="1" fill="#6b7280"/>
                      <rect x="186" y="72" width="3" height="8" rx="1" fill="#6b7280"/>
                      {/* Pink dots */}
                      <circle cx="130" cy="82" r="3" fill="#ec4899"/>
                      <circle cx="140" cy="82" r="3" fill="#ec4899"/>
                      {/* Lower panel buttons */}
                      <rect x="75" y="95" width="50" height="40" rx="2" fill="#3a3a3a"/>
                      <circle cx="100" cy="125" r="8" fill="#4a4a4a"/>
                      <path d="M97 125 L103 125 M100 122 L100 128" stroke="#6b7280" strokeWidth="1.5"/>
                      {/* Right panel */}
                      <rect x="135" y="95" width="70" height="40" rx="2" fill="#3a3a3a"/>
                      <circle cx="150" cy="105" r="3" fill="#6b7280"/>
                      <circle cx="160" cy="105" r="3" fill="#6b7280"/>
                      <circle cx="150" cy="115" r="3" fill="#6b7280"/>
                      <circle cx="160" cy="115" r="3" fill="#6b7280"/>
                      <rect x="175" y="100" width="20" height="25" rx="2" fill="#4a4a4a"/>
                      {/* Headphones */}
                      <ellipse cx="55" cy="130" rx="20" ry="25" fill="none" stroke="#5a5a5a" strokeWidth="8"/>
                      <circle cx="40" cy="140" r="12" fill="#4a4a4a"/>
                      <circle cx="70" cy="140" r="12" fill="#4a4a4a"/>
                      {/* Antenna ball */}
                      <line x1="95" y1="60" x2="95" y2="35" stroke="#6b7280" strokeWidth="2"/>
                      <circle cx="95" cy="30" r="8" fill="#e5e7eb"/>
                      <path d="M91 28 L93 32 M95 26 L95 32 M99 28 L97 32" stroke="#9ca3af" strokeWidth="1"/>
                      {/* Sparkle */}
                      <path d="M185 35 L188 45 L185 55 L182 45 Z" fill="#6366f1"/>
                      <path d="M175 45 L185 42 L195 45 L185 48 Z" fill="#6366f1"/>
                      {/* Cable */}
                      <path d="M205 110 Q 230 120, 240 140" stroke="#3a3a3a" strokeWidth="3" fill="none"/>
                      <circle cx="240" cy="145" r="8" fill="#4a4a4a"/>
                      {/* Soldering iron */}
                      <rect x="220" y="125" width="40" height="12" rx="2" fill="#5a5a5a"/>
                      <polygon points="260,128 280,131 260,134" fill="#f59e0b"/>
                    </svg>
                  </div>
                  <h3 className="webhook-empty-title">You have no webhooks!</h3>
                  <button
                    type="button"
                    className="cc-btn-primary webhook-create-btn"
                    onClick={handleAddWebhook}
                  >
                    Create Webhook
                  </button>
                </div>
              ) : (
                <>
                  <div className="webhook-header-row">
                    <button
                      type="button"
                      className="cc-btn-primary"
                      onClick={handleAddWebhook}
                    >
                      New Webhook
                    </button>
                  </div>

                  <div className="webhook-list">

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

                    {/* Bottom row: created-at on left, buttons on right */}
                    <div className="webhook-bottom-row">
                      <div className="webhook-bottom-left">
                        <span className="webhook-created-at">
                          Created {formatCreatedAt(wh.createdAt)}
                        </span>
                        <button
                          type="button"
                          className="webhook-activity-btn"
                          onClick={() => console.log("See activity for webhook:", wh.id)}
                        >
                          See activity
                        </button>
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
                </>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Connectors Dialog */}
      <ConnectorsDialog
        isOpen={isConnectorsDialogOpen}
        onClose={() => setIsConnectorsDialogOpen(false)}
        onConnectorClick={(connector) => {
          console.log("Selected connector:", connector);
          setIsConnectorsDialogOpen(false);
        }}
      />
    </div>
  );
}

export default ChannelSettingsPage;
