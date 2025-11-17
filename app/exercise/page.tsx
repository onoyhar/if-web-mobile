"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function ExercisePage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Check auth first
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Exercise page - User:', user?.email || 'None');
        setAuthChecking(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function load() {
      if (authChecking) return; // Wait for auth check first
      
      try {
        const { data, error } = await supabase.from("exercise_library").select("*");
        
        if (error) {
          console.error("Error loading exercises:", error);
        }
        
        setList(data || []);
      } catch (error) {
        console.error("Exception loading exercises:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authChecking]);

  const addSampleExercises = async () => {
    const samples = [
      {
        title: "10 Min Full Body Workout - No Equipment",
        thumbnail_url: "https://img.youtube.com/vi/ml6cT4AZdqI/maxresdefault.jpg",
        video_url: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
      },
      {
        title: "20 Min HIIT Cardio Workout",
        thumbnail_url: "https://img.youtube.com/vi/-hSma-BRzoo/maxresdefault.jpg",
        video_url: "https://www.youtube.com/watch?v=-hSma-BRzoo",
      },
      {
        title: "15 Min Abs Workout",
        thumbnail_url: "https://img.youtube.com/vi/1919eTCoESo/maxresdefault.jpg",
        video_url: "https://www.youtube.com/watch?v=1919eTCoESo",
      },
    ];

    const { data, error } = await supabase
      .from("exercise_library")
      .insert(samples)
      .select();

    if (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } else {
      alert(`${data.length} sample exercises added!`);
      setList([...list, ...data]);
    }
  };

  return (
    <div className="space-y-3 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Exercise Library</h1>
        {list.length === 0 && !loading && (
          <button
            onClick={addSampleExercises}
            className="text-xs bg-purple-500 text-white px-3 py-1 rounded-md"
          >
            Add Samples
          </button>
        )}
      </div>

      {(loading || authChecking) ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : list.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 mb-3">No exercises found.</p>
          <button
            onClick={addSampleExercises}
            className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm"
          >
            Add Sample Exercises
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {list.map((ex) => (
            <Link key={ex.id} href={`/exercise/${ex.id}`}>
              <Card>
                <div className="flex items-center gap-3 hover:bg-brandLightPurple/40 transition-colors p-2">
                  {ex.thumbnail_url && (
                    <img
                      src={ex.thumbnail_url}
                      className="h-20 w-32 rounded-md object-cover flex-shrink-0"
                      alt="thumbnail"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{ex.title}</h3>
                  </div>
                </div>
              </Card>
              <div className="my-2">
                <hr />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}