# Supabase Database Setup Guide

## Overview
This guide will help you set up the database schema for the Intermittent Fasting app.

## Step 1: Create Tables

Run these SQL commands in your Supabase SQL Editor (Dashboard > SQL Editor > New Query):

### 1.1 Users Profile Table

```sql
-- Create users_profile table
CREATE TABLE IF NOT EXISTS public.users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  age INTEGER,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view/edit their own profile
CREATE POLICY "Users can view own profile"
  ON public.users_profile
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users_profile
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users_profile
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 1.2 User Settings Table

```sql
-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view/edit their own settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 1.3 Fasting Logs Table

```sql
-- Create fasting_logs table
CREATE TABLE IF NOT EXISTS public.fasting_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  target_hours INTEGER NOT NULL,
  status TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_fasting_logs_user_id ON public.fasting_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fasting_logs_start ON public.fasting_logs(start);

-- Enable Row Level Security
ALTER TABLE public.fasting_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own fasting logs"
  ON public.fasting_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fasting logs"
  ON public.fasting_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fasting logs"
  ON public.fasting_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fasting logs"
  ON public.fasting_logs
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 1.4 Exercise Library Table

```sql
-- Create exercise_library table
CREATE TABLE IF NOT EXISTS public.exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can view exercises
CREATE POLICY "Anyone can view exercises"
  ON public.exercise_library
  FOR SELECT
  USING (true);
```

## Step 2: Set Up Auto Profile Creation

This trigger automatically creates profile and settings when a user signs up:

```sql
-- Function to automatically create profile and settings when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile entry
  INSERT INTO public.users_profile (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  
  -- Create settings entry
  INSERT INTO public.user_settings (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 3: Add Mood Column (New Feature)

This adds mood tracking to fasting logs:

```sql
-- Add mood column to fasting_logs table (if not already added)
ALTER TABLE public.fasting_logs 
ADD COLUMN IF NOT EXISTS mood TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.fasting_logs.mood IS 'User mood after completing fast: great, good, okay, not-good, bad, or skip';
```

## Step 4: Create Test User (Optional)

### Option A: Via Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. Click **"Add User"** > **"Create new user"**
3. Fill in:
   - Email: `test@example.com`
   - Password: `Test123456`
   - ✅ **Auto Confirm User** (check this box!)
4. Click **"Create User"**
5. The trigger will automatically create profile and settings

### Option B: Via Sign Up Page

1. Open your app at `/login`
2. Sign up with email and password
3. Profile and settings will be created automatically

## Step 5: Verify Setup

Run this query to check if everything is set up correctly:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users_profile', 'user_settings', 'fasting_logs', 'exercise_library')
ORDER BY table_name;

-- Check if trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users_profile', 'user_settings', 'fasting_logs', 'exercise_library');
```

## Troubleshooting

### Error: Foreign Key Constraint Violation

**Problem:** `insert or update on table "users_profile" violates foreign key constraint "users_profile_id_fkey"`

**Solution:** You must create the user in `auth.users` table first. Use Option A or B in Step 4 above.

### Error: Row Level Security Policy Violation

**Problem:** User can't access their own data

**Solution:** Make sure you're logged in and the policies are created correctly. Check with:

```sql
SELECT * FROM pg_policies WHERE tablename IN ('users_profile', 'user_settings', 'fasting_logs');
```

### Trigger Not Working

**Problem:** Profile/settings not created automatically

**Solution:** 
1. Verify trigger exists (see Step 5)
2. Make sure user email is confirmed
3. Check Supabase logs for errors

## Quick Setup Script

Run this entire script to set up everything at once:

```sql
-- ============================================
-- COMPLETE SETUP SCRIPT
-- ============================================

-- 1. Create tables
-- (Run all CREATE TABLE commands from Step 1)

-- 2. Enable RLS
-- (Run all ALTER TABLE ... ENABLE ROW LEVEL SECURITY)

-- 3. Create policies
-- (Run all CREATE POLICY commands)

-- 4. Create trigger
-- (Run trigger creation from Step 2)

-- 5. Add mood column
ALTER TABLE public.fasting_logs 
ADD COLUMN IF NOT EXISTS mood TEXT;

-- 6. Verify
SELECT 'Setup complete!' as status;
```

## Next Steps

After database setup:

1. ✅ Update `.env` file with Supabase credentials
2. ✅ Create a test user
3. ✅ Start the development server: `npm run dev`
4. ✅ Test the fasting timer with end flow
5. ✅ Check Supabase dashboard to see saved data

## Support

If you encounter issues:
- Check Supabase Dashboard > **Logs** for errors
- Verify environment variables in `.env`
- Make sure you're using `NEXT_PUBLIC_` prefix for client-side vars
