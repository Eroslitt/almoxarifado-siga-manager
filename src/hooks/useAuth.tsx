import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types/database';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        return;
      }

      setUser(data);
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

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      loading,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
