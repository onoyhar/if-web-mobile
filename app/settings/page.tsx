"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

type GoalData = {
  heightCm: string; // tinggi (cm)
  weightKg: string; // berat saat ini (kg)
};

const GOAL_STORAGE_KEY = "if_goal_settings";

function calcBmiAndTarget(heightCm: number, weightKg: number) {
  if (!heightCm || !weightKg) return null;

  const hM = heightCm / 100;
  const bmi = weightKg / (hM * hM);

  const minNormal = 18.5 * hM * hM;
  const maxNormal = 24.9 * hM * hM;
  const ideal = (minNormal + maxNormal) / 2;

  const diff = weightKg - ideal;
  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obesity";

  return { bmi, minNormal, maxNormal, ideal, diff, category };
}

export default function SettingsPage() {
  const [goal, setGoal] = useState<GoalData>({
    heightCm: "",
    weightKg: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

    useEffect(() => {
        async function loadGoal() {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                // User not logged in - redirect to login
                router.push("/login");
                return;
            }

            const { data } = await supabase
            .from("user_settings")
            .select("*")
            .eq("id", user.id)
            .single();

            if (data) {
                setGoal({
                    heightCm: data.height_cm?.toString() || "",
                    weightKg: data.weight_kg?.toString() || ""
                });
            }
            
            setLoading(false);
        }
        loadGoal();
    }, [router]);

  const handleChange =
    (field: keyof GoalData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGoal((prev) => ({ ...prev, [field]: e.target.value }));
      setSaved(false);
    };

  const stats = useMemo(() => {
    const h = parseFloat(goal.heightCm);
    const w = parseFloat(goal.weightKg);
    if (!h || !w) return null;
    return calcBmiAndTarget(h, w);
  }, [goal.heightCm, goal.weightKg]);

  const handleSave = async () => {
    if (typeof window === "undefined") return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must login first");
      return;
    }

    const { data, error } = await supabase
    .from("user_settings")
    .upsert({
        id: user.id,
        height_cm: parseInt(goal.heightCm),
        weight_kg: parseFloat(goal.weightKg),
        updated_at: new Date().toISOString()
    });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setSaved(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16 px-3 pt-4">
      <section>
        <h1 className="text-2xl font-semibold">Settings & Goals</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
          Setup your body metrics to calculate BMI and recommended proportional weight.
        </p>
      </section>

      {/* Theme Settings */}
      <Card className="rounded-3xl p-5">
        <h2 className="text-sm font-semibold mb-3">Appearance</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm">Light Mode</span>
            <input
              type="radio"
              name="theme"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
              className="w-4 h-4 text-purple-600"
            />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm">Dark Mode</span>
            <input
              type="radio"
              name="theme"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
              className="w-4 h-4 text-purple-600"
            />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm">System Default</span>
            <input
              type="radio"
              name="theme"
              checked={theme === "system"}
              onChange={() => setTheme("system")}
              className="w-4 h-4 text-purple-600"
            />
          </label>
        </div>
      </Card>

      <Card className="rounded-3xl p-5">
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium">Height (cm)</label>
            <Input
              type="number"
              value={goal.heightCm}
              onChange={handleChange("heightCm")}
              placeholder="e.g. 170"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Current Weight (kg)</label>
            <Input
              type="number"
              value={goal.weightKg}
              onChange={handleChange("weightKg")}
              placeholder="e.g. 85"
            />
          </div>

          <Button
            className="mt-2 rounded-full bg-brandPurple text-white hover:bg-brandLavender"
            onClick={handleSave}
          >
            Save Goals
          </Button>

          {saved && (
            <p className="text-xs text-emerald-500 mt-1">
              Settings saved to this device.
            </p>
          )}
        </div>
      </Card>

      {/* BMI Result Card */}
      {stats && (
        <Card>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">BMI Result</h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              BMI = Berat badan (kg) ÷ Tinggi² (m)
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.18em]">
                  Your BMI
                </p>
                <p className="text-lg font-semibold">
                  {stats.bmi.toFixed(1)}{" "}
                  <span className="text-xs text-slate-500">
                    ({stats.category})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.18em]">
                  Normal Range
                </p>
                <p className="text-sm">
                  {stats.minNormal.toFixed(1)} – {stats.maxNormal.toFixed(1)} kg
                </p>
              </div>
            </div>

            <div className="mt-2 text-sm">
              <p className="text-[11px] text-slate-400 uppercase tracking-[0.18em]">
                Ideal Weight (mid)
              </p>
              <p className="font-semibold">
                {stats.ideal.toFixed(1)} kg
              </p>
            </div>

            <div className="mt-2 text-sm">
              {Math.abs(stats.diff) < 0.5 ? (
                <p className="text-emerald-500">
                  Your current weight is very close to ideal. Good job!
                </p>
              ) : stats.diff > 0 ? (
                <p className="text-orange-500">
                  You need to reduce approximately{" "}
                  <span className="font-semibold">
                    {stats.diff.toFixed(1)} kg
                  </span>{" "}
                  to reach your ideal proportional weight.
                </p>
              ) : (
                <p className="text-sky-500">
                  You need to gain approximately{" "}
                  <span className="font-semibold">
                    {Math.abs(stats.diff).toFixed(1)} kg
                  </span>{" "}
                  to reach your ideal proportional weight.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
            {/* Progress toward ideal weight */}
      {stats && (
        <Card>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Progress Toward Ideal Weight</h2>

            {/* Calculation */}
            {(() => {
              const current = parseFloat(goal.weightKg);
              const ideal = stats.ideal;
              const diff = Math.abs(current - ideal);
              const progress = Math.max(
                0,
                Math.min(100, (1 - diff / current) * 100)
              );

              return (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    You are <strong>{diff.toFixed(1)} kg</strong> away from your ideal weight.
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brandLavender to-brandPurple transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Percentage */}
                  <p className="text-sm font-semibold text-brandPurple">
                    {progress.toFixed(1)}% toward ideal weight
                  </p>

                  {/* Category messages */}
                  {progress > 90 ? (
                    <p className="text-emerald-500 text-xs">🔥 You're very close! Stay consistent!</p>
                  ) : progress > 60 ? (
                    <p className="text-brandPurple text-xs">Great progress — keep going!</p>
                  ) : progress > 30 ? (
                    <p className="text-orange-500 text-xs">You’re on your way. Keep pushing!</p>
                  ) : (
                    <p className="text-red-500 text-xs">Let’s begin the journey step-by-step 💪</p>
                  )}
                </>
              );
            })()}
          </div>
        </Card>
      )}
    </div>
  );
}