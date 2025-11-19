"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Share2, Smile } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import confetti from "canvas-confetti";

type FastingStatus = "idle" | "running" | "completed";

const PRESETS = [
  { label: "16-8", hours: 16 },
  { label: "18-6", hours: 18 },
  { label: "20-4", hours: 20 },
];

interface FastingState {
  status: FastingStatus;
  start?: string;
  end?: string;
  targetHours: number;
  logId?: string;
}

const STORAGE_KEY = "if_fasting_state_v2";

function loadState(): FastingState {
  if (typeof window === "undefined") return { status: "idle", targetHours: 16 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { status: "idle", targetHours: 16 };
    const parsed = JSON.parse(raw);
    return {
      status: parsed.status ?? "idle",
      start: parsed.start,
      end: parsed.end,
      targetHours: parsed.targetHours ?? 16,
      logId: parsed.logId,
    };
  } catch {
    return { status: "idle", targetHours: 16 };
  }
}

function saveState(state: FastingState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatHM(date: Date | null) {
  if (!date) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatEndsOn(end: Date | null) {
  if (!end) return "--";
  const isToday =
    end.toDateString() === new Date().toDateString() ? "Today" : end.toLocaleDateString();
  return `${isToday} ${formatHM(end)}`;
}

function formatHMS(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
}

export default function FastingTimer() {
  const [state, setState] = useState<FastingState>(() => loadState());
  const [now, setNow] = useState<Date>(new Date());
  const [presetHours, setPresetHours] = useState<number>(state.targetHours || 16);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [completedTime, setCompletedTime] = useState<string>("");

  // tick - only run when fasting is running
  useEffect(() => {
    if (state.status !== "running") return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const startDate = state.start ? new Date(state.start) : null;
  const endDate = useMemo(() => {
    if (!startDate) return null;
    return new Date(startDate.getTime() + state.targetHours * 3600 * 1000);
  }, [startDate, state.targetHours]);

  const { elapsedMs, remainingMs, percent } = useMemo(() => {
    if (!startDate) {
      return {
        elapsedMs: 0,
        remainingMs: state.targetHours * 3600 * 1000,
        percent: 0,
      };
    }
    const total = state.targetHours * 3600 * 1000;
    const elapsed = Math.min(total, Math.max(0, now.getTime() - startDate.getTime()));
    const remaining = Math.max(0, total - elapsed);
    const p = total === 0 ? 0 : (elapsed / total) * 100;
    return { elapsedMs: elapsed, remainingMs: remaining, percent: p };
  }, [startDate, now, state.targetHours]);

  const elapsedLabel = formatHMS(elapsedMs);
  const remainingLabel = formatHMS(remainingMs);

  const onStart = () => {
    const s = new Date();
    setState({
      status: "running",
      start: s.toISOString(),
      end: undefined,
      targetHours: presetHours,
    });
  };

  const onEndClick = () => {
    setShowEndConfirm(true);
  };

  const confirmEnd = async () => {
    const endTime = new Date();
    const completedDuration = formatHMS(elapsedMs);
    
    logger.group("End Fasting");
    logger.info("User confirmed end fasting", {
      startTime: state.start,
      endTime: endTime.toISOString(),
      duration: completedDuration,
      targetHours: state.targetHours
    });
    
    // Save to Supabase
    let insertedLogId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn("No authenticated user, skipping database save");
        setShowEndConfirm(false);
        setState((prev) => ({
          ...prev,
          status: "completed",
          end: endTime.toISOString(),
        }));
        setCompletedTime(completedDuration);
        setTimeout(() => setShowMoodModal(true), 300);
        logger.groupEnd();
        return;
      }

      logger.debug("Inserting fasting log to database", {
        user_id: user.id,
        start: state.start,
        end_time: endTime.toISOString(),
        target_hours: state.targetHours
      });

      const { data, error } = await supabase.from("fasting_logs").insert({
        user_id: user.id,
        start: state.start,
        end_time: endTime.toISOString(),
        target_hours: state.targetHours,
        status: "completed",
      }).select("id").single();

      if (error) {
        logger.error("Failed to save fasting log", error);
        console.error("Error saving fasting log:", error);
      } else if (data) {
        insertedLogId = data.id;
        logger.info("Fasting log saved successfully", { logId: data.id });
      }
    } catch (error) {
      logger.error("Exception while saving fasting log", error);
      console.error("Error:", error);
    }

    // Update state
    setState((prev) => ({
      ...prev,
      status: "completed",
      end: endTime.toISOString(),
      logId: insertedLogId, // Store log ID for mood update
    }));
    
    setCompletedTime(completedDuration);
    setShowEndConfirm(false);
    
    logger.info("Showing mood selection modal");
    logger.groupEnd();
    
    // Show mood modal
    setTimeout(() => {
      setShowMoodModal(true);
    }, 300);
  };

  const cancelEnd = () => setShowEndConfirm(false);

  const handleMoodSelect = async (mood: string) => {
    logger.group("Mood Selection");
    setSelectedMood(mood);
    
    // Save mood to Supabase using stored logId
    try {
      logger.info("Selected mood:", mood);
      
      if (!state.logId) {
        logger.warn("No logId in state, cannot update mood");
        setShowMoodModal(false);
        setTimeout(() => {
          setShowSuccessModal(true);
          fireConfetti();
        }, 300);
        return;
      }
      
      logger.debug("Updating fasting log with ID:", state.logId);
      
      const { error } = await supabase
        .from("fasting_logs")
        .update({ mood })
        .eq("id", state.logId);
      
      if (error) {
        logger.error("Failed to update mood:", error);
      } else {
        logger.info("Mood saved successfully");
      }
    } catch (error) {
      logger.error("Error saving mood:", error);
    } finally {
      logger.groupEnd();
    }

    setShowMoodModal(false);
    
    // Show success modal with confetti
    setTimeout(() => {
      setShowSuccessModal(true);
      fireConfetti();
    }, 300);
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#a855f7", "#ec4899", "#f43f5e"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#a855f7", "#ec4899", "#f43f5e"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    // Reset to idle state
    setState({
      status: "idle",
      targetHours: presetHours,
    });
  };

  const onPresetChange = (value: string) => {
    const h = Number(value);
    setPresetHours(h);
    if (state.status === "idle") {
      setState((prev) => ({ ...prev, targetHours: h }));
    }
  };

  const handleShare = async () => {
    const text = `I just completed a ${completedTime} fast! 🎉\n\nJoin me on my intermittent fasting journey!`;
    const url = window.location.origin;
    
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: "Fasting Achievement!", 
          text,
          url,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard?.writeText(`${text}\n${url}`);
      alert("Copied to clipboard!");
    }
  };

  const handleMood = () => {
    setShowMoodModal(true);
  };

  // Progress circle parameters
  const radius = 82;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  // Emoji icons positions
  const iconSize = 32;
  const iconRadius = radius + stroke / 2 + 12;

  return (
    <Card className="rounded-3xl p-5 bg-white dark:bg-slate-900 shadow-sm">
      {/* Fasting circle with icons */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 260, height: 260 }}>
          {/* Background circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 rounded-full bg-slate-50 dark:bg-slate-800" />
          </div>

          {/* SVG Progress Circle - Start from bottom left */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260">
            {/* Background track */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={stroke}
              fill="none"
              className="dark:stroke-slate-700"
            />
            {/* Progress arc - rotated to start from bottom-left (225deg) */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              stroke="#a855f7"
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
              transform="rotate(135 130 130)"
            />
          </svg>

          {/* Emoji icons around circle */}
          <div
            className="absolute bg-white dark:bg-slate-900 rounded-full p-2 shadow-md"
            style={{
              width: iconSize,
              height: iconSize,
              left: `calc(50% - ${iconSize / 2}px)`,
              top: `calc(50% - ${iconRadius}px - ${iconSize / 2}px)`,
            }}
          >
            <span className="text-lg">🍽️</span>
          </div>
          <div
            className="absolute bg-white dark:bg-slate-900 rounded-full p-2 shadow-md"
            style={{
              width: iconSize,
              height: iconSize,
              right: `calc(50% - ${iconRadius}px - ${iconSize / 2}px)`,
              top: `calc(50% - ${iconSize / 2}px)`,
            }}
          >
            <span className="text-lg">🔥</span>
          </div>
          <div
            className="absolute bg-white dark:bg-slate-900 rounded-full p-2 shadow-md"
            style={{
              width: iconSize,
              height: iconSize,
              left: `calc(50% - ${iconSize / 2}px)`,
              bottom: `calc(50% - ${iconRadius}px - ${iconSize / 2}px)`,
            }}
          >
            <span className="text-lg">⚡</span>
          </div>
          <div
            className="absolute bg-white dark:bg-slate-900 rounded-full p-2 shadow-md"
            style={{
              width: iconSize,
              height: iconSize,
              left: `calc(50% - ${iconRadius}px - ${iconSize / 2}px)`,
              top: `calc(50% - ${iconSize / 2}px)`,
            }}
          >
            <span className="text-lg">💧</span>
          </div>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-[10px] text-slate-400">
              Elapsed time ({Math.round(percent)}%)
            </p>
            <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
              {elapsedLabel}
            </p>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Your fast ends on
            </p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatEndsOn(endDate)}
            </p>
            
            {/* Preset badge with edit */}
            <button
              onClick={() => {
                const newHours = prompt("Enter target hours:", String(presetHours));
                if (newHours) onPresetChange(newHours);
              }}
              className="mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium"
            >
              <span>{presetHours}-{24-presetHours}</span>
              <Pencil className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full flex items-center justify-center gap-3 mt-4">
          <button
            onClick={handleMood}
            className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Smile className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          {state.status === "running" ? (
            <Button
              onClick={onEndClick}
              className="flex-1 rounded-full border-2 border-rose-500 text-rose-600 bg-white dark:bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold py-2.5"
            >
              End Fasting
            </Button>
          ) : (
            <Button
              onClick={onStart}
              className="flex-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5"
            >
              Start Fasting
            </Button>
          )}

          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Share2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Start / End times */}
        <div className="w-full flex items-center justify-between mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-900 dark:text-white font-medium">
              Today, {formatHM(startDate)}
            </span>
            <Pencil className="h-3 w-3 text-slate-400" />
          </div>
          
          <div className="text-slate-400">•</div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-900 dark:text-white font-medium">
              Today, {formatHM(endDate)}
            </span>
          </div>
        </div>

        <div className="w-full flex justify-between text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
          <span>Start fast</span>
          <span>End fast</span>
        </div>
      </div>

      {/* End confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp">
            <h3 className="text-2xl font-bold text-center mb-3 text-slate-900 dark:text-white">
              End Fasting
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-400 text-center mb-8">
              Do you want to end your fasting now?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelEnd}
                className="flex-1 py-4 rounded-full text-rose-500 font-semibold text-base
                           hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
              >
                No, Continue Fasting
              </button>
              <button
                onClick={confirmEnd}
                className="flex-1 py-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base
                           shadow-lg shadow-rose-500/30 transition-all active:scale-95"
              >
                Yes, End Fasting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mood selection modal */}
      {showMoodModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp">
            <h3 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">
              How do you feel about this fast?
            </h3>
            
            {/* Mood options */}
            <div className="grid grid-cols-3 gap-4 my-8">
              <button
                onClick={() => handleMoodSelect("great")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-3xl">
                  😄
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Great</span>
              </button>

              <button
                onClick={() => handleMoodSelect("good")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-green-50 dark:hover:bg-green-950/20 transition-all active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl">
                  🙂
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Good</span>
              </button>

              <button
                onClick={() => handleMoodSelect("okay")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-slate-500 flex items-center justify-center text-3xl">
                  😐
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Okay</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleMoodSelect("not-good")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-3xl">
                  😕
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Not Good</span>
              </button>

              <button
                onClick={() => handleMoodSelect("bad")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-3xl">
                  😞
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bad</span>
              </button>
            </div>

            <button
              onClick={() => handleMoodSelect("skip")}
              className="w-full mt-6 py-4 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              I Feel...
            </button>
          </div>
        </div>
      )}

      {/* Success/Achievement modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-950 p-4">
          <div className="max-w-sm w-full text-center space-y-6 animate-fadeIn">
            {/* Trophy illustration */}
            <div className="flex justify-center">
              <div className="text-9xl animate-bounce">
                🏆
              </div>
            </div>

            {/* Completed time */}
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">
              {completedTime}
            </h1>

            {/* Success message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Fasting Goal Achieved!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Earn this award every time you reach your fasting goal target!
              </p>
            </div>

            {/* Share message */}
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Share your achievements with friends
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCloseSuccess}
                className="flex-1 py-4 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-semibold text-base
                           hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-all"
              >
                Back to Home
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base
                           shadow-lg shadow-rose-500/30 transition-all active:scale-95"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}