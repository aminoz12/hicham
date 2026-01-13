# Quick Setup: Supabase Storage Bucket

## Error: "Bucket not found"

If you're seeing this error, you need to create the storage bucket in Supabase.

## Quick Setup (2 minutes)

### Step 1: Create the Bucket

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New bucket** button
5. Fill in:
   - **Name**: `products` (exactly this name, lowercase)
   - **Public bucket**: ✅ **Check this box** (important!)
   - Click **Create bucket**

### Step 2: Set Up Policies (Optional but Recommended)

After creating the bucket, click on it, then go to **Policies** tab.

#### Quick Policy (Allows authenticated uploads):

Click **New Policy** → **For full customization**

Paste this SQL:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated'
);
```

Click **Review** → **Save policy**

### Step 3: Test

1. Go to `/admin/products/new`
2. Try uploading an image
3. It should work now!

## Alternative: Use URL Input

If you don't want to set up storage right now, you can still use the URL input option:
- After clicking "Télécharger une image", scroll down
- You'll see "Ou utilisez une URL" option
- Enter an image URL directly

## Troubleshooting

### Still getting "Bucket not found"?
- Make sure the bucket name is exactly `products` (lowercase, no spaces)
- Refresh the page after creating the bucket
- Check that the bucket is set to **Public**

### Getting permission errors?
- Make sure you've set up the storage policies
- Check that your user is authenticated
- Verify the bucket is public

### Images not displaying?
- Check that the bucket is set to **Public**
- Verify the public URL is generated correctly
- Check browser console for CORS errors

