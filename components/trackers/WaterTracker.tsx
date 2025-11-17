"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WaterDroplet from "@/components/WaterDroplet";
import { WaterLog } from "@/lib/types";
import { getWaterLogs, setWaterLogs, enqueueForSync } from "@/lib/storage";

const DAILY_TARGET = 2500; // ml

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function WaterTracker() {
  const [logs, setLogs] = useState<WaterLog[]>([]);

  useEffect(() => {
    setLogs(getWaterLogs());
  }, []);

  const today = todayKey();
  const todayTotal = useMemo(
    () => logs.filter((l) => l.date === today).reduce((sum, l) => sum + l.ml, 0),
    [logs, today]
  );

  const addWater = (ml: number) => {
    const newLog: WaterLog = {
      id: crypto.randomUUID(),
      date: today,
      ml,
    };
    const next = [newLog, ...logs];
    setLogs(next);
    setWaterLogs(next);

    enqueueForSync({
      fastingLogs: [],
      waterLogs: next,
      weightLogs: [],
    });

    if (navigator.onLine) {
      syncWater(next).catch(console.error);
    }
  };

  const percent = (todayTotal / DAILY_TARGET) * 100;

  return (
    <Card>
      <div className="flex items-center gap-4">
        <WaterDroplet percent={percent} />
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-50">
                Water Intake
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-300">
                Target {DAILY_TARGET / 1000}L per day.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-100">
                {todayTotal} ml
              </p>
              <p className="text-[10px] text-slate-400">today</p>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-brandLightPurple/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brandBlue to-brandPurple transition-all duration-500 ease-out"
              style={{ width: `${Math.max(4, Math.min(100, percent))}%` }}
            />
          </div>

          <div className="flex justify-between gap-2 text-[11px]">
            <Button
              size="sm"
              className="flex-1 rounded-full bg-white/80 text-slate-800 hover:bg-brandLightPurple/80 dark:bg-[#281a40] dark:text-slate-100"
              onClick={() => addWater(200)}
            >
              +200 ml
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-full bg-white/80 text-slate-800 hover:bg-brandLightPurple/80 dark:bg-[#281a40] dark:text-slate-100"
              onClick={() => addWater(300)}
            >
              +300 ml
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-full bg-brandBlue text-white hover:bg-[#6ea4ff]"
              onClick={() => addWater(500)}
            >
              +500 ml
            </Button>
          </div>

          <div className="mt-2 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Recent days
            </p>
            <div className="max-h-20 space-y-1 overflow-y-auto text-[11px]">
              {Object.entries(
                logs.reduce<Record<string, number>>((acc, l) => {
                  acc[l.date] = (acc[l.date] || 0) + l.ml;
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => (a < b ? 1 : -1))
                .slice(0, 5)
                .map(([date, total]) => (
                  <div
                    key={date}
                    className="flex justify-between rounded-xl bg-white/70 px-2 py-1 text-slate-700 dark:bg-[#251938] dark:text-slate-100"
                  >
                    <span>{date}</span>
                    <span className="text-brandBlue">{total} ml</span>
                  </div>
                ))}
              {logs.length === 0 && (
                <p className="text-slate-400">No water logs yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

async function syncWater(allLogs: WaterLog[]) {
  await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fastingLogs: [],
      waterLogs: allLogs,
      weightLogs: [],
    }),
  });
}
