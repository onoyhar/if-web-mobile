import { createClient } from "@supabase/supabase-js";

// Service role key (server-only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,   // IMPORTANT
);

export async function GET() {
  const samples = [
    {
      title: "What is Intermittent Fasting?",
      description: "A simple guide to understanding fasting windows.",
      category: "tips",
      thumbnail_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
      content: "Intermittent fasting (IF) is an eating pattern...",
    },
    {
      title: "Healthy Chicken Bowl Recipe",
      description: "Perfect for eating window meals.",
      category: "recipe",
      thumbnail_url: "https://images.unsplash.com/photo-1551218808-94e220e084d2",
      content: "Try this chicken bowl with quinoa...",
    },
  ];

  const { data, error } = await supabaseAdmin
    .from("explore_content")
    .insert(samples);

  return Response.json({ success: true, data, error });
}