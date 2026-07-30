import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars not configured')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

/*
 * Supabase table SQL - run this in the Supabase SQL editor:
 *
 * CREATE TABLE orders (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   name TEXT NOT NULL,
 *   phone TEXT NOT NULL,
 *   address TEXT NOT NULL,
 *   city TEXT NOT NULL,
 *   quantity INTEGER NOT NULL DEFAULT 1,
 *   total_price INTEGER NOT NULL,
 *   product_name TEXT NOT NULL DEFAULT 'Jabón Kojic Serum 10',
 *   status TEXT NOT NULL DEFAULT 'pending',
 *   dropi_order_id TEXT,
 *   notes TEXT
 * );
 *
 * -- Enable Row Level Security (RLS)
 * ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
 *
 * -- Policy to allow inserts from anon (for form submissions)
 * CREATE POLICY "Allow anon inserts" ON orders
 *   FOR INSERT TO anon
 *   WITH CHECK (true);
 *
 * -- Policy to allow service role full access
 * CREATE POLICY "Allow service role full access" ON orders
 *   FOR ALL TO service_role
 *   USING (true);
 */

export type Order = {
  id?: string
  created_at?: string
  name: string
  phone: string
  address: string
  city: string
  quantity: number
  total_price: number
  product_name?: string
  status?: string
  dropi_order_id?: string
  notes?: string
}
