"use client";

import { usePushSubscription } from "@/hooks/usePushSubscription";

export function NotificationToggle() {
  const { isSubscribed, isSupported, loading, subscribe, unsubscribe } =
    usePushSubscription();

  if (!isSupported) {
    return (
      <p className="text-xs text-slate-400">
        Push notifications not supported in this browser.
      </p>
    );
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
        isSubscribed
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        {isSubscribed ? (
          <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        ) : (
          <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        )}
      </svg>
      {loading
        ? "..."
        : isSubscribed
          ? "Notifications On"
          : "Enable Notifications"}
    </button>
  );
}
