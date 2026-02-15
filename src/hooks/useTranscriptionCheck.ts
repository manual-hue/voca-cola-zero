"use client";

import { useMemo } from "react";

export interface CharResult {
  char: string;
  expected: string;
  correct: boolean;
}

export function useTranscriptionCheck(input: string, target: string) {
  const results = useMemo<CharResult[]>(() => {
    const chars: CharResult[] = [];
    for (let i = 0; i < input.length; i++) {
      chars.push({
        char: input[i],
        expected: target[i] ?? "",
        correct: input[i] === target[i],
      });
    }
    return chars;
  }, [input, target]);

  const accuracy = useMemo(() => {
    if (results.length === 0) return 0;
    const correct = results.filter((r) => r.correct).length;
    return Math.round((correct / target.length) * 100);
  }, [results, target.length]);

  const isComplete = input.length >= target.length;

  return { results, accuracy, isComplete };
}
