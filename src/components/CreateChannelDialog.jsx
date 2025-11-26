// src/components/CreateChannelDialog.jsx
import { useState, useRef, useEffect } from "react";
import ConnectorsDialog from "./ConnectorsDialog";

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

// Default instructions for new channels
const DEFAULT_INSTRUCTIONS = "You are a helpful assistant for this channel. When someone asks a question, use company knowledge to provide the best answer.";

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

function CreateChannelDialog({ isOpen, onClose, onChannelCreated }) {
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [allowMentions, setAllowMentions] = useState(true);
  const [autoChime, setAutoChime] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Sources menu state
  const [isSourcesMenuOpen, setIsSourcesMenuOpen] = useState(false);

  // Connectors dialog state
  const [isConnectorsDialogOpen, setIsConnectorsDialogOpen] = useState(false);

  // Step 2 fields
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");

  const overlayRef = useRef(null);
  const sourcesMenuRef = useRef(null);
  const sourcesButtonRef = useRef(null);

  const maxNameLength = 80;
  const remaining = maxNameLength - name.length;
  const nameTooLong = remaining < 0;
  const canSubmitStep1 = !nameTooLong && name.trim().length > 0;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Sources menu click-outside handling
  useEffect(() => {
    if (!isSourcesMenuOpen) return;

    function handleClickOutside(event) {
      const target = event.target;
      if (
        sourcesMenuRef.current &&
        !sourcesMenuRef.current.contains(target) &&
        sourcesButtonRef.current &&
        !sourcesButtonRef.current.contains(target)
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

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setName("");
      setIsPrivate(false);
      setInstructions(DEFAULT_INSTRUCTIONS);
      setAllowMentions(true);
      setAutoChime(false);
      setWebhookUrl("");
      setTestRunning(false);
      setTestResults(null);
      setIsSourcesMenuOpen(false);
      setIsConnectorsDialogOpen(false);
      setSelectedMembers([]);
      setMemberSearch("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleRunTest = async () => {
    setTestRunning(true);
    setTestResults(null);

    // Simulate test run
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setTestRunning(false);
    setTestResults({
      passed: true,
      message: "Test passed successfully",
    });
  };

  const handlePrimaryAction = () => {
    if (!canSubmitStep1) return;

    if (isPrivate) {
      // Move to step 2
      setStep(2);
    } else {
      // Create public channel immediately
      onChannelCreated({
        id: `channel-${Date.now()}`,
        name: name.trim(),
        isPrivate: false,
        instructions,
        allowMentions,
        autoChime,
        webhookUrl: webhookUrl.trim() || undefined,
        members: [],
      });
    }
  };

  const handleCreatePrivateChannel = () => {
    onChannelCreated({
      id: `channel-${Date.now()}`,
      name: name.trim(),
      isPrivate: true,
      instructions,
      allowMentions,
      autoChime,
      webhookUrl: webhookUrl.trim() || undefined,
      members: selectedMembers.map(id => mockMembers.find(m => m.id === id)),
    });
  };

  const primaryLabel = step === 1 ? (isPrivate ? "Next" : "Create channel") : "Create channel";

  return (
    <div
      ref={overlayRef}
      className="cc-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="cc-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-channel-title"
      >
        {step === 1 ? (
          <ChannelDetailsStep
            name={name}
            setName={setName}
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
            instructions={instructions}
            setInstructions={setInstructions}
            allowMentions={allowMentions}
            setAllowMentions={setAllowMentions}
            autoChime={autoChime}
            setAutoChime={setAutoChime}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            remaining={remaining}
            nameTooLong={nameTooLong}
            canSubmit={canSubmitStep1}
            testRunning={testRunning}
            testResults={testResults}
            onRunTest={handleRunTest}
            onClose={onClose}
            onPrimary={handlePrimaryAction}
            primaryLabel={primaryLabel}
            isSourcesMenuOpen={isSourcesMenuOpen}
            setIsSourcesMenuOpen={setIsSourcesMenuOpen}
            sourcesMenuRef={sourcesMenuRef}
            sourcesButtonRef={sourcesButtonRef}
            setIsConnectorsDialogOpen={setIsConnectorsDialogOpen}
          />
        ) : (
          <ChannelMembersStep
            channelName={name}
            selectedMembers={selectedMembers}
            setSelectedMembers={setSelectedMembers}
            memberSearch={memberSearch}
            setMemberSearch={setMemberSearch}
            onBack={() => setStep(1)}
            onClose={onClose}
            onCreate={handleCreatePrivateChannel}
          />
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

// Step 1: Channel Details
function ChannelDetailsStep({
  name,
  setName,
  isPrivate,
  setIsPrivate,
  instructions,
  setInstructions,
  allowMentions,
  setAllowMentions,
  autoChime,
  setAutoChime,
  webhookUrl,
  setWebhookUrl,
  remaining,
  nameTooLong,
  canSubmit,
  testRunning,
  testResults,
  onRunTest,
  onClose,
  onPrimary,
  primaryLabel,
  isSourcesMenuOpen,
  setIsSourcesMenuOpen,
  sourcesMenuRef,
  sourcesButtonRef,
  setIsConnectorsDialogOpen,
}) {
  return (
    <>
      <header className="cc-modal-header">
        <div>
          <h1 id="create-channel-title" className="cc-modal-title">
            Create channel
          </h1>
          <p className="cc-modal-subtitle">
            Describe how you want Popcorn to work in this channel.
          </p>
        </div>
        <button
          type="button"
          className="cc-modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div className="cc-modal-body">
        {/* Channel name row with visibility toggle */}
        <div className="cc-field-group">
          <div className="cc-field-label-row">
            <label className="cc-field-label">Channel name</label>
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
              autoFocus
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
                          ref={sourcesButtonRef}
                          type="button"
                          className="cc-inline-pill"
                          onClick={() => setIsSourcesMenuOpen(!isSourcesMenuOpen)}
                        >
                          <span className="cc-inline-pill-icon" aria-hidden="true">
                            🏠
                          </span>
                          <span>Company knowledge</span>
                        </button>

                        {isSourcesMenuOpen && (
                          <div ref={sourcesMenuRef} className="cc-sources-menu" role="menu">
                            <button className="cc-sources-item" type="button">
                              <span className="cc-sources-icon">📁</span>
                              <span>Google Drive</span>
                              <span className="cc-sources-status">Connect</span>
                            </button>
                            <button className="cc-sources-item" type="button">
                              <span className="cc-sources-icon">🐙</span>
                              <span>GitHub</span>
                              <span className="cc-sources-status">Connect</span>
                            </button>
                            <button className="cc-sources-item" type="button">
                              <span className="cc-sources-icon">🔷</span>
                              <span>Linear</span>
                              <span className="cc-sources-status">Connect</span>
                            </button>
                            <button className="cc-sources-item" type="button">
                              <span className="cc-sources-icon">📝</span>
                              <span>Notion</span>
                              <span className="cc-sources-status">Connect</span>
                            </button>
                            <button className="cc-sources-item" type="button">
                              <span className="cc-sources-icon">🎨</span>
                              <span>Figma</span>
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
                <div className="cc-tools-missing" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
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

        {/* Webhooks section */}
        <div className="cc-field-group">
          <div className="cc-field-label">Webhooks</div>
          <p className="cc-field-help">
            Optionally connect external tools (PagerDuty, Linear, GitHub, etc.)
            by posting events into this channel.
          </p>
          <div className="cc-webhook-row">
            <input
              className="cc-text-input cc-webhook-input"
              placeholder="Webhook URL (optional)"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <button
              type="button"
              className={
                "cc-secondary-btn" + (testRunning ? " cc-test-button--running" : "")
              }
              onClick={onRunTest}
              disabled={!instructions.trim() || testRunning}
            >
              {testRunning ? "Running..." : "Run test"}
            </button>
          </div>
          {testResults && (
            <div
              className={
                "cc-test-results" +
                (testResults.passed
                  ? " cc-test-results--success"
                  : " cc-test-results--error")
              }
            >
              {testResults.message}
            </div>
          )}
        </div>
      </div>

      <footer className="cc-modal-footer">
        <button type="button" className="cc-secondary-btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="cc-primary-btn"
          disabled={!canSubmit}
          onClick={onPrimary}
        >
          {primaryLabel}
        </button>
      </footer>
    </>
  );
}

// Step 2: Members Selection
function ChannelMembersStep({
  channelName,
  selectedMembers,
  setSelectedMembers,
  memberSearch,
  setMemberSearch,
  onBack,
  onClose,
  onCreate,
}) {
  const normalized = memberSearch.trim().toLowerCase();
  const filteredMembers = mockMembers.filter((m) =>
    m.name.toLowerCase().includes(normalized)
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
    <>
      <header className="cc-modal-header">
        <div>
          <h1 className="cc-modal-title">Add members</h1>
          <p className="cc-modal-subtitle">
            Choose who can access <strong>#{channelName || "new-channel"}</strong>.
          </p>
        </div>
        <button
          type="button"
          className="cc-modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div className="cc-modal-body">
        <div className="cc-field-group">
          <label className="cc-field-label">Members</label>

          {/* Search input */}
          <input
            className="cc-text-input cc-member-search"
            placeholder="Search members..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            autoFocus
          />

          {/* Selected members pills */}
          {selectedMembers.length > 0 && (
            <div className="cc-selected-pills">
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
            </div>
          )}

          {/* Member list */}
          <ul className="cc-member-list">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
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
              })
            ) : (
              <div className="cc-member-list-empty">
                No members found matching "{memberSearch}"
              </div>
            )}
          </ul>
        </div>
      </div>

      <footer className="cc-modal-footer">
        <button type="button" className="cc-secondary-btn" onClick={onBack}>
          Back
        </button>
        <button type="button" className="cc-primary-btn" onClick={onCreate}>
          Create channel
        </button>
      </footer>
    </>
  );
}

export default CreateChannelDialog;
