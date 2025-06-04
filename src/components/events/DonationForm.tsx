import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

const donationSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1'),
  message: z.string().max(200, 'Message must be less than 200 characters').optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function DonationForm({ eventId, onSuccess }: DonationFormProps) {
  const { user } = useAuth();
  const [error, setError] = React.useState('');
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
  });

  const onSubmit = async (data: DonationFormData) => {
    try {
      setError('');
      
      if (!user) {
        toast.error('Please sign in to make a donation');
        return;
      }

      await api.events.updateFundraising(eventId, data.amount);
      
      toast.success('Thank you for your donation!');
      reset();
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Donation error:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to process donation';
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ErrorMessage message={error} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Donation Amount
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="input pl-10"
            placeholder="0.00"
            step="0.01"
            min="1"
          />
        </div>
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message (Optional)
        </label>
        <textarea
          {...register('message')}
          className="input"
          rows={3}
          placeholder="Add a message of support..."
        />
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <DollarSign className="w-4 h-4" />
            <span>Donate Now</span>
          </>
        )}
      </button>
    </form>
  );
}
