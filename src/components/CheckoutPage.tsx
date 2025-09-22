import React, { useState } from 'react';
import { uploadImageToVercel } from '../utils/imageUpload';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CartContext, type Order } from '../App';

const isDevelopment = window.location.hostname === 'localhost';
const log = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart, subtotal, discount, delivery, grandTotal } = React.useContext(CartContext);
  
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    pincode: '',
    contact: '',
    tlName: '',
    memberName: '',
    orderNote: ''
  });
  
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    else if (!/^[0-9]{10}$/.test(formData.contact)) newErrors.contact = 'Contact must be 10 digits';
    if (!formData.tlName.trim()) newErrors.tlName = 'TL name is required';
    if (!formData.memberName.trim()) newErrors.memberName = 'Member name is required';

    // Make payment screenshot mandatory
    if (!paymentScreenshot) newErrors.paymentScreenshot = 'Payment screenshot is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const dateStr = format(now, 'yyyyMMdd');
    const timeStr = format(now, 'HHmmss');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MC-${dateStr}-${timeStr}-${random}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 5MB for ImgBB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB');
        return;
      }
      setPaymentScreenshot(file);
      // Clear any previous file error
      if (errors.paymentScreenshot) setErrors(prev => ({ ...prev, paymentScreenshot: '' }));
    } else if (file) {
      alert('Please select a valid image file');
    }
  };

  // Function to process image for Vercel Storage hosting
  const uploadImageToCloud = async (imageFile: File): Promise<string | null> => {
    try {
      log('🔄 Uploading image to Vercel Storage...');
      setIsUploadingImage(true);
      
      // Use our Vercel Storage upload utility
      const result = await uploadImageToVercel(imageFile);
      
      if (result.success && result.url) {
        log('✅ Image uploaded successfully to Vercel Storage');
        return result.url;
      } else {
        console.warn('⚠️ Vercel Storage upload failed:', result.error);
        return `Upload failed - file: ${imageFile.name}`;
      }
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      return `Upload failed - file: ${imageFile.name}`;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const submitOrder = async () => {
    if (!validateForm() || cart.length === 0) return;
    
    setIsSubmitting(true);
    
    const orderNumber = generateOrderNumber(); // Move outside try block
    const now = new Date();
    
    try {
      // Upload payment screenshot to cloud storage if provided
      let paymentScreenshotUrl: string | undefined;
      
      if (paymentScreenshot) {
        log('🔄 Uploading payment screenshot...');
        setIsUploadingImage(true);
        const uploadedUrl = await uploadImageToCloud(paymentScreenshot);
        setIsUploadingImage(false);
        
        if (uploadedUrl) {
          paymentScreenshotUrl = uploadedUrl;
          log('✅ Payment screenshot uploaded:', uploadedUrl);
        } else {
          console.warn('⚠️ Failed to upload payment screenshot, proceeding without public URL');
          paymentScreenshotUrl = 'Upload failed - stored locally';
        }
      }
      
      // Create order for local storage
      const order: Order = {
        orderNumber,
        customerName: formData.customerName,
        address: formData.address,
        pincode: formData.pincode,
        contact: formData.contact,
        tlName: formData.tlName,
        memberName: formData.memberName,
        subtotal,
        discount,
        delivery,
        grandTotal,
        paymentScreenshotUrl: paymentScreenshotUrl || (paymentScreenshot ? URL.createObjectURL(paymentScreenshot) : undefined),
        items: [...cart],
        timestamp: now.toISOString(),
        orderNote: formData.orderNote
      };

      // Save to localStorage first (backup)
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      // Submit to Google Apps Script with CORS workaround
      // Using the NEW Web app deployment URL
      const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbzLGfstN1t9ub81kGKWpoXprrCRgbiwLmfHHc_y-RDZ1CRloRyzes1_s7Cq5fpGGXVTAg/exec';
      const apiKey = 'L9h8sF2kd93XyPzQwErT7UvBnM4cJ1oZ5y';

      // Prepare payload for Google Sheets
      const payload = {
        apiKey,
        orderNumber,
        date: format(now, 'yyyy-MM-dd'),
        time: format(now, 'HH:mm:ss'),
        customerName: formData.customerName,
        customerPhone: formData.contact,
        customerAddress: formData.address,
        pincode: formData.pincode,
        tlName: formData.tlName,
        memberName: formData.memberName,
        subtotal: subtotal.toString(),
        discount: discount.toString(),
        deliveryFee: delivery.toString(),
        grandTotal: grandTotal.toString(),
        paymentMethod: 'Payment Screenshot',
        paymentScreenshot: paymentScreenshotUrl || (paymentScreenshot ? 'Uploaded locally' : 'Not uploaded'),
        paymentScreenshotUrl: paymentScreenshotUrl || '', // Public URL for the image
        orderStatus: 'Pending',
        orderNote: formData.orderNote || '',
        items: cart.map(item => ({
          productName: item.productName,
          productVariant: item.variant,
          size: item.size,
          sku: item.sku,
          quantity: item.qty,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal
        }))
      };

      log('Submitting order to Google Apps Script:', payload);

      // Direct submission with no-cors to bypass CORS preflight issues
      let submitted = false;
      let lastError: Error | null = null;

      // Method 1: POST with no-cors (most reliable for Google Apps Script)
      try {
        log('🔄 Attempting POST with no-cors...');
        
        await fetch(googleAppsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        log('✅ Order submitted via POST (no-cors mode)');
        submitted = true;
        
      } catch (error) {
        console.warn('⚠️ POST no-cors failed:', error);
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      // Method 2: GET fallback with query parameters (if POST failed)
      if (!submitted) {
        try {
          log('🔄 Attempting GET fallback method...');
          
          // Create a simpler payload for GET method
          const getPayload: any = {
            ...payload,
            // Convert items array to a string to avoid URL length issues
            itemsData: JSON.stringify(payload.items)
          };
          delete getPayload.items;
          
          const queryParams = new URLSearchParams();
          Object.entries(getPayload).forEach(([key, value]) => {
            queryParams.append(key, String(value));
          });
          
          const getUrl = `${googleAppsScriptUrl}?${queryParams.toString()}`;
          log('📤 GET URL length:', getUrl.length);
          
          // Make the GET request
          await fetch(getUrl, { 
            method: 'GET',
            mode: 'no-cors' // This allows the request but limits response access
          });
          
          // With no-cors, we can't read the response, so we assume success if no error
          log('✅ Order submitted via GET fallback (no-cors mode)');
          submitted = true;
          
        } catch (error) {
          console.warn('⚠️ GET fallback also failed:', error);
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }

      // Method 3: Try CORS POST as final attempt (for testing)
      if (!submitted) {
        try {
          log('🔄 Attempting CORS POST (final attempt)...');
          const response = await fetch(googleAppsScriptUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
              log('✅ Order submitted successfully via CORS POST:', result);
              submitted = true;
            } else {
              throw new Error(result.message || 'Server returned error status');
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.warn('⚠️ CORS POST also failed:', error);
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }

      if (submitted) {
        clearCart();
        navigate(`/invoice/${orderNumber}`);
      } else {
        throw lastError || new Error('All submission methods failed');
      }
      
    } catch (error) {
      console.error('❌ Order submission failed:', error);
      
      // Show user-friendly error message with next steps
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const isCorsProblem = errorMsg.includes('CORS') || errorMsg.includes('fetch');
      
      let userMessage = `⚠️ Upload Issue: ${errorMsg}\n\n`;
      
      if (isCorsProblem) {
        userMessage += `🔧 This is a CORS configuration issue with Google Apps Script.\n\n` +
                      `✅ Your order has been SAVED LOCALLY and can be recovered.\n\n` +
                      `📋 Next steps:\n` +
                      `1. Contact admin to update Google Apps Script\n` +
                      `2. Check DEPLOYMENT_INSTRUCTIONS.md file\n` +
                      `3. Your order is safely stored for retry`;
      } else {
        userMessage += `✅ Your order has been SAVED LOCALLY.\n\n` +
                      `📋 Please try again or contact support.`;
      }
      
      alert(userMessage);
      
      // Still navigate to invoice since order is saved locally
      clearCart();
      navigate(`/invoice/${orderNumber}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <h2>Your cart is empty</h2>
            <p>Add some items to your cart before checking out.</p>
            <button onClick={() => navigate('/pos')} className="btn btn-primary">
              Go to POS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-container">
      <h1 className="page-title">Checkout</h1>
      
      {/* Order Summary Card */}
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">Order Summary ({cart.length} items)</h2>
        </div>
        <div className="card-body">
          <div className="order-items">
            {cart.map((item, index) => (
              <div key={index} className="order-item">
                <div className="order-item-details">
                  <div className="order-item-name">{item.productName}</div>
                  <div className="order-item-variant">{item.variant} - {item.size}</div>
                  <div className="order-item-sku">SKU: {item.sku} (Qty: {item.qty})</div>
                </div>
                <div className="order-item-price">₹{item.lineTotal}</div>
              </div>
            ))}
          </div>
          
          <div className="order-total">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="total-row discount-row">
                <span>Discount ({subtotal >= 2000 ? '15' : subtotal >= 1000 ? '10' : '5'}%):</span>
                <span className="discount-amount">-₹{discount}</span>
              </div>
            )}
            <div className="total-row">
              <span>Delivery:</span>
              <span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
            </div>
            <div className="total-row-final">
              <span>Total:</span>
              <span>₹{grandTotal}</span>
            </div>
            {subtotal >= 1000 && (
              <div className="delivery-notice gift-notice">
                🎁 Free Gift included with your order!
              </div>
            )}
            {subtotal < 500 && (
              <div className="delivery-notice">
                Add ₹{500 - subtotal} more for 5% discount!
              </div>
            )}
            {subtotal >= 500 && subtotal < 1000 && (
              <div className="delivery-notice">
                Add ₹{1000 - subtotal} more for 10% discount + free delivery!
              </div>
            )}
            {subtotal >= 1000 && subtotal < 2000 && (
              <div className="delivery-notice">
                Add ₹{2000 - subtotal} more for 15% discount!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Details Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Customer & Delivery Details</h2>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); submitOrder(); }} className="checkout-form">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className={`form-control ${errors.customerName ? 'error' : ''}`}
                placeholder="Enter customer name"
              />
              {errors.customerName && <div className="error-message">{errors.customerName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`form-control textarea ${errors.address ? 'error' : ''}`}
                placeholder="Enter complete delivery address"
                rows={3}
              />
              {errors.address && <div className="error-message">{errors.address}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={`form-control ${errors.pincode ? 'error' : ''}`}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                {errors.pincode && <div className="error-message">{errors.pincode}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className={`form-control ${errors.contact ? 'error' : ''}`}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                {errors.contact && <div className="error-message">{errors.contact}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Team Leader Name *</label>
                <input
                  type="text"
                  name="tlName"
                  value={formData.tlName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.tlName ? 'error' : ''}`}
                  placeholder="TL name"
                />
                {errors.tlName && <div className="error-message">{errors.tlName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Member Name *</label>
                <input
                  type="text"
                  name="memberName"
                  value={formData.memberName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.memberName ? 'error' : ''}`}
                  placeholder="Member name"
                />
                {errors.memberName && <div className="error-message">{errors.memberName}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Screenshot * (required)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`form-control file-input ${errors.paymentScreenshot ? 'error' : ''}`}
                disabled={isSubmitting || isUploadingImage}
              />
              {errors.paymentScreenshot && <div className="error-message">{errors.paymentScreenshot}</div>}
              {paymentScreenshot && (
                <div className="payment-preview">
                  <img 
                    src={URL.createObjectURL(paymentScreenshot)} 
                    alt="Payment screenshot" 
                    className="payment-image"
                  />
                  <p className="payment-filename">{paymentScreenshot.name}</p>
                  <p className="payment-info">
                    📤 Image will be uploaded to Vercel Storage for public access in sheets
                  </p>
                </div>
              )}
              {isUploadingImage && (
                <div className="upload-progress">
                  🔄 Uploading to Vercel Storage...
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Order Notes (Optional)</label>
              <textarea
                name="orderNote"
                value={formData.orderNote}
                onChange={handleInputChange}
                className="form-control textarea"
                rows={3}
                placeholder="Any special delivery instructions or notes"
              />
            </div>

            {/* Disclaimer */}
            <div className="disclaimer-section">
              <div className="disclaimer-box">
                <p className="disclaimer-text">
                  <strong>📦 Shipping Information:</strong><br />
                  Your product will be shipped to you within 24 to 48 working hours. 
                  Tracking ID will be shared with you soon after dispatch.
                </p>
                <p className="terms-text">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                Back to Shop
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className={`btn btn-success checkout-submit ${isSubmitting || isUploadingImage ? 'loading' : ''}`}
              >
                {isUploadingImage ? 'Uploading Image...' : 
                 isSubmitting ? 'Placing Order...' : 
                 `Place Order - ₹${grandTotal}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
