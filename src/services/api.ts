import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  APIResponse, APIError, CreateUserData, 
  UpdateUserData, User, EventDonation 
} from '../types/api';
import { z } from 'zod';

class APIError extends Error {
  constructor(message: string, public code?: string, public details?: unknown) {
    super(message);
    this.name = 'APIError';
  }
}

function handleSupabaseError(error: any): APIResponse {
  console.error('Supabase error:', error);
  return {
    data: null,
    error: {
      message: error.message || 'An unexpected error occurred',
      code: error.code,
      details: error.details
    }
  };
}

// Validation schemas
const createUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  display_name: z.string().min(2).max(50),
  privacy: z.object({
    showEmail: z.boolean(),
    showLocation: z.boolean(),
    showSocial: z.boolean(),
    showFullName: z.boolean()
  }),
  social: z.object({
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional()
  }).optional()
});

const updateUserSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  hobbies: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  teaching_interest: z.boolean().optional(),
  volunteer_interest: z.boolean().optional(),
  hobby_groups: z.array(z.string()).optional(),
  privacy: z.object({
    showEmail: z.boolean(),
    showLocation: z.boolean(),
    showSocial: z.boolean(),
    showFullName: z.boolean()
  }).optional(),
  social: z.object({
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional()
  }).optional(),
  avatar_url: z.string().url().nullable().optional()
});

export const api = {
  auth: {
    signUp: async (email: string, password: string): Promise<APIResponse<{ user: User | null }>> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (error) throw error;
        return { data: { user: data.user }, error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    },

    signIn: async (email: string, password: string): Promise<APIResponse<User>> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        return { data: data.user, error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    },

    signOut: async (): Promise<APIResponse> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    },

    verifyEmail: async (token: string): Promise<APIResponse> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });

        if (error) throw error;
        return { error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    },

    resetPassword: async (email: string): Promise<APIResponse> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return { error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    },

    updatePassword: async (newPassword: string): Promise<APIResponse> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;
        return { error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    }
  },

  users: {
    create: async (userData: CreateUserData): Promise<APIResponse> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        // Validate input data
        const validatedData = createUserSchema.parse(userData);

        const { error } = await supabase
          .from('users')
          .insert([validatedData]);

        if (error) throw error;
        return { data: null, error: null };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            data: null,
            error: {
              message: 'Invalid user data',
              code: 'VALIDATION_ERROR',
              details: error.errors
            }
          };
        }
        return handleSupabaseError(error);
      }
    },

    get: async (userId: string): Promise<APIResponse<User>> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    },

    update: async (userId: string, updates: UpdateUserData): Promise<APIResponse> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        // Validate update data
        const validatedData = updateUserSchema.parse(updates);

        const { error } = await supabase
          .from('users')
          .update(validatedData)
          .eq('id', userId);

        if (error) throw error;
        return { data: null, error: null };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            data: null,
            error: {
              message: 'Invalid update data',
              code: 'VALIDATION_ERROR',
              details: error.errors
            }
          };
        }
        return handleSupabaseError(error);
      }
    }
  },

  events: {
    updateFundraising: async (eventId: string, amount: number): Promise<APIResponse> => {
      try {
        if (!isSupabaseConfigured()) {
          throw new APIError('Please configure Supabase first');
        }

        if (amount <= 0) {
          throw new APIError('Amount must be greater than 0', 'INVALID_AMOUNT');
        }

        const { error } = await supabase.rpc('update_event_fundraising', {
          event_id: eventId,
          amount: amount
        });

        if (error) throw error;
        return { data: null, error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    },

    getDonations: async (eventId: string): Promise<APIResponse<EventDonation[]>> => {
      try {
        if (!isSupabaseConfigured()) {
          return { data: [], error: null };
        }

        const { data, error } = await supabase
          .from('event_donations')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return handleSupabaseError(error);
      }
    }
  }
};