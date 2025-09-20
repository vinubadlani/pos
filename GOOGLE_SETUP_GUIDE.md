# Google Cloud Service Account Setup Guide

## Step 1: Create Service Account

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select your project: **total-array-472709-t4** (Project ID)
3. Navigate to: IAM & Admin > Service Accounts
4. Click "Create Service Account"

## Step 2: Configure Service Account

**Service Account Details:**
- Name: `pos-drive-uploader`
- Description: `Service account for POS system to upload images to Google Drive`

## Step 3: Generate JSON Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Download the JSON file

## Step 4: Enable APIs

Make sure these APIs are enabled in your project:
- Google Drive API
- Google Sheets API (if using sheets integration)

## Step 5: Share Drive Folder

1. Open your Google Drive folder: 
   https://drive.google.com/drive/folders/1baKgd52mtYjRyvmTziIoJrzysMRhLU_U
2. Click "Share"
3. Add the service account email (from the JSON file)
4. Give it "Editor" permissions

## Step 6: Environment Configuration

Copy the JSON content and minify it (remove spaces/newlines), then add to .env.local:
```
GOOGLE_SA_KEY={"type":"service_account","project_id":"total-array-472709-t4",...}
```

## Your Project Info:
- Project Number: 519148593843
- Project ID: total-array-472709-t4
- OAuth Client ID: [REDACTED - Available in your Google Cloud Console]
- OAuth Client Secret: [REDACTED - Available in your Google Cloud Console]

Note: The OAuth credentials above are for user authentication, not service accounts.
