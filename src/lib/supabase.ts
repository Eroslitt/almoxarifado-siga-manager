
// Re-export from the main Supabase client
// This file exists for backward compatibility
import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Demo mode is always false - using real Supabase
export const isDemoMode = false;
