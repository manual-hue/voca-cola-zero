"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SquatState = "idle" | "down";

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

  // 핵심: 사용자의 초기 자세를 저장할 레퍼런스
  const baselineRef = useRef(9.8);

  // --- 설정값 (이 수치들이 스쿼트의 '맛'을 결정합니다) ---
  const SENSITIVITY = 1.8;   // 숫자가 낮을수록 더 예민하게 반응합니다 (1.5 ~ 2.5 추천)
  const DEBOUNCE_MS = 800;   // 한 번 하고 나서 0.8초간은 무시 (중복 카운트 방지)
  const ALPHA = 0.2;         // 로우패스 필터 (낮을수록 움직임이 부드럽게 보정됨)

  const handleMotion = useCallback(
      (e: DeviceMotionEvent) => {
        const y = e.accelerationIncludingGravity?.y;
        if (y == null) return;

        setHasMotion(true);

        // 1. 값 부드럽게 깎기 (노이즈 제거)
        smoothedRef.current = ALPHA * y + (1 - ALPHA) * smoothedRef.current;
        const now = Date.now();
        const val = smoothedRef.current;

        // 2. 너무 빨리 움직이면 무시
        if (now - lastTransitionRef.current < DEBOUNCE_MS) return;

        const state = stateRef.current;
        const baseline = baselineRef.current;

        // 3. 스쿼트 판정 로직 (상대적 기준점 사용)
        // 앉을 때: 기준점보다 SENSITIVITY만큼 값이 떨어지면 'down'
        if (state === "idle" && val < baseline - SENSITIVITY) {
          stateRef.current = "down";
          lastTransitionRef.current = now;
        }
        // 일어날 때: 다시 기준점 근처(또는 그 이상)로 올라오면 'count'
        else if (state === "down" && val > baseline - (SENSITIVITY * 0.3)) {
          stateRef.current = "idle";
          lastTransitionRef.current = now;
          countRef.current += 1;
          setCount(countRef.current);

          if (countRef.current >= target) {
            onComplete();
          }
        }
      },
      [target, onComplete],
  );

  const start = useCallback(async () => {
    // 1. 권한 확인
    const DME = DeviceMotionEvent as any;
    let granted = false;
    if (typeof DME.requestPermission === "function") {
      const res = await DME.requestPermission();
      granted = res === "granted";
    } else {
      granted = true;
    }

    if (!granted) return;

    // 2. 초기화 및 기준점 잡기
    // 시작하는 순간의 폰 각도를 기준(Baseline)으로 잡습니다.
    // 사용자가 폰을 들고 '준비' 상태일 때의 Y값을 저장합니다.
    const initialY = smoothedRef.current;
    baselineRef.current = (initialY > 0) ? initialY : 9.8;

    countRef.current = 0;
    setCount(0);
    stateRef.current = "idle";
    setIsTracking(true);
    setPermissionGranted(true);
  }, []);

  const manualIncrement = useCallback(() => {
    countRef.current += 1;
    setCount(countRef.current);
    if (countRef.current >= target) onComplete();
  }, [target, onComplete]);

  useEffect(() => {
    if (!isTracking) return;
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isTracking, handleMotion]);

  return { count, isTracking, hasMotion, permissionGranted, start, manualIncrement };
}