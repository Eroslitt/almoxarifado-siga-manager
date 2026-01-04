// Re-export from the main Supabase client
// This file exists for backward compatibility
import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Demo mode allows the app to work without authentication
// Set to true to enable demo mode with mock data
export const isDemoMode = true;
