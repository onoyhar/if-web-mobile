"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FastingRing from "@/components/FastingRing";
import { FastingLog } from "@/lib/types";
import { getFastingLogs, setFastingLogs, enqueueForSync } from "@/lib/storage";
import confetti from "canvas-confetti";

const PRESETS = [
  { label: "16:8", hours: 16 },
  { label: "18:6", hours: 18 },
  { label: "20:4", hours: 20 },
];

function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    zIndex: 9999,
  });
}

function formatHMS(ms: number) {
  if (ms <= 0) return "00:00:00";

  const totalSec = Math.floor(ms / 1000);

  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function FastingTimer() {
  const [targetHours, setTargetHours] = useState(20);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<FastingLog[]>([]);
  const [badge, setBadge] = useState<string | null>(null);

  useEffect(() => {
    const logs = getFastingLogs();
    setHistory(logs);
    const current = logs.find((l) => l.status === "running");
    if (current) {
      setStartTime(new Date(current.start));
      setStatus("running");
    }
  }, []);

  useEffect(() => {
    if (status !== "running" || !startTime) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - startTime.getTime());
    }, 1000);
    return () => clearInterval(id);
  }, [status, startTime]);

  const targetMs = targetHours * 3600 * 1000;
  const remainingMs = Math.max(0, targetMs - elapsed);
  const progress = Math.min(100, (elapsed / targetMs) * 100);

  useEffect(() => {
    if (status === "running" && progress >= 100) {
      fireConfetti();
    }
  }, [progress, status]);

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
  };

  const handleStop = () => {
    const now = new Date();
    const updated = getFastingLogs().map((l) =>
      l.status === "running" ? { ...l, status: "completed" as const, end: now.toISOString() } : l
    );

    setFastingLogs(updated);
    enqueueForSync({
      fastingLogs: updated,
      waterLogs: [],
      weightLogs: []
    });

    setHistory(updated);
    setStatus("idle");
    setStartTime(null);
    setElapsed(0);
  };

  return (
    <Card>
      <div className="flex gap-4">
        
        {/* Ring */}
        <FastingRing
          progress={progress}
          label={status === "running" ? "Remaining" : "Target"}
          bigText={status === "running" ? formatHMS(remainingMs) : `${targetHours}h`}
        />

        <div className="flex-1 space-y-3">
          {/* Title */}
          <div className="flex justify-between">
            <div>
              <h2 className="text-sm font-semibold">Fasting</h2>
              <p className="text-[11px] text-slate-500">Choose a preset and start your fasting window.</p>
            </div>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="badge-chip cursor-pointer"
              >
                Preset: {PRESETS.find(p => p.hours === targetHours)?.label ?? `${targetHours}:0`} ▾
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white shadow-lg dark:bg-[#241833] p-2 text-sm z-50">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      className="block w-full text-left px-2 py-1 hover:bg-brandLightPurple/40 rounded"
                      onClick={() => {
                        setTargetHours(p.hours);
                        setDropdownOpen(false);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}

                  {/* Custom */}
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <Input
                      type="number"
                      min={10}
                      max={36}
                      value={targetHours}
                      onChange={(e) => setTargetHours(parseInt(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Start / Stop */}
          {status === "idle" ? (
            <Button
              className="w-full rounded-full bg-brandPurple text-white py-3"
              onClick={handleStart}
            >
              Start Fasting
            </Button>
          ) : (
            <Button
              className="w-full rounded-full bg-brandPink text-white py-3"
              onClick={handleStop}
            >
              Stop & Save
            </Button>
          )}

          {/* History */}
          <div>
            <p className="text-[10px] uppercase text-slate-400 tracking-[0.2em]">History</p>
            {history.filter(h => h.status === "completed").length === 0 && (
              <p className="text-[11px] text-slate-500">No fasting logs yet.</p>
            )}
          </div>

        </div>
      </div>
    </Card>
  );
}