"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Card from "@/components/ui/card";

export default function ReportPage() {
  const [fasting, setFasting] = useState<any[]>([]);
  const [water, setWater] = useState<any[]>([]);
  const [weight, setWeight] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    await Promise.all([loadFasting(), loadWater(), loadWeight()]);
    setLoading(false);
  }

  /* ---------------- FASTING ---------------- */
  async function loadFasting() {
    try {
      const { data } = await supabase
        .from("fasting_logs")
        .select("*")
        .order("start", { ascending: true })
        .limit(30);

      const formatted = (data || [])
        .filter((log) => log.end && log.status === "completed")
        .map((log) => ({
          date: new Date(log.start).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          hours: Number(
            (
              (new Date(log.end).getTime() - new Date(log.start).getTime()) /
              1000 /
              3600
            ).toFixed(1)
          ),
        }));

      setFasting(formatted);
    } catch (error) {
      console.error("Error loading fasting:", error);
    }
  }

  /* ---------------- WATER ---------------- */
  async function loadWater() {
    try {
      const { data } = await supabase
        .from("water_logs")
        .select("*")
        .order("date", { ascending: true })
        .limit(30);

      const totals: Record<string, number> = {};

      (data || []).forEach((log) => {
        const d = log.date.slice(0, 10);
        totals[d] = (totals[d] || 0) + log.ml;
      });

      const result = Object.entries(totals)
        .map(([date, ml]) => ({
          date: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          ml,
        }))
        .slice(-14); // Last 14 days

      setWater(result);
    } catch (error) {
      console.error("Error loading water:", error);
    }
  }

  /* ---------------- WEIGHT ---------------- */
  async function loadWeight() {
    try {
      const { data } = await supabase
        .from("weight_logs")
        .select("*")
        .order("date", { ascending: true })
        .limit(30);

      const formatted = (data || []).map((w) => ({
        date: new Date(w.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        kg: w.weight,
      }));

      setWeight(formatted);
    } catch (error) {
      console.error("Error loading weight:", error);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 space-y-8">
      {/* HEADER */}
      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brandPurple to-brandLavender bg-clip-text text-transparent">
          Health Report
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Track your progress with detailed insights
        </p>
      </div>

      {/* FASTING REPORT */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brandPurple">
            Fasting History
          </h2>
          <span className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full">
            Last 30 days
          </span>
        </div>

        {fasting.length > 0 ? (
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fasting} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  tickLine={false}
                  label={{ value: "Hours", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: "none", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                  }}
                />
                <Bar dataKey="hours" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <p>No fasting data available</p>
          </div>
        )}
      </Card>

      {/* WATER REPORT */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-600">
            Water Intake
          </h2>
          <span className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full">
            Last 14 days
          </span>
        </div>

        {water.length > 0 ? (
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={water} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  tickLine={false}
                  label={{ value: "ml", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: "none", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                  }}
                />
                <Bar dataKey="ml" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <p>No water intake data available</p>
          </div>
        )}
      </Card>

      {/* WEIGHT REPORT */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-red-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-red-600">
            Weight Trend
          </h2>
          <span className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full">
            Last 30 days
          </span>
        </div>

        {weight.length > 0 ? (
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weight} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  tickLine={false}
                  label={{ value: "kg", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: "none", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <p>No weight data available</p>
          </div>
        )}
      </Card>
    </div>
  );
}