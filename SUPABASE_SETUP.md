# Supabase Integration Setup Guide

## Overview
This guide will help you set up Supabase as the database backend for your Mr. Champaran POS system. Supabase provides:

- **PostgreSQL Database**: Store orders, customers, and product data
- **Real-time Features**: Live updates for order status changes
- **API Generation**: Automatic REST API from your database schema
- **Authentication**: User management (for future admin features)

## 🚀 Quick Setup

### 1. Supabase Project Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (if you haven't already)
3. Note down your:
   - **Project URL**: `https://akbzjwkkcvcdvzwpcddq.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Database Schema Setup

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create all tables and indexes

### 3. Environment Variables Setup

The environment variables are already configured in your `.env.local` file:

```bash
VITE_SUPABASE_URL=https://akbzjwkkcvcdvzwpcddq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Vercel Production Setup

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

- `VITE_SUPABASE_URL`: `https://akbzjwkkcvcdvzwpcddq.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📊 Database Tables Created

### 1. `orders` Table
Stores main order information:
- Customer details (name, phone, address)
- Order totals (subtotal, discount, delivery, grand total)
- Payment information
- Order status and notes

### 2. `order_items` Table
Stores individual line items for each order:
- Product details (name, variant, size, SKU)
- Quantity and pricing
- Linked to orders via foreign key

### 3. `products` Table (Future Use)
Master product catalog for admin management

### 4. `product_variants` & `product_sizes` Tables
For advanced product management features

## 🔄 Integration Points

### Current Google Sheets Integration
- **Maintained**: Your current Google Apps Script continues to work
- **Enhanced**: Now also saves to Supabase for better data management
- **Backup**: Supabase acts as a reliable backup to Google Sheets

### Payment Screenshot Handling
- **Vercel Storage**: Images uploaded and compressed
- **Supabase**: Image URLs stored in `payment_screenshot_url` field
- **Google Sheets**: Receives the same image URLs

## 📈 Benefits Added

### 1. **Reliable Data Storage**
- PostgreSQL backend with automatic backups
- No more worries about Google Sheets API limits
- ACID transactions ensure data consistency

### 2. **Advanced Querying**
```typescript
// Get orders by status
const pendingOrders = await orderService.getOrdersByStatus('Pending')

// Get recent orders
const recentOrders = await orderService.getRecentOrders(7) // Last 7 days

// Get specific order
const order = await orderService.getOrderByNumber('MC-20241122-143052-001')
```

### 3. **Real-time Updates**
```typescript
// Subscribe to order changes (future feature)
supabase
  .channel('orders')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
    (payload) => {
      console.log('Order updated:', payload)
    }
  )
  .subscribe()
```

### 4. **Admin Dashboard Ready**
- All data structures in place for future admin features
- Order management, status updates, analytics
- Product catalog management

## 🔧 Code Changes Made

### 1. New Files Added:
- `src/lib/supabase.ts` - Supabase client configuration
- `src/services/orderService.ts` - Database operations
- `src/vite-env.d.ts` - TypeScript environment types
- `supabase-schema.sql` - Database schema

### 2. Updated Files:
- `.env.local` - Added Supabase credentials
- `.env.example` - Updated with Supabase variables
- `package.json` - Added @supabase/supabase-js dependency

## 🧪 Testing the Integration

### 1. Verify Connection
```typescript
import { supabase } from './src/lib/supabase'

// Test connection
const { data, error } = await supabase.from('orders').select('count')
console.log('Supabase connected:', data, error)
```

### 2. Test Order Creation
Place a test order through your POS system and verify:
1. Order appears in Supabase `orders` table
2. Order items appear in `order_items` table
3. Google Sheets still receives the data
4. Payment screenshot URL is stored

## 🔄 Migration Strategy

### Phase 1: Dual Writing (Current)
- All new orders saved to both Google Sheets AND Supabase
- Existing functionality unchanged
- Supabase as backup/enhancement

### Phase 2: Supabase Primary (Future)
- Use Supabase as primary data source
- Google Sheets for reporting/compatibility
- Advanced features like real-time updates

### Phase 3: Full Migration (Optional)
- Migrate historical data from Google Sheets to Supabase
- Advanced admin dashboard
- Analytics and reporting features

## 🛡️ Security Notes

### Row Level Security (RLS)
Currently disabled for development. For production:
1. Enable RLS on all tables
2. Create appropriate policies
3. Add authentication if needed

### Environment Variables
- Use VITE_ prefix for client-side variables
- Store sensitive keys in Vercel environment settings
- Never commit actual credentials to git

## 📞 Support

The integration is designed to be:
- **Non-breaking**: Existing functionality preserved
- **Progressive**: Add features gradually
- **Reliable**: Multiple backup systems

Your POS system now has enterprise-grade database backing while maintaining all existing Google Sheets functionality!

## 🚀 Next Steps

1. Run the schema in Supabase SQL Editor
2. Test a new order to verify dual-writing
3. Explore the Supabase dashboard to see your data
4. Plan for advanced features like admin dashboard

The foundation is now set for powerful features like real-time order tracking, advanced analytics, and comprehensive admin management!
