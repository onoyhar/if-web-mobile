import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subscription, userId } = body;

  if (!subscription) {
    return NextResponse.json(
      { ok: false, error: "missing_subscription" },
      { status: 400 }
    );
  }

  if (!supabase) {
    console.log("Received push subscription", subscription);
    return NextResponse.json({ ok: true, message: "Saved locally/log only" });
  }

  try {
    await supabase.from("push_subscriptions").upsert({
      user_id: userId ?? null,
      subscription
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "db_error" },
      { status: 500 }
    );
  }
}