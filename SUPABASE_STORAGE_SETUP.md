# Supabase Storage Setup for Image Uploads

## Overview
The admin panel now supports image uploads for products. Images are stored in Supabase Storage.

## Setup Instructions

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `products`
   - **Public bucket**: ✅ Yes (so images can be accessed via public URLs)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*` (or specific types like `image/jpeg,image/png,image/webp`)

### 2. Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

#### Policy 1: Allow Public Read Access
```sql
-- Allow anyone to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');
```

#### Policy 2: Allow Authenticated Admins to Upload
```sql
-- Allow admins to upload images
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);
```

#### Policy 3: Allow Authenticated Admins to Update
```sql
-- Allow admins to update images
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);
```

#### Policy 4: Allow Authenticated Admins to Delete
```sql
-- Allow admins to delete images
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);
```

### 3. Alternative: Simple Public Upload Policy

If you want a simpler setup (less secure, but easier for development):

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');
```

## Image Upload Features

### Current Implementation
- ✅ File selection with drag & drop support
- ✅ Image preview before upload
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ Automatic upload to Supabase Storage
- ✅ Public URL generation
- ✅ Fallback to URL input if needed

### File Structure in Storage
Images are stored in the following structure:
```
products/
  ├── 1234567890-abc123.jpg
  ├── 1234567891-def456.png
  └── ...
```

Each file is named with a timestamp and random string to ensure uniqueness.

## Troubleshooting

### Error: "Bucket not found"
- Make sure you've created the `products` bucket in Supabase Storage
- Check that the bucket name matches exactly: `products`

### Error: "new row violates row-level security policy"
- Make sure you've set up the storage policies as described above
- Verify that your user is authenticated and has admin privileges

### Error: "File size exceeds limit"
- The default limit is 5MB
- You can increase the limit in the bucket settings or update the validation in `AdminProductEdit.tsx`

### Images not displaying
- Check that the bucket is set to **Public**
- Verify the public URL is correctly generated
- Check browser console for CORS errors

## Testing

1. Go to `/admin/products/new`
2. Click "Télécharger une image" (Upload an image)
3. Select an image file
4. Verify the preview appears
5. Fill in other product details
6. Click "Enregistrer" (Save)
7. Check that the image URL is saved correctly

## Security Notes

⚠️ **Important**: The current implementation uses the anon key, which means:
- Anyone with your Supabase URL and key can potentially upload images
- For production, consider:
  - Using authenticated uploads only
  - Implementing server-side validation
  - Adding image processing/optimization
  - Setting up CDN for better performance

## Next Steps

1. **Image Optimization**: Add image compression before upload
2. **Multiple Images**: Support uploading multiple images per product
3. **Image Cropping**: Add image cropping functionality
4. **Image Gallery**: Create a gallery view for managing uploaded images
5. **CDN Integration**: Set up CDN for faster image delivery

