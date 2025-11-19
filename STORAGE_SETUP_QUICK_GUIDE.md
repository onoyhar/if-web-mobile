# Quick Storage Setup - Supabase Dashboard

## Error: "must be owner of table objects"

Jika Anda mendapat error ini saat menjalankan SQL script, gunakan **Dashboard method** sebagai gantinya.

## Setup Storage Bucket via Dashboard (5 menit)

### Step 1: Buat Bucket
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Di sidebar kiri, klik **Storage**
4. Klik tombol **"New bucket"** atau **"Create a new bucket"**

### Step 2: Configure Bucket
Fill in the form:
- **Name**: `profiles`
- **Public bucket**: ✅ **TOGGLE ON** (penting!)
- **File size limit**: `5 MB` (optional)
- **Allowed MIME types**: `image/jpeg, image/png, image/jpg, image/webp` (optional)

### Step 3: Create
- Klik **"Create bucket"**
- Done! ✅

## Verify Setup

### Check Bucket Exists
1. Di Storage page, Anda harus lihat bucket `profiles`
2. Status: Public (ada badge hijau/icon public)

### Test Upload
1. Klik bucket `profiles`
2. Klik **"Upload file"**
3. Upload test image
4. Jika sukses, bucket sudah siap! ✅

## Policies (Automatic)

Ketika Anda membuat **public bucket** via Dashboard, Supabase otomatis membuat policies:

✅ **Public Read**: Anyone can view files  
✅ **Authenticated Write**: Logged-in users can upload  
✅ **Authenticated Update**: Logged-in users can update  
✅ **Authenticated Delete**: Logged-in users can delete  

**Anda tidak perlu manual buat policies!**

## Common Issues

### Issue: "Bucket already exists"
**Solution**: Bucket sudah dibuat sebelumnya. Anda tidak perlu create lagi.

### Issue: "Upload failed - policy violation"
**Solution**: 
1. Pastikan bucket is **Public** (check settings)
2. Pastikan user is **logged in** (authenticated)
3. Check user has valid auth token

### Issue: Can't see uploaded image
**Solution**:
1. Check if file uploaded successfully (refresh Storage page)
2. Get public URL: Click file → Copy URL
3. Use that URL in `photo_url` field

## Testing Storage

### Test 1: Upload via Dashboard
1. Go to Storage → profiles bucket
2. Click "Upload file"
3. Select an image
4. Should upload successfully ✅

### Test 2: Get Public URL
1. Click on uploaded file
2. Click "Copy URL" button
3. Paste URL in browser
4. Image should display ✅

### Test 3: Upload via App
1. Go to `/account/personal-info`
2. Click camera icon
3. Select image file
4. Wait for upload
5. Image should appear in avatar ✅
6. Check Supabase Storage → profiles → avatars/
7. File should be there ✅

## File Structure

Uploaded photos will be stored as:
```
profiles/
  └── avatars/
      ├── user-id-1-timestamp.jpg
      ├── user-id-2-timestamp.png
      └── user-id-3-timestamp.webp
```

## Environment Variables

Make sure your `.env` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Quick Checklist

- [ ] Storage bucket `profiles` created
- [ ] Bucket is set to **Public**
- [ ] Test upload via Dashboard works
- [ ] Can copy public URL of uploaded file
- [ ] Environment variables set correctly
- [ ] App can upload photos successfully

## Need Help?

If you still get errors:
1. Check Supabase Logs (Dashboard → Logs)
2. Check browser console for errors
3. Verify you're logged in when uploading
4. Try upload via Dashboard first to confirm bucket works

---

✅ **Storage setup complete!** Sekarang app Anda bisa upload foto profil.
