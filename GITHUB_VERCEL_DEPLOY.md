# 🚀 GitHub & Vercel Deployment Instructions

## Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `mr-champaran-pos`
3. **Description**: `Mobile-optimized POS system for Mr Champaran Mahila Uday Bazaar`
4. **Visibility**: Public ✅
5. **Initialize**: Do NOT check any boxes (we have files ready)
6. **Click**: "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you these commands. Run them in your terminal:

```bash
# Add the GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mr-champaran-pos.git

# Rename branch to main (recommended)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Connect GitHub to Vercel (Recommended)
1. **Go to**: https://vercel.com
2. **Click**: "New Project"
3. **Import**: Select your `mr-champaran-pos` repository
4. **Configure**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Click**: "Deploy"

### Option B: Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy from project directory
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N  
# - Project name: mr-champaran-pos
# - Directory: ./
# - Auto-detect settings? Y
```

## Step 4: Update Google Apps Script

After Vercel deployment, you'll get a URL like: `https://mr-champaran-pos.vercel.app`

1. **Open**: https://script.google.com/
2. **Find**: Your "Mr Champaran POS" project
3. **Replace**: All code with content from `google-apps-script-vercel.js`
4. **Deploy**: "Deploy" → "New deployment"
5. **Copy**: The deployment URL

## Step 5: Test Your Live Application

1. **Visit**: Your Vercel URL
2. **Test**: 
   - Add products to cart
   - Fill checkout form
   - Upload payment screenshot
   - Submit order
3. **Verify**: Check Google Sheets for new order

## 🎉 Success! Your POS is Live

Your Mr Champaran POS system is now:
- ✅ Live on Vercel with global CDN
- ✅ Mobile-optimized for field agents
- ✅ Connected to Google Sheets
- ✅ Ready for production use

## 📱 Share with Field Agents

Send them the Vercel URL: `https://mr-champaran-pos.vercel.app`

They can even add it to their phone's home screen as a PWA!

## 🔧 Need Help?

- **Vercel Issues**: Check build logs in Vercel dashboard
- **Google Sheets**: Verify Apps Script deployment URL
- **Mobile Testing**: Use browser dev tools or real devices
- **Admin Panel**: Visit `/admin/images` for local image recovery
