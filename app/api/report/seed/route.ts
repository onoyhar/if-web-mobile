import { createClient } from "@supabase/supabase-js";

// SERVER-SIDE (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const today = new Date();

    // Helper to format date
    const d = (offset: number) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - offset);
      return dt.toISOString();
    };

    // SAMPLE FASTING LOGS — last 7 days
    const fastingSamples = [
      { start: d(1), end_time: d(1), hours: 16 },
      { start: d(2), end_time: d(2), hours: 18 },
      { start: d(3), end_time: d(3), hours: 20 },
      { start: d(4), end_time: d(4), hours: 14 },
      { start: d(5), end_time: d(5), hours: 17 },
      { start: d(6), end_time: d(6), hours: 19 },
      { start: d(7), end_time: d(7), hours: 16 },
    ].map((x) => ({
      start: x.start,
      end_time: x.end_time,
      target_hours: x.hours,
      status: "completed",
      user_id: null,
    }));

    // SAMPLE WATER LOGS
    const waterSamples = Array.from({ length: 7 }).map((_, i) => ({
      date: d(i),
      amount: 1500 + Math.floor(Math.random() * 1000),
      user_id: null,
    }));

    // SAMPLE WEIGHT LOGS
    const weightSamples = [
      { date: d(7), weight: 89.5 },
      { date: d(6), weight: 89.0 },
      { date: d(5), weight: 88.8 },
      { date: d(4), weight: 88.3 },
      { date: d(3), weight: 87.9 },
      { date: d(2), weight: 87.5 },
      { date: d(1), weight: 87.2 },
    ].map((x) => ({
      date: x.date,
      weight: x.weight,
      user_id: null,
    }));

    // Insert sample data
    await supabaseAdmin.from("fasting_logs").insert(fastingSamples);
    await supabaseAdmin.from("water_logs").insert(waterSamples);
    await supabaseAdmin.from("weight_logs").insert(weightSamples);

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message });
  }
}