"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { getTodayKey } from "@/lib/client-date";
import { useSquatTracker } from "@/hooks/useSquatTracker";
import { SquatProgress } from "./SquatProgress";
import { CompletionCelebration } from "./CompletionCelebration";
import { AppShell } from "./AppShell";

const TARGET = 30;

export function SquatChallenge() {
  const t = useTranslations("Squat");
  const tMod = useTranslations("Module");
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
      <AppShell title={tMod("squat")}>
          <CompletionCelebration
            title={t("complete")}
            subtitle={t("repsDone", { target: TARGET })}
            autoRedirect
          />
        </AppShell>
    );
  }

  return (
      <AppShell title={tMod("squat")} subtitle={t("subtitle", { target: TARGET })}>
        <div className="flex flex-col items-center py-8">
          {!isTracking ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-4xl mx-auto mb-6">
                🏋️
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{t("ready")}</h2>
              <p className="text-slate-500 mb-8 max-w-sm">
                {t("holdPhone")}
              </p>
              <button
                onClick={start}
                className="px-8 py-3 rounded-full bg-orange-500 text-white font-semibold text-lg hover:bg-orange-600 transition-colors active:scale-95"
              >
                {t("start")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              <SquatProgress current={count} target={TARGET} />

              {!hasMotion && (
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-4">
                    {t("noMotion")}
                  </p>
                  <button
                    onClick={manualIncrement}
                    className="w-32 h-32 rounded-full bg-orange-500 text-white font-bold text-xl hover:bg-orange-600 transition-colors active:scale-95 shadow-lg"
                  >
                    {t("tap")}
                  </button>
                </div>
              )}

              {hasMotion && (
                <p className="text-sm text-slate-500 text-center">
                  {t("tracking")}
                </p>
              )}
            </div>
          )}
        </div>
      </AppShell>
  );
}
