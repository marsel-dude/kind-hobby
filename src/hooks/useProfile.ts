import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useCache } from './useCache';
import { useMemoizedCallback } from './useMemoizedCallback';
import { logger } from '../services/logger';

interface ProfileData {
  id: string;
  display_name?: string;
  bio?: string;
  hobbies?: string[];
  skills?: string[];
  teaching_interest?: boolean;
  volunteer_interest?: boolean;
  avatar_url?: string;
  level?: number;
  created_at?: string;
}

export function useProfile(userId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');

  const { 
    data: profile, 
    loading, 
    error,
    refresh: refreshProfile
  } = useCache<ProfileData>(
    `profile_${userId}`,
    () => api.users.get(userId).then(res => res.data),
    { 
      ttl: 5 * 60 * 1000, // 5 minutes cache
      staleWhileRevalidate: true,
      backgroundSync: true,
      retryAttempts: 3,
      onError: (error) => {
        logger.error('Profile fetch error:', error);
        toast.error('Failed to load profile data');
      }
    }
  );

  const updateProfile = useMemoizedCallback(async (data: Partial<ProfileData>) => {
    if (!userId) return false;
    
    setIsSaving(true);
    setSaveError('');

    try {
      const { error } = await api.users.update(userId, data);
      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated successfully!');
      return true;
    } catch (err: any) {
      logger.error('Profile update error:', err);
      const errorMessage = err?.message || 'Failed to update profile';
      setSaveError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, refreshProfile]);

  return {
    profile,
    loading,
    error,
    isSaving,
    saveError,
    updateProfile,
    refreshProfile
  };
}
