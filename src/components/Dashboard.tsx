"use client";

import { useCallback, useEffect, useState } from "react";
import { VocabCard } from "./VocabCard";
import { NotificationToggle } from "./NotificationToggle";

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

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function Dashboard() {
  const [data, setData] = useState<VocabData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedToday, setGeneratedToday] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Voca Cola Zero
              </h1>
              {data && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {data.language} &middot; {data.subject} &middot;{" "}
                  {data.vocabulary.length} words
                </p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <NotificationToggle />
            <div className="relative">
              <button
                onClick={() => {
                  if (generatedToday) {
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2000);
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
                {loading ? "Generating..." : generatedToday ? "Today Done" : "New Words"}
              </button>
              {showToast && (
                <div className="absolute top-full mt-2 right-0 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
                  하루에 한 번만 생성할 수 있습니다!
                </div>
              )}
            </div>
          </div>
          </div>
          {/* Mobile buttons */}
          <div className="flex sm:hidden gap-3 mt-3">
            <div className="flex-1">
              <NotificationToggle fullWidth />
            </div>
            <div className="relative flex-1">
              <button
                onClick={() => {
                  if (generatedToday) {
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2000);
                  } else {
                    fetchVocabulary();
                  }
                }}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  generatedToday
                    ? "bg-slate-400 text-white cursor-not-allowed"
                    : "bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                }`}
              >
                {loading ? "Generating..." : generatedToday ? "Today Done" : "New Words"}
              </button>
              {showToast && (
                <div className="absolute top-full mt-2 left-0 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
                  하루에 한 번만 생성할 수 있습니다!
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchVocabulary}
              disabled={loading}
              className="ml-4 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 text-sm">
              Generating vocabulary with AI...
            </p>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.vocabulary.map((item, i) => (
              <VocabCard
                key={`${item.word}-${i}`}
                word={item.word}
                meaning={item.meaning}
                pronunciation={item.pronunciation}
                language={data.language}
                index={i}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
