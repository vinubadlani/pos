# Mr Champaran — Mahila Uday Bazaar POS System

A modern, mobile-optimized Point of Sale system for field agents selling sweet and namkeen products.

## 🚀 Live Demo
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mr-champaran-pos)

## ✨ Features

- **📱 Mobile-First Design** - Optimized for field agents using phones/tablets
- **🛒 Multi-Item Cart** - Add multiple products with variants
- **📸 Payment Screenshots** - Instant image upload with base64 processing
- **📊 Google Sheets Integration** - Automatic order submission
- **💾 Offline Support** - Local backup and admin recovery panel
- **⚡ Lightning Fast** - Optimized for Vercel deployment

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS3 with mobile-responsive design
- **Backend**: Google Apps Script
- **Deployment**: Vercel (recommended)
- **Storage**: Google Sheets + localStorage backup

## 🚀 Quick Deploy to Vercel

1. **Clone & Push to GitHub**
   ```bash
   git clone YOUR_REPO_URL
   cd mr-champaran-pos
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub
   - Deploy instantly!

## 📊 Google Sheets Format

The system automatically creates a sheet with these exact headers:

```
Timestamp | OrderNumber | CustomerName | Address | Pincode | Contact | TLName | MemberName | ProductName | Variant | Size | SKU | UnitPrice | Qty | LineTotal | Subtotal | Delivery | GrandTotal | PaymentScreenshotUrl | RawPayload
```

Each order creates one row per item, so a 3-item order will create 3 rows.

## 🧪 Testing

### Test Order Submission

1. **Frontend Testing:**
   ```javascript
   // Open browser console on the app
   // Add items to cart and proceed to checkout
   // Fill form and submit - check localStorage for orders
   console.log(JSON.parse(localStorage.getItem('orders')));
   ```

2. **Google Apps Script Testing:**
   - Use the `testSetup()` function in Apps Script editor
   - Check the execution log for success/error messages
   - Verify data appears in the Google Sheet

3. **API Testing:**
   ```bash
   # Test serverless endpoint
   curl -X POST https://your-app.vercel.app/api/submit-order \
     -H "Content-Type: application/json" \
     -d '{
       "orderNumber": "MC-20250920-153000-001",
       "customerName": "Test Customer",
       "address": "Test Address",
       "pincode": "800001",
       "contact": "9123456789",
       "tlName": "Test TL",
       "memberName": "Test Member",
       "subtotal": 520,
       "delivery": 100,
       "grandTotal": 620,
       "items": [
         {
           "productName": "Thekua",
           "variant": "Shahi Thekua",
           "size": "200g",
           "sku": "THEKUA-SHAHI-200",
           "unitPrice": 150,
           "qty": 2,
           "lineTotal": 300
         }
       ]
     }'
   ```

## 🛠 Project Structure

```
mr-champaran-pos/
├── src/
│   ├── components/
│   │   ├── CheckoutPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── ProductsPage.tsx
│   │   └── InvoicePage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── api/
│   └── submit-order.js        # Serverless function
├── google-apps-script.js      # Google Apps Script code
├── package.json
├── vite.config.ts
└── README.md
```

## 📱 Product Catalog

### Sweets (🍯)
- **Thekua**
  - Shahi Thekua (200g: ₹150, 500g: ₹350, 1kg: ₹650)
  - Suji Maida Thekua (200g: ₹120, 500g: ₹280, 1kg: ₹520)
  - Shudh Desi Ghee Thekua (200g: ₹140, 500g: ₹320, 1kg: ₹600)
- **Gaja**
  - Authentic GAJA (200g: ₹160, 500g: ₹380, 1kg: ₹720)

### Namkeen (🥨)
- **Namakpara**
  - Classic Namakpara (200g: ₹80, 500g: ₹190, 1kg: ₹360)
  - Spicy Namakpara (200g: ₹85, 500g: ₹200, 1kg: ₹380)
- **Murukku**
  - Traditional Murukku (200g: ₹90, 500g: ₹210, 1kg: ₹400)

## 🔧 Configuration

### Delivery Rules
- **Free delivery:** Orders ≥ ₹1000
- **Delivery fee:** ₹100 for orders < ₹1000
- Configurable in the app settings

### Order Number Format
- Pattern: `MC-YYYYMMDD-HHMMSS-xxx`
- Example: `MC-20250920-153045-001`

### Validation Rules
- **Pincode:** Exactly 6 digits
- **Contact:** Exactly 10 digits
- **Required fields:** Customer name, address, pincode, contact, TL name, member name
- **Cart:** Must contain at least 1 item

## 🔒 Security Features

- **API Key Protection:** Hidden from frontend via serverless proxy
- **Input Validation:** Both frontend and backend validation
- **CORS Configuration:** Properly configured for cross-origin requests
- **Error Handling:** Comprehensive error messages and logging
- **Retry Logic:** Exponential backoff for network requests

## 📈 Monitoring & Analytics

### Available Metrics
- Daily order count and revenue
- Product performance by category
- TL and member performance
- Geographic distribution by pincode
- Average order value

### Data Export
- Orders can be exported as CSV from Google Sheets
- Raw order data stored in RawPayload column for complex analysis

## 🎨 Customization

### Branding
- Update colors in `src/index.css` (primary color: `#ff6b35`)
- Replace logo/brand text in navigation components
- Customize mission statement in Dashboard

### Product Catalog
- Modify product data in `src/App.tsx`
- Add new categories, variants, or sizes
- Update SKU patterns and pricing

### Business Logic
- Adjust delivery rules in cart calculation
- Modify order number format
- Add new validation rules

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Various Platforms

#### GitHub Pages
```bash
npm run build
# Upload dist/ folder to gh-pages branch
```

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

#### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
# Configure CloudFront distribution
```

## 📞 Support & Contributing

### Common Issues
1. **Orders not saving to Google Sheets**
   - Check API key configuration
   - Verify Google Apps Script deployment
   - Check browser network tab for errors

2. **Images not uploading**
   - Currently uses blob URLs for demo
   - Implement cloud storage (Drive/S3) for production

3. **Mobile layout issues**
   - Test on various devices
   - Use browser developer tools for debugging

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### License
This project is licensed under the MIT License.

---

**Built with ❤️ for women entrepreneurs in Bihar**
# bihar
