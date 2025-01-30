import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useFormSubmit } from '../hooks/useForm';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FormField } from '../components/ui/FormField';

const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const { isSubmitting, error, handleSubmit: submitForm } = useFormSubmit<SignupFormData>({
    onSubmit: async (data) => {
      try {
        await signUp(data.email, data.password, data.username);
        navigate('/profile-setup');
      } catch (err: any) {
        throw new Error(err.message || 'Failed to create account');
      }
    },
    successMessage: 'Account created successfully!',
    errorMessage: 'Failed to create account. Please try again.',
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        
        <ErrorMessage message={error} className="mb-6" />

        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <FormField
            label="Username"
            name="username"
            register={register}
            error={errors.username}
            placeholder="Choose a unique username"
            required
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            placeholder="you@example.com"
            required
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            register={register}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary hover:text-primary/80"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}