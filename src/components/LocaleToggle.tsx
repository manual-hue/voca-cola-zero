"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/actions";

export function LocaleToggle({ fullWidth = false }: { fullWidth?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = locale === "ko" ? "en" : "ko";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 ${fullWidth ? "w-full" : ""}`}
    >
      {locale === "ko" ? "EN" : "KO"}
    </button>
  );
}
