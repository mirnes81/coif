import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Admin {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  last_visit?: string;
  created_at: string;
}

export interface ClientPhoto {
  id: string;
  client_id: string;
  photo_url: string;
  description?: string;
  uploaded_at: string;
}

export interface ClientHistory {
  id: string;
  client_id: string;
  action_type: string;
  description: string;
  metadata?: any;
  created_by: string;
  created_at: string;
}

export interface POSTransaction {
  id: string;
  client_id?: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  items: any[];
  twint_qr_code?: string;
  created_by: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  description_short?: string;
  description_long?: string;
  price: number;
  original_price?: number;
  volume?: string;
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  image_url?: string;
  stock_quantity?: number;
  in_stock?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  visible_on_shop?: boolean;
  rating?: number;
  reviews_count?: number;
  created_at: string;
}
