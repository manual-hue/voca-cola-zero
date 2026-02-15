"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast, { Toaster } from "react-hot-toast";
import { getTodayKey } from "@/lib/client-date";
import { VocabCard } from "./VocabCard";
import { AdSlot } from "./AdSlot";
import { AppShell } from "./AppShell";

interface VocabWord {
  word: string;
  meaning: string;
  pronunciation: string;
}

interface VocabData {
  subject: string;
  language: string;
  vocabulary: VocabWord[];
}

export function LanguageDashboard() {
  const t = useTranslations("Language");
  const tMod = useTranslations("Module");
  const [data, setData] = useState<VocabData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedToday, setGeneratedToday] = useState(false);

  const fetchVocabulary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch vocabulary");
      setData(json);
      localStorage.setItem("vocaGeneratedDate", getTodayKey());
      setGeneratedToday(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedDate = localStorage.getItem("vocaGeneratedDate");
    if (savedDate === getTodayKey()) {
      setGeneratedToday(true);
    }
    fetchVocabulary();
  }, [fetchVocabulary]);

  const subtitle = data
    ? `${data.language} · ${data.subject} · ${data.vocabulary.length} words`
    : undefined;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af" },
            iconTheme: { primary: "#2563eb", secondary: "#eff6ff" },
          },
        }}
      />
      <AppShell title={tMod("language")} subtitle={subtitle}>
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              if (generatedToday) {
                toast.success(t("oncePerDay"));
              } else {
                fetchVocabulary();
              }
            }}
            disabled={loading}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              generatedToday
                ? "bg-slate-400 text-white cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            }`}
          >
            {loading ? t("generating") : generatedToday ? t("todayDone") : t("newWords")}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchVocabulary}
              disabled={loading}
              className="ml-4 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 shrink-0"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 text-sm">{t("generatingVocab")}</p>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.vocabulary.map((item, i) => (
              <Fragment key={`${item.word}-${i}`}>
                <VocabCard
                  word={item.word}
                  meaning={item.meaning}
                  pronunciation={item.pronunciation}
                  language={data.language}
                  index={i}
                />
                {(i === 19 || i === 39) && process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID && (
                  <AdSlot adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID} />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </AppShell>
    </>
  );
}
