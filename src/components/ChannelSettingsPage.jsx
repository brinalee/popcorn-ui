// src/components/ChannelSettingsPage.jsx
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import KnowledgeKernelScreen from "./KnowledgeKernelScreen";
import WebhookActivityModal from "./WebhookActivityModal";
import KernelModal from "./KernelModal";
import {
  getWorkspaceKernel,
  getChannelKernelSettings,
  updateChannelKernelSettings,
} from "../utils/kernelData";
import { CONNECTORS, CONNECTOR_ICON_URLS } from "../utils/companyKnowledgeData";

// Generate unique ID
const generateId = () => `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// Token patterns for parsing
const TOKEN_RE = /\[\[(webhook|knowledge):([^\]]+)\]\]/g;
const KNOWLEDGE_TOKEN = "company knowledge";

// Parse instructions string into nodes array
function parseInstructions(text, webhooks = []) {
  if (!text) {
    return [{ id: generateId(), type: "text", text: "" }];
  }

  const nodes = [];
  let lastIndex = 0;

  // First, convert legacy "company knowledge" token to [[knowledge:company]]
  let normalizedText = text;
  const knowledgeIndex = normalizedText.toLowerCase().indexOf(KNOWLEDGE_TOKEN);
  if (knowledgeIndex !== -1) {
    normalizedText =
      normalizedText.slice(0, knowledgeIndex) +
      "[[knowledge:company]]" +
      normalizedText.slice(knowledgeIndex + KNOWLEDGE_TOKEN.length);
  }

  // Parse [[type:value]] tokens
  let match;
  while ((match = TOKEN_RE.exec(normalizedText)) !== null) {
    // Add text before token
    if (match.index > lastIndex) {
      nodes.push({
        id: generateId(),
        type: "text",
        text: normalizedText.slice(lastIndex, match.index),
      });
    }

    const tokenType = match[1]; // "webhook" or "knowledge"
    const tokenValue = match[2]; // webhook ID or "company"

    if (tokenType === "knowledge") {
      if (tokenValue === "linear") {
        nodes.push({
          id: generateId(),
          type: "source-pill",
          sourceKind: "knowledge",
          knowledgeType: "linear",
          label: "Your Kernel",
        });
      } else {
        nodes.push({
          id: generateId(),
          type: "source-pill",
          sourceKind: "knowledge",
          knowledgeType: "company",
          label: "Your Kernel",
        });
      }
    } else if (tokenType === "webhook") {
      const webhook = webhooks.find((wh) => wh.id === tokenValue);
      nodes.push({
        id: generateId(),
        type: "source-pill",
        sourceKind: "webhook",
        webhookId: tokenValue,
        label: webhook ? `Webhooks: ${webhook.name}` : "Webhooks: Unknown",
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < normalizedText.length) {
    nodes.push({
      id: generateId(),
      type: "text",
      text: normalizedText.slice(lastIndex),
    });
  }

  // Ensure at least one text node
  if (nodes.length === 0) {
    nodes.push({ id: generateId(), type: "text", text: "" });
  }

  return nodes;
}

// Serialize nodes array back to string
function serializeInstructions(nodes) {
  return nodes
    .map((n) => {
      if (n.type === "text") return n.text;
      if (n.type === "source-pill" && n.sourceKind === "webhook") {
        return `[[webhook:${n.webhookId}]]`;
      }
      if (n.type === "source-pill" && n.sourceKind === "knowledge") {
        if (n.knowledgeType === "linear") {
          return `[[knowledge:linear]]`;
        }
        return `[[knowledge:company]]`;
      }
      return "";
    })
    .join("");
}

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
    mode: "silent",
    label: "Silent",
    subtitle: "Update channel context quietly, no visible post.",
  },
];

// Helper function to get display data for a mode
const getWebhookModeDisplay = (mode) => {
  return WEBHOOK_MODE_DISPLAY.find((m) => m.mode === mode) || WEBHOOK_MODE_DISPLAY[0];
};


const ChannelSettingsPage = forwardRef(function ChannelSettingsPage({ channel, onSave, onCancel }, ref) {
  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Form state
  const [name, setName] = useState(channel?.name || "");
  const [isPrivate, setIsPrivate] = useState(channel?.isPrivate || false);
  const [webAccess, setWebAccess] = useState(channel?.webAccess ?? false);
  const [allowMentions, setAllowMentions] = useState(channel?.allowMentions ?? true);
  const [autoChime, setAutoChime] = useState(channel?.autoChime ?? false);
  const [webhooks, setWebhooks] = useState(channel?.webhooks || []);

  // Instructions nodes state (rich content)
  const [instructionsNodes, setInstructionsNodes] = useState(() =>
    parseInstructions(channel?.instructions || "", channel?.webhooks || [])
  );

  // Initial values for change detection
  const [initialName] = useState(channel?.name || "");
  const [initialInstructions] = useState(channel?.instructions || "");

  // Unsaved changes dialog state
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'tab' | 'cancel' | 'navigate', value?: string }

  // Mention popover state
  const [mention, setMention] = useState({
    active: false,
    query: "",
    anchorRect: null,
    showSubmenu: false, // show webhook submenu on hover
    submenuRect: null, // position for submenu
  });

  // Webhook picker popover state (for clicking existing pills)
  const [webhookPicker, setWebhookPicker] = useState({
    open: false,
    anchorRect: null,
    targetNodeId: null, // text node or existing pill to update
    currentWebhookId: null, // webhook ID the pill references
    cursorPosition: 0, // position in text where we insert
    showSwitchSubmenu: false, // show switch webhook submenu on hover
    switchSubmenuRect: null, // position for switch submenu
  });

  // Editor ref
  const editorRef = useRef(null);
  const mentionPopoverRef = useRef(null);
  const webhookPickerRef = useRef(null);

  // Webhook mode dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Sources dropdown state
  const [isSourcesMenuOpen, setIsSourcesMenuOpen] = useState(false);
  const [isLinearSourcesMenuOpen, setIsLinearSourcesMenuOpen] = useState(false);
  const sourcesMenuRef = useRef(null);
  const sourcesPillRef = useRef(null);
  const linearSourcesMenuRef = useRef(null);
  const linearSourcesPillRef = useRef(null);


  // Connectors dialog state
  const [isKernelScreenOpen, setIsKernelScreenOpen] = useState(false);

  // Webhook activity modal state
  const [activityWebhook, setActivityWebhook] = useState(null);

  // Kernel modal state
  const [isKernelModalOpen, setIsKernelModalOpen] = useState(false);

  // Knowledge Kernel state
  const [kernelSettings, setKernelSettings] = useState(() =>
    getChannelKernelSettings(channel?.id)
  );
  const [workspaceKernel, setWorkspaceKernel] = useState(() => getWorkspaceKernel());

  // Source definitions for the kernel
  const KERNEL_SOURCES = [
    { id: "github", name: "GitHub", icon: "🐙" },
    { id: "notion", name: "Notion", icon: "📝" },
    { id: "linear", name: "Linear", icon: "🔷" },
    { id: "figma", name: "Figma", icon: "🎨" },
    { id: "trello", name: "Trello", icon: "📋" },
    { id: "asana", name: "Asana", icon: "🎯" },
    { id: "google-drive", name: "Google Drive", icon: "📁" },
  ];

  // Get active sources for this channel
  const getChannelActiveSources = () => {
    if (!kernelSettings.kernelEnabled) return [];
    return workspaceKernel.sourceIds.filter(
      (id) => !kernelSettings.disabledSources.includes(id)
    );
  };

  // Toggle kernel for this channel
  const handleToggleKernel = () => {
    const newSettings = {
      ...kernelSettings,
      kernelEnabled: !kernelSettings.kernelEnabled,
    };
    setKernelSettings(newSettings);
    updateChannelKernelSettings(channel?.id, newSettings);
  };

  // Toggle individual source for this channel
  const handleToggleSource = (sourceId) => {
    const isDisabled = kernelSettings.disabledSources.includes(sourceId);
    const newDisabledSources = isDisabled
      ? kernelSettings.disabledSources.filter((id) => id !== sourceId)
      : [...kernelSettings.disabledSources, sourceId];
    const newSettings = {
      ...kernelSettings,
      disabledSources: newDisabledSources,
    };
    setKernelSettings(newSettings);
    updateChannelKernelSettings(channel?.id, newSettings);
  };

  // Handle Kernel screen close - refresh state and auto-disable new sources
  const handleKernelScreenClose = () => {
    const oldSourceIds = workspaceKernel.sourceIds;
    const newKernel = getWorkspaceKernel();
    const newSourceIds = newKernel.sourceIds;

    // Find newly added sources
    const addedSources = newSourceIds.filter(id => !oldSourceIds.includes(id));

    // Add new sources to disabledSources (so they start OFF)
    if (addedSources.length > 0) {
      const newDisabledSources = [
        ...kernelSettings.disabledSources,
        ...addedSources
      ];
      const newSettings = {
        ...kernelSettings,
        disabledSources: newDisabledSources,
      };
      setKernelSettings(newSettings);
      updateChannelKernelSettings(channel?.id, newSettings);
    }

    // Update workspace kernel state
    setWorkspaceKernel(newKernel);
    setIsKernelScreenOpen(false);
  };

  const maxNameLength = 80;
  const remaining = maxNameLength - name.length;
  const nameTooLong = remaining < 0;

  // Compute hasChanges by comparing current values to initial values
  const currentInstructions = serializeInstructions(instructionsNodes);
  const hasChanges = name !== initialName || currentInstructions !== initialInstructions;

  // canSave requires valid name AND actual changes
  const canSave = !nameTooLong && name.trim().length > 0 && hasChanges;

  // Reset handler - restore all values to initial state
  const handleReset = () => {
    setName(channel?.name || "");
    setInstructionsNodes(parseInstructions(channel?.instructions || "", channel?.webhooks || []));
  };

  // Tab change handler with unsaved changes guard
  const handleTabChange = (newTab) => {
    if (hasChanges && activeTab === "overview") {
      setPendingAction({ type: "tab", value: newTab });
      setShowUnsavedDialog(true);
    } else {
      setActiveTab(newTab);
    }
  };

  // Cancel click handler with unsaved changes guard
  const handleCancelClick = () => {
    if (hasChanges) {
      setPendingAction({ type: "cancel" });
      setShowUnsavedDialog(true);
    } else {
      onCancel();
    }
  };

  // Execute the pending action after dialog choice
  const executePendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "tab") {
      setActiveTab(pendingAction.value);
    } else if (pendingAction.type === "cancel" || pendingAction.type === "navigate") {
      onCancel();
    }
    setPendingAction(null);
  };

  // Discard changes and proceed with pending action
  const handleDiscardAndProceed = () => {
    setShowUnsavedDialog(false);
    executePendingAction();
  };

  // Save changes and proceed with pending action
  const handleSaveAndProceed = () => {
    handleSave();
    setShowUnsavedDialog(false);
    executePendingAction();
  };

  // Expose methods to parent via ref for sidebar navigation guard
  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => hasChanges,
    showUnsavedDialog: (action) => {
      if (hasChanges) {
        setPendingAction(action);
        setShowUnsavedDialog(true);
        return true; // blocked
      }
      return false; // not blocked
    }
  }), [hasChanges]);

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

  // Linear sources menu click-outside handling
  useEffect(() => {
    if (!isLinearSourcesMenuOpen) return;

    function handleClickOutside(event) {
      const target = event.target;
      if (
        linearSourcesMenuRef.current &&
        !linearSourcesMenuRef.current.contains(target) &&
        linearSourcesPillRef.current &&
        !linearSourcesPillRef.current.contains(target)
      ) {
        setIsLinearSourcesMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsLinearSourcesMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLinearSourcesMenuOpen]);

  // Mention popover click-outside and escape handling
  useEffect(() => {
    if (!mention.active) return;

    function handleClickOutside(event) {
      if (
        mentionPopoverRef.current &&
        !mentionPopoverRef.current.contains(event.target)
      ) {
        setMention({ active: false, query: "", anchorRect: null, showSubmenu: false, submenuRect: null });
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMention({ active: false, query: "", anchorRect: null, showSubmenu: false, submenuRect: null });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mention.active]);

  // Webhook picker click-outside and escape handling
  useEffect(() => {
    if (!webhookPicker.open) return;

    function handleClickOutside(event) {
      if (
        webhookPickerRef.current &&
        !webhookPickerRef.current.contains(event.target)
      ) {
        setWebhookPicker({ open: false, anchorRect: null, targetNodeId: null, cursorPosition: 0 });
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setWebhookPicker({ open: false, anchorRect: null, targetNodeId: null, cursorPosition: 0 });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [webhookPicker.open]);

  // Get caret position for popover placement
  const getCaretRect = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    return range.getBoundingClientRect();
  };

  // Handle webhook selection from mention submenu
  const handleSelectWebhookFromSubmenu = (wh) => {
    // Remove the @webhooks text from the current text node and insert pill
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;

      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || "";
        const cursorPos = range.startOffset;

        // Find the @ symbol before cursor
        let atIndex = text.lastIndexOf("@", cursorPos - 1);
        if (atIndex === -1) atIndex = text.lastIndexOf("@");

        if (atIndex !== -1) {
          // Remove @webhooks from text
          const before = text.slice(0, atIndex);
          const after = text.slice(cursorPos);
          textNode.textContent = before + after;

          // Find which node this is and update state with pill insertion
          const nodeId = textNode.parentElement?.dataset?.nodeId;
          if (nodeId) {
            setInstructionsNodes((nodes) => {
              const idx = nodes.findIndex((n) => n.id === nodeId);
              if (idx === -1) return nodes;

              const pill = {
                id: generateId(),
                type: "source-pill",
                sourceKind: "webhook",
                webhookId: wh.id,
                label: `Webhooks: ${wh.name}`,
              };

              const beforeText = before;
              const afterText = after;
              const newNodes = [...nodes];

              // Replace target with: before text, pill, after text
              const replacement = [];
              if (beforeText) {
                replacement.push({ id: nodeId, type: "text", text: beforeText });
              }
              replacement.push(pill);
              if (afterText) {
                replacement.push({ id: generateId(), type: "text", text: afterText });
              }

              newNodes.splice(idx, 1, ...replacement);
              return newNodes;
            });
          }
        }
      }
    }

    // Close mention popover
    setMention({ active: false, query: "", anchorRect: null, showSubmenu: false, submenuRect: null });
  };

  // Create new webhook from submenu and insert pill
  const handleCreateWebhookFromSubmenu = () => {
    const id = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const mockNames = ["Kernel Panic", "Pop Alert", "Butter Signal", "Hot Drop", "Salt Ping", "Pop Shot", "Butter Buzz", "Fresh Pop"];
    const name = mockNames[webhooks.length % mockNames.length];
    const now = new Date().toISOString();

    const newWebhook = {
      id,
      name,
      url: `https://hooks.kewl.dev/mock/${id}`,
      mode: "markdown",
      createdAt: now,
      customCommand: WEBHOOK_MODE_DEFAULTS["markdown"],
    };

    // Add webhook to state
    setWebhooks((prev) => [...prev, newWebhook]);

    // Insert the new webhook as a pill
    handleSelectWebhookFromSubmenu(newWebhook);
  };

  // Show submenu on hover
  const handleShowSubmenu = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMention((prev) => ({
      ...prev,
      showSubmenu: true,
      submenuRect: rect,
    }));
  };

  // Hide submenu on mouse leave (with delay for moving to submenu)
  const hideSubmenuTimeoutRef = useRef(null);

  const handleHideSubmenu = () => {
    hideSubmenuTimeoutRef.current = setTimeout(() => {
      setMention((prev) => ({
        ...prev,
        showSubmenu: false,
      }));
    }, 150);
  };

  const handleSubmenuEnter = () => {
    if (hideSubmenuTimeoutRef.current) {
      clearTimeout(hideSubmenuTimeoutRef.current);
    }
  };

  const handleSubmenuLeave = () => {
    setMention((prev) => ({
      ...prev,
      showSubmenu: false,
    }));
  };

  // Handle webhook pill insertion or update
  const handleInsertWebhookPill = (wh) => {
    setInstructionsNodes((nodes) => {
      if (!webhookPicker.targetNodeId) return nodes;

      const idx = nodes.findIndex((n) => n.id === webhookPicker.targetNodeId);
      if (idx === -1) return nodes;

      const target = nodes[idx];

      // If target is an existing webhook pill, update it
      if (target.type === "source-pill" && target.sourceKind === "webhook") {
        const updated = {
          ...target,
          webhookId: wh.id,
          label: `Webhooks: ${wh.name}`,
        };
        const newNodes = [...nodes];
        newNodes[idx] = updated;
        return newNodes;
      }

      // Otherwise, split text node at cursor position and insert pill
      if (target.type === "text") {
        const text = target.text;
        const pos = webhookPicker.cursorPosition;

        const beforeText = text.slice(0, pos);
        const afterText = text.slice(pos);

        const newNodes = [...nodes];

        const pill = {
          id: generateId(),
          type: "source-pill",
          sourceKind: "webhook",
          webhookId: wh.id,
          label: `Webhooks: ${wh.name}`,
        };

        // Replace target with: before text, pill, after text
        const replacement = [];
        if (beforeText) {
          replacement.push({ id: target.id, type: "text", text: beforeText });
        }
        replacement.push(pill);
        if (afterText) {
          replacement.push({ id: generateId(), type: "text", text: afterText });
        }

        newNodes.splice(idx, 1, ...replacement);
        return newNodes;
      }

      return nodes;
    });

    setWebhookPicker({ open: false, anchorRect: null, targetNodeId: null, cursorPosition: 0 });
  };

  // Handle pill click to re-open picker
  const handlePillClick = (node, rect) => {
    if (node.sourceKind === "webhook") {
      setWebhookPicker({
        open: true,
        anchorRect: rect,
        targetNodeId: node.id,
        currentWebhookId: node.webhookId, // Track which webhook the pill references
        cursorPosition: 0,
      });
    } else if (node.sourceKind === "knowledge") {
      // Open sources menu for knowledge pill - different menu for linear vs company
      if (node.knowledgeType === "linear") {
        setIsLinearSourcesMenuOpen(true);
      } else {
        setIsSourcesMenuOpen(true);
      }
    }
  };

  // Copy webhook URL to clipboard
  const handleCopyWebhookUrl = (url) => {
    navigator.clipboard.writeText(url);
    setWebhookPicker({ open: false, anchorRect: null, targetNodeId: null, currentWebhookId: null, cursorPosition: 0, showSwitchSubmenu: false, switchSubmenuRect: null });
  };

  // Switch webhook submenu hover handlers
  const switchSubmenuTimeoutRef = useRef(null);

  const handleShowSwitchSubmenu = (e) => {
    if (switchSubmenuTimeoutRef.current) {
      clearTimeout(switchSubmenuTimeoutRef.current);
      switchSubmenuTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setWebhookPicker((prev) => ({
      ...prev,
      showSwitchSubmenu: true,
      switchSubmenuRect: rect,
    }));
  };

  const handleHideSwitchSubmenu = () => {
    switchSubmenuTimeoutRef.current = setTimeout(() => {
      setWebhookPicker((prev) => ({
        ...prev,
        showSwitchSubmenu: false,
        switchSubmenuRect: null,
      }));
    }, 150);
  };

  const handleSwitchSubmenuEnter = () => {
    if (switchSubmenuTimeoutRef.current) {
      clearTimeout(switchSubmenuTimeoutRef.current);
      switchSubmenuTimeoutRef.current = null;
    }
  };

  const handleSwitchSubmenuLeave = () => {
    setWebhookPicker((prev) => ({
      ...prev,
      showSwitchSubmenu: false,
      switchSubmenuRect: null,
    }));
  };

  // Handle input in editor for @ detection
  const handleEditorInput = (e) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent || "";
      const cursorPos = range.startOffset;

      // Find @ symbol before cursor
      let atIndex = -1;
      for (let i = cursorPos - 1; i >= 0; i--) {
        if (text[i] === "@") {
          atIndex = i;
          break;
        }
        if (text[i] === " " || text[i] === "\n") break;
      }

      if (atIndex !== -1) {
        const query = text.slice(atIndex + 1, cursorPos);

        // Show mention popover if query matches "webhooks"
        if ("webhooks".startsWith(query.toLowerCase())) {
          const caretRect = getCaretRect();
          setMention({
            active: true,
            query,
            anchorRect: caretRect,
          });
        } else {
          setMention({ active: false, query: "", anchorRect: null });
        }
      } else {
        setMention({ active: false, query: "", anchorRect: null });
      }

      // Update the text node in state
      const nodeId = textNode.parentElement?.dataset?.nodeId;
      if (nodeId) {
        setInstructionsNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && n.type === "text" ? { ...n, text } : n
          )
        );
      }
    }
  };

  // Handle keydown for special keys
  const handleEditorKeyDown = (e) => {
    // Handle Enter in mention popover - show submenu
    if (mention.active && e.key === "Enter") {
      e.preventDefault();
      if ("webhooks".startsWith(mention.query.toLowerCase())) {
        // Show submenu on Enter - get caret position for submenu
        const caretRect = getCaretRect();
        if (caretRect) {
          setMention((prev) => ({
            ...prev,
            showSubmenu: true,
            submenuRect: caretRect,
          }));
        }
      }
      return;
    }

    // Handle Tab in mention popover - show submenu
    if (mention.active && e.key === "Tab") {
      e.preventDefault();
      if ("webhooks".startsWith(mention.query.toLowerCase())) {
        const caretRect = getCaretRect();
        if (caretRect) {
          setMention((prev) => ({
            ...prev,
            showSubmenu: true,
            submenuRect: caretRect,
          }));
        }
      }
      return;
    }

    // Handle backspace to delete pills
    if (e.key === "Backspace") {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.startOffset === 0 && range.collapsed) {
          // Check if previous sibling is a pill
          const currentSpan = range.startContainer.parentElement;
          const prevSibling = currentSpan?.previousElementSibling;

          if (prevSibling?.classList.contains("instr-pill")) {
            e.preventDefault();
            const pillId = prevSibling.dataset.nodeId;
            if (pillId) {
              setInstructionsNodes((nodes) =>
                nodes.filter((n) => n.id !== pillId)
              );
            }
          }
        }
      }
    }
  };

  // Webhook management functions
  const handleAddWebhook = () => {
    const id = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const mockNames = ["Kernel Panic", "Pop Alert", "Butter Signal", "Hot Drop", "Salt Ping", "Pop Shot", "Butter Buzz", "Fresh Pop"];
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
      instructions: serializeInstructions(instructionsNodes),
      webAccess,
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
          <button type="button" className="cc-secondary-btn" onClick={handleCancelClick}>
            Cancel
          </button>
          <button
            type="button"
            className="cc-secondary-btn"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
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

      {/* Unsaved changes dialog */}
      {showUnsavedDialog && (
        <div className="dialog-overlay" onClick={() => setShowUnsavedDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">Unsaved changes</h3>
            </div>
            <div className="dialog-body">
              <p>You have unsaved changes. What would you like to do?</p>
            </div>
            <div className="dialog-footer">
              <button
                type="button"
                className="dialog-button dialog-button--secondary"
                onClick={() => setShowUnsavedDialog(false)}
              >
                Stay
              </button>
              <button
                type="button"
                className="dialog-button dialog-button--secondary"
                onClick={handleDiscardAndProceed}
              >
                Discard
              </button>
              <button
                type="button"
                className="dialog-button dialog-button--primary"
                onClick={handleSaveAndProceed}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="channel-settings-tabs">
        <button
          type="button"
          className={
            "channel-settings-tab" +
            (activeTab === "overview" ? " channel-settings-tab--active" : "")
          }
          onClick={() => handleTabChange("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={
            "channel-settings-tab" +
            (activeTab === "connectors" ? " channel-settings-tab--active" : "")
          }
          onClick={() => handleTabChange("connectors")}
        >
          Webhooks
        </button>
        <button
          type="button"
          className={
            "channel-settings-tab" +
            (activeTab === "members" ? " channel-settings-tab--active" : "")
          }
          onClick={() => handleTabChange("members")}
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
                  {name.length}/{maxNameLength}
                </div>
              </div>
            </div>

            {/* Instructions Editor */}
            <div className="cc-field-group">
              <label className="cc-field-label">Instructions</label>
              <div className="instr-editor-wrapper">
                <div
                  ref={editorRef}
                  className="instr-editor"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onKeyDown={handleEditorKeyDown}
                >
                  {instructionsNodes.map((node) => {
                    if (node.type === "text") {
                      return (
                        <span
                          key={node.id}
                          data-node-id={node.id}
                          className="instr-text-node"
                        >
                          {node.text}
                        </span>
                      );
                    }

                    if (node.type === "source-pill") {
                      if (node.sourceKind === "knowledge") {
                        const isLinear = node.knowledgeType === "linear";

                        if (isLinear) {
                          // Linear knowledge pill with Linear-specific sources menu
                          return (
                            <span key={node.id} className="cc-inline-pill-wrapper">
                              <button
                                ref={linearSourcesPillRef}
                                type="button"
                                data-node-id={node.id}
                                className="instr-pill instr-pill--knowledge instr-pill--linear"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePillClick(node, e.currentTarget.getBoundingClientRect());
                                }}
                                contentEditable={false}
                              >
                                <span className="instr-pill-icon">🔷</span>
                                <span>{node.label}</span>
                              </button>

                              {isLinearSourcesMenuOpen && (
                                <div ref={linearSourcesMenuRef} className="cc-sources-menu" role="menu">
                                  <button className="cc-sources-item" type="button">
                                    <span className="cc-sources-icon">🔷</span>
                                    <span>Linear workspace: Brina – Product</span>
                                    <span className="cc-sources-toggle cc-sources-toggle--on">
                                      <span className="cc-toggle-track">
                                        <span className="cc-toggle-thumb"></span>
                                      </span>
                                    </span>
                                  </button>
                                  <button className="cc-sources-item" type="button">
                                    <span className="cc-sources-icon">🔷</span>
                                    <span>Linear workspace: Brina – Engineering</span>
                                    <span className="cc-sources-toggle cc-sources-toggle--on">
                                      <span className="cc-toggle-track">
                                        <span className="cc-toggle-thumb"></span>
                                      </span>
                                    </span>
                                  </button>
                                </div>
                              )}
                            </span>
                          );
                        }

                        // Company knowledge pill with full sources menu
                        return (
                          <span key={node.id} className="cc-inline-pill-wrapper">
                            <button
                              ref={sourcesPillRef}
                              type="button"
                              data-node-id={node.id}
                              className="instr-pill instr-pill--knowledge"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handlePillClick(node, e.currentTarget.getBoundingClientRect());
                              }}
                              contentEditable={false}
                            >
                              <span>{node.label}</span>
                              <span className="instr-pill-logos">
                                {workspaceKernel.sourceIds
                                  .filter(id => !kernelSettings.disabledSources?.includes(id))
                                  .map(sourceId => (
                                    <img
                                      key={sourceId}
                                      src={CONNECTOR_ICON_URLS[sourceId]}
                                      alt=""
                                      className="instr-pill-logo"
                                    />
                                  ))
                                }
                              </span>
                            </button>

                            {isSourcesMenuOpen && (
                              <div ref={sourcesMenuRef} className="cc-sources-menu" role="menu">
                                {workspaceKernel.sourceIds.map(sourceId => {
                                  const connector = CONNECTORS.find(c => c.id === sourceId);
                                  if (!connector) return null;
                                  const isEnabled = !kernelSettings.disabledSources?.includes(sourceId);
                                  return (
                                    <button
                                      key={sourceId}
                                      className="cc-sources-item"
                                      type="button"
                                      onClick={() => handleToggleSource(sourceId)}
                                    >
                                      <img src={CONNECTOR_ICON_URLS[sourceId]} alt={connector.name} className="cc-sources-icon-img" />
                                      <span>{connector.name}</span>
                                      <span className={`cc-sources-toggle ${isEnabled ? "cc-sources-toggle--on" : ""}`}>
                                        <span className="cc-toggle-track">
                                          <span className="cc-toggle-thumb"></span>
                                        </span>
                                      </span>
                                    </button>
                                  );
                                })}
                                <button
                                  className="cc-sources-item cc-sources-item--more"
                                  type="button"
                                  onClick={() => {
                                    setIsSourcesMenuOpen(false);
                                    setIsKernelScreenOpen(true);
                                  }}
                                >
                                  <span className="cc-sources-icon">⋯</span>
                                  <span>Connect more</span>
                                </button>
                              </div>
                            )}
                          </span>
                        );
                      }

                      if (node.sourceKind === "webhook") {
                        return (
                          <button
                            key={node.id}
                            type="button"
                            data-node-id={node.id}
                            className="instr-pill instr-pill--webhook"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePillClick(node, e.currentTarget.getBoundingClientRect());
                            }}
                            contentEditable={false}
                          >
                            <span className="instr-pill-icon">🔗</span>
                            <span>{node.label}</span>
                          </button>
                        );
                      }
                    }

                    return null;
                  })}
                </div>

                {/* Mention popover (@webhooks) with submenu */}
                {mention.active && "webhooks".startsWith(mention.query.toLowerCase()) && mention.anchorRect && (
                  <div
                    ref={mentionPopoverRef}
                    className="instr-mention-popover"
                    style={{
                      position: "fixed",
                      top: mention.anchorRect.bottom + 4,
                      left: mention.anchorRect.left,
                    }}
                  >
                    <button
                      type="button"
                      className="instr-mention-item instr-mention-item--has-submenu"
                      onMouseEnter={handleShowSubmenu}
                      onMouseLeave={handleHideSubmenu}
                    >
                      <span>@webhooks</span>
                      <span className="instr-mention-chevron">›</span>
                    </button>

                    {/* Webhook submenu */}
                    {mention.showSubmenu && mention.submenuRect && (
                      <div
                        className="instr-webhook-submenu"
                        style={{
                          position: "fixed",
                          top: mention.submenuRect.top - 4,
                          left: mention.submenuRect.right + 4,
                        }}
                        onMouseEnter={handleSubmenuEnter}
                        onMouseLeave={handleSubmenuLeave}
                      >
                        {webhooks.map((wh) => (
                          <button
                            key={wh.id}
                            type="button"
                            className="instr-webhook-item"
                            onClick={() => handleSelectWebhookFromSubmenu(wh)}
                          >
                            {wh.name}
                          </button>
                        ))}
                        {webhooks.length > 0 && <div className="instr-submenu-separator" />}
                        <button
                          type="button"
                          className="instr-webhook-item instr-webhook-item--new"
                          onClick={handleCreateWebhookFromSubmenu}
                        >
                          <span className="instr-webhook-item-icon">+</span>
                          <span>New webhook</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Webhook picker popover */}
                {webhookPicker.open && webhookPicker.anchorRect && (() => {
                  const currentWebhook = webhooks.find(wh => wh.id === webhookPicker.currentWebhookId);
                  const otherWebhooks = webhooks.filter(wh => wh.id !== webhookPicker.currentWebhookId);

                  return (
                    <div
                      ref={webhookPickerRef}
                      className="instr-webhook-picker"
                      style={{
                        position: "fixed",
                        top: webhookPicker.anchorRect.bottom + 4,
                        left: webhookPicker.anchorRect.left,
                      }}
                    >
                      {/* Copy URL - always show if current webhook exists */}
                      {currentWebhook && (
                        <button
                          type="button"
                          className="instr-webhook-item"
                          onClick={() => handleCopyWebhookUrl(currentWebhook.url)}
                        >
                          Copy URL
                        </button>
                      )}

                      {/* Switch webhook - only show if there are other webhooks */}
                      {otherWebhooks.length > 0 && (
                        <button
                          type="button"
                          className="instr-webhook-item instr-mention-item--has-submenu"
                          onMouseEnter={handleShowSwitchSubmenu}
                          onMouseLeave={handleHideSwitchSubmenu}
                        >
                          <span>Switch webhook</span>
                          <span className="instr-mention-chevron">›</span>
                        </button>
                      )}

                      {/* Switch webhook submenu */}
                      {webhookPicker.showSwitchSubmenu && webhookPicker.switchSubmenuRect && (
                        <div
                          className="instr-webhook-submenu"
                          style={{
                            position: "fixed",
                            top: webhookPicker.switchSubmenuRect.top - 4,
                            left: webhookPicker.switchSubmenuRect.right + 4,
                          }}
                          onMouseEnter={handleSwitchSubmenuEnter}
                          onMouseLeave={handleSwitchSubmenuLeave}
                        >
                          {otherWebhooks.map((wh) => (
                            <button
                              key={wh.id}
                              type="button"
                              className="instr-webhook-item"
                              onClick={() => handleInsertWebhookPill(wh)}
                            >
                              {wh.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* New webhook option */}
                      <button
                        type="button"
                        className="instr-webhook-item instr-webhook-item--new"
                        onClick={handleCreateWebhookFromSubmenu}
                      >
                        <span className="instr-webhook-item-icon">+</span>
                        <span>New webhook</span>
                      </button>
                    </div>
                  );
                })()}
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
            </div>


            {/* Checkboxes */}
            <div className="cc-checkbox-group">
              <label className="cc-checkbox-row">
                <input
                  type="checkbox"
                  checked={webAccess}
                  onChange={(e) => setWebAccess(e.target.checked)}
                />
                <div>
                  <div className="cc-checkbox-label">Give web access</div>
                  <div className="cc-checkbox-subtitle">
                    Allow Popcorn to browse the web for information.
                  </div>
                </div>
              </label>

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

            {/* Channel actions */}
            <div className="cc-channel-actions">
              <button
                type="button"
                className="cc-channel-action-btn"
                onClick={() => console.log("Archive channel")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
                Archive channel
              </button>
              <button
                type="button"
                className="cc-channel-action-btn cc-channel-action-btn--danger"
                onClick={() => console.log("Delete channel")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Delete channel
              </button>
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
              <p className="settings-section-help" style={{ fontSize: '16px', lineHeight: '1.5' }}>
                Webhooks bring events from your external tools into this channel. Any webhook you create here can be referenced in the channel's Instructions with <strong>@webhooks</strong>, so you can tell Popcorn how to handle those events (summarize the last few, enrich with company knowledge, trigger custom actions, and more).
              </p>

              {webhooks.length === 0 ? (
                <div className="webhook-empty-state">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3418/3418886.png"
                    alt="Popcorn"
                    className="webhook-empty-image"
                  />
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
                          onClick={() => setActivityWebhook(wh)}
                        >
                          See activity
                        </button>
                        <button
                          type="button"
                          className="webhook-activity-btn"
                          onClick={() => {
                            const pill = {
                              id: generateId(),
                              type: "source-pill",
                              sourceKind: "webhook",
                              webhookId: wh.id,
                              label: `Webhooks: ${wh.name}`,
                            };
                            setInstructionsNodes((nodes) => [...nodes, pill]);
                            setActiveTab("overview");
                          }}
                        >
                          Add to instructions
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

      {/* Knowledge Kernel Screen */}
      <KnowledgeKernelScreen
        isOpen={isKernelScreenOpen}
        onClose={handleKernelScreenClose}
      />

      {/* Webhook Activity Modal */}
      {activityWebhook && (
        <WebhookActivityModal
          webhook={activityWebhook}
          onClose={() => setActivityWebhook(null)}
        />
      )}

      {/* Kernel Modal */}
      <KernelModal
        isOpen={isKernelModalOpen}
        onClose={() => setIsKernelModalOpen(false)}
      />
    </div>
  );
});

export default ChannelSettingsPage;
