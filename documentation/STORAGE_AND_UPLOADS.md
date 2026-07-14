# Storage and Uploads

✅ **Status**: Implemented

All binary assets are handled by **Supabase Storage**.

## Storage Buckets

### 1. `avatars` (Public)
- **Purpose:** Stores user profile pictures.
- **Permissions:** 
  - Read: Public (Anyone can view).
  - Write: Authenticated users can upload/update only their own `user_id` folder.

### 2. `complaints` (Private)
- **Purpose:** Stores photo evidence of illegal dumping or missed collections.
- **Permissions:**
  - Read: Restricted to the uploading Citizen and Admins.
  - Write: Authenticated Citizens.
- **Security:** Requires requesting a Signed URL from the Supabase API to view the image.

## Upload Flow
1. The frontend React component uses the Supabase JS client to request an upload operation.
2. The file is uploaded directly from the browser to the Supabase Storage Edge network (bypassing the Next.js and Express servers entirely to save bandwidth and compute).
3. Upon success, the resulting file path is saved to the relevant Postgres table (e.g., `profiles.avatar_url` or `complaints.image_url`).

## Performance
- Images should be compressed client-side before upload (planned optimization).
- Supabase Storage acts as a CDN, ensuring fast delivery of public assets globally.
