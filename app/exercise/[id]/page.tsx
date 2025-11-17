"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/card";

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string {
  // If already an embed URL, return as is
  if (url.includes('/embed/')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    let videoId = "";
    
    // Extract video ID from different YouTube URL formats
    if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v") || "";
    } else if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.slice(1);
    }
    
    if (!videoId) {
      console.error("Could not extract video ID from URL:", url);
      return url;
    }
    
    // Return embed URL in the correct format
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    return url;
  }
}

export default function ExerciseVideo() {
  const params = useParams();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExercise() {
      const { data, error } = await supabase
        .from("exercise_library")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (error) {
        console.error("Error loading exercise:", error);
      }
      
      if (data) {
        console.log("Exercise data:", data);
        console.log("Video URL:", data.video_url);
        console.log("Embed URL:", getYouTubeEmbedUrl(data.video_url));
      }
      
      setExercise(data);
      setLoading(false);
    }
    
    if (params.id) {
      loadExercise();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500">Exercise not found</p>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(exercise.video_url);

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-xl font-semibold">{exercise.title}</h1>

      {/* YouTube Video Player */}
      <div className="w-full rounded-lg overflow-hidden">
        <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            title={exercise.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      {/* Video Info */}
      <Card>
        <div className="text-xs text-slate-400 mb-2">Video URL:</div>
        <a 
          href={exercise.video_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-purple-500 hover:underline break-all"
        >
          {exercise.video_url}
        </a>
      </Card>

      {exercise.description && (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {exercise.description}
          </p>
        </Card>
      )}

      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          🔥 Enjoy your workout! 
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Follow along with the video and maintain proper form for best results.
        </p>
      </Card>
    </div>
  );
}