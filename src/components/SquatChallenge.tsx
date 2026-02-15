"use client";

import { useCallback, useState } from "react";
import { useSquatTracker } from "@/hooks/useSquatTracker";
import { SquatProgress } from "./SquatProgress";
import { CompletionCelebration } from "./CompletionCelebration";
import { AppShell } from "./AppShell";
import { PageTransition } from "./PageTransition";

const TARGET = 50;

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function SquatChallenge() {
  const [completed, setCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`squatCompleted-${getTodayKey()}`) === "true";
  });

  const handleComplete = useCallback(() => {
    localStorage.setItem(`squatCompleted-${getTodayKey()}`, "true");
    setCompleted(true);
  }, []);

  const { count, isTracking, hasMotion, start, manualIncrement } = useSquatTracker({
    target: TARGET,
    onComplete: handleComplete,
  });

  if (completed) {
    return (
      <PageTransition>
        <AppShell title="Squat">
          <CompletionCelebration
            title="Squats Complete!"
            subtitle={`${TARGET} reps done for today. Great work!`}
            autoRedirect
          />
        </AppShell>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AppShell title="Squat" subtitle={`${TARGET} reps daily challenge`}>
        <div className="flex flex-col items-center py-8">
          {!isTracking ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-4xl mx-auto mb-6">
                🏋️
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to squat?</h2>
              <p className="text-slate-500 mb-8 max-w-sm">
                Hold your phone while squatting. The accelerometer will count your reps automatically.
              </p>
              <button
                onClick={start}
                className="px-8 py-3 rounded-full bg-orange-500 text-white font-semibold text-lg hover:bg-orange-600 transition-colors active:scale-95"
              >
                Start
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              <SquatProgress current={count} target={TARGET} />

              {!hasMotion && (
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-4">
                    No motion sensor detected. Use manual mode:
                  </p>
                  <button
                    onClick={manualIncrement}
                    className="w-32 h-32 rounded-full bg-orange-500 text-white font-bold text-xl hover:bg-orange-600 transition-colors active:scale-95 shadow-lg"
                  >
                    TAP
                  </button>
                </div>
              )}

              {hasMotion && (
                <p className="text-sm text-slate-500 text-center">
                  Tracking your squats via motion sensor...
                </p>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </PageTransition>
  );
}
