import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Order {
  id?: number
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  pincode: string
  tl_name: string
  member_name: string
  subtotal: number
  discount: number
  delivery_fee: number
  grand_total: number
  payment_method: string
  payment_screenshot_url?: string
  order_status: string
  order_note?: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id?: number
  order_id: number
  product_name: string
  product_variant: string
  size: string
  sku: string
  quantity: number
  unit_price: number
  line_total: number
  created_at?: string
}

export interface Product {
  id?: number
  name: string
  category: 'sweet' | 'namkeen'
  created_at?: string
  updated_at?: string
}

export interface ProductVariant {
  id?: number
  product_id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface ProductSize {
  id?: number
  variant_id: number
  size: string
  sku: string
  price: number
  created_at?: string
  updated_at?: string
}
