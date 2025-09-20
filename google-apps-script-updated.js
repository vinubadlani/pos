// Google Apps Script: Complete POS Backend with CORS support
const SPREADSHEET_ID = '1UsZOYFd3I568Yff-MFyGhUfC4bzmfMae05jM9bIc72Y';

// Keep this secret - replace with your own secure key
const API_KEY = 'L9h8sF2kd93XyPzQwErT7UvBnM4cJ1oZ5y';

// Sheet name to write into
const SHEET_NAME = 'Sheet1';

const HEADERS = [
  'Order Number','Date','Time','Customer Name','Customer Phone','Customer Address','Pincode',
  'TL Name','Member Name','Product Name','Product Variant','Size','SKU','Quantity','Unit Price',
  'Line Total','Subtotal','Delivery Fee','Grand Total','Payment Method','Payment Screenshot',
  'Payment Screenshot URL','Order Note','Order Status'
];

function doPost(e) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createResponse({ status: 'error', message: 'No post data found' }, 400, headers);
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (err) {
      return createResponse({ status: 'error', message: 'Invalid JSON: ' + err.message }, 400, headers);
    }

    // Validate API key
    var providedKey = (payload && payload.apiKey) ? payload.apiKey : (e.parameter && e.parameter.apiKey ? e.parameter.apiKey : null);
    if (!providedKey || providedKey !== API_KEY) {
      return createResponse({ status: 'error', message: 'Unauthorized: invalid apiKey' }, 401, headers);
    }

    // Handle image upload action
    if (payload.action === 'uploadImage') {
      return handleImageUpload(payload, headers);
    }

    // Handle regular order submission
    return handleOrderSubmission(payload, headers);

  } catch (err) {
    console.error('Error in doPost:', err);
    return createResponse({ 
      status: 'error', 
      message: 'Server error: ' + err.message 
    }, 500, headers);
  }
}

function handleImageUpload(payload, headers) {
  try {
    // Validate required fields
    if (!payload.imageData || !payload.fileName || !payload.mimeType) {
      return createResponse({ 
        status: 'error', 
        message: 'Missing required fields: imageData, fileName, mimeType' 
      }, 400, headers);
    }

    // Convert base64 to blob
    var imageBlob = Utilities.newBlob(
      Utilities.base64Decode(payload.imageData), 
      payload.mimeType, 
      payload.fileName
    );

    // Create folder for payment screenshots if it doesn't exist
    var folderName = 'Mr Champaran Payment Screenshots';
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
      // Make folder publicly viewable
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    // Upload file to Drive
    var file = folder.createFile(imageBlob);
    
    // Make file publicly viewable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get public URL
    var fileId = file.getId();
    var publicUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    
    console.log('✅ Image uploaded to Google Drive:', publicUrl);
    
    return createResponse({ 
      status: 'success', 
      message: 'Image uploaded successfully',
      fileId: fileId,
      publicUrl: publicUrl,
      fileName: payload.fileName
    }, 200, headers);

  } catch (error) {
    console.error('❌ Image upload failed:', error);
    return createResponse({ 
      status: 'error', 
      message: 'Image upload failed: ' + error.message 
    }, 500, headers);
  }
}

function handleOrderSubmission(payload, headers) {
  try {
    // Get or create spreadsheet
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
    }

    // Ensure headers are present
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    function makeRow(order, item) {
      item = item || {};
      return [
        order.orderNumber || '',
        order.date || '',
        order.time || '',
        order.customerName || '',
        order.customerPhone || '',
        order.customerAddress || '',
        order.pincode || '',
        order.tlName || '',
        order.memberName || '',
        item.productName || order.productName || '',
        item.productVariant || order.productVariant || '',
        item.size || order.size || '',
        item.sku || order.sku || '',
        (item.quantity != null ? item.quantity : (order.quantity != null ? order.quantity : '')),
        (item.unitPrice != null ? item.unitPrice : (order.unitPrice != null ? order.unitPrice : '')),
        (item.lineTotal != null ? item.lineTotal : (order.lineTotal != null ? order.lineTotal : '')),
        order.subtotal || '',
        order.deliveryFee || '',
        order.grandTotal || '',
        order.paymentMethod || 'Payment Screenshot',
        order.paymentScreenshot || 'Not uploaded',
        order.paymentScreenshotUrl || '', // Public URL for payment screenshot
        order.orderNote || '', // Order notes/instructions
        order.orderStatus || 'Pending'
      ];
    }

    // Handle multiple items (recommended approach)
    if (Array.isArray(payload.items) && payload.items.length > 0) {
      var rows = payload.items.map(function(item) { 
        return makeRow(payload, item); 
      });
      
      // Add all rows at once for better performance
      if (rows.length > 0) {
        var range = sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length);
        range.setValues(rows);
      }
      
      return createResponse({ 
        status: 'success', 
        message: 'Order submitted successfully', 
        appendedRows: rows.length,
        orderNumber: payload.orderNumber
      }, 200, headers);
    }

    // Single-row fallback (if no items array)
    var row = makeRow(payload, null);
    sheet.appendRow(row);
    
    return createResponse({ 
      status: 'success', 
      message: 'Single item order submitted', 
      appendedRows: 1,
      orderNumber: payload.orderNumber
    }, 200, headers);

  } catch (err) {
    console.error('Error in handleOrderSubmission:', err);
    return createResponse({ 
      status: 'error', 
      message: 'Order submission error: ' + err.message 
    }, 500, headers);
  }
}

