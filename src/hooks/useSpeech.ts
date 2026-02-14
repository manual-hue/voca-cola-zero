"use client";

import { useCallback, useRef, useState } from "react";

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback((text: string, lang: "en-US" | "zh-CN") => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setSpeaking(true);

    const params = new URLSearchParams({ text, lang });
    const audio = new Audio(`/api/tts?${params}`);
    audioRef.current = audio;

    audio.onended = () => setSpeaking(false);
    audio.onerror = () => setSpeaking(false);

    audio.play().catch(() => setSpeaking(false));
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
