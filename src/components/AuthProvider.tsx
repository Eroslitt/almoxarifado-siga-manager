import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle profile creation/loading after auth state change
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            setTimeout(() => {
              loadUserProfile(currentSession.user.id);
            }, 0);
          }
        }
      } catch (error) {
        console.error('Error in initAuth:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  // Redirect logic based on auth state
  useEffect(() => {
    if (!loading) {
      const isAuthPage = location.pathname === '/auth';
      
      if (!session && !isAuthPage) {
        // Not authenticated and not on auth page -> redirect to auth
        navigate('/auth');
      } else if (session && isAuthPage) {
        // Authenticated and on auth page -> redirect to main app
        navigate('/');
      }
    }
  }, [session, loading, location.pathname, navigate]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      // If no profile exists, create one
      if (!profile) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        
        if (user) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
              company_name: user.user_metadata?.company_name || 'Empresa',
              phone: user.user_metadata?.phone || null,
              subscription_status: 'inactive'
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created successfully');
          }
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = 'Erro ao fazer login';
        
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Por favor, confirme seu email antes de fazer login';
        } else if (error.message.includes('Too many requests')) {
          message = 'Muitas tentativas. Tente novamente em alguns minutos';
        } else {
          message = error.message;
        }
        
        return { success: false, message };
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!');
        return { success: true, message: 'Login realizado com sucesso!' };
      }

      return { success: false, message: 'Erro inesperado ao fazer login' };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { success: false, message: 'Erro inesperado ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast.error('Erro ao fazer logout');
      } else {
        setSession(null);
        setUser(null);
        toast.success('Logout realizado com sucesso!');
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      toast.error('Erro inesperado ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
  };

  // Show loading spinner while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};