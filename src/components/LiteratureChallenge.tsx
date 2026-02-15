"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getTodayKey } from "@/lib/client-date";
import { useTranscriptionCheck } from "@/hooks/useTranscriptionCheck";
import { CompletionCelebration } from "./CompletionCelebration";
import { AppShell } from "./AppShell";
import { AdSlot } from "./AdSlot";

interface LiteratureData {
  title: string;
  author: string;
  excerpt: string;
  language: string;
  translation: string;
}

export function LiteratureChallenge() {
  const t = useTranslations("Literature");
  const tMod = useTranslations("Module");
  const [data, setData] = useState<LiteratureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [completed, setCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`literatureCompleted-${getTodayKey()}`) === "true";
  });

  const fetchLiterature = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/literature");
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
    fetchLiterature();
  }, [fetchLiterature]);

  const { results, accuracy, isComplete } = useTranscriptionCheck(
    input,
    data?.excerpt ?? "",
  );

  const handleSubmit = () => {
    if (!isComplete) return;
    setSubmitted(true);
    if (accuracy >= 80) {
      localStorage.setItem(`literatureCompleted-${getTodayKey()}`, "true");
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <AppShell title={tMod("literature")} subtitle={data ? `${data.title} — ${data.author}` : undefined}>
          <CompletionCelebration
            title={t("complete")}
            subtitle={submitted ? t("accuracyResult", { value: accuracy }) : t("todayDone")}
          >
            {data && (
              <div className="max-w-2xl mx-auto mt-4">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6">
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
                    {t("todaysExcerpt")}
                  </h3>
                  <p className="text-lg leading-relaxed text-slate-800 font-serif">{data.excerpt}</p>
                  <p className="text-sm text-slate-500 mt-4">{data.translation}</p>
                </div>
                {process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID && (
                  <div className="mt-6">
                    <AdSlot adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID} />
                  </div>
                )}
              </div>
            )}
          </CompletionCelebration>
        </AppShell>
    );
  }

  return (
      <AppShell title={tMod("literature")} subtitle={data ? `${data.title} — ${data.author}` : undefined}>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 text-sm">{t("loadingExcerpt")}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchLiterature}
              className="ml-4 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors shrink-0"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {data && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 mb-6">
              <p className="text-lg leading-relaxed text-slate-800 font-serif">{data.excerpt}</p>
              <p className="text-sm text-slate-500 mt-4">{data.translation}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t("typePassage")}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-slate-200 p-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder={t("startTyping")}
                disabled={submitted}
              />
            </div>

            {input.length > 0 && (
              <div className="mb-4 rounded-xl bg-white border border-slate-200 p-4">
                <div className="flex flex-wrap gap-0 font-mono text-lg leading-relaxed">
                  {results.map((r, i) => (
                    <span
                      key={i}
                      className={r.correct ? "text-emerald-600" : "text-red-500 bg-red-50"}
                    >
                      {r.char === " " ? "\u00A0" : r.char}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                  <span>{t("accuracy", { value: accuracy })}</span>
                  <span>{t("chars", { current: input.length, total: data.excerpt.length })}</span>
                </div>
              </div>
            )}

            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!isComplete}
                className="w-full px-6 py-3 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("submit")}
              </button>
            ) : (
              <div className="rounded-xl p-4 text-center bg-amber-50 border border-amber-200 text-amber-700">
                <p className="font-semibold">
                  {t("tryAgain", { value: accuracy })}
                </p>
              </div>
            )}

            {process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID && (
              <div className="mt-6">
                <AdSlot adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID} />
              </div>
            )}
          </div>
        )}
      </AppShell>
  );
}
