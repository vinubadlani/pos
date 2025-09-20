import { google } from 'googleapis';

// Vercel serverless function to upload images to Google Drive
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

    // Parse service account JSON from environment variable
    const saKeyString = process.env.GOOGLE_SA_KEY;
    if (!saKeyString) {
      return res.status(500).json({ error: 'Google Service Account key not configured' });
    }

    const serviceAccount = JSON.parse(saKeyString);

    // Create JWT authentication
    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Convert base64 to buffer
    const buffer = Buffer.from(data, 'base64');

    // Your specific folder ID from the URL you provided
    const folderId = '1baKgd52mtYjRyvmTziIoJrzysMRhLU_U';

    const fileMetadata = {
      name: `${Date.now()}-${name}`, // Add timestamp to avoid conflicts
      parents: [folderId] // Upload to your specific folder
    };

    const media = {
      mimeType,
      body: buffer
    };

    // Upload file to Google Drive
    const createResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, size'
    });

    const fileId = createResponse.data.id;

    // Make the file publicly readable
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Generate different URL formats
    const viewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const shareUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    const directImageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    console.log(`✅ Image uploaded successfully: ${createResponse.data.name}`);

    return res.status(200).json({
      success: true,
      fileId,
      fileName: createResponse.data.name,
      size: createResponse.data.size,
      viewUrl,
      downloadUrl,
      shareUrl,
      directImageUrl, // This URL works best for displaying in sheets
      message: 'Image uploaded to Google Drive successfully'
    });

  } catch (error) {
    console.error('❌ Google Drive upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload to Google Drive',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
