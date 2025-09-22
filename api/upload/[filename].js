import { get } from '@vercel/blob';

// Vercel serverless function to serve images from Vercel Storage
export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  try {
    // Get the blob from Vercel Storage
    const blob = await get(filename);
    
    if (!blob) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Content-Length', blob.size);

    // Stream the image data
    const response = await fetch(blob.url);
    const imageBuffer = await response.arrayBuffer();
    
    res.status(200).send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('❌ Error serving image:', error);
    res.status(500).json({ 
      error: 'Failed to serve image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
