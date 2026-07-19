"use client";

import { useEffect, useRef } from "react";

type UseVisibilityPollingOptions = {
  /** When false, polling is disabled. */
  enabled: boolean;

  /** Function executed every poll cycle. */
  onPoll: () => void | Promise<void>;

  /** Normal polling interval (default: 30s). */
  intervalMs?: number;

  /** Faster polling immediately after mount. */
  fastIntervalMs?: number;

  /** Duration to use the fast interval. */
  fastDurationMs?: number;

  /** Pause polling while browser tab is hidden. */
  pauseWhenHidden?: boolean;

  /** Optional dynamic polling interval. */
  getIntervalMs?: () => number;
};

/**
 * Visibility-aware polling hook.
 *
 * Features:
 * - Initial poll immediately after mount.
 * - Fast polling immediately after mount.
 * - Dynamic polling intervals.
 * - Pauses while browser tab is hidden.
 * - Prevents overlapping requests.
 * - Cleans up correctly on unmount.
 */
export function useVisibilityPolling({
  enabled,
  onPoll,
  intervalMs = 30_000,
  fastIntervalMs = 12_000,
  fastDurationMs = 120_000,
  pauseWhenHidden = true,
  getIntervalMs,
}: UseVisibilityPollingOptions) {
  const mountedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPollRef = useRef(onPoll);
  const getIntervalMsRef = useRef(getIntervalMs);

  /** Prevent concurrent requests */
  const pollingRef = useRef(false);

  /** Prevent scheduling after unmount */
  const destroyedRef = useRef(false);

  useEffect(() => {
    onPollRef.current = onPoll;
    getIntervalMsRef.current = getIntervalMs;
  }, [onPoll, getIntervalMs]);

  useEffect(() => {
    if (!enabled) return;

    destroyedRef.current = false;
    mountedAtRef.current = Date.now();

    const resolveInterval = () => {
      const dynamicInterval = getIntervalMsRef.current;

      if (dynamicInterval) return dynamicInterval();

      const elapsed = Date.now() - mountedAtRef.current;

      return elapsed < fastDurationMs ? fastIntervalMs : intervalMs;
    };

    const scheduleNextPoll = () => {
      if (destroyedRef.current) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (
        pauseWhenHidden &&
        typeof document !== "undefined" &&
        document.hidden
      ) {
        return;
      }

      timerRef.current = setTimeout(() => {
        void executePoll();
      }, resolveInterval());
    };

    const executePoll = async () => {
      if (destroyedRef.current) return;

      if (pollingRef.current)  return;
    
      pollingRef.current = true;

      try {
        await onPollRef.current();
      } finally {
        pollingRef.current = false;

        scheduleNextPoll();
      }
    };

    const handleVisibilityChange = () => {
      if (
        pauseWhenHidden &&
        typeof document !== "undefined" &&
        document.hidden
      ) {
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      void executePoll();
    };

    void executePoll();

    if (pauseWhenHidden && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      destroyedRef.current = true;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (pauseWhenHidden && typeof document !== "undefined") {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }
    };
  }, [enabled, intervalMs, fastIntervalMs, fastDurationMs, pauseWhenHidden]);
}
