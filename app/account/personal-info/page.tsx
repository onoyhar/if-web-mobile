"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

// SHADCN SELECT
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function PersonalInfoPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState<any>({
    name: "",
    email: "",
    age: "",
    photo_url: "",
    height: "",
    weight: "",
    gender: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    logger.group("Load Profile");

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    setUser(auth.user);

    const { data } = await supabase
      .from("users_profile")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();

    setProfile({
      name: data?.name || "",
      email: auth.user.email,
      age: data?.age || "",
      photo_url: data?.photo_url || "",
      height: data?.height || "",
      weight: data?.weight || "",
      gender: data?.gender || "",
    });

    logger.groupEnd();
  }

  async function uploadPhoto(file: File) {
    if (!user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      setProfile((prev: any) => ({
        ...prev,
        photo_url: urlData.publicUrl,
      }));

      showToast("Photo updated!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  }

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024)
      return showToast("Max size 5MB", "error");

    uploadPhoto(file);
  };

  async function save() {
    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const payload = {
      id: auth.user.id,
      name: profile.name,
      age: profile.age ? Number(profile.age) : null,
      height: profile.height ? Number(profile.height) : null,
      weight: profile.weight ? Number(profile.weight) : null,
      gender: profile.gender,
      photo_url: profile.photo_url,
      email: auth.user.email,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("users_profile")
      .upsert(payload);

    setSaving(false);

    if (error) return showToast("Failed to update profile!", "error");

    showToast("Profile updated!", "success");
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-20">

      {/* HEADER */}
      <div className="flex items-center gap-3 pt-6 mb-6">
        <Link href="/account">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Personal Info</h1>
      </div>

      {/* AVATAR */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="relative">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {profile.name ? profile.name[0] : "?"}
            </div>
          )}

          {/* hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg active:scale-95 transition disabled:opacity-50"
          >
            {uploading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="space-y-4">

        <Input
          label="Full Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />

        <Input label="Email" disabled value={profile.email} />

        <Input
          label="Age"
          type="number"
          value={profile.age}
          onChange={(e) => setProfile({ ...profile, age: e.target.value })}
        />

        <Input
          label="Height (cm)"
          type="number"
          value={profile.height}
          onChange={(e) => setProfile({ ...profile, height: e.target.value })}
        />

        <Input
          label="Weight (kg)"
          type="number"
          value={profile.weight}
          onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
        />

        {/* SEX (CUSTOM SELECT) */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Sex
          </p>

          <Select
            value={profile.gender}
            onValueChange={(v) => setProfile({ ...profile, gender: v })}
          >
            <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-purple-500">
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>

            <SelectContent className="rounded-xl shadow-md">
              <SelectItem value="male">♂️ Male</SelectItem>
              <SelectItem value="female">♀️ Female</SelectItem>
              <SelectItem value="prefer_not">🔒 Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={save}
        disabled={saving}
        className="mt-8 w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-semibold shadow-lg active:scale-95 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

/* -------- INPUT COMPONENT -------- */

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </p>
      <input
        {...props}
        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800
                   border border-slate-200 dark:border-slate-700
                   focus:ring-2 focus:ring-purple-500 outline-none"
      />
    </div>
  );
}