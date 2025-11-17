"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WeightLog } from "@/lib/types";
import { getWeightLogs, setWeightLogs, enqueueForSync } from "@/lib/storage";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function WeightTracker() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const data = getWeightLogs().sort((a, b) => (b.date > a.date ? 1 : -1));
    setLogs(data);
    const today = todayKey();
    const todayLog = data.find((l) => l.date === today);
    if (todayLog) setValue(todayLog.weight.toString());
  }, []);

  const handleSave = () => {
    if (!value) return;
    const weight = parseFloat(value);
    if (Number.isNaN(weight)) return;

    const today = todayKey();
    const filtered = logs.filter((l) => l.date !== today);
    const newLog: WeightLog = {
      id: crypto.randomUUID(),
      date: today,
      weight,
    };
    const next = [newLog, ...filtered].sort((a, b) =>
      b.date > a.date ? 1 : -1
    );
    setLogs(next);
    setWeightLogs(next);

    enqueueForSync({
      fastingLogs: [],
      waterLogs: [],
      weightLogs: next,
    });

    if (navigator.onLine) {
      syncWeight(next).catch(console.error);
    }
  };

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-50">
              Weight
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-300">
              Log daily to track your progress.
            </p>
          </div>
          {logs[0] && (
            <div className="text-right">
              <p className="text-xs font-semibold text-brandPurple dark:text-brandLavender">
                {logs[0].weight} kg
              </p>
              <p className="text-[10px] text-slate-400">latest</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="e.g. 86.2"
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-full bg-white/80 text-sm text-slate-800 dark:bg-[#281a40] dark:text-slate-100"
          />
          <Button className="rounded-full bg-brandOrange px-4 text-sm font-semibold text-white hover:bg-[#ff9966]" onClick={handleSave}>
            Save
          </Button>
        </div>

        <div className="mt-2 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            History
          </p>
          <div className="max-h-24 space-y-1 overflow-y-auto text-[11px]">
            {logs.slice(0, 7).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl bg-white/70 px-2 py-1 text-slate-700 dark:bg-[#251938] dark:text-slate-100"
              >
                <span>{l.date}</span>
                <span className="font-mono text-brandPurple dark:text-brandLavender">
                  {l.weight} kg
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-slate-400">No weight logs yet.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

async function syncWeight(allLogs: WeightLog[]) {
  await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fastingLogs: [],
      waterLogs: [],
      weightLogs: allLogs,
    }),
  });
}
