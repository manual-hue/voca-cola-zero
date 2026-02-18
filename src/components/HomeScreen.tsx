"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getTodayKey } from "@/lib/client-date";
import { MODULES } from "@/types/modules";
import { ModuleCard } from "./ModuleCard";
import { NotificationToggle } from "./NotificationToggle";
import { LocaleToggle } from "./LocaleToggle";
import { PageTransition } from "./PageTransition";

export function HomeScreen() {
  const t = useTranslations("Home");
  const tMod = useTranslations("Module");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const key = getTodayKey();
    setCompleted({
      language: localStorage.getItem("vocaGeneratedDate") === key,
      squat: localStorage.getItem(`squatCompleted-${key}`) === "true",
      literature: localStorage.getItem(`literatureCompleted-${key}`) === "true",
      history: localStorage.getItem(`historyCompleted-${key}`) === "true",
    });
  }, []);

  const completedCount = Object.values(completed).filter(Boolean).length;

  const moduleI18n: Record<string, { title: string; subtitle: string }> = {
    language: { title: tMod("language"), subtitle: tMod("languageSub") },
    squat: { title: tMod("squat"), subtitle: tMod("squatSub") },
    literature: { title: tMod("literature"), subtitle: tMod("literatureSub") },
    history: { title: tMod("history"), subtitle: tMod("historySub") },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Voca Cola Zero</h1>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none"><LocaleToggle fullWidth /></div>
                <div className="flex-1 sm:flex-none"><NotificationToggle fullWidth /></div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900">{t("selectChallenge")}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {t("completedToday", { count: completedCount })}
            </p>
          </div>

          <div className="grid gap-4">
            {MODULES.map((mod, i) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                index={i}
                completed={completed[mod.id]}
                titleOverride={moduleI18n[mod.id]?.title}
                subtitleOverride={moduleI18n[mod.id]?.subtitle}
              />
            ))}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
