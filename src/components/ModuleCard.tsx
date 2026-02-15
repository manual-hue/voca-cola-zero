"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ModuleConfig } from "@/types/modules";

interface ModuleCardProps {
  module: ModuleConfig;
  index: number;
  completed?: boolean;
  titleOverride?: string;
  subtitleOverride?: string;
}

export function ModuleCard({ module, index, completed, titleOverride, subtitleOverride }: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={module.href}
        className={`block relative rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
          completed ? "border-green-200" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${module.bgColor} flex items-center justify-center text-2xl shrink-0`}>
            {module.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900">{titleOverride ?? module.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{subtitleOverride ?? module.subtitle}</p>
          </div>
          {completed ? (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
