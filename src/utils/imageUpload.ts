// Image upload utility for Vercel Storage with compression

const isDevelopment = window.location.hostname === 'localhost';

const log = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  customUrl?: string;
  error?: string;
  compressionRatio?: string;
}

export const uploadImageToVercel = async (file: File): Promise<ImageUploadResult> => {
  try {
    log('🔄 Processing image for Vercel Storage upload...');
    
    // Convert image to base64
    const base64 = await fileToBase64(file);
    
    // Prepare the upload payload
    const uploadPayload = {
      name: file.name,
      mimeType: file.type,
      data: base64 // Just the base64 data without data: prefix
    };

    // Upload to our custom /api/upload endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadPayload)
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      log('✅ Image uploaded successfully to Vercel Storage');
      log('📊 Compression ratio:', result.compressionRatio);
      log('🔗 Storage URL:', result.url);
      log('🔗 Custom URL:', result.customUrl);
      
      return {
        success: true,
        url: result.url, // Vercel Storage URL
        customUrl: result.customUrl, // Custom domain/upload/image format
        compressionRatio: result.compressionRatio
      };
    } else {
      throw new Error(result.error || 'Upload failed');
    }

  } catch (error) {
    log('❌ Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Backup function for storing image data locally
export const storeImageLocally = (file: File, orderId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      
      // Store in localStorage with order reference
      const imageData = {
        orderId,
        fileName: file.name,
        dataUrl,
        timestamp: new Date().toISOString(),
        size: file.size
      };
      
      localStorage.setItem(`payment-image-${orderId}`, JSON.stringify(imageData));
      resolve(dataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
