"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    photoUrl: ""
  });

  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user + profile
  useEffect(() => {
    async function loadProfile() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        // User not logged in - redirect to login
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          name: data.name || "",
          email: data.email || user.email || "",
          age: data.age?.toString() || "",
          photoUrl: data.photo_url || ""
        });
      } else {
        // email minimal autofill
        setProfile((prev) => ({
          ...prev,
          email: user.email || ""
        }));
      }
      
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  // Save profile
  const handleSave = async () => {
    if (!userId) {
      alert("You must login first");
      return;
    }

    const { data, error } = await supabase
      .from("users_profile")
      .upsert({
        id: userId,
        name: profile.name,
        email: profile.email,
        age: profile.age ? Number(profile.age) : null,
        photo_url: profile.photoUrl,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setSaved(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <Card>
        <div className="space-y-3">
          {/* Preview Photo */}
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-brandLightPurple/50 flex items-center justify-center text-xl font-semibold">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} className="h-full w-full object-cover" />
              ) : (
                (profile.name[0] || "U").toUpperCase()
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label>Name</label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label>Email</label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label>Age</label>
            <Input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label>Photo URL</label>
            <Input
              value={profile.photoUrl}
              onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })}
            />
          </div>

          <Button
            className="rounded-full bg-brandPurple text-white"
            onClick={handleSave}
          >
            Save Profile
          </Button>

          {saved && <p className="text-xs text-emerald-500">Saved!</p>}
        </div>
      </Card>
    </div>
  );
}