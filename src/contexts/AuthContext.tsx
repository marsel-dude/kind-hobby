import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider initialized');
    
    const initializeAuth = async () => {
      try {
        console.log('Checking Supabase configuration...');
        if (!isSupabaseConfigured()) {
          console.warn('Supabase not configured, using mock auth');
          setLoading(false);
          return;
        }

        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          toast.error('Session error. Please sign in again.');
          await api.auth.signOut();
          throw error;
        }
        
        console.log('Session retrieved:', session ? 'Present' : 'None');
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session present' : 'No session');
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
      } else if (event === 'USER_DELETED') {
        console.log('User deleted');
        setUser(null);
        toast.error('Your account has been deleted.');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
        setUser(session?.user ?? null);
      }

      setUser(session?.user ?? null);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Please configure Supabase first');
      }

      // Check if username exists using count
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);

      if (countError) {
        throw new Error('Failed to check username availability');
      }

      if (count && count > 0) {
        throw new Error('Username is already taken');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('An account with this email already exists');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          username,
          display_name: username,
          privacy: {
            showEmail: false,
            showLocation: true,
            showSocial: true,
            showFullName: false
          }
        }]);

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.signOut();
        if (profileError.message.includes('users_username_key')) {
          throw new Error('Username is already taken');
        }
        throw new Error('Failed to create user profile');
      }

      toast.success('Account created successfully!');
    } catch (err: any) {
      console.error('Signup error:', err);
      throw new Error(err.message || 'Failed to create account');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Please configure Supabase first');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      toast.success('Welcome back!');
      return data;
    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(err.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('You have been signed out.');
    } catch (err: any) {
      console.error('Signout error:', err);
      throw new Error('Failed to sign out');
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });
      if (error) throw error;
      toast.success('Email verified successfully!');
    } catch (err: any) {
      console.error('Email verification error:', err);
      throw new Error('Failed to verify email');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Password reset instructions sent to your email');
    } catch (err: any) {
      console.error('Password reset error:', err);
      throw new Error('Failed to send password reset email');
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (err: any) {
      console.error('Password update error:', err);
      throw new Error('Failed to update password');
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}