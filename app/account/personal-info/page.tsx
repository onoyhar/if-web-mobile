"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function PersonalInfoPage() {
  const { showToast } = useToast();  // ⬅️ penting! harus di sini
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

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
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    setUser(auth.user);

    const { data, error } = await supabase
      .from("users_profile")
      .select("*")
      .eq("id", auth.user.id)
      .single();

    if (error) {
      showToast("Failed to load profile!", "error");
      return;
    }

    if (data) {
      setProfile({
        name: data.name || "",
        email: auth.user.email,
        age: data.age || "",
        photo_url: data.photo_url || "",
        height: data.height || "",
        weight: data.weight || "",
        gender: data.gender || "",
      });
    }
  }

  async function save() {
    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      showToast("You must login first", "error");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("users_profile")
      .upsert({
        id: auth.user.id,
        ...profile,
        email: auth.user.email,
      });

    setSaving(false);

    if (error) {
      showToast("Failed to update profile!", "error");
      return;
    }

    showToast("Profile updated!", "success");
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-20">

      {/* Header */}
      <div className="flex items-center gap-3 pt-6 mb-4">
        <Link href="/account">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Personal Info</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="relative">
          <img
            src={profile.photo_url || "/default-avatar.png"}
            className="h-24 w-24 rounded-full object-cover border shadow"
          />
          <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow active:scale-95">
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Form */}
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

        <div className="space-y-1">
        <p className="text-sm text-slate-600 dark:text-slate-300">Gender</p>
        <select
            value={profile.gender}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
        >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not">Prefer not to say</option>
        </select>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="mt-8 w-full py-3 bg-purple-600 text-white rounded-xl font-semibold shadow active:scale-95 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
      <input
        {...props}
        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
      />
    </div>
  );
}