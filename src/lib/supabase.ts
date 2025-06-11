
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Fallback values for development/demo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Check if we're using demo values
const isDemo = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isDemo) {
  console.warn('⚠️ Using demo Supabase configuration. Connect to real Supabase for full functionality.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const isDemoMode = isDemo;
