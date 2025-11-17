import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SyncPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SyncPayload;

  if (!supabase) {
    // if Supabase not configured, just accept and do nothing
    return NextResponse.json({ ok: true, message: "Supabase not configured" });
  }

  try {
    const { fastingLogs, waterLogs, weightLogs } = body;

    if (fastingLogs?.length) {
      await supabase.from("fasting_logs").upsert(
        fastingLogs.map((f) => ({
          id: f.id,
          start: f.start,
          end: f.end,
          status: f.status,
          target_hours: f.targetHours
        }))
      );
    }

    if (waterLogs?.length) {
      await supabase.from("water_logs").upsert(
        waterLogs.map((w) => ({
          id: w.id,
          date: w.date,
          ml: w.ml
        }))
      );
    }

    if (weightLogs?.length) {
      await supabase.from("weight_logs").upsert(
        weightLogs.map((w) => ({
          id: w.id,
          date: w.date,
          weight: w.weight
        }))
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "sync_failed" },
      { status: 500 }
    );
  }
}