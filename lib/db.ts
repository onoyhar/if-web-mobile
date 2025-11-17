import { supabase } from "./supabase";
import type { UserProfile, UserSettings } from "./types";

// User Profile operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users_profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
  const { error } = await supabase
    .from("users_profile")
    .upsert({
      ...profile,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Error upserting user profile:", error);
    return false;
  }

  return true;
}

// User Settings operations
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }

  return data;
}

export async function upsertUserSettings(settings: Partial<UserSettings> & { id: string }): Promise<boolean> {
  const { error } = await supabase
    .from("user_settings")
    .upsert({
      ...settings,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Error upserting user settings:", error);
    return false;
  }

  return true;
}

// Auth helper
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Error getting current user:", error);
    return null;
  }

  return user;
}

// Exercise Library operations
export async function getExercises() {
  const { data, error } = await supabase
    .from("exercise_library")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }

  return data;
}

export async function getExerciseById(id: string) {
  const { data, error } = await supabase
    .from("exercise_library")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching exercise:", error);
    return null;
  }

  return data;
}
