
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Fallback values for development/demo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Check if we're using demo values
const isDemo = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isDemo) {
  console.warn('⚠️ Using demo Supabase configuration. All API calls will use mock data.');
}

// Create a mock client that doesn't make real requests when in demo mode
export const supabase = isDemo ? 
  {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
      }),
    },
  } as any :
  createClient<Database>(supabaseUrl, supabaseAnonKey);

export const isDemoMode = isDemo;

// Log system status
console.log(`🔌 Sistema: ${isDemo ? 'MODO DEMO - Dados Mock' : 'CONECTADO - Supabase'}`);
