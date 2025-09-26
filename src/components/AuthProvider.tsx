import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/database';
import { AuthContext } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile loading to avoid deadlock
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (profile) {
        setUser({
          id: profile.user_id,
          email: supabaseUser?.email || '',
          full_name: profile.full_name,
          company_name: profile.company_name,
          phone: profile.phone,
          subscription_status: profile.subscription_status as 'active' | 'inactive' | 'cancelled',
          subscription_end_date: profile.subscription_end_date,
          created_at: profile.created_at,
        });
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Login realizado com sucesso!' };
    } catch (error: any) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Conta criada com sucesso! Verifique seu email para confirmar.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  const contextValue = {
    user,
    supabaseUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};