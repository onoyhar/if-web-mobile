"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import { ChevronRight, Pencil } from "lucide-react";

const STORAGE_KEY = "if_weight_logs_v2";

interface WeightLog {
  date: string;
  weight: number;
}

function loadLatest(): WeightLog | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const logs: WeightLog[] = JSON.parse(raw);
    if (!logs.length) return null;
    return logs[logs.length - 1];
  } catch {
    return null;
  }
}

function saveWeight(weight: number) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const logs: WeightLog[] = raw ? JSON.parse(raw) : [];
  logs.push({
    date: new Date().toISOString(),
    weight,
  });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export default function WeightTracker() {
  const [goal, setGoal] = useState(70); // default goal
  const [startWeight, setStartWeight] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const last = loadLatest();
    if (last) {
      setCurrentWeight(last.weight);
      if (!startWeight) setStartWeight(last.weight);
    }
  }, []);

  const handleSave = () => {
    const w = Number(input);
    if (!w || isNaN(w)) return;
    saveWeight(w);
    setCurrentWeight(w);
    if (!startWeight) setStartWeight(w);
    setInput("");
  };

  const percent =
    currentWeight && startWeight
      ? Math.min(
          100,
          Math.max(
            0,
            ((startWeight - currentWeight) / (startWeight - goal || 1)) * 100
          )
        )
      : 0;

  const difference = currentWeight && startWeight ? startWeight - currentWeight : 0;
  const isLoss = difference > 0;

  return (
    <Card className="rounded-3xl p-5 bg-white dark:bg-slate-900 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Weight Tracker
        </h2>
        <button className="text-rose-500 hover:text-rose-600">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Main display */}
      <div className="flex items-center justify-between mb-5">
        {/* Current weight */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-slate-900 dark:text-white">
              {currentWeight ? currentWeight.toFixed(1) : "0.0"}
            </span>
            <span className="text-lg text-slate-400">kg</span>
          </div>
          
          {/* Difference badge */}
          {difference !== 0 && (
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              isLoss 
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
            }`}>
              <span>{isLoss ? '↓' : '↑'}</span>
              <span>{Math.abs(difference).toFixed(1)} kg</span>
            </div>
          )}
        </div>

        {/* Edit button */}
        <button
          onClick={() => {
            const newWeight = prompt("Enter current weight (kg):", currentWeight?.toString() || "");
            if (newWeight) handleSave();
          }}
          className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <Pencil className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Start and Goal labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Starting: {startWeight ? `${startWeight.toFixed(1)} kg` : "0 kg"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Goal: {goal} kg
          </p>
        </div>
      </div>
    </Card>
  );
}