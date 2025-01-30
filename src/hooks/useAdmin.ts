import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { logger } from '../services/logger';

interface AdminLoginResponse {
  success: boolean;
  error?: string;
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;
        setIsAdmin(userData?.is_admin || false);
      } catch (err) {
        logger.error('Admin check error:', err as Error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      } else if (event === 'SIGNED_IN') {
        checkAdmin();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<AdminLoginResponse> => {
    try {
      // First try to sign in with email directly
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'darko@kindhobby.com',
        password
      });

      if (authError) {
        logger.error('Admin auth error:', authError);
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Then verify if the user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData?.is_admin) {
        logger.error('Admin verification error:', userError || 'User is not admin');
        await supabase.auth.signOut(); // Sign out if not admin
        return {
          success: false,
          error: 'Access denied. This account does not have admin privileges.'
        };
      }

      setIsAdmin(true);
      return { success: true };
    } catch (err) {
      logger.error('Admin login error:', err as Error);
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (err) {
      logger.error('Admin logout error:', err as Error);
      toast.error('Failed to log out');
    }
  };

  return { isAdmin, loading, login, logout };
}