"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWaterLogs, setWaterLogs, enqueueForSync } from "@/lib/storage";
import { WaterLog } from "@/lib/types";

const DAILY_GOAL = 2000; // 2000 ml = 2 Liter

export default function WaterTracker() {
  const [water, setWater] = useState(0);
  const [logs, setLogs] = useState<WaterLog[]>([]);

  useEffect(() => {
    const stored = getWaterLogs();
    setLogs(stored);

    // get today's total
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = stored.filter((l) => l.date.startsWith(today));
    const total = todayLogs.reduce((sum, l) => sum + l.ml, 0);
    setWater(total);
  }, []);

  const add = (ml: number) => {
    const now = new Date().toISOString();
    const newLog = { id: crypto.randomUUID(), ml, date: now };

    const updated = [...logs, newLog];
    setLogs(updated);
    setWater((w) => w + ml);

    setWaterLogs(updated);
    enqueueForSync({
      fastingLogs: [],
      waterLogs: updated,
      weightLogs: [],
    });
  };

  const progress = Math.min(100, (water / DAILY_GOAL) * 100);

  return (
    <Card className="rounded-3xl p-5 bg-gradient-to-b from-[#ecf1ff] to-white dark:from-slate-900 dark:to-slate-950 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-xs font-medium text-slate-500">Water Intake</p>
      </div>

      {/* Big Drop + Total */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          {/* Drop */}
          <div className="w-20 h-24 bg-blue-100 dark:bg-slate-800 rounded-3xl flex flex-col items-center justify-center shadow-inner">
            <span className="text-lg font-bold text-blue-600">{water} ml</span>
          </div>
        </div>

        {/* Goal text */}
        <p className="text-xs text-slate-500">
          Daily Goal:{" "}
          <span className="font-semibold text-brandPurple">{DAILY_GOAL} ml</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between">
        <Button
          className="rounded-full w-24 py-2 bg-blue-500 text-white font-semibold"
          onClick={() => add(250)}
        >
          +250ml
        </Button>

        <Button
          className="rounded-full w-24 py-2 bg-blue-300 text-blue-900 font-semibold"
          onClick={() => add(100)}
        >
          +100ml
        </Button>
      </div>
    </Card>
  );
}