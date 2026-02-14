"use client";

import { useSpeech } from "@/hooks/useSpeech";

interface VocabCardProps {
  word: string;
  meaning: string;
  pronunciation: string;
  language: string;
  index: number;
}

export function VocabCard({
  word,
  meaning,
  pronunciation,
  language,
  index,
}: VocabCardProps) {
  const { speak, speaking } = useSpeech();

  const lang = language === "English" ? "en-US" : "zh-CN";

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary-300">
      <span className="absolute top-3 right-3 text-xs font-medium text-slate-300">
        #{index + 1}
      </span>

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 truncate">{word}</h3>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">
            {pronunciation}
          </p>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">
            {meaning}
          </p>
        </div>

        <button
          onClick={() => speak(word, lang)}
          disabled={speaking}
          className="flex-shrink-0 mt-1 w-9 h-9 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-50"
          aria-label={`Pronounce ${word}`}
        >
          {speaking ? (
            <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="8" width="3" height="8" rx="1" />
              <rect x="10" y="5" width="3" height="14" rx="1" />
              <rect x="16" y="8" width="3" height="8" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 5L6 9H2v6h4l5 4V5zm5.54 3.46a5 5 0 0 1 0 7.07l-1.41-1.41a3 3 0 0 0 0-4.24l1.41-1.42zm2.83-2.83a9 9 0 0 1 0 12.73l-1.41-1.41a7 7 0 0 0 0-9.9l1.41-1.42z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
