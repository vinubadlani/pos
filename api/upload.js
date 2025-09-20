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
      return res.status(500).json({ 
        error: 'Google Service Account key not configured',
        help: 'Set GOOGLE_SA_KEY environment variable in Vercel dashboard'
      });
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(saKeyString);
    } catch (parseError) {
      return res.status(500).json({ 
        error: 'Invalid GOOGLE_SA_KEY format',
        help: 'Ensure GOOGLE_SA_KEY is valid JSON',
        details: parseError.message
      });
    }

    // Validate required fields
    const requiredFields = ['client_email', 'private_key', 'project_id'];
    for (const field of requiredFields) {
      if (!serviceAccount[field]) {
        return res.status(500).json({ 
          error: `Missing required field: ${field}`,
          help: 'Ensure your service account JSON includes all required fields'
        });
      }
    }

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
    
    // Provide specific error messages based on error type
    let helpMessage = 'Check server logs for details';
    
    if (error.message.includes('invalid_grant')) {
      helpMessage = 'Service account credentials are invalid. Check your GOOGLE_SA_KEY';
    } else if (error.message.includes('access_denied') || error.message.includes('403')) {
      helpMessage = 'Service account lacks permissions. Share the Drive folder with the service account email';
    } else if (error.message.includes('not found') || error.message.includes('404')) {
      helpMessage = 'Drive folder not found. Check folder ID and permissions';
    } else if (error.message.includes('quota')) {
      helpMessage = 'Google Drive API quota exceeded. Try again later';
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload to Google Drive',
      help: helpMessage,
      serviceAccountEmail: serviceAccount?.client_email || 'unknown',
      folderId: '1baKgd52mtYjRyvmTziIoJrzysMRhLU_U',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
