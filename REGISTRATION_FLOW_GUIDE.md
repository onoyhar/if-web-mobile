# Registration Flow Implementation

## Overview
Implementasi lengkap untuk flow registrasi user baru dengan welcome modal dan profile completion.

## Flow Diagram

```
1. User Register (Sign Up)
   ↓
2. Account Created & Auto Login
   ↓
3. Redirect to Home (/?newUser=true)
   ↓
4. Welcome Modal Muncul
   ↓
5. User Klik "Complete Profile"
   ↓
6. Redirect ke /account/personal-info
   ↓
7. User Lengkapi Data:
   - Name
   - Age
   - Photo (Upload to Supabase Storage)
   - Height
   - Weight
   - Gender
   ↓
8. Save to Supabase
   ↓
9. Done! Profile Completed
```

## Features Implemented

### 1. **Auto Profile Creation**
- Trigger database otomatis membuat `users_profile` dan `user_settings` saat user register
- Tidak perlu manual insert profile

### 2. **Welcome Modal**
- Muncul otomatis setelah registrasi berhasil
- Design modern dengan gradient icon
- 2 pilihan: "Skip for Now" atau "Complete Profile"
- Animation: fadeIn + slideUp

### 3. **Photo Upload**
- Upload ke Supabase Storage bucket `profiles`
- Support validation:
  - Max file size: 5MB
  - File type: image only
  - Auto resize/optimize (optional)
- Display avatar:
  - Show uploaded photo
  - Fallback ke initial name (gradient background)
- Loading state saat upload

### 4. **Profile Form**
- Fields:
  - Full Name (text)
  - Email (disabled, from auth)
  - Age (number)
  - Photo (upload)
  - Height in cm (number)
  - Weight in kg (number)
  - Gender (select)
- Real-time validation
- Toast notifications for success/error

## Files Modified

### 1. `/app/login/page.tsx`
**Changes:**
- Updated `handleSubmit` untuk signup
- Setelah signup berhasil, redirect ke `/?newUser=true`
- Tidak lagi manual insert profile (trigger auto handle)

### 2. `/app/page.tsx` (Home)
**Changes:**
- Import `WelcomeModal`, `useSearchParams`, `supabase`
- Check `?newUser=true` query param
- Check jika profile incomplete (no name)
- Show `WelcomeModal` jika user baru dan profile kosong

### 3. `/app/account/personal-info/page.tsx`
**Changes:**
- Added photo upload functionality
- Added `useRef` untuk file input
- Added `uploadPhoto()` function
- Added `handleFileChange()` with validation
- Updated avatar section dengan upload button
- Loading state untuk upload
- Better error handling

### 4. `/components/WelcomeModal.tsx` (NEW)
**Features:**
- Modern gradient design
- Animated trophy icon
- Call to action message
- 2 buttons: Skip / Complete Profile
- Auto redirect ke personal-info page

## Database Setup Required

### 1. Storage Bucket for Photos

Run SQL file: `setup_storage_bucket.sql`

```sql
-- Creates 'profiles' bucket
-- Sets up RLS policies
-- Allows public read, authenticated upload
```

Or manually:
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `profiles`
3. Set as Public bucket
4. Policies akan otomatis dibuat via SQL

### 2. Verify Trigger Exists

