import React, { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types/database';
import { AuthContext } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Demo user for when isDemoMode is true
const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@siga.com',
  name: 'Usuário Demo',
  department: 'Almoxarifado',
  role: 'administrator',
  active: true,
  notification_preferences: { email: true, push: true },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DEMO_SUPABASE_USER = {
  id: 'demo-user-123',
  email: 'demo@siga.com',
  user_metadata: {
    name: 'Usuário Demo',
    department: 'Almoxarifado'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
} as SupabaseUser;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(isDemoMode ? DEMO_USER : null);
  const [supabaseUser, setSupabaseUser] = React.useState<SupabaseUser | null>(isDemoMode ? DEMO_SUPABASE_USER : null);
  const [loading, setLoading] = React.useState(!isDemoMode);

  const loadUserProfile = useCallback(async (userId: string, sbUser: SupabaseUser | null) => {
    try {
      if (isDemoMode) {
        setUser(DEMO_USER);
        return;
      }

      // Try to get from profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.warn('Error fetching profile:', profileError);
      }

      if (profileData) {
        // Convert profile data to User format
        const userData: User = {
          id: profileData.user_id,
          email: sbUser?.email || '',
          name: profileData.full_name || 'Usuário',
          department: 'Usuário',
          role: 'operator',
          active: true,
          notification_preferences: { email: true, push: true },
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        };
        setUser(userData);
        return;
      }

      // If no profile exists and we have a supabase user, create basic user data
      if (sbUser) {
        const userData: User = {
          id: userId,
          email: sbUser.email || '',
          name: sbUser.user_metadata?.full_name || 'Usuário',
          department: 'Usuário',
          role: 'operator',
          active: true,
          notification_preferences: { email: true, push: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(userData);
        
        // Try to create profile in background (fire and forget)
        supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: sbUser.user_metadata?.full_name || 'Usuário'
          })
          .then(({ error }) => {
            if (error) {
              console.warn('Could not create profile:', error);
            } else {
              console.log('Profile created');
            }
          });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }, []);

  React.useEffect(() => {
    // If demo mode, we're already set up
    if (isDemoMode) {
      console.log('✅ Modo demo ativado');
      return;
    }

    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Error getting session:', error);
        }
        
        if (mounted && session?.user) {
          setSupabaseUser(session.user);
          await loadUserProfile(session.user.id, session.user);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (mounted) {
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadUserProfile(session.user.id, session.user);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (isDemoMode) {
        // Demo mode - always succeed
        return { success: true, message: 'Login realizado com sucesso (modo demo)' };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Login realizado com sucesso' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  };

  const signOut = async () => {
    try {
      if (isDemoMode) {
        // Demo mode - just clear state
        setUser(null);
        setSupabaseUser(null);
        console.log('Demo logout successful');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const contextValue = {
    user,
    supabaseUser,
    loading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};