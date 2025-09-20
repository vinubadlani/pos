import React, { useState, useEffect } from 'react';

interface StoredImage {
  ref: string;
  filename: string;
  type: string;
  base64: string;
  timestamp: number;
}

const ImageRecoveryAdmin: React.FC = () => {
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);

  useEffect(() => {
    // Scan localStorage for stored images
    const images: StoredImage[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('image-payment-')) {
        const ref = key.replace('image-', '');
        const base64 = localStorage.getItem(key) || '';
        const filename = localStorage.getItem(`${key}-filename`) || 'unknown.jpg';
        const type = localStorage.getItem(`${key}-type`) || 'image/jpeg';
        
        // Extract timestamp from ref
        const timestampMatch = ref.match(/-(\d+)$/);
        const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : Date.now();
        
        images.push({
          ref,
          filename,
          type,
          base64,
          timestamp
        });
      }
    }
    
    // Sort by timestamp (newest first)
    images.sort((a, b) => b.timestamp - a.timestamp);
    setStoredImages(images);
  }, []);

  const downloadImage = (image: StoredImage) => {
    const link = document.createElement('a');
    link.href = image.base64;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearImage = (ref: string) => {
    localStorage.removeItem(`image-${ref}`);
    localStorage.removeItem(`image-${ref}-filename`);
    localStorage.removeItem(`image-${ref}-type`);
    setStoredImages(prev => prev.filter(img => img.ref !== ref));
  };

  const clearAllImages = () => {
    storedImages.forEach(image => {
      localStorage.removeItem(`image-${image.ref}`);
      localStorage.removeItem(`image-${image.ref}-filename`);
      localStorage.removeItem(`image-${image.ref}-type`);
    });
    setStoredImages([]);
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Payment Screenshot Recovery</h1>
      <p>These are payment screenshots that were stored locally when online upload failed.</p>
      
      {storedImages.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <h3>No locally stored images found</h3>
            <p>All payment screenshots were successfully uploaded to cloud storage.</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={clearAllImages}
              className="btn btn-danger"
              style={{ marginRight: '1rem' }}
            >
              Clear All ({storedImages.length})
            </button>
            <span style={{ color: '#666' }}>
              {storedImages.length} payment screenshot(s) stored locally
            </span>
          </div>
          
          <div className="grid" style={{ gap: '1rem' }}>
            {storedImages.map((image) => (
              <div key={image.ref} className="card">
                <div className="card-body">
                  <h4>Payment Screenshot</h4>
                  <p><strong>File:</strong> {image.filename}</p>
                  <p><strong>Date:</strong> {new Date(image.timestamp).toLocaleString()}</p>
                  <p><strong>Reference:</strong> {image.ref}</p>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <img 
                      src={image.base64}
                      alt="Payment screenshot"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '150px',
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => downloadImage(image)}
                      className="btn btn-primary"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => clearImage(image.ref)}
                      className="btn btn-secondary"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageRecoveryAdmin;
