"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { NotificationToggle } from "./NotificationToggle";
import { LocaleToggle } from "./LocaleToggle";
import { PageTransition } from "./PageTransition";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
}

export function AppShell({ title, subtitle, children, showBack = true }: AppShellProps) {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showBack && (
                  <Link
                    href="/"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                  {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LocaleToggle />
                <NotificationToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </div>
    </PageTransition>
  );
}
