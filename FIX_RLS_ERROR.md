# 🔒 Fix RLS Policy Error

## Problem
Error saat end fasting:
```
new row violates row-level security policy for table "fasting_logs"
```

## Solution
Table `fasting_logs`, `water_logs`, dan `weight_logs` perlu RLS policies agar user bisa insert/update/delete data mereka sendiri.

## Quick Fix - Jalankan SQL ini di Supabase

### 1. Buka Supabase SQL Editor
- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
- Or: Dashboard → SQL Editor → New Query

### 2. Copy & Paste SQL dari file ini
```bash
# File sudah disiapkan:
supabase_fix_rls_logs.sql
```

### 3. Run Query
Klik **Run** atau tekan `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

### 4. Verify
Query terakhir akan menampilkan semua policies yang baru dibuat:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('fasting_logs', 'water_logs', 'weight_logs')
ORDER BY tablename, policyname;
```

Expected output:
- 4 policies untuk `fasting_logs` (SELECT, INSERT, UPDATE, DELETE)
- 4 policies untuk `water_logs` (SELECT, INSERT, UPDATE, DELETE)
- 4 policies untuk `weight_logs` (SELECT, INSERT, UPDATE, DELETE)

## What These Policies Do

### Fasting Logs
- ✅ User **can** view their own fasting logs
- ✅ User **can** create new fasting logs for themselves
- ✅ User **can** update their own fasting logs (e.g., add mood)
- ✅ User **can** delete their own fasting logs
- ❌ User **cannot** see other users' fasting logs

### Water Logs & Weight Logs
Same rules apply for water and weight tracking.

## Policy Logic
```sql
-- Example: Insert policy
CREATE POLICY "Users can insert own fasting logs"
  ON public.fasting_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

This means:
- `auth.uid()` = Currently logged in user ID
- `user_id` = Column in the table
- Policy: Only allow insert if `auth.uid()` matches `user_id`

## Testing After Fix

1. Restart your dev server (if running)
2. Login to your app
3. Start a fasting timer
4. End the fasting
5. Select a mood
6. Check browser console - should see:
   ```
   [INFO] Fasting log saved successfully { logId: "..." }
   [INFO] Mood saved successfully
   ```

## Files Updated
- ✅ `supabase_fix_rls_logs.sql` - Quick fix SQL (run this first!)
- ✅ `supabase_policies.sql` - Complete policies documentation
- ✅ `components/trackers/FastingTimer.tsx` - Already has logging to debug

## Troubleshooting

### Still getting RLS error after running SQL?
1. Check if tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('fasting_logs', 'water_logs', 'weight_logs');
   ```

2. Check if RLS is enabled:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('fasting_logs', 'water_logs', 'weight_logs');
   ```
   - `rowsecurity` should be `true`

3. Check if policies exist:
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('fasting_logs', 'water_logs', 'weight_logs');
   ```
   - Should see 12 policies total (4 per table)

### Other issues?
Check browser console logs - `FastingTimer.tsx` has comprehensive logging:
- `[INFO]` - Normal operations
- `[WARN]` - Warnings (e.g., no logId)
- `[ERROR]` - Errors with full details

## Related Files
- Schema: `sample_exercises.sql`
- Mood column: `add_mood_to_fasting_logs.sql`
- Storage: `supabase_storage_setup.sql`
