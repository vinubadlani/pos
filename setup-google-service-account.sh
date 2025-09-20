#!/bin/bash

# Google Cloud Service Account Setup Script
echo "🚀 Setting up Google Cloud Service Account for POS System"
echo "Project ID: total-array-472709-t4"
echo "Project Number: 519148593843"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "📋 Make sure you're logged in and have the correct project selected:"
echo "   gcloud auth login"
echo "   gcloud config set project total-array-472709-t4"
echo ""

read -p "Press Enter to continue or Ctrl+C to stop..."

# Set project
echo "🔧 Setting project..."
gcloud config set project total-array-472709-t4

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable drive.googleapis.com
gcloud services enable sheets.googleapis.com

# Create service account
echo "👤 Creating service account..."
gcloud iam service-accounts create pos-drive-uploader \
    --display-name="POS Drive Uploader" \
    --description="Service account for POS system to upload images to Google Drive"

# Get service account email
SERVICE_ACCOUNT_EMAIL="pos-drive-uploader@total-array-472709-t4.iam.gserviceaccount.com"
echo "📧 Service account email: $SERVICE_ACCOUNT_EMAIL"

# Create and download key
echo "🔑 Creating JSON key..."
gcloud iam service-accounts keys create ./pos-service-account.json \
    --iam-account="$SERVICE_ACCOUNT_EMAIL"

echo ""
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. 📁 Share your Google Drive folder with this email:"
echo "   $SERVICE_ACCOUNT_EMAIL"
echo "   Give it 'Editor' permissions"
echo ""
echo "2. 📋 Copy the contents of pos-service-account.json"
echo "   Minify it and add to .env.local as GOOGLE_SA_KEY"
echo ""
echo "3. 🚀 Deploy to Vercel with the environment variable"
echo ""
echo "4. 🧪 Test using google-drive-tester.html"
echo ""
echo "Your service account JSON file: ./pos-service-account.json"
