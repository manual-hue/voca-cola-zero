"use client";

import { useEffect } from "react";
import { HomeScreen } from "@/components/HomeScreen";

export default function Home() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }
  }, []);

  return <HomeScreen />;
}
