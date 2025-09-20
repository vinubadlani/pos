// Simple base64 image upload utility for Vercel hosting

const isDevelopment = window.location.hostname === 'localhost';

const log = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImageToVercel = async (file: File): Promise<ImageUploadResult> => {
  try {
    log('🔄 Processing image for Vercel hosting...');
    
    // Convert image to base64
    const base64 = await fileToBase64(file);
    
    // For Vercel hosting, we'll store the image as base64 data URL
    // This creates an immediate, accessible URL
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    log('✅ Image processed successfully for Vercel');
    
    return {
      success: true,
      url: dataUrl
    };
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
