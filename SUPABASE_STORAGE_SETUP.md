# Supabase Storage Setup for Payment Screenshots

## Overview
This implementation uses Supabase Storage to store payment screenshot images with automatic compression and public URL generation for Google Sheets integration.

## 🚀 Setup Steps

### 1. Create Storage Bucket in Supabase

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the sidebar
4. Click **New bucket**
5. Configure:
   - **Name**: `payment-screenshots`
   - **Public bucket**: ✅ **Enabled**
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

#### Option B: Via SQL (Alternative)
Run the SQL commands in `supabase-schema.sql` which includes:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
);
```

### 2. Configure Storage Policies

The schema includes RLS policies for:
- **Public read access** - Anyone can view images via public URLs
- **Public upload access** - POS system can upload images
- **Update/Delete access** - For future admin features

### 3. Environment Variables

Already configured in your `.env.local`:
```bash
VITE_SUPABASE_URL=https://akbzjwkkcvcdvzwpcddq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Vercel Production Deployment

Add the same environment variables in Vercel Dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📁 File Structure

### New Files Created:
- `src/services/imageService.ts` - Supabase Storage upload service
- `supabase-schema.sql` - Updated with storage bucket setup

### Updated Files:
- `src/components/CheckoutPage.tsx` - Uses new image service
- Environment files with Supabase credentials

## 🔄 Image Upload Flow

### 1. Client-Side Compression
```typescript
// Compresses images to max 1200px width, 85% quality
const compressedBlob = await compressImage(file, 1200, 0.85)
```

### 2. Upload to Supabase Storage
```typescript
const { data, error } = await supabase.storage
  .from('payment-screenshots')
  .upload(fileName, compressedBlob, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false
  })
```

### 3. Generate Public URL
```typescript
const { data: publicUrlData } = supabase.storage
  .from('payment-screenshots')
  .getPublicUrl(fileName)
```

### 4. Fallback System
If Supabase fails, automatically falls back to Vercel Storage:
```typescript
const result = await uploadImageWithFallback(file)
```

## 🌐 URL Format

### Supabase Storage URLs:
```
https://akbzjwkkcvcdvzwpcddq.supabase.co/storage/v1/object/public/payment-screenshots/payment-1732287632001-a1b2c3.jpg
```

### Features:
- **Public access** - No authentication required
- **CDN delivery** - Fast global access
- **Permanent URLs** - Never expire
- **Clean format** - Perfect for Google Sheets

## 🔧 Integration with Google Sheets

The public URLs are automatically sent to your Google Apps Script:
```typescript
const payload = {
  // ... other order data
  paymentScreenshotUrl: publicUrl, // Supabase Storage public URL
  // ...
}
```

## 🛡️ Security & Access Control

### Public Bucket Benefits:
- **No authentication needed** for viewing images
- **Fast loading** in Google Sheets
- **Easy sharing** for order management

### Security Measures:
- **File size limits** (5MB max)
- **MIME type restrictions** (images only)
- **Unique filenames** (timestamp + random string)
- **RLS policies** for controlled access

## 📊 Storage Management

### View Uploaded Images:
```typescript
import { listUploadedImages } from '../services/imageService'

const recentImages = await listUploadedImages(50)
```

### Delete Images (Admin):
```typescript
import { deleteImage } from '../services/imageService'

const deleted = await deleteImage('payment-1732287632001-a1b2c3.jpg')
```

## 🔍 Monitoring & Analytics

### Supabase Dashboard:
1. Go to **Storage** → **payment-screenshots**
2. View all uploaded files
3. Monitor storage usage
4. Check upload activity

### File Naming Convention:
```
payment-{timestamp}-{random}.{extension}
Example: payment-1732287632001-a1b2c3.jpg
```

## 🚀 Benefits Over Vercel Storage

### 1. **Integrated Ecosystem**
- Same database and storage provider
- Unified authentication and permissions
- Single dashboard for monitoring

### 2. **Better URLs**
- Branded with your Supabase project
- Consistent format across all images
- No complex routing needed

### 3. **Advanced Features**
- Built-in image transformations (future)
- Real-time storage events
- Integrated with database RLS

### 4. **Cost Efficiency**
- Included in Supabase free tier
- Predictable pricing
- No separate billing

## 🧪 Testing the Setup

### 1. Verify Bucket Creation
Check Supabase Dashboard → Storage → payment-screenshots exists

### 2. Test Upload
Place a test order with payment screenshot and verify:
- ✅ Image uploads successfully
- ✅ Public URL generated
- ✅ URL accessible without authentication
- ✅ Google Sheets receives the URL
- ✅ Image displays in sheets

### 3. Check Fallback
Temporarily disable Supabase and verify Vercel fallback works

## 🔄 Migration Notes

### Existing Images:
- **Vercel Storage images**: Continue to work
- **New uploads**: Use Supabase Storage
- **No broken links**: Seamless transition

### Gradual Migration:
1. **Phase 1**: Dual upload (both systems) ✅ Current
2. **Phase 2**: Supabase primary, Vercel fallback ✅ Implemented
3. **Phase 3**: Supabase only (future option)

## 📞 Troubleshooting

### Common Issues:

#### Bucket Not Found
- Verify bucket created in Supabase Dashboard
- Check bucket name matches 'payment-screenshots'
- Ensure bucket is public

#### Upload Permissions
- Verify RLS policies created
- Check environment variables set correctly
- Ensure anon key has storage permissions

#### URL Not Accessible
- Confirm bucket is public
- Check file uploaded successfully
- Verify public URL generation

Your POS system now has enterprise-grade image storage with Supabase! 🎉
