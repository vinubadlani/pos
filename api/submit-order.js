/**
 * Serverless API endpoint for Mr Champaran POS System
 * This acts as a proxy to Google Apps Script, hiding the API key from the frontend
 * 
 * Deploy this on Vercel, Netlify, or similar platforms
 * Set environment variables: GAS_WEBAPP_URL and GAS_API_KEY
 */

// Environment variables (set these in your deployment platform)
const GAS_WEBAPP_URL = process.env.GAS_WEBAPP_URL;
const GAS_API_KEY = process.env.GAS_API_KEY;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Validate environment variables
    if (!GAS_WEBAPP_URL || !GAS_API_KEY) {
      console.error('Missing environment variables:', { 
        hasUrl: !!GAS_WEBAPP_URL, 
        hasKey: !!GAS_API_KEY 
      });
      return res.status(500).json({ 
        ok: false, 
        error: 'Server misconfiguration. Please contact administrator.' 
      });
    }

    // Validate request body
    const orderData = req.body;
    if (!orderData) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Request body is required' 
      });
    }

    // Basic validation
    const validationError = validateOrderData(orderData);
    if (validationError) {
      return res.status(400).json({ 
        ok: false, 
        error: validationError 
      });
    }

    // Inject API key into the payload
    const payloadWithKey = {
      ...orderData,
      apiKey: GAS_API_KEY
    };

    console.log('Forwarding order to Google Apps Script:', {
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      itemCount: orderData.items?.length || 0,
      grandTotal: orderData.grandTotal
    });

    // Forward request to Google Apps Script with retry logic
    const response = await forwardToGoogleAppsScript(payloadWithKey);
    
    // Log the response for debugging
    console.log('Google Apps Script response:', {
      status: response.status,
      ok: response.ok
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Google Apps Script error:', result);
      return res.status(response.status).json(result);
    }

    // Success
    console.log('Order processed successfully:', result);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
}

/**
 * Validate order data before forwarding
 */
function validateOrderData(data) {
  // Required fields
  const requiredFields = [
    'orderNumber', 'customerName', 'address', 'pincode', 
    'contact', 'tlName', 'memberName'
  ];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }

  // Validate pincode format
  if (!/^\d{6}$/.test(data.pincode)) {
    return 'Pincode must be exactly 6 digits';
  }
  
  // Validate contact format  
  if (!/^\d{10}$/.test(data.contact)) {
    return 'Contact must be exactly 10 digits';
  }
  
  // Validate items array
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return 'Items array is required and must not be empty';
  }

  // Validate numeric fields
  if (typeof data.subtotal !== 'number' || data.subtotal < 0) {
    return 'Subtotal must be a non-negative number';
  }
  
  if (typeof data.delivery !== 'number' || data.delivery < 0) {
    return 'Delivery must be a non-negative number';
  }
  
  if (typeof data.grandTotal !== 'number' || data.grandTotal < 0) {
    return 'Grand total must be a non-negative number';
  }

  return null; // No validation errors
}

/**
 * Forward request to Google Apps Script with retry logic
 */
async function forwardToGoogleAppsScript(data, retries = 3) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        timeout: 30000 // 30 seconds timeout
      });
      
      return response;
      
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed after ${retries} attempts: ${error.message}`);
      }
      
      // Exponential backoff: 1s, 2s, 4s
      await delay(Math.pow(2, attempt - 1) * 1000);
    }
  }
}
