import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  full_name: string;
  role: 'seeker' | 'landlord';
  phone: string | null;
  created_at: string;
};

export type Listing = {
  id: string;
  landlord_id: string;
  title: string;
  building_name: string;
  description: string;
  price: number;
  location: string;
  property_type: 'bedsitter' | '1br' | '2br' | '3br' | 'studio' | 'single';
  bedrooms: number;
  bathrooms: number;
  image_url: string;
  gallery: string[];
  available: boolean;
  unlocked_price: number;
  quantity: number;
  water_price: number;
  has_cctv: boolean;
  has_biometrics: boolean;
  created_at: string;
};

export type Unlock = {
  id: string;
  seeker_id: string;
  listing_id: string;
  amount_paid: number;
  payment_method: 'mpesa' | 'card';
  mpesa_code: string | null;
  created_at: string;
};
