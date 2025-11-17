"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      // Check for updates immediately
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });

      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          console.log("SW registered", reg);

          // Force update on page load
          reg.update();

          if ("SyncManager" in window) {
            try {
              await reg.sync.register("sync-logs");
              console.log("Background sync registered");
            } catch (e) {
              console.warn("Sync registration failed", e);
            }
          }
        })
        .catch((err) => console.error("SW registration failed", err));
    }
  }, []);

  return null;
}