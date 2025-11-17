"use client";

import { useState } from "react";
import { Button } from "./ui/button";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";

async function subscribeUser() {
  if (!("serviceWorker" in navigator)) return;

  const reg = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permission denied");

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
      ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      : undefined
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription })
  });

  return subscription;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationSetup() {
  const [status, setStatus] = useState<"idle" | "enabled" | "error">("idle");

  const handleEnable = async () => {
    try {
      await subscribeUser();
      setStatus("enabled");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Reminder Notifications</h2>
        <Button size="sm" onClick={handleEnable}>
          Enable
        </Button>
      </div>
      <p className="text-sm text-slate-400">
        Get push notifications for fasting end time & water reminders.
      </p>
      {status === "enabled" && (
        <p className="text-xs text-emerald-400">Notifications enabled.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-400">
          Failed to enable. Check HTTPS / browser support.
        </p>
      )}
    </div>
  );
}