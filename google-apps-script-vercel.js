// Simplified Google Apps Script for Vercel deployment
// This version handles orders with base64 image URLs from Vercel

function doPost(e) {
  try {
    console.log('📥 Received request');
    
    // Handle CORS preflight
    if (e.parameter === undefined && e.postData === undefined) {
      return createCorsResponse('OK');
    }
    
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return createCorsResponse('No data received', 400);
    }
    
    console.log('📝 Processing order data...');
    
    // Validate API key
    if (!data.apiKey || data.apiKey !== 'L9h8sF2kd93XyPzQwErT7UvBnM4cJ1oZ5y') {
      return createCorsResponse('Invalid API key', 401);
    }
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('Orders');
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Orders');
      
      // Set up headers
      const headers = [
        'Order Number',
        'Customer Name',
        'Address',
        'Pincode',
        'Contact',
        'TL Name',
        'Member Name',
        'Items',
        'Subtotal',
        'Delivery',
        'Grand Total',
        'Payment Screenshot URL',
        'Order Note',
        'Timestamp',
        'Order Status'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Prepare items string
    let itemsString = '';
    if (data.items && Array.isArray(data.items)) {
      itemsString = data.items.map(item => 
        `${item.name} (${item.category}) - Qty: ${item.quantity} - ₹${item.price * item.quantity}`
      ).join('\n');
    }
    
    // Determine screenshot status and URL
    let screenshotStatus = 'Not uploaded';
    let screenshotUrl = '';
    
    if (data.paymentScreenshotUrl) {
      if (data.paymentScreenshotUrl.startsWith('data:image/')) {
        screenshotStatus = 'Uploaded (Base64)';
        screenshotUrl = 'Image embedded in order data (viewable in admin panel)';
      } else if (data.paymentScreenshotUrl.startsWith('http')) {
        screenshotStatus = 'Uploaded';
        screenshotUrl = data.paymentScreenshotUrl;
      } else {
        screenshotStatus = data.paymentScreenshotUrl;
        screenshotUrl = 'Check admin panel for local backup';
      }
    }
    
    // Prepare row data
    const rowData = [
      data.orderNumber || 'N/A',
      data.customerName || 'N/A',
      data.address || 'N/A',
      data.pincode || 'N/A',
      data.contact || 'N/A',
      data.tlName || 'N/A',
      data.memberName || 'N/A',
      itemsString,
      data.subtotal || 0,
      data.delivery || 0,
      data.grandTotal || 0,
      screenshotUrl,
      data.orderNote || '',
      data.timestamp || new Date().toISOString(),
      'Processing'
    ];
    
    // Add the order to the sheet
    sheet.appendRow(rowData);
    
    console.log('✅ Order added to spreadsheet');
    
    // Auto-resize columns for better visibility
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    return createCorsResponse('Order submitted successfully', 200, {
      status: 'success',
      orderNumber: data.orderNumber,
      message: 'Order added to Google Sheets'
    });
    
  } catch (error) {
    console.error('❌ Error processing request:', error);
    return createCorsResponse('Internal server error: ' + error.toString(), 500);
  }
}

function createCorsResponse(message, status = 200, data = null) {
  const response = {
    message: message,
    status: status === 200 ? 'success' : 'error',
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    Object.assign(response, data);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return createCorsResponse('OK');
}

// Test function to verify setup
function testSetup() {
  console.log('🧪 Testing spreadsheet setup...');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  console.log('📊 Spreadsheet name:', spreadsheet.getName());
  
  let sheet = spreadsheet.getSheetByName('Orders');
  if (!sheet) {
    console.log('📋 Creating Orders sheet...');
    sheet = spreadsheet.insertSheet('Orders');
    
    const headers = [
      'Order Number', 'Customer Name', 'Address', 'Pincode', 'Contact',
      'TL Name', 'Member Name', 'Items', 'Subtotal', 'Delivery',
      'Grand Total', 'Payment Screenshot URL', 'Order Note', 'Timestamp', 'Order Status'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  console.log('✅ Setup complete');
  return 'Setup successful';
}
