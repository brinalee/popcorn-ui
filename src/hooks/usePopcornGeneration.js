// src/hooks/usePopcornGeneration.js
// State management hook for Popcorn AI message generation

import { useState, useCallback, useRef, useEffect } from "react";

// Generation states
export const GenerationState = {
  THINKING: "thinking",
  GENERATING: "generating",
  STOPPED: "stopped",
  ERROR: "error",
  COMPLETED: "completed",
};

// Thinking verbs that rotate during the thinking phase (playful tone)
export const THINKING_VERBS = [
  "Analyzing...",
  "Searching...",
  "Thinking...",
  "Summarizing...",
  "Looking into that...",
  "Finding context...",
  "Connecting dots...",
  "Almost there...",
];

export function usePopcornGeneration() {
  const [activeMessage, setActiveMessage] = useState(null);
  const generationRef = useRef(null); // Track current generation for cancellation
  const thinkingTimerRef = useRef(null); // Timer for elapsed seconds
  const verbRotationRef = useRef(null); // Timer for verb rotation

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    if (verbRotationRef.current) {
      clearInterval(verbRotationRef.current);
      verbRotationRef.current = null;
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const startThinking = useCallback(() => {
    // Clear any existing timers first
    clearTimers();

    const id = `popcorn-gen-${Date.now()}`;
    generationRef.current = id;

    setActiveMessage({
      id,
      state: GenerationState.THINKING,
      streamedText: "",
      errorMessage: null,
      currentVerbIndex: 0,
      stoppedDuringThinking: false,
    });

    // Start 2-second timer for verb rotation (no elapsed time timer needed)
    verbRotationRef.current = setInterval(() => {
      setActiveMessage((prev) => {
        if (!prev || prev.state !== GenerationState.THINKING) return prev;
        return {
          ...prev,
          currentVerbIndex: (prev.currentVerbIndex + 1) % THINKING_VERBS.length,
        };
      });
    }, 2000);

    return id;
  }, [clearTimers]);

  const startGenerating = useCallback(() => {
    // Stop thinking timers when transitioning to generating
    clearTimers();

    setActiveMessage((prev) => {
      if (!prev) return null;
      return { ...prev, state: GenerationState.GENERATING };
    });
  }, [clearTimers]);

  const appendText = useCallback((text) => {
    setActiveMessage((prev) => {
      if (!prev || prev.state !== GenerationState.GENERATING) return prev;
      return {
        ...prev,
        streamedText: prev.streamedText + text,
      };
    });
  }, []);

  const stop = useCallback(() => {
    // Track if we stopped during thinking phase
    const wasThinking = activeMessage?.state === GenerationState.THINKING;

    clearTimers();
    generationRef.current = null;

    setActiveMessage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        state: GenerationState.STOPPED,
        stoppedDuringThinking: wasThinking,
      };
    });
  }, [activeMessage?.state, clearTimers]);

  const setError = useCallback((errorMessage) => {
    clearTimers();
    generationRef.current = null;

    setActiveMessage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        state: GenerationState.ERROR,
        errorMessage,
      };
    });
  }, [clearTimers]);

  // Legacy complete - returns streamed text (kept for compatibility)
  const complete = useCallback(() => {
    const finalText = activeMessage?.streamedText || "";
    clearTimers();
    generationRef.current = null;
    setActiveMessage(null);
    return finalText;
  }, [activeMessage, clearTimers]);

  // New instant complete - skips streaming, returns full message
  const completeWithMessage = useCallback((fullText) => {
    clearTimers();
    generationRef.current = null;
    setActiveMessage(null);
    return fullText;
  }, [clearTimers]);

  const retry = useCallback(() => {
    // Clear timers and start fresh
    clearTimers();

    const id = `popcorn-gen-${Date.now()}`;
    generationRef.current = id;

    setActiveMessage({
      id,
      state: GenerationState.THINKING,
      streamedText: "",
      errorMessage: null,
      currentVerbIndex: 0,
      stoppedDuringThinking: false,
    });

    // Start verb rotation timer only (no elapsed time)
    verbRotationRef.current = setInterval(() => {
      setActiveMessage((prev) => {
        if (!prev || prev.state !== GenerationState.THINKING) return prev;
        return {
          ...prev,
          currentVerbIndex: (prev.currentVerbIndex + 1) % THINKING_VERBS.length,
        };
      });
    }, 2000);

    return id;
  }, [clearTimers]);

  const clear = useCallback(() => {
    clearTimers();
    generationRef.current = null;
    setActiveMessage(null);
  }, [clearTimers]);

  // Check if a generation is still valid (hasn't been cancelled)
  const isGenerationValid = useCallback((id) => {
    return generationRef.current === id;
  }, []);

  return {
    activeMessage,
    startThinking,
    startGenerating,
    appendText,
    stop,
    setError,
    complete,
    completeWithMessage,
    retry,
    clear,
    isGenerationValid,
  };
}
