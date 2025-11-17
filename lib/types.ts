export type FastingStatus = "idle" | "running" | "completed";

export interface FastingLog {
  id: string;
  start: string; // ISO
  end?: string;  // ISO
  status: FastingStatus;
  targetHours: number;
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  ml: number;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface SyncPayload {
  fastingLogs: FastingLog[];
  waterLogs: WaterLog[];
  weightLogs: WeightLog[];
}

// Database Types
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  age: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  height_cm: number | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLibrary {
  id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string;
  created_at: string;
}