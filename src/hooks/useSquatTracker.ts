"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SquatState = "idle" | "down" | "up";

interface UseSquatTrackerOptions {
  target: number;
  onComplete: () => void;
}

export function useSquatTracker({ target, onComplete }: UseSquatTrackerOptions) {
  const [count, setCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [hasMotion, setHasMotion] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const stateRef = useRef<SquatState>("idle");
  const smoothedRef = useRef(9.8);
  const lastTransitionRef = useRef(0);
  const countRef = useRef(0);

  const DOWN_THRESHOLD = -12;
  const UP_THRESHOLD = 12;
  const DEBOUNCE_MS = 400;
  const ALPHA = 0.3;

  const handleMotion = useCallback(
    (e: DeviceMotionEvent) => {
      const y = e.accelerationIncludingGravity?.y;
      if (y == null) return;

      setHasMotion(true);
      smoothedRef.current = ALPHA * y + (1 - ALPHA) * smoothedRef.current;
      const now = Date.now();

      if (now - lastTransitionRef.current < DEBOUNCE_MS) return;

      const state = stateRef.current;
      const val = smoothedRef.current;

      if (state === "idle" && val < DOWN_THRESHOLD) {
        stateRef.current = "down";
        lastTransitionRef.current = now;
      } else if (state === "down" && val > UP_THRESHOLD) {
        stateRef.current = "idle";
        lastTransitionRef.current = now;
        countRef.current += 1;
        const newCount = countRef.current;
        setCount(newCount);
        if (newCount >= target) {
          onComplete();
        }
      }
    },
    [target, onComplete],
  );

  const requestPermission = useCallback(async () => {
    const DME = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DME.requestPermission === "function") {
      const permission = await DME.requestPermission();
      if (permission === "granted") {
        setPermissionGranted(true);
        return true;
      }
      return false;
    }
    setPermissionGranted(true);
    return true;
  }, []);

  const start = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) return;
    countRef.current = 0;
    setCount(0);
    stateRef.current = "idle";
    smoothedRef.current = 9.8;
    setIsTracking(true);
  }, [requestPermission]);

  const manualIncrement = useCallback(() => {
    countRef.current += 1;
    const newCount = countRef.current;
    setCount(newCount);
    if (newCount >= target) {
      onComplete();
    }
  }, [target, onComplete]);

  useEffect(() => {
    if (!isTracking) return;
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isTracking, handleMotion]);

  return {
    count,
    isTracking,
    hasMotion,
    permissionGranted,
    start,
    manualIncrement,
  };
}
