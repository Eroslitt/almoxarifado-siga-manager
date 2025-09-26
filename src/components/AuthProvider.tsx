
import React from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types/database';
import { AuthContext } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🔄 AuthProvider rendering...');
  
  const [user, setUser] = React.useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = React.useState<SupabaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        if (isDemoMode) {
          // Demo mode - use mock user
          const mockUser: User = {
            id: 'demo-user-123',
            email: 'demo@siga.com',
            name: 'Demo User',
            department: 'Almoxarifado',
            role: 'administrator',
            active: true,
            notification_preferences: { email: true, push: true },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const mockSupabaseUser = {
            id: 'demo-user-123',
            email: 'demo@siga.com',
            user_metadata: {
              name: 'Demo User',
              department: 'Almoxarifado'
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as SupabaseUser;

          setUser(mockUser);
          setSupabaseUser(mockSupabaseUser);
          setLoading(false);
          
          console.log('✅ Demo authentication initialized');
          return;
        }

        // Real Supabase mode
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadUserProfile(session.user.id);
        }
        
        setLoading(false);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          if (session?.user) {
            setSupabaseUser(session.user);
            await loadUserProfile(session.user.id);
          } else {
            setSupabaseUser(null);
            setUser(null);
          }
          
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      if (isDemoMode) {
        // Demo mode - return mock user
        const mockUser: User = {
          id: userId,
          email: 'demo@siga.com',
          name: 'Demo User',
          department: 'Almoxarifado',
          role: 'administrator',
          active: true,
          notification_preferences: { email: true, push: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(mockUser);
        return;
      }

      // Try to get from profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        // Convert profile data to User format
        const userData: User = {
          id: profileData.user_id,
          email: supabaseUser?.email || '',
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

      // If no profile exists, create one
      if (supabaseUser) {
        const newProfile = {
          user_id: userId,
          full_name: supabaseUser.user_metadata?.full_name || 'Usuário'
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (!insertError) {
          const userData: User = {
            id: userId,
            email: supabaseUser.email || '',
            name: newProfile.full_name,
            department: 'Usuário',
            role: 'operator',
            active: true,
            notification_preferences: { email: true, push: true },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

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
