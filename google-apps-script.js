/**
 * Google Apps Script for Mr Champaran POS System
 * This script receives order data from the frontend and saves it to Google Sheets
 */

// Configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const SHEET_NAME = 'Orders'; // Name of the sheet tab

// Headers for the Google Sheet (exact order as specified in requirements)
const HEADERS = [
  'Timestamp',
  'OrderNumber', 
  'CustomerName',
  'Address',
  'Pincode',
  'Contact',
  'TLName',
  'MemberName',
  'ProductName',
  'Variant',
  'Size',
  'SKU',
  'UnitPrice',
  'Qty',
  'LineTotal',
  'Subtotal',
  'Delivery',
  'GrandTotal',
  'PaymentScreenshotUrl',
  'RawPayload'
];

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  try {
    // Parse the request
    const data = JSON.parse(e.postData.contents);
    
    // Validate API key
    if (!data.apiKey || data.apiKey !== API_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          ok: false, 
          error: 'Unauthorized: Invalid API key' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validate required fields
    const validationError = validateOrderData(data);
    if (validationError) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          ok: false, 
          error: validationError 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the spreadsheet
    const sheet = getOrCreateSheet();
    
    // Add order to sheet (one row per item)
    const rowsAdded = addOrderToSheet(sheet, data);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        ok: true, 
        rows: rowsAdded,
        orderNumber: data.orderNumber,
        message: `Order ${data.orderNumber} saved successfully with ${rowsAdded} items`
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing order:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        ok: false, 
        error: 'Internal server error: ' + error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Validate the incoming order data
 */
function validateOrderData(data) {
  // Check required fields
  if (!data.orderNumber) return 'OrderNumber is required';
  if (!data.customerName) return 'CustomerName is required';
  if (!data.address) return 'Address is required';
  if (!data.pincode) return 'Pincode is required';
  if (!data.contact) return 'Contact is required';
  if (!data.tlName) return 'TLName is required';
  if (!data.memberName) return 'MemberName is required';
  
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
  
  // Validate each item
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.productName) return `Item ${i + 1}: productName is required`;
    if (!item.size) return `Item ${i + 1}: size is required`;
    if (!item.sku) return `Item ${i + 1}: sku is required`;
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      return `Item ${i + 1}: unitPrice must be a non-negative number`;
    }
    if (!Number.isInteger(item.qty) || item.qty < 1) {
      return `Item ${i + 1}: qty must be a positive integer`;
    }
  }
  
  return null; // No validation errors
}

/**
 * Get or create the Orders sheet
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create new sheet
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    // Add headers
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    
    // Freeze header row
    sheet.setFrozenRows(1);
  } else {
    // Check if headers exist, if not add them
    const existingHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (existingHeaders[0] !== HEADERS[0]) {
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
      
      // Freeze header row
      sheet.setFrozenRows(1);
    }
  }
  
  return sheet;
}

/**
 * Add order data to the sheet (one row per item)
 */
function addOrderToSheet(sheet, data) {
  const timestamp = new Date().toISOString();
  const rawPayload = JSON.stringify(data);
  
  const rows = [];
  
  // Create one row for each item in the order
  data.items.forEach(item => {
    const row = [
      timestamp,
      data.orderNumber,
      data.customerName,
      data.address,
      data.pincode,
      data.contact,
      data.tlName,
      data.memberName,
      item.productName,
      item.variant || '',
      item.size,
      item.sku,
      item.unitPrice,
      item.qty,
      item.lineTotal,
      data.subtotal,
      data.delivery,
      data.grandTotal,
      data.paymentScreenshotUrl || '',
      rawPayload
    ];
    rows.push(row);
  });
  
  // Add all rows to the sheet at once
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, HEADERS.length).setValues(rows);
  
  return rows.length;
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Mr Champaran POS API is running',
      timestamp: new Date().toISOString(),
      headers: HEADERS
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to validate the setup
 */
function testSetup() {
  console.log('Testing Google Apps Script setup...');
  
  // Test sample data
  const sampleData = {
    apiKey: API_KEY,
    orderNumber: 'MC-20250920-153000-001',
    customerName: 'Test Customer',
    address: 'Test Address, Bihar',
    pincode: '845401',
    contact: '9876543210',
    tlName: 'Test TL',
    memberName: 'Test Member',
    subtotal: 520,
    delivery: 100,
    grandTotal: 620,
    paymentScreenshotUrl: '',
    items: [
      {
        productName: 'Thekua',
        variant: 'Shudh Desi Ghee Thekua',
        size: '200g',
        sku: 'THEKUA-GHEE-200',
        unitPrice: 140,
        qty: 2,
        lineTotal: 280
      },
      {
        productName: 'Gaja',
        variant: 'Authentic GAJA',
        size: '500g',
        sku: 'GAJA-AUTH-500',
        unitPrice: 240,
        qty: 1,
        lineTotal: 240
      }
    ]
  };
  
  // Simulate the doPost function
  const e = {
    postData: {
      contents: JSON.stringify(sampleData)
    }
  };
  
  const response = doPost(e);
  console.log('Test response:', response.getContent());
}

/**
 * Clear all data from the Orders sheet (use with caution!)
 */
function clearOrdersSheet() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
    console.log(`Cleared ${lastRow - 1} rows from ${SHEET_NAME} sheet`);
  } else {
    console.log('No data rows to clear');
  }
}
