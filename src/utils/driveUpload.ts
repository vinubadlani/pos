// Utility to upload images to Google Drive via Vercel API
export interface DriveUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileId?: string;
  directImageUrl?: string;
}

// Convert File to base64 without data URL prefix
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const uploadToGoogleDrive = async (file: File): Promise<DriveUploadResult> => {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Prepare the payload
    const payload = {
      name: file.name,
      mimeType: file.type,
      data: base64Data
    };

    // Determine the API endpoint URL
    const isDevelopment = window.location.hostname === 'localhost';
    const baseUrl = isDevelopment 
      ? 'http://localhost:3000' 
      : window.location.origin;
    
    const apiUrl = `${baseUrl}/api/upload`;

    console.log(`🔄 Uploading ${file.name} to Google Drive via ${apiUrl}...`);

    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Image uploaded successfully to Google Drive:`, result);
      return {
        success: true,
        url: result.directImageUrl || result.viewUrl, // Use directImageUrl for better sheet compatibility
        fileId: result.fileId,
        directImageUrl: result.directImageUrl
      };
    } else {
      throw new Error(result.error || 'Upload failed');
    }

  } catch (error) {
    console.error('❌ Google Drive upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

// Legacy function for backwards compatibility
export const uploadImageToVercel = async (file: File): Promise<DriveUploadResult> => {
  return uploadToGoogleDrive(file);
};

// Keep the existing local storage function as fallback
export const storeImageLocally = async (file: File, orderNumber: string): Promise<string> => {
  try {
    // Create object URL for local viewing
    const objectUrl = URL.createObjectURL(file);
    
    // Store in localStorage for recovery
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    return new Promise((resolve) => {
      reader.onload = () => {
        try {
          const imageData = {
            orderNumber,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            timestamp: new Date().toISOString(),
            dataUrl: reader.result as string
          };
          
          // Store in localStorage
          const existingImages = JSON.parse(localStorage.getItem('stored_images') || '[]');
          existingImages.push(imageData);
          localStorage.setItem('stored_images', JSON.stringify(existingImages));
          
          console.log(`💾 Image stored locally for order ${orderNumber}`);
          resolve(objectUrl);
        } catch (error) {
          console.error('Local storage failed:', error);
          resolve(objectUrl);
        }
      };
    });
  } catch (error) {
    console.error('Local image storage failed:', error);
    throw error;
  }
};
