import { put } from '@vercel/blob';
import sharp from 'sharp';

// Vercel serverless function to upload compressed images to Vercel Storage
export default async function handler(req, res) {
  // Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Expect JSON body: { name, mimeType, data } where data is base64 (no data:... prefix)
    const { name = 'payment-screenshot.jpg', mimeType = 'image/jpeg', data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    console.log('🔄 Processing image upload to Vercel Storage...');

    // Convert base64 to buffer
    const originalBuffer = Buffer.from(data, 'base64');
    const originalSize = originalBuffer.length;

    console.log(`📊 Original image size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Compress image using Sharp
    let compressedBuffer;
    try {
      compressedBuffer = await sharp(originalBuffer)
        .jpeg({ 
          quality: 85, // Good quality while reducing file size
          progressive: true,
          mozjpeg: true // Better compression
        })
        .resize({ 
          width: 1200, // Max width for web display
          height: 1200, // Max height
          fit: 'inside', // Maintain aspect ratio
          withoutEnlargement: true // Don't upscale small images
        })
        .toBuffer();
    } catch (sharpError) {
      console.warn('⚠️ Sharp compression failed, using original:', sharpError.message);
      compressedBuffer = originalBuffer;
    }

    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`📊 Compressed image size: ${(compressedSize / 1024).toFixed(2)} KB (${compressionRatio}% reduction)`);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = name.split('.').pop() || 'jpg';
    const uniqueFileName = `payment-${timestamp}.${fileExtension}`;

    // Upload to Vercel Storage
    const blob = await put(uniqueFileName, compressedBuffer, {
      access: 'public',
      contentType: 'image/jpeg'
    });

    // Get the domain from the request or environment
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || process.env.VERCEL_URL;
    const domain = `${protocol}://${host}`;

    // Create the custom URL format: domain/upload/image
    const customImageUrl = `${domain}/upload/${uniqueFileName}`;

    console.log(`✅ Image uploaded successfully: ${uniqueFileName}`);
    console.log(`🔗 Vercel Storage URL: ${blob.url}`);
    console.log(`🔗 Custom URL format: ${customImageUrl}`);

    return res.status(200).json({
      success: true,
      url: blob.url, // Original Vercel Storage URL
      customUrl: customImageUrl, // Custom format URL
      fileName: uniqueFileName,
      originalSize: originalSize,
      compressedSize: compressedSize,
      compressionRatio: `${compressionRatio}%`,
      message: 'Image compressed and uploaded to Vercel Storage successfully'
    });

  } catch (error) {
    console.error('❌ Vercel Storage upload error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload to Vercel Storage',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
