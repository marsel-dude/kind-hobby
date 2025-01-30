import React from 'react';
import { User, Clock } from 'lucide-react';

interface Donation {
  id: string;
  user_id: string;
  amount: number;
  message?: string;
  created_at: string;
}

interface DonationListProps {
  donations: Donation[];
}

export function DonationList({ donations }: DonationListProps) {
  if (donations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Be the first to donate!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <div
          key={donation.id}
          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium">Anonymous</p>
              <span className="text-lg font-semibold text-primary">
                ${donation.amount}
              </span>
            </div>
            
            {donation.message && (
              <p className="text-gray-600 mt-1">{donation.message}</p>
            )}
            
            <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <time dateTime={donation.created_at}>
                {new Date(donation.created_at).toLocaleDateString()}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}