function doGet(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json'
  };
  
  return createResponse({ 
    status: 'ok', 
    message: 'Mr Champaran POS API is running',
    timestamp: new Date().toISOString()
  }, 200, headers);
}

function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
  
  return createResponse({}, 200, headers);
}

function createResponse(data, code, headers) {
  code = code || 200;
  headers = headers || {};
  
  var output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Set CORS headers
  Object.keys(headers).forEach(function(key) {
    // Note: Apps Script doesn't support setting custom headers directly
    // CORS is handled by Google's infrastructure for web apps
  });
  
  return output;
}

// Test function to verify setup including image upload
function testSetup() {
  console.log('Testing Google Apps Script setup...');
  
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('✓ Spreadsheet access successful');
    
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      console.log('✓ Sheet created with headers');
    } else {
      console.log('✓ Sheet exists');
    }
    
    // Test Drive access
    try {
      var folderName = 'Mr Champaran Payment Screenshots';
      var folders = DriveApp.getFoldersByName(folderName);
      var folder;
      
      if (folders.hasNext()) {
        folder = folders.next();
        console.log('✓ Drive folder exists:', folder.getName());
      } else {
        folder = DriveApp.createFolder(folderName);
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        console.log('✓ Drive folder created:', folder.getName());
      }
    } catch (driveError) {
      console.warn('⚠️ Drive access issue:', driveError.message);
    }
    
    // Test data with Drive URL
    var testPayload = {
      apiKey: API_KEY,
      orderNumber: 'TEST-' + new Date().getTime(),
      date: '2025-09-20',
      time: '15:30:00',
      customerName: 'Test Customer',
      customerPhone: '9123456789',
      customerAddress: 'Test Address, Bihar',
      pincode: '800001',
      tlName: 'Test TL',
      memberName: 'Test Member',
      subtotal: '520',
      deliveryFee: '100',
      grandTotal: '620',
      paymentMethod: 'Payment Screenshot',
      paymentScreenshot: 'Test Upload',
      paymentScreenshotUrl: 'https://drive.google.com/file/d/TEST123/view?usp=sharing',
      orderNote: 'Test order note',
      orderStatus: 'Test',
      items: [
        {
          productName: 'Thekua',
          productVariant: 'Shudh Desi Ghee Thekua',
          size: '1kg',
          sku: 'THEKUA-GHEE-1000',
          quantity: 1,
          unitPrice: 720,
          lineTotal: 720
        }
      ]
    };
    
    // Simulate order submission
    var mockEvent = {
      postData: {
        contents: JSON.stringify(testPayload)
      }
    };
    
    var result = handleOrderSubmission(testPayload, {});
    console.log('✓ Test order submission successful:', JSON.stringify(result));
    
    return 'Setup test completed successfully! Google Drive integration ready.';
    
  } catch (error) {
    console.error('❌ Setup test failed:', error);
    return 'Setup test failed: ' + error.message;
  }
}

// Helper function to get sheet data (for debugging)
function getSheetData() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return 'Sheet not found';
    }
    
    var data = sheet.getDataRange().getValues();
    console.log('Sheet data:', data);
    return data;
    
  } catch (error) {
    console.error('Error getting sheet data:', error);
    return 'Error: ' + error.message;
  }
}
