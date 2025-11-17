"use client";

import { FastingLog, WaterLog, WeightLog, SyncPayload } from "./types";

const FASTING_KEY = "if_pwa_fasting_logs";
const WATER_KEY = "if_pwa_water_logs";
const WEIGHT_KEY = "if_pwa_weight_logs";
const QUEUE_KEY = "if_pwa_sync_queue";

function safeParse<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getFastingLogs(): FastingLog[] {
  return safeParse<FastingLog>(FASTING_KEY);
}
export function setFastingLogs(logs: FastingLog[]) {
  save<FastingLog>(FASTING_KEY, logs);
}

export function getWaterLogs(): WaterLog[] {
  return safeParse<WaterLog>(WATER_KEY);
}
export function setWaterLogs(logs: WaterLog[]) {
  save<WaterLog>(WATER_KEY, logs);
}

export function getWeightLogs(): WeightLog[] {
  return safeParse<WeightLog>(WEIGHT_KEY);
}
export function setWeightLogs(logs: WeightLog[]) {
  save<WeightLog>(WEIGHT_KEY, logs);
}

// offline sync queue (for background sync / online event)
export function enqueueForSync(payload: SyncPayload) {
  const queue = safeParse<SyncPayload>(QUEUE_KEY);
  queue.push(payload);
  save<SyncPayload>(QUEUE_KEY, queue);
}

export function getSyncQueue(): SyncPayload[] {
  return safeParse<SyncPayload>(QUEUE_KEY);
}

export function clearSyncQueue() {
  save<SyncPayload>(QUEUE_KEY, []);
}