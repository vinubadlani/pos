-- Supabase Database Schema for Mr. Champaran POS System
-- Run these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security (RLS) on all tables
-- For development, we'll disable RLS, but enable it for production

-- 0. Create Storage Bucket for Payment Screenshots
-- This needs to be done in the Supabase Dashboard under Storage, but here's the SQL equivalent:
-- Navigate to Storage in Supabase Dashboard and create a bucket named 'payment-screenshots'
-- Or run this in SQL Editor if you have admin access:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Authenticated users can upload payment screenshots"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Users can update their own payment screenshots"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Users can delete their own payment screenshots"  
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'payment-screenshots');

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  tl_name VARCHAR(255) NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(100) NOT NULL DEFAULT 'Payment Screenshot',
  payment_screenshot_url TEXT,
  order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  order_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_variant VARCHAR(255) NOT NULL,
  size VARCHAR(50) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Products Table (for future product management)
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('sweet', 'namkeen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Product Sizes Table
CREATE TABLE IF NOT EXISTS product_sizes (
  id BIGSERIAL PRIMARY KEY,
  variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);
CREATE INDEX IF NOT EXISTS idx_product_sizes_sku ON product_sizes(sku);

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_product_sizes_updated_at BEFORE UPDATE ON product_sizes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 9. Enable Row Level Security (RLS) - For Production
-- For development/testing, you might want to disable RLS temporarily
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies (uncomment for production)
-- For now, we'll allow all operations for development

-- Allow all operations on orders table
-- CREATE POLICY "Allow all operations on orders" ON orders
--   FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on order_items table
-- CREATE POLICY "Allow all operations on order_items" ON order_items
--   FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on products table
-- CREATE POLICY "Allow all operations on products" ON products
--   FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on product_variants table
-- CREATE POLICY "Allow all operations on product_variants" ON product_variants
--   FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on product_sizes table
-- CREATE POLICY "Allow all operations on product_sizes" ON product_sizes
--   FOR ALL USING (true) WITH CHECK (true);

-- 11. Insert sample data (optional)
-- This will populate the products table with your current catalog

INSERT INTO products (name, category) VALUES
  ('The-Cookies Thekua', 'sweet'),
  ('Shakarpara', 'sweet'),
  ('Gaja', 'sweet'),
  ('Anarsa', 'sweet'),
  ('Khaja', 'sweet'),
  ('Lai', 'sweet'),
  ('Namakpara', 'namkeen'),
  ('Dalmoth', 'namkeen'),
  ('Chanachur', 'namkeen'),
  ('Healthy Mixture', 'namkeen')
ON CONFLICT DO NOTHING;

-- Insert sample product variants (you can expand this based on your current catalog)
-- This is just a basic example - you'll want to add all your variants

-- Thekua variants
INSERT INTO product_variants (product_id, name) 
SELECT id, 'Shudh Desi Ghee Theukua' FROM products WHERE name = 'The-Cookies Thekua'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, name) 
SELECT id, 'Refined Oil Aata Thekua' FROM products WHERE name = 'The-Cookies Thekua'
ON CONFLICT DO NOTHING;

-- Note: You'll need to complete the variant and size insertions based on your full catalog
-- Or you can populate this data through your application's admin interface
