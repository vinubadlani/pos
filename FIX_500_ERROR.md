# 🔧 Quick Fix for 500 Error - Service Account Setup

## The Problem
You're getting a 500 error because the Vercel environment variable `GOOGLE_SA_KEY` is not configured with valid service account credentials.

## ⚡ Quick Solution (5 minutes)

### Step 1: Create Service Account
1. **Go to Google Cloud Console**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=total-array-472709-t4

2. **Click "Create Service Account"**
   - Name: `pos-drive-uploader`
   - ID: `pos-drive-uploader` 
   - Description: `Service account for POS system uploads`

3. **Skip roles for now** (click "Continue" then "Done")

### Step 2: Create and Download Key
1. **Click on the service account** you just created
2. **Go to "Keys" tab**
3. **Click "Add Key" → "Create new key"**
4. **Select "JSON"** and click "Create"
5. **Download the JSON file** (save as `service-account.json`)

### Step 3: Enable Google Drive API
1. **Go to**: https://console.cloud.google.com/apis/library/drive.googleapis.com?project=total-array-472709-t4
2. **Click "Enable"**

### Step 4: Share Drive Folder
1. **Open your folder**: https://drive.google.com/drive/folders/1baKgd52mtYjRyvmTziIoJrzysMRhLU_U
2. **Click "Share"**
3. **Add the service account email**: `pos-drive-uploader@total-array-472709-t4.iam.gserviceaccount.com`
4. **Set permission to "Editor"**
5. **Click "Send"**

### Step 5: Configure Vercel Environment Variable
1. **Go to Vercel Dashboard**: https://vercel.com/vinubadlanis-projects/pos/settings/environment-variables
2. **Add new environment variable**:
   - **Name**: `GOOGLE_SA_KEY`
   - **Value**: Copy the ENTIRE contents of the downloaded JSON file (as one line, no spaces)
   - **Environments**: Select "Production" and "Preview"
3. **Click "Save"**

### Step 6: Redeploy
```bash
npx vercel --prod
```

### Step 7: Test
Open: https://pos-f5ym7cy9p-vinubadlanis-projects.vercel.app/google-drive-tester.html

## 🎯 JSON Format Example
Your service account JSON should look like this (replace with your actual values):
```json
{
  "type": "service_account",
  "project_id": "total-array-472709-t4",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "pos-drive-uploader@total-array-472709-t4.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/pos-drive-uploader%40total-array-472709-t4.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

## ⚠️ Important Notes:
- Copy the JSON as ONE LINE (no line breaks) into Vercel
- Don't include any extra quotes or spaces
- Make sure the Drive folder is shared with the service account email
- After adding the environment variable, you MUST redeploy

## 🔍 Verification:
After setup, the 500 error should be gone and you'll see successful uploads in your Drive folder!
