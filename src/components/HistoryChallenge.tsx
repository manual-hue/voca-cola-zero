"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CompletionCelebration } from "./CompletionCelebration";
import { AppShell } from "./AppShell";
import { PageTransition } from "./PageTransition";
import { AdSlot } from "./AdSlot";

interface HistoryData {
  topic: string;
  category: string;
  summary: string;
  keyFacts: string[];
  reflection: string;
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function HistoryChallenge() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`historyCompleted-${getTodayKey()}`) === "true";
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const markComplete = () => {
    localStorage.setItem(`historyCompleted-${getTodayKey()}`, "true");
    setCompleted(true);
  };

  const historyContent = data && (
    <div className="max-w-2xl mx-auto mt-4">
      <div className="rounded-2xl bg-purple-50 border border-purple-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">{data.topic}</h2>
        <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mb-4">
          {data.category}
        </span>
        <p className="text-slate-700 leading-relaxed">{data.summary}</p>
      </div>

      {process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID && (
        <div className="mb-6">
          <AdSlot adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID} />
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Key Facts
        </h3>
        <ul className="space-y-3">
          {data.keyFacts.map((fact, i) => (
            <li key={i} className="flex gap-3 text-slate-700">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
          Reflection
        </h3>
        <p className="text-slate-700 italic">{data.reflection}</p>
      </div>
    </div>
  );

  if (completed) {
    return (
      <PageTransition>
        <AppShell title="History" subtitle={data ? `${data.category} · ${data.topic}` : undefined}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <p className="mt-4 text-slate-500 text-sm">Loading today&apos;s insight...</p>
            </div>
          )}
          <CompletionCelebration
            title="History Complete!"
            subtitle="Today's insight has been reviewed."
          >
            {historyContent}
          </CompletionCelebration>
        </AppShell>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AppShell
        title="History"
        subtitle={data ? `${data.category} · ${data.topic}` : undefined}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 text-sm">Loading today&apos;s insight...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchHistory}
              className="ml-4 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-purple-50 border border-purple-200 p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-3">{data.topic}</h2>
              <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mb-4">
                {data.category}
              </span>
              <p className="text-slate-700 leading-relaxed">{data.summary}</p>
            </motion.div>

            {process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID && (
              <div className="mb-6">
                <AdSlot adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID} />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white border border-slate-200 p-6 mb-6"
            >
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Key Facts
              </h3>
              <ul className="space-y-3">
                {data.keyFacts.map((fact, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex gap-3 text-slate-700"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{fact}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-amber-50 border border-amber-200 p-6 mb-6"
            >
              <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Reflection
              </h3>
              <p className="text-slate-700 italic">{data.reflection}</p>
            </motion.div>

            <button
              onClick={markComplete}
              className="w-full px-6 py-3 rounded-full bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors"
            >
              Mark as Read
            </button>
          </div>
        )}
      </AppShell>
    </PageTransition>
  );
}
