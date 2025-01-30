import { useState } from 'react';
import { toast } from 'sonner';

interface UseFormOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useFormSubmit<T>({
  onSubmit,
  onSuccess,
  onError,
  successMessage = 'Success!',
  errorMessage = 'An error occurred. Please try again.',
}: UseFormOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (data: T) => {
    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(data);
      toast.success(successMessage);
      onSuccess?.();
    } catch (err: any) {
      console.error('Form submission error:', err);
      const errorMsg = err?.message || errorMessage;
      setError(errorMsg);
      toast.error(errorMsg);
      onError?.(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
}