import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin().auth.admin.createUser({
    email: "admin@if-app.com",
    password: "Admin123!",
    email_confirm: true,
    user_metadata: {
      role: "admin"
    }
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true, user: data.user });
}