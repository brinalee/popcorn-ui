// src/hooks/useChannelCreation.js
// State management hook for channel creation loading flow

import { useState, useCallback, useRef, useEffect } from "react";

// Creation states
export const CreationState = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// Playful loading messages that rotate
export const LOADING_MESSAGES = [
  "Popcorn is working its magic...",
  "Heating up the kernels...",
  "Crunching the data for your new channel...",
  "Almost ready...",
];

export function useChannelCreation() {
  const [creationState, setCreationState] = useState(CreationState.IDLE);
  const [messageIndex, setMessageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const rotationRef = useRef(null);
  const elapsedRef = useRef(null);

  // Clear all timers
  const clearTimer = useCallback(() => {
    if (rotationRef.current) {
      clearInterval(rotationRef.current);
      rotationRef.current = null;
    }
    if (elapsedRef.current) {
      clearInterval(elapsedRef.current);
      elapsedRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Start creation process
  const startCreation = useCallback(() => {
    clearTimer();
    setCreationState(CreationState.LOADING);
    setMessageIndex(0);
    setErrorMessage(null);
    setElapsedSeconds(0);

    // Rotate messages every 2.5 seconds
    rotationRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    // Track elapsed seconds
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, [clearTimer]);

  // Mark as success
  const setSuccess = useCallback(() => {
    clearTimer();
    setCreationState(CreationState.SUCCESS);
  }, [clearTimer]);

  // Mark as error
  const setError = useCallback((message) => {
    clearTimer();
    setCreationState(CreationState.ERROR);
    setErrorMessage(message || "Something went wrong. Please try again.");
  }, [clearTimer]);

  // Retry (go back to loading)
  const retry = useCallback(() => {
    startCreation();
  }, [startCreation]);

  // Reset to idle
  const reset = useCallback(() => {
    clearTimer();
    setCreationState(CreationState.IDLE);
    setMessageIndex(0);
    setErrorMessage(null);
  }, [clearTimer]);

  return {
    creationState,
    loadingMessage: LOADING_MESSAGES[messageIndex],
    errorMessage,
    elapsedSeconds,
    isLoading: creationState === CreationState.LOADING,
    isError: creationState === CreationState.ERROR,
    startCreation,
    setSuccess,
    setError,
    retry,
    reset,
  };
}
