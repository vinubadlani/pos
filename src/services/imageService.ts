import { supabase } from '../lib/supabase'

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  publicUrl?: string;
  error?: string;
  fileName?: string;
}

// Compress image using canvas (client-side compression)
const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas compression failed'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = URL.createObjectURL(file)
  })
}

export const uploadImageToSupabase = async (file: File): Promise<ImageUploadResult> => {
  try {
    console.log('🔄 Starting image upload to Supabase Storage...')
    
    // Compress the image first
    let imageBlob: Blob
    try {
      imageBlob = await compressImage(file, 1200, 0.85)
      console.log(`📊 Compressed image: ${(file.size / 1024).toFixed(2)}KB → ${(imageBlob.size / 1024).toFixed(2)}KB`)
    } catch (compressionError) {
      console.warn('⚠️ Compression failed, using original file:', compressionError)
      imageBlob = file
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `payment-${timestamp}-${randomString}.${fileExtension}`
    
    console.log(`📤 Uploading to Supabase Storage: ${fileName}`)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('payment-screenshots')
      .upload(fileName, imageBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('❌ Supabase Storage upload error:', error)
      throw error
    }
    
    console.log('✅ File uploaded successfully:', data)
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(fileName)
    
    const publicUrl = publicUrlData.publicUrl
    console.log('🔗 Public URL generated:', publicUrl)
    
    return {
      success: true,
      url: publicUrl,
      publicUrl: publicUrl,
      fileName: fileName
    }
    
  } catch (error) {
    console.error('❌ Image upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Fallback: Upload to Vercel Storage if Supabase fails
export const uploadImageWithFallback = async (file: File): Promise<ImageUploadResult> => {
  try {
    // Try Supabase first
    const supabaseResult = await uploadImageToSupabase(file)
    
    if (supabaseResult.success) {
      console.log('✅ Supabase upload successful')
      return supabaseResult
    }
    
    console.warn('⚠️ Supabase upload failed, trying Vercel fallback...')
    
    // Fallback to Vercel Storage
    const { uploadImageToVercel } = await import('../utils/imageUpload')
    const vercelResult = await uploadImageToVercel(file)
    
    if (vercelResult.success) {
      console.log('✅ Vercel fallback successful')
      return {
        success: true,
        url: vercelResult.customUrl || vercelResult.url,
        publicUrl: vercelResult.customUrl || vercelResult.url
      }
    }
    
    throw new Error('Both Supabase and Vercel uploads failed')
    
  } catch (error) {
    console.error('❌ All upload methods failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'All upload methods failed'
    }
  }
}

// List uploaded images (for admin dashboard)
export const listUploadedImages = async (limit: number = 50): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from('payment-screenshots')
      .list('', {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) throw error
    
    return data.map(file => {
      const { data: urlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(file.name)
      return urlData.publicUrl
    })
    
  } catch (error) {
    console.error('❌ Error listing images:', error)
    return []
  }
}

// Delete image (for cleanup)
export const deleteImage = async (fileName: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('payment-screenshots')
      .remove([fileName])
    
    if (error) throw error
    
    console.log('✅ Image deleted successfully:', fileName)
    return true
    
  } catch (error) {
    console.error('❌ Error deleting image:', error)
    return false
  }
}
