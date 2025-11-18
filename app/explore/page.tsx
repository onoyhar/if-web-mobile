"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/card";

export default function ExplorePage() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("explore_content")
        .select("*")
        .order("created_at", { ascending: false });

      setContent(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 pb-24 space-y-6">

      {/* Title */}
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
        <p className="text-sm text-slate-500 mt-1">
          Articles · Tips · Recipes · Workouts · Motivation
        </p>
      </div>

      {/* Loading */}
      {loading && <p className="text-slate-500 text-sm">Loading...</p>}

      {/* Empty */}
      {!loading && content.length === 0 && (
        <p className="text-slate-500 text-sm">No explore content yet.</p>
      )}

      {/* Content List */}
      <div className="space-y-6">
        {content.map((item) => (
          <Link key={item.id} href={`/explore/${item.id}`}>
            <div className="
              rounded-3xl overflow-hidden shadow-lg shadow-black/5
              bg-white dark:bg-slate-900 
              active:scale-[.98] transition
              mb-4
            ">
              
              {/* Thumbnail */}
              {item.thumbnail_url && (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-44 object-cover"
                />
              )}

              {/* Inner Content */}
              <div className="p-5 space-y-2">

                {/* Category */}
                <span className="
                  text-[10px] px-3 py-1 rounded-full bg-purple-100 
                  text-brandPurple font-semibold uppercase tracking-wider
                ">
                  {item.category}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold leading-tight">
                  {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}