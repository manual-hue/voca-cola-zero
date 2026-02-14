"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const findVoice = useCallback((lang: string) => {
    const voices = voicesRef.current;
    return (
      voices.find((v) => v.lang === lang) ||
      voices.find((v) => v.lang.startsWith(lang.split("-")[0]))
    );
  }, []);

  const speak = useCallback((text: string, lang: "en-US" | "zh-CN") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voice = findVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [findVoice]);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
