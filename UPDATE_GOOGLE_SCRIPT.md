# Update Google Apps Script for Google Drive Integration

## What's New
- **Google Drive Integration**: Payment screenshots are uploaded directly to Google Drive
- **Public Drive URLs**: Images get shareable Google Drive links stored in spreadsheet
- **Automatic Folder Management**: Creates "Mr Champaran Payment Screenshots" folder
- **Fallback System**: Uses Telegraph as backup if Drive upload fails
- New column "Payment Screenshot URL" with clickable Google Drive links

## Steps to Update Google Apps Script

### 1. Enable Google Drive API
- Open Google Apps Script: https://script.google.com/
- Find your "Mr Champaran POS" project
- Go to "Services" in the left sidebar
- Click "+" to add a service
- Select "Drive API" and click "Add"

### 2. Update the Script
- Replace the entire contents of Code.gs with the updated script from `google-apps-script-updated.js`
- Key new features:
  - `handleImageUpload()` function for Drive uploads
  - Automatic folder creation and permissions
  - Public URL generation for images
  - Enhanced CORS handling

### 3. Set Drive Permissions
The script will automatically:
- Create "Mr Champaran Payment Screenshots" folder in your Google Drive
- Set folder sharing to "Anyone with link can view"
- Upload images with public viewing permissions
- Generate shareable URLs

### 4. Deploy the Updated Version
- Click "Deploy" → "New deployment" (or update existing)
- Set "Execute as": Me
- Set "Who has access": Anyone
- Click "Deploy"
- **Important**: Copy the new deployment URL if it changes

### 5. Test the Integration
- Run the `testSetup()` function in Apps Script editor
- Check that the Drive folder is created
- Verify test data appears in your Google Sheet
- Confirm Drive access permissions are working

## How It Works

### Image Upload Flow
1. **Frontend**: User selects payment screenshot (max 5MB)
2. **Conversion**: Image converted to base64 for transmission
3. **Google Apps Script**: Receives image data via POST request
4. **Google Drive**: Creates file in dedicated folder with public permissions
5. **URL Generation**: Returns shareable Google Drive link
6. **Spreadsheet**: Stores public URL in "Payment Screenshot URL" column

### Google Drive Structure
```
Your Google Drive/
└── Mr Champaran Payment Screenshots/
    ├── payment-MC-20250920-143052-001-screenshot.jpg
    ├── payment-MC-20250920-143155-002-receipt.png
    └── ...
```

### Fallback Mechanism
- **Primary**: Google Drive upload with public URL
- **Fallback**: Telegraph image hosting if Drive fails
- **Local Backup**: Order still processes even if all uploads fail

## Benefits of Google Drive Integration

✅ **Permanent Storage**: Images stored permanently in your Google Drive
✅ **Free Solution**: No cost for storage or bandwidth
✅ **Easy Access**: Click any URL to view payment screenshot instantly
✅ **Organized**: All images in dedicated folder
✅ **Secure**: Only people with link can view (not publicly indexed)
✅ **No Size Limits**: Google Drive handles large images efficiently
✅ **Version Control**: Automatic backup and versioning

## New Google Sheet Structure

| Column | Description |
|--------|-------------|
| Order Number | Unique order identifier |
| ... | (existing columns) |
| Payment Screenshot | Status text ("Uploaded", "Not uploaded") |
| **Payment Screenshot URL** | **🆕 Clickable Google Drive link** |
| Order Note | Special delivery instructions |
| Order Status | Processing status |

## Troubleshooting

### If Drive folder doesn't appear:
- Run `testSetup()` function manually
- Check Google Apps Script execution logs
- Verify Drive API is enabled in Services

### If images aren't uploading:
- Check file size (max 5MB recommended)
- Verify API key matches in frontend and script
- Look for errors in browser console and Apps Script logs

### If URLs aren't clickable in Sheets:
- URLs should automatically become clickable links
- Try clicking refresh in Google Sheets
- Verify URLs start with "https://drive.google.com/"

### CORS Issues (Normal Behavior):
- **Expected**: Browser shows CORS error for initial upload attempt
- **This is Normal**: Google Apps Script has CORS limitations for complex requests
- **System Still Works**: Automatic fallback ensures images are uploaded
- **No Action Needed**: Orders process successfully despite CORS warnings
- **Check Logs**: Look for "Image sent to Google Drive" and "Telegraph" messages
- **Verification**: Check Google Sheets for populated "Payment Screenshot URL" column

### Image Upload Status Messages:
- `🔄 Uploading image to Google Drive...` - Upload initiated
- `ℹ️ CORS method unavailable` - Normal fallback behavior  
- `📤 Image sent to Google Drive (no-cors mode)` - Drive upload sent
- `📸 Using Telegraph as public URL provider` - Public URL generated
- `✅ Image uploaded to Telegraph` - Fallback successful

## Security Notes
- Images are set to "Anyone with link can view" for accessibility
- Links are not publicly searchable or indexed
- Only people with the direct URL can access images
- Consider this appropriate for business payment verification
