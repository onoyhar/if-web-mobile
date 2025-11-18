"use client";

import { useEffect, useState, useMemo } from "react";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FastingRing from "@/components/FastingRing";
import { FastingLog } from "@/lib/types";
import { getFastingLogs, setFastingLogs, enqueueForSync } from "@/lib/storage";
import confetti from "canvas-confetti";

const PRESETS = [
  { label: "16-8", hours: 16 },
  { label: "18-6", hours: 18 },
  { label: "20-4", hours: 20 },
];

function formatHMS(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    zIndex: 9999,
  });
}

export default function FastingTimer() {
  const [targetHours, setTargetHours] = useState(16);
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<FastingLog[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [badge, setBadge] = useState<string | null>(null);

  // load from local storage
  useEffect(() => {
    const logs = getFastingLogs();
    setHistory(logs);
    const current = logs.find((l) => l.status === "running");
    if (current) {
      setStartTime(new Date(current.start));
      setStatus("running");
    }
  }, []);

  // tick timer
  useEffect(() => {
    if (status !== "running" || !startTime) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - startTime.getTime());
    }, 1000);
    return () => clearInterval(id);
  }, [status, startTime]);

  const targetMs = targetHours * 3600 * 1000;
  const remainingMs = Math.max(0, targetMs - elapsed);
  const elapsedMs = Math.min(elapsed, targetMs);
  const progress = Math.min(100, (elapsedMs / targetMs) * 100);

  // confetti when complete
  useEffect(() => {
    if (status === "running" && progress >= 100) {
      fireConfetti();
    }
  }, [progress, status]);

  // milestone badges (fat burn, halfway, autophagy, complete)
  useEffect(() => {
    if (progress < 25) {
      setBadge(null);
    } else if (progress >= 25 && progress < 50) {
      setBadge("🔥 Fat Burn Zone");
    } else if (progress >= 50 && progress < 75) {
      setBadge("🌙 Halfway There");
    } else if (progress >= 75 && progress < 100) {
      setBadge("⚡ Autophagy Zone");
    } else if (progress >= 100) {
      setBadge("🏆 Fasting Complete");
    }
  }, [progress]);

  const endTime = useMemo(() => {
    if (!startTime) return null;
    return new Date(startTime.getTime() + targetMs);
  }, [startTime, targetMs]);

  const latestCompleted = useMemo(
    () => history.find((h) => h.status === "completed"),
    [history]
  );

  const handleStart = () => {
    const now = new Date();
    const newLog: FastingLog = {
      id: crypto.randomUUID(),
      start: now.toISOString(),
      status: "running",
      targetHours,
    };
    const updated = [newLog, ...getFastingLogs()];
    setFastingLogs(updated);
    setHistory(updated);
    setStartTime(now);
    setStatus("running");
    setElapsed(0);
  };

  const handleStop = () => {
  if (!startTime) return;
  const now = new Date();

  const updated: FastingLog[] = getFastingLogs().map((l) =>
    l.status === "running"
      ? {
          ...l,
          status: "completed" as FastingLog["status"],
          end: now.toISOString(),
        }
      : l
  );

  setFastingLogs(updated);
  enqueueForSync({
    fastingLogs: updated,
    waterLogs: [],
    weightLogs: [],
  });
  setHistory(updated);
  setStatus("idle");
  setStartTime(null);
  setElapsed(0);
};

  return (
    <Card className="bg-gradient-to-b from-[#f7f0ff] via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-4 shadow-sm">
      <div className="flex flex-col items-center gap-5">

        {/* Top: Home / title area */}
        <div className="w-full flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Fasting</p>
            {badge && (
              <span className="mt-1 inline-flex items-center rounded-full bg-brandLightPurple/40 px-3 py-1 text-[10px] font-medium text-brandPurple">
                {badge}
              </span>
            )}
          </div>

          {/* Preset pill with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
            >
              {PRESETS.find((p) => p.hours === targetHours)?.label ?? `${targetHours}-0`}
              <span className="text-[9px] text-slate-400">▼</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white shadow-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-700 z-30">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    className="block w-full px-3 py-1.5 text-left text-xs hover:bg-brandLightPurple/40"
                    onClick={() => {
                      setTargetHours(p.hours);
                      setDropdownOpen(false);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-2">
                  <p className="text-[10px] text-slate-500 mb-1">Custom (hours)</p>
                  <Input
                    type="number"
                    min={8}
                    max={36}
                    value={targetHours}
                    onChange={(e) =>
                      setTargetHours(Number(e.target.value) || targetHours)
                    }
                    className="h-7 text-[11px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ring + timer text */}
        <div className="flex flex-col items-center gap-3">
          <FastingRing
            progress={progress}
            label={`Elapsed (${Math.round(progress)}%)`}
            bigText={formatHMS(elapsedMs)}
          />

          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500">
              Remaining time{" "}
              <span className="font-semibold text-brandPurple">
                {formatHMS(remainingMs)}
              </span>
            </p>
            {endTime && (
              <p className="text-[11px] text-slate-500">
                Your fast ends at{" "}
                <span className="font-semibold">
                  {endTime.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Start / End button */}
        <div className="w-full flex flex-col items-center gap-3">
          {status === "idle" ? (
            <Button
              className="w-full rounded-full bg-brandPurple text-white py-3 text-sm font-semibold hover:bg-brandLavender"
              onClick={handleStart}
            >
              Start Fasting
            </Button>
          ) : (
            <Button
              className="w-full rounded-full border border-brandPurple text-brandPurple py-3 text-sm font-semibold bg-white hover:bg-brandLightPurple/40"
              onClick={handleStop}
            >
              End Fasting
            </Button>
          )}

          {/* Start / End info row */}
          <div className="w-full grid grid-cols-2 gap-2 text-center text-[11px] text-slate-500">
            <div>
              <p className="uppercase tracking-[0.18em] text-[9px] text-slate-400 mb-1">
                Start fast
              </p>
              <p className="font-medium">
                {startTime
                  ? startTime.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : latestCompleted?.start
                  ? new Date(latestCompleted.start).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </p>
            </div>
            <div>
              <p className="uppercase tracking-[0.18em] text-[9px] text-slate-400 mb-1">
                End fast
              </p>
              <p className="font-medium">
                {status === "running" && endTime
                  ? endTime.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : latestCompleted?.end
                  ? new Date(latestCompleted.end!).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}