Make sure you've run `supabase_auto_profile.sql`:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
...
```

This trigger creates profile + settings automatically on signup.

## Testing Steps

### Test Registration Flow:

1. **Logout** (jika sudah login)
   ```
   Go to /login → Click Logout
   ```

2. **Sign Up**
   ```
   - Go to /login
   - Toggle to "Sign Up"
   - Email: newuser@test.com
   - Password: Test123456
   - Click "Sign Up"
   ```

3. **Verify Welcome Modal**
   ```
   - Should redirect to /?newUser=true
   - Welcome modal should appear
   - Shows "Welcome!" message
   ```

4. **Complete Profile**
   ```
   - Click "Complete Profile" button
   - Redirects to /account/personal-info
   ```

5. **Upload Photo**
   ```
   - Click camera icon
   - Select image file (< 5MB)
   - Wait for upload
   - Should show uploaded photo
   ```

6. **Fill Profile**
   ```
   - Name: Test User
   - Age: 25
   - Height: 170
   - Weight: 70
   - Gender: Male/Female
   - Click "Save Changes"
   ```

7. **Verify in Supabase**
   ```
   - Dashboard → Table Editor → users_profile
   - Should see new row with:
     - id (UUID)
     - name
     - age
     - photo_url (storage URL)
     - email
   ```

### Test Photo Upload:

1. Valid image (PNG/JPG) < 5MB → ✅ Success
2. File > 5MB → ❌ Error: "File size must be less than 5MB"
3. Non-image file (PDF/TXT) → ❌ Error: "File must be an image"
4. No file selected → Nothing happens

### Test Welcome Modal:

1. New user without name → Modal shows
2. New user with name → Modal skipped
3. Returning user → Modal doesn't show
4. Click "Skip for Now" → Modal closes, stay on home
5. Click "Complete Profile" → Redirect to /account/personal-info

## Environment Variables

Make sure these are set in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

### Issue: Welcome Modal Not Showing

**Possible causes:**
1. User already has name in profile
2. Query param `?newUser=true` not present
3. Not logged in

**Solution:**
- Check if user has `name` field set in `users_profile`
- Manually add `?newUser=true` to URL
- Make sure signup redirects correctly

### Issue: Photo Upload Failed

**Possible causes:**
1. Storage bucket doesn't exist
2. RLS policies not configured
3. File size/type validation failed

**Solution:**
1. Run `setup_storage_bucket.sql`
2. Check Supabase Dashboard → Storage → profiles bucket exists
3. Verify bucket is set to Public
4. Check browser console for errors

### Issue: Profile Not Saving

**Possible causes:**
1. RLS policies blocking insert/update
2. User not authenticated
3. Missing required fields

**Solution:**
1. Check `supabase_policies.sql` is run
2. Verify user is logged in: `await supabase.auth.getUser()`
3. Check console for Supabase errors

## UI/UX Details

### Welcome Modal
- **Position**: Center screen
- **Background**: Black overlay (60% opacity)
- **Animation**: slideUp from bottom
- **Icon**: Gradient circle with 🎉 emoji + bounce
- **Colors**: Purple/Pink gradient buttons
- **Responsive**: Mobile-first design

### Photo Upload
- **Avatar Size**: 96px (24 in Tailwind)
- **Default Avatar**: Gradient circle with first letter of name
- **Upload Button**: Purple circle at bottom-right
- **Loading**: Spinning border animation
- **Success**: Toast notification
- **Error**: Toast with error message

### Profile Form
- **Field Style**: Rounded-xl, slate background
- **Spacing**: 16px between fields
- **Button**: Full width, gradient, shadow
- **Validation**: Real-time (max 5MB, image only)
- **Toast Duration**: 2.5 seconds

## Future Enhancements

### Optional Improvements:
- [ ] Image cropping before upload
- [ ] Multiple photo uploads (gallery)
- [ ] Social login (Google, Facebook)
- [ ] Email verification flow
- [ ] Profile completion progress bar
- [ ] Avatar selection from predefined images
- [ ] Photo compression before upload
- [ ] Drag & drop file upload
- [ ] Profile preview before save

## Support

Jika ada masalah:
1. Check Supabase Dashboard → Logs
2. Check browser console for errors
3. Verify all SQL scripts have been run
4. Make sure `.env` variables are correct
5. Test with different browsers

---

## Quick Setup Checklist

- [ ] Run `supabase_auto_profile.sql` (trigger)
- [ ] Run `setup_storage_bucket.sql` (storage)
- [ ] Run `supabase_policies.sql` (RLS policies)
- [ ] Verify `.env` has NEXT_PUBLIC_ prefix
- [ ] Test signup flow
- [ ] Test photo upload
- [ ] Test profile save
- [ ] Verify data in Supabase dashboard

✅ **Done!** Registration flow is ready!
