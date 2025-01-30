import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export function SuccessMessage({ message, className = '' }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <div className={`p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2 ${className}`}>
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-green-600">{message}</p>
    </div>
  );
}