"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/card";

export default function ExploreDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("explore_content")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading explore detail:", error);
      }
      setItem(data);
    }
    if (id) load();
  }, [id]);

  if (!item) {
    return <p className="p-4 text-sm text-slate-500">Loading...</p>;
  }

  const embedUrl =
    item.video_url &&
    item.video_url.includes("watch?v=")
      ? item.video_url.replace("watch?v=", "embed/")
      : item.video_url;

  return (
    <div className="max-w-md mx-auto px-4 pb-20 space-y-4">
      {item.thumbnail_url && (
        <img
          src={item.thumbnail_url}
          className="w-full h-52 object-cover rounded-3xl"
          alt={item.title}
        />
      )}

      <div className="space-y-2">
        <span className="text-[10px] uppercase font-semibold text-brandPurple">
          {item.category}
        </span>
        <h1 className="text-2xl font-bold">{item.title}</h1>
      </div>

      {embedUrl && (
        <div className="mt-2 rounded-2xl overflow-hidden">
          <iframe
            className="w-full aspect-video"
            src={embedUrl}
            allowFullScreen
          />
        </div>
      )}

      {item.content && (
        <Card className="p-4 text-sm leading-relaxed">
          {item.content}
        </Card>
      )}
    </div>
  );
}