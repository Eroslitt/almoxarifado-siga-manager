
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

// Mock user data for demo mode
const mockUser = {
  id: 'demo-user-123',
  email: 'demo@siga.com',
  user_metadata: {
    name: 'Demo User',
    department: 'Almoxarifado'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Create a comprehensive mock client for demo mode
const createMockClient = () => {
  const mockClient = {
    from: (table: string) => ({
      select: (columns?: string) => Promise.resolve({ 
        data: table === 'users' ? [mockUser] : [], 
        error: null 
      }),
      insert: (data: any) => Promise.resolve({ 
        data: Array.isArray(data) ? data : [data], 
        error: null 
      }),
      update: (data: any) => Promise.resolve({ 
        data: Array.isArray(data) ? data : [data], 
        error: null 
      }),
      delete: () => Promise.resolve({ data: [], error: null }),
      eq: function(column: string, value: any) { return this; },
      single: function() { 
        return Promise.resolve({ 
          data: table === 'users' ? mockUser : {}, 
          error: null 
        }); 
      },
      order: function(column: string, options?: any) { return this; },
      limit: function(count: number) { return this; },
      range: function(from: number, to: number) { return this; },
      in: function(column: string, values: any[]) { return this; },
      or: function(filters: string) { return this; },
      gte: function(column: string, value: any) { return this; },
      lte: function(column: string, value: any) { return this; },
      like: function(column: string, pattern: string) { return this; },
      ilike: function(column: string, pattern: string) { return this; }
    }),
    auth: {
      signUp: (options: any) => Promise.resolve({ 
        data: { user: mockUser, session: { user: mockUser, access_token: 'demo-token' } }, 
        error: null 
      }),
      signInWithPassword: (options: any) => Promise.resolve({ 
        data: { user: mockUser, session: { user: mockUser, access_token: 'demo-token' } }, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ 
        data: { user: mockUser }, 
        error: null 
      }),
      getSession: () => Promise.resolve({ 
        data: { session: { user: mockUser, access_token: 'demo-token' } }, 
        error: null 
      }),
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        // Simulate initial session
        setTimeout(() => {
          callback('SIGNED_IN', { user: mockUser, access_token: 'demo-token' });
        }, 100);
        
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log('Demo: Auth subscription unsubscribed')
            }
          }
        };
      },
      updateUser: (data: any) => Promise.resolve({ 
        data: { user: { ...mockUser, ...data } }, 
        error: null 
      })
    },
    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: any) => Promise.resolve({ 
          data: { path, fullPath: `${bucket}/${path}` }, 
          error: null 
        }),
        download: (path: string) => Promise.resolve({ 
          data: new Blob(['demo file content']), 
          error: null 
        }),
        remove: (paths: string[]) => Promise.resolve({ 
          data: paths.map(path => ({ name: path })), 
          error: null 
        }),
        getPublicUrl: (path: string) => ({ 
          data: { publicUrl: `https://demo.supabase.co/storage/v1/object/public/${bucket}/${path}` }
        })
      })
    },
    functions: {
      invoke: (functionName: string, options?: any) => Promise.resolve({
        data: { message: `Demo response from ${functionName}` },
        error: null
      })
    },
    // Top-level channel method (used by realTimeSync service)
    channel: (topic: string) => ({
      on: function(type: string, filter: any, callback: (payload: any) => void) {
        console.log(`Demo: Listening to ${type} on ${topic}`, filter);
        return this;
      },
      subscribe: () => {
        console.log(`Demo: Subscribed to realtime channel ${topic}`);
        return Promise.resolve('SUBSCRIBED');
      },
      unsubscribe: () => {
        console.log(`Demo: Unsubscribed from ${topic}`);
        return Promise.resolve('UNSUBSCRIBED');
      }
    }),
    // Remove channel method
    removeChannel: (channel: any) => {
      console.log('Demo: Removed channel', channel);
      return Promise.resolve();
    },
    realtime: {
      channel: (topic: string) => ({
        on: (event: string, callback: (payload: any) => void) => {
          console.log(`Demo: Listening to ${event} on ${topic}`);
          return this;
        },
        subscribe: () => {
          console.log(`Demo: Subscribed to realtime channel ${topic}`);
          return Promise.resolve('SUBSCRIBED');
        },
        unsubscribe: () => {
          console.log(`Demo: Unsubscribed from ${topic}`);
          return Promise.resolve('UNSUBSCRIBED');
        }
      })
    }
  };

  return mockClient;
};

// Create the client with proper typing
const realClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
const mockClient = createMockClient();

// Use type assertion to resolve the TypeScript conversion error
export const supabase = isDemo ? (mockClient as any) : realClient;

export const isDemoMode = isDemo;

// Log system status
console.log(`🔌 Sistema: ${isDemo ? 'MODO DEMO - Dados Mock' : 'CONECTADO - Supabase'}`);
