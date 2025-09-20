# 🚀 Deployment Instructions for Google Apps Script

## Current CORS Error
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'http://localhost:3001' has been blocked by CORS policy
```

This happens because the Google Apps Script needs to be re-deployed with the updated CORS headers.

## Step-by-Step Fix

### 1. Open Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Open your existing project "Mr Champaran POS API"

### 2. Replace the Code
1. Delete all existing code in the script editor
2. Copy the entire contents of `google-apps-script-updated.js` 
3. Paste it into the script editor

### 3. Update Configuration
Make sure these values are correct:
```javascript
const SPREADSHEET_ID = '1UsZOYFd3I568Yff-MFyGhUfC4bzmfMae05jM9bIc72Y';
const API_KEY = 'L9h8sF2kd93XyPzQwErT7UvBnM4cJ1oZ5y';
```

### 4. Save and Deploy
1. Click "Save" (Ctrl+S)
2. Click "Deploy" → "New deployment"
3. Set configuration:
   - **Type**: Web app
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click "Deploy"
5. **IMPORTANT**: Copy the new Web app URL

### 5. Test the Deployment
The new URL should look like:
```
https://script.google.com/macros/s/AKfycbz[NEW_ID]/exec
```

### 6. Update Frontend (if URL changed)
If you got a new URL, update it in your code:
```javascript
// In CheckoutPage.tsx, around line 20
const GAS_WEBAPP_URL = 'YOUR_NEW_URL_HERE';
```

## Verification Steps

### Test CORS Headers
```bash
curl -X OPTIONS "YOUR_GOOGLE_APPS_SCRIPT_URL" \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

You should see these headers in the response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### Test Order Submission
1. Open your app at http://localhost:3002
2. Add items to cart
3. Go to checkout
4. Fill the form and submit
5. Check the Google Sheet for new data

## Common Issues

### Issue 1: Still getting CORS errors
**Solution**: Make sure you deployed as "Web app" not "Library" or "Add-on"

### Issue 2: "Unauthorized" error
**Solution**: Check that the API_KEY in the script matches what's being sent

### Issue 3: "Script not found"
**Solution**: Make sure the Web app is deployed with "Anyone" access, not "Anyone with Google account"

### Issue 4: Sheet not found
**Solution**: Make sure the SPREADSHEET_ID is correct and the sheet exists

## Success Indicators
✅ No CORS errors in browser console  
✅ Orders appear in Google Sheet  
✅ HTTP status 200 responses  
✅ Success message in app  

---

**Need help?** Check the browser Network tab for detailed error messages.
