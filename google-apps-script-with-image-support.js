// Enhanced Google Apps Script with Base64 Image Support
// This version can convert base64 images to Google Drive files for viewing

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
        'Payment Screenshot',
        'Order Note',
        'Timestamp',
        'Order Status'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
      
      // Set column widths for better visibility
      sheet.setColumnWidth(8, 300); // Items column wider
      sheet.setColumnWidth(12, 200); // Payment Screenshot column wider
    }
    
    // Prepare items string
    let itemsString = '';
    if (data.items && Array.isArray(data.items)) {
      itemsString = data.items.map(item => 
        `${item.productName || item.name} (${item.variant || item.category}) - ${item.size || ''} - Qty: ${item.qty || item.quantity} - ₹${item.lineTotal || (item.price * item.quantity)}`
      ).join('\n');
    }
    
    // Handle payment screenshot
    let screenshotInfo = processPaymentScreenshot(data.paymentScreenshotUrl, data.orderNumber);
    
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
      screenshotInfo,
      data.orderNote || '',
      data.timestamp || new Date().toISOString(),
      'Processing'
    ];
    
    // Add the order to the sheet
    const lastRow = sheet.getLastRow() + 1;
    sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
    
    // If we have a screenshot URL, create a hyperlink
    if (screenshotInfo.includes('http')) {
      const cell = sheet.getRange(lastRow, 12);
      cell.setFormula(`=HYPERLINK("${screenshotInfo}", "View Payment Screenshot")`);
      cell.setFontColor('#1155cc');
      cell.setFontUnderline(true);
    }
    
    console.log('✅ Order added to spreadsheet');
    
    // Auto-resize columns for better visibility
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    return createCorsResponse('Order submitted successfully', 200, {
      status: 'success',
      orderNumber: data.orderNumber,
      message: 'Order added to Google Sheets with payment screenshot'
    });
    
  } catch (error) {
    console.error('❌ Error processing request:', error);
    return createCorsResponse('Internal server error: ' + error.toString(), 500);
  }
}

function processPaymentScreenshot(screenshotUrl, orderNumber) {
  if (!screenshotUrl) {
    return 'No screenshot uploaded';
  }
  
  // If it's already a URL, return it
  if (screenshotUrl.startsWith('http')) {
    return screenshotUrl;
  }
  
  // If it's base64, try to convert to Google Drive file
  if (screenshotUrl.startsWith('data:image/')) {
    try {
      return convertBase64ToGoogleDriveImage(screenshotUrl, orderNumber);
    } catch (error) {
      console.error('Failed to convert base64 to Drive file:', error);
      return 'Base64 image (conversion failed)';
    }
  }
  
  return screenshotUrl;
}

function convertBase64ToGoogleDriveImage(base64Data, orderNumber) {
  try {
    // Extract the image data and format
    const matches = base64Data.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 format');
    }
    
    const imageFormat = matches[1]; // jpeg, png, etc.
    const base64Image = matches[2];
    
    // Convert base64 to blob
    const binaryString = Utilities.base64Decode(base64Image);
    const blob = Utilities.newBlob(binaryString, `image/${imageFormat}`, `payment_${orderNumber}.${imageFormat}`);
    
    // Create or get the folder for payment screenshots
    let folder;
    try {
      folder = DriveApp.getFoldersByName('Mr Champaran Payment Screenshots').next();
    } catch (e) {
      folder = DriveApp.createFolder('Mr Champaran Payment Screenshots');
    }
    
    // Save the file to Google Drive
    const file = folder.createFile(blob);
    
    // Make the file publicly viewable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return the public URL
    return `https://drive.google.com/file/d/${file.getId}/view`;
    
  } catch (error) {
    console.error('Error converting base64 to Drive file:', error);
    throw error;
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
      'Grand Total', 'Payment Screenshot', 'Order Note', 'Timestamp', 'Order Status'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // Set column widths
    sheet.setColumnWidth(8, 300);
    sheet.setColumnWidth(12, 200);
  }
  
  console.log('✅ Setup complete');
  return 'Setup successful';
}

// Function to test base64 conversion
function testBase64Conversion() {
  // Test with a simple base64 image
  const testBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
  
  try {
    const result = convertBase64ToGoogleDriveImage(testBase64, "TEST123");
    console.log('✅ Test conversion successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Test conversion failed:', error);
    return error.toString();
  }
}
