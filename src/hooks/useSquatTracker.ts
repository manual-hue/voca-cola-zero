"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSquatTracker({ target, onComplete }: { target: number; onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  const countRef = useRef(0);
  const stateRef = useRef<"idle" | "down">("idle");
  const lastTimeRef = useRef(0);

  // 여기가 제일 중요한 민감도. 안 올라가면 1.5>1.0으로 낮춰볼 것.
  const SENSITIVITY = 1.5;
  const COOLDOWN = 1000;

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.acceleration; // 중력 빼고 실제 순수 움직임만 체크
    if (!acc || acc.y === null) return;

    const now = Date.now();
    if (now - lastTimeRef.current < COOLDOWN) return;

    const y = acc.y;
    const state = stateRef.current;

    // 내려갈 때 (음수 가속도)
    if (state === "idle" && y < -SENSITIVITY) {
      stateRef.current = "down";
    }
    // 올라올 때 (양수 가속도)
    else if (state === "down" && y > SENSITIVITY) {
      stateRef.current = "idle";
      lastTimeRef.current = now;
      countRef.current += 1;
      setCount(countRef.current);

      if (countRef.current >= target) onComplete();
    }
  }, [target, onComplete]);

  const start = useCallback(async () => {
    const DME = DeviceMotionEvent as any;
    if (typeof DME.requestPermission === "function") {
      await DME.requestPermission();
    }
    countRef.current = 0;
    setCount(0);
    stateRef.current = "idle";
    setIsTracking(true);
  }, []);

  useEffect(() => {
    if (!isTracking) return;
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isTracking, handleMotion]);

  return {
    count,
    isTracking,
    start,
    hasMotion: true,
    permissionGranted: true,
    manualIncrement: () => {
      countRef.current += 1;
      setCount(countRef.current);
      if (countRef.current >= target) onComplete();
    }
  };
}