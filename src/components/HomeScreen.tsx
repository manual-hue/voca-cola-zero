"use client";

import { useEffect, useState } from "react";
import { MODULES } from "@/types/modules";
import { ModuleCard } from "./ModuleCard";
import { NotificationToggle } from "./NotificationToggle";
import { PageTransition } from "./PageTransition";

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function HomeScreen() {
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Voca Cola Zero</h1>
              <NotificationToggle />
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900">Select your challenge</h2>
            <p className="text-sm text-slate-500 mt-1">
              {completedCount}/4 completed today
            </p>
          </div>

          <div className="grid gap-4">
            {MODULES.map((mod, i) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                index={i}
                completed={completed[mod.id]}
              />
            ))}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
