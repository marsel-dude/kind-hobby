import React from 'react';
import { Save } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface SaveButtonProps {
  isSaving: boolean;
  onClick?: () => void;
  className?: string;
}

export function SaveButton({ isSaving, onClick, className = '' }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isSaving}
      className={`btn-primary flex items-center space-x-2 ${className}`}
    >
      {isSaving ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </>
      )}
    </button>
  );
}