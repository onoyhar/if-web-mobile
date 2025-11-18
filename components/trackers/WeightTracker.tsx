"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWeightLogs, setWeightLogs, enqueueForSync } from "@/lib/storage";
import { WeightLog } from "@/lib/types";

const TARGET_WEIGHT = 70; // default target, bisa diambil dari settings nanti

export default function WeightTracker() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [weight, setWeight] = useState<number | null>(null);

  useEffect(() => {
    const stored = getWeightLogs();
    setLogs(stored);

    if (stored.length > 0) {
      setWeight(stored[0].weight); // newest first
    }
  }, []);

  const addWeight = () => {
    if (!weight) return;

    const now = new Date().toISOString();
    const newLog: WeightLog = {
      id: crypto.randomUUID(),
      weight,
      date: now,
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    setWeightLogs(updated);

    enqueueForSync({
      fastingLogs: [],
      waterLogs: [],
      weightLogs: updated,
    });
  };

  const lastWeight = logs.length > 1 ? logs[1].weight : weight;
  const diff = lastWeight && weight ? weight - lastWeight : 0;

  const startWeight = logs.length > 0 ? logs[logs.length - 1].weight : weight ?? 0;
  const progress = Math.min(
    100,
    ((startWeight - (weight ?? startWeight)) /
      (startWeight - TARGET_WEIGHT || 1)) *
      100
  );

  return (
    <Card className="rounded-3xl p-5 bg-gradient-to-b from-[#fff4fc] to-white dark:from-slate-900 dark:to-slate-950 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-xs font-medium text-slate-500">Weight Tracker</p>
      </div>

      {/* Weight display */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold text-brandPurple">
          {weight ? weight.toFixed(1) : "--"}<span className="text-xl">kg</span>
        </h1>

        {diff !== 0 && (
          <p
            className={`text-xs font-semibold ${
              diff < 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {diff < 0 ? "▼" : "▲"} {Math.abs(diff).toFixed(1)} kg
          </p>
        )}

        <p className="text-[11px] text-slate-500">
          Goal Weight: <span className="font-semibold">{TARGET_WEIGHT} kg</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brandPurple to-brandLavender transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Input weight */}
      <div className="flex items-center justify-between mt-3">
        <input
          type="number"
          step="0.1"
          value={weight ?? ""}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm"
          placeholder="Weight"
        />

        <Button
          className="rounded-full px-6 py-2 bg-brandPurple text-white font-semibold"
          onClick={addWeight}
        >
          Save
        </Button>
      </div>

      {/* Start vs target summary */}
      <div className="flex justify-between text-[11px] text-slate-500 pt-2">
        <div>
          <p className="uppercase tracking-wide text-[10px] text-slate-400">
            Start
          </p>
          <p className="font-medium">{startWeight} kg</p>
        </div>
        <div>
          <p className="uppercase tracking-wide text-[10px] text-slate-400">
            Target
          </p>
          <p className="font-medium">{TARGET_WEIGHT} kg</p>
        </div>
      </div>
    </Card>
  );
}