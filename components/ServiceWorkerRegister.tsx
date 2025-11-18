"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          console.log("✅ SW registered", reg);

          // Check for updates on load
          reg.update();

          // Listen for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("🔄 New version available! Refreshing...");
                  // Auto-reload to get new version
                  window.location.reload();
                }
              });
            }
          });

          // Register background sync if supported
          if ("SyncManager" in window) {
            try {
              await reg.sync.register("sync-logs");
              console.log("📡 Background sync registered");
            } catch (e) {
              console.warn("⚠️ Sync registration failed", e);
            }
          }
        })
        .catch((err) => console.error("❌ SW registration failed", err));

      // Check for updates periodically (every 60 seconds)
      setInterval(() => {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.update();
        });
      }, 60000);
    }
  }, []);

  return null;